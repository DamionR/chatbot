import { openDB, saveSetting, getSetting, saveChat, getChats, cleanupChats } from './backend/db.js';
import { fetchModels, sendMessageToAPI, checkCredits } from './backend/api.js';
import { createSettingsForm, getSettings } from './config/settings.js';
import { addMessageToHistory, processStream } from './utils/utils.js';
import { createUI, setTheme, showView, chatHistory, inputField, apiKeyInput, modelSelect, themeToggle } from './ui.js';

let streamController = null;
let apiKey = '';
let orchestrator = null;
let sessionId = null;
const BACKEND_URL = 'https://your-backend-service.com:7777'; // Update with actual backend

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
  if (apiKey) {
    await populateModels();
  } else {
    addMessageToHistory('system', 'Please enter your API key in settings.');
  }
  const chats = await getChats(sessionId);
  chats.forEach(chat => addMessageToHistory(chat.role, chat.content));
  showView('chat');

  const Orchestrator = (await import('./agents/orchestrator.js')).default;
  orchestrator = new Orchestrator();
  await orchestrator.setupClients();
  console.log('Orchestrator initialized');

  setInterval(() => cleanupChats(30).catch(e => console.error('Cleanup failed:', e)), 24 * 60 * 60 * 1000);
}

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

async function populateModels() {
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
  modelSelect.onchange = () => saveSetting('selectedModel', modelSelect.value);
}

async function sendMessage(cancelButton) {
  const text = inputField.value.trim();
  if (!text) return;
  addMessageToHistory('user', text);
  await saveChat({ role: 'user', content: text }, sessionId);
  inputField.value = '';
  if (!apiKey || !modelSelect.value) {
    addMessageToHistory('system', 'Please set API key and select a model in settings.');
    return;
  }

  const typingMsg = document.createElement('div');
  typingMsg.className = 'system-message';
  typingMsg.textContent = 'Bot is typing...';
  chatHistory.appendChild(typingMsg);

  try {
    const chats = await getChats(sessionId);
    const messages = chats.map(chat => ({ role: chat.role, content: chat.content }));
    messages.push({ role: 'user', content: text });

    const lowerText = text.toLowerCase();
    const agentKeywords = ["calculate", "translate", "email", "file", "news", "whois", "history", "fetch", "http"];
    if (agentKeywords.some(keyword => lowerText.includes(keyword))) {
      await orchestrator.handleMessage(text, sessionId, (response) => {
        chatHistory.removeChild(typingMsg);
        if (response.includes("Error:")) {
          addMessageToHistory('system', response);
        } else {
          addMessageToHistory('assistant', response);
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

    const result = await sendMessageToAPI(messages, options);
    chatHistory.removeChild(typingMsg);

    if (settings.stream) {
      cancelButton.style.display = 'inline';
      streamController = result.controller;
      const reply = await processStream(result.stream, result.controller, sessionId);
      await saveChat({ role: 'assistant', content: reply }, sessionId);
      cancelButton.style.display = 'none';
    } else {
      addMessageToHistory('assistant', result.content);
      await saveChat({ role: 'assistant', content: result.content }, sessionId);
    }
  } catch (e) {
    chatHistory.removeChild(typingMsg);
    addMessageToHistory('system', `Error: ${e.message}`);
    await saveChat({ role: 'system', content: `Error: ${e.message}` }, sessionId);
  }
}

function cancelStream() {
  if (streamController) {
    streamController.abort();
    streamController = null;
    addMessageToHistory('system', 'Stream cancelled.');
    saveChat({ role: 'system', content: 'Stream cancelled.' }, sessionId);
  }
}

init().catch(console.error);