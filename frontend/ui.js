import { saveSetting } from '../backend/db.js';

let chatHistory, inputField, apiKeyInput, modelSelect, themeToggle, chatView, settingsView;
const style = document.createElement('style');
document.head.appendChild(style);

function setTheme(theme) {
  document.body.className = theme;
  setStyles();
  saveSetting('theme', theme).catch(e => console.error('Failed to save theme:', e));
}

function setStyles() {
  const isDark = document.body.className === 'dark';
  style.textContent = `
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: ${isDark ? '#333' : 'white'};
      color: ${isDark ? 'white' : 'black'};
    }
    .main-container {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 200px;
      background-color: ${isDark ? '#444' : '#f0f0f0'};
      padding: 10px;
    }
    .nav-button {
      width: 100%;
      padding: 10px;
      margin-bottom: 5px;
      background-color: ${isDark ? '#555' : '#ddd'};
      border: none;
      cursor: pointer;
    }
    .nav-button:hover {
      background-color: ${isDark ? '#666' : '#ccc'};
    }
    .content-area {
      flex: 1;
      padding: 20px;
    }
    .chat-view, .settings-view {
      display: none;
    }
    .chat-history {
      height: 70vh;
      overflow-y: scroll;
      padding: 10px;
      border: 1px solid ${isDark ? '#555' : '#ccc'};
      margin-bottom: 10px;
      background-color: ${isDark ? '#444' : 'white'};
    }
    .input-area {
      display: flex;
      gap: 10px;
    }
    .input-area input {
      flex: 1;
      padding: 8px;
      border: 1px solid ${isDark ? '#555' : '#ccc'};
      background-color: ${isDark ? '#555' : 'white'};
      color: ${isDark ? 'white' : 'black'};
    }
    .input-area button {
      padding: 8px 16px;
      background-color: ${isDark ? '#007bff' : '#0056b3'};
      color: white;
      border: none;
      cursor: pointer;
    }
    .input-area button:hover {
      background-color: ${isDark ? '#0056b3' : '#003d80'};
    }
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }
    .settings-form label {
      font-weight: bold;
    }
    .settings-form input, .settings-form select {
      padding: 6px;
      border: 1px solid ${isDark ? '#555' : '#ccc'};
      background-color: ${isDark ? '#555' : 'white'};
      color: ${isDark ? 'white' : 'black'};
    }
    .user-message {
      text-align: right;
      background-color: ${isDark ? '#0056b3' : '#007bff'};
      color: white;
      padding: 8px;
      margin: 8px 8px 8px 40px;
      border-radius: 8px;
    }
    .assistant-message {
      text-align: left;
      background-color: ${isDark ? '#555' : '#f0f0f0'};
      color: ${isDark ? 'white' : 'black'};
      padding: 8px;
      margin: 8px 40px 8px 8px;
      border-radius: 8px;
    }
    .system-message {
      text-align: center;
      color: ${isDark ? '#ff6666' : '#cc0000'};
      font-style: italic;
      padding: 4px;
      margin: 4px;
    }
    @media (max-width: 768px) {
      .main-container {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        display: flex;
        justify-content: space-around;
        padding: 8px;
      }
      .nav-button {
        padding: 8px;
        margin-bottom: 0;
      }
      .content-area {
        padding: 12px;
      }
      .chat-history {
        height: 60vh;
      }
      .input-area {
        flex-direction: column;
      }
      .input-area button {
        width: 100%;
        margin-top: 8px;
      }
    }
  `;
}

function createUI() {
  const mainContainer = document.createElement('div');
  mainContainer.className = 'main-container';
  document.body.appendChild(mainContainer);

  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  const chatNav = document.createElement('button');
  chatNav.className = 'nav-button';
  chatNav.textContent = 'Chat';
  chatNav.onclick = () => showView('chat');
  const settingsNav = document.createElement('button');
  settingsNav.className = 'nav-button';
  settingsNav.textContent = 'Settings';
  settingsNav.onclick = () => showView('settings');
  sidebar.appendChild(chatNav);
  sidebar.appendChild(settingsNav);
  mainContainer.appendChild(sidebar);

  const contentArea = document.createElement('div');
  contentArea.className = 'content-area';
  mainContainer.appendChild(contentArea);

  chatView = document.createElement('div');
  chatView.className = 'chat-view';
  chatHistory = document.createElement('div');
  chatHistory.id = 'chat-history';
  chatHistory.className = 'chat-history';
  const inputArea = document.createElement('div');
  inputArea.className = 'input-area';
  inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.placeholder = 'Type your message...';
  const sendButton = document.createElement('button');
  sendButton.textContent = 'Send';
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.display = 'none';
  inputArea.appendChild(inputField);
  inputArea.appendChild(sendButton);
  inputArea.appendChild(cancelButton);
  chatView.appendChild(chatHistory);
  chatView.appendChild(inputArea);
  contentArea.appendChild(chatView);

  settingsView = document.createElement('div');
  settingsView.className = 'settings-view';
  const settingsForm = document.createElement('div');
  settingsForm.className = 'settings-form';
  const apiKeyLabel = document.createElement('label');
  apiKeyLabel.textContent = 'API Key:';
  apiKeyInput = document.createElement('input');
  apiKeyInput.type = 'text';
  apiKeyInput.placeholder = 'Enter your API key';
  apiKeyInput.onblur = async () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      await saveSetting('apiKey', key);
      // Trigger model population in main.js
      document.dispatchEvent(new Event('apiKeyUpdated'));
    }
  };
  const modelLabel = document.createElement('label');
  modelLabel.textContent = 'Select Model:';
  modelSelect = document.createElement('select');
  const themeLabel = document.createElement('label');
  themeLabel.textContent = 'Dark Mode:';
  themeToggle = document.createElement('input');
  themeToggle.type = 'checkbox';
  themeToggle.onchange = async () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    setTheme(theme);
    await saveSetting('theme', theme);
  };
  settingsForm.appendChild(apiKeyLabel);
  settingsForm.appendChild(apiKeyInput);
  settingsForm.appendChild(modelLabel);
  settingsForm.appendChild(modelSelect);
  settingsForm.appendChild(themeLabel);
  settingsForm.appendChild(themeToggle);
  settingsView.appendChild(settingsForm);
  contentArea.appendChild(settingsView);

  sendButton.addEventListener('click', () => document.dispatchEvent(new CustomEvent('sendMessage', { detail: { cancelButton } })));
  cancelButton.addEventListener('click', () => document.dispatchEvent(new Event('cancelStream')));
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('sendMessage', { detail: { cancelButton } }));
    }
  });
}

function showView(view) {
  chatView.style.display = view === 'chat' ? 'block' : 'none';
  settingsView.style.display = view === 'settings' ? 'block' : 'none';
  if (view === 'settings') {
    document.dispatchEvent(new Event('populateModels'));
  }
}

export { createUI, setTheme, showView, chatHistory, inputField, apiKeyInput, modelSelect, themeToggle };