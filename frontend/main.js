import { openDB, saveSetting, getSetting, saveChat, getChats, cleanupChats } from '../backend/db.js';
import { fetchModels, sendMessageToAPI, checkCredits } from '../backend/api.js';
import { createSettingsForm, getSettings, saveSettingsToBackend, loadSettingsFromBackend } from './config/settings.js';
import { addMessageToHistory, processStream } from './utils/utils.js';
import { createUI, setTheme, showView, chatHistory, inputField, apiKeyInput, modelSelect, themeToggle } from './ui.js';

let streamController = null;
let apiKey = '';
let orchestrator = null;
let sessionId = null;
const BACKEND_URL = 'http://localhost:3000';

async function init() {
  await openDB();
  const theme = await getSetting('theme') || 'light';
  setTheme(theme);
  apiKey = await getSetting('apiKey') || '';
  sessionId = await getSetting('sessionId') || generateSessionId();
  await saveSetting('sessionId', sessionId);
  createUI();
  themeToggle.checked = theme === 'dark';
  apiKeyInput.value = apiKey;
  createSettingsForm();
  await loadSettingsFromBackend();
  if (apiKey) {
    await populateModels();
  } else {
    await addMessageToHistory('system', 'Please enter your API key in settings.', sessionId);
  }
  const chats = await getChats(sessionId);
  chats.forEach(chat => addMessageToHistory(chat.role, chat.content, sessionId));
  showView('chat');

  const Orchestrator = (await import('./agents/orchestrator.js')).default;
  orchestrator = new Orchestrator();
  await orchestrator.setupClients();
  console.log('Orchestrator initialized');

  setInterval(() => cleanupChats(30).catch(e => console.error('Cleanup failed:', e)), 24 * 60 * 60 * 1000);

  // Event listeners for UI interactions
  document.addEventListener('sendMessage', async (e) => {
    await sendMessage(e.detail.cancelButton);
  });
  document.addEventListener('cancelStream', cancelStream);
  document.addEventListener('apiKeyUpdated', async () => {
    apiKey = apiKeyInput.value.trim();
    await populateModels();
  });
  document.addEventListener('populateModels', async () => {
    await populateModels();
  });
}

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

async function populateModels() {
  try {
    const models = await fetchModels();
    modelSelect.innerHTML = '';
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name || m.id;
      modelSelect.appendChild(opt);
    });
    const savedModel = await getSetting('selectedModel');
    if (savedModel && models.some(m => m.id === savedModel)) {
      modelSelect.value = savedModel;
    } else if (models.length) {
      modelSelect.value = models[0].id;
      await saveSetting('selectedModel', models[0].id);
    }
    modelSelect.onchange = async () => {
      await saveSetting('selectedModel', modelSelect.value);
    };
  } catch (error) {
    console.error('Error populating models:', error);
    await addMessageToHistory('system', `Error loading models: ${error.message}`, sessionId);
  }
}

async function sendMessage(cancelButton) {
  const text = inputField.value.trim();
  if (!text) return;

  try {
    await addMessageToHistory('user', text, sessionId);
    await saveChat({ role: 'user', content: text }, sessionId);
    inputField.value = '';

    if (!apiKey || !modelSelect.value) {
      await addMessageToHistory('system', 'Please set API key and select a model in settings.', sessionId);
      return;
    }

    const typingMsg = document.createElement('div');
    typingMsg.className = 'system-message';
    typingMsg.textContent = 'Bot is typing...';
    chatHistory.appendChild(typingMsg);

    const chats = await getChats(sessionId);
    const messages = chats.map(chat => ({ role: chat.role, content: chat.content }));
    messages.push({ role: 'user', content: text });

    const lowerText = text.toLowerCase();
    const agentKeywords = ["calculate", "translate", "email", "news", "whois", "history", "fetch", "http", "issue"];
    if (agentKeywords.some(keyword => lowerText.includes(keyword))) {
      await orchestrator.handleMessage(text, sessionId, async (response) => {
        chatHistory.removeChild(typingMsg);
        if (response.includes("Error:")) {
          await addMessageToHistory('system', response, sessionId);
          await saveChat({ role: 'system', content: response }, sessionId);
        } else {
          await addMessageToHistory('assistant', response, sessionId);
          await saveChat({ role: 'assistant', content: response }, sessionId);
        }
      });
      return;
    }

    const settings = getSettings();
    const options = {
      model: modelSelect.value,
      models: settings.fallbackModels || [],
      provider: {
        order: settings.providerOrder,
        allow_fallbacks: settings.allowFallbacks,
        require_parameters: settings.requireParameters,
        data_collection: settings.dataCollection,
        ignore: settings.ignoreProviders,
        quantizations: settings.quantizations,
        sort: settings.sort || undefined
      },
      stream: settings.stream,
      maxTokens: settings.maxTokens,
      temperature: settings.temperature,
      topP: settings.topP,
      topK: settings.topK,
      frequencyPenalty: settings.frequencyPenalty,
      presencePenalty: settings.presencePenalty,
      repetitionPenalty: settings.repetitionPenalty,
      minP: settings.minP,
      topA: settings.topA,
      seed: settings.seed,
      responseFormat: settings.responseFormat,
      stop: settings.stop,
      maxPrice: settings.maxPrice
    };

    const credits = await checkCredits();
    if (credits && credits.data.usage >= (credits.data.limit || Infinity)) {
      throw new Error('Insufficient credits. Please add more credits.');
    }

    await saveSettingsToBackend(settings);
    const result = await sendMessageToAPI(messages, options);
    chatHistory.removeChild(typingMsg);

    if (settings.stream) {
      cancelButton.style.display = 'inline';
      streamController = result.controller;
      const reply = await processStream(result.stream, result.controller, sessionId);
      cancelButton.style.display = 'none';
    } else {
      await addMessageToHistory('assistant', result.content, sessionId);
      await saveChat({ role: 'assistant', content: result.content }, sessionId);
    }
  } catch (error) {
    chatHistory.removeChild(typingMsg);
    await addMessageToHistory('system', `Error: ${error.message}`, sessionId);
    await saveChat({ role: 'system', content: `Error: ${error.message}` }, sessionId);
  }
}

function cancelStream() {
  if (streamController) {
    streamController.abort();
    streamController = null;
    addMessageToHistory('system', 'Stream cancelled.', sessionId);
    saveChat({ role: 'system', content: 'Stream cancelled.' }, sessionId);
  }
}

init().catch(error => {
  console.error('Initialization failed:', error);
  addMessageToHistory('system', `Initialization error: ${error.message}`, sessionId);
});