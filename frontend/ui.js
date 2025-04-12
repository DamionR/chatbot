let chatHistory, inputField, apiKeyInput, modelSelect, themeToggle, chatView, settingsView;
const style = document.createElement('style');
document.head.appendChild(style);

function setTheme(theme) {
  document.body.className = theme;
  setStyles();
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
    }
    .input-area input {
      flex: 1;
      padding: 5px;
    }
    .input-area button {
      margin-left: 10px;
      padding: 5px 10px;
    }
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .user-message {
      text-align: right;
      background-color: ${isDark ? '#0056b3' : '#007bff'};
      color: white;
      padding: 5px;
      margin: 5px;
      border-radius: 5px;
    }
    .assistant-message {
      text-align: left;
      background-color: ${isDark ? '#555' : '#f0f0f0'};
      padding: 5px;
      margin: 5px;
      border-radius: 5px;
    }
    .system-message {
      text-align: center;
      color: red;
      font-style: italic;
    }
    @media (max-width: 768px) {
      .main-container {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        display: flex;
        justify-content: space-around;
      }
      .content-area {
        padding: 10px;
      }
      .chat-history {
        height: 60vh;
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
  chatHistory.className = 'chat-history';
  const inputArea = document.createElement('div');
  inputArea.className = 'input-area';
  inputField = document.createElement('input');
  inputField.type = 'text';
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
  apiKeyInput.onblur = () => {
    apiKey = apiKeyInput.value;
    saveSetting('apiKey', apiKey).then(populateModels);
  };
  const modelLabel = document.createElement('label');
  modelLabel.textContent = 'Select Free Model:';
  modelSelect = document.createElement('select');
  const themeLabel = document.createElement('label');
  themeLabel.textContent = 'Dark Mode:';
  themeToggle = document.createElement('input');
  themeToggle.type = 'checkbox';
  themeToggle.onchange = () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    setTheme(theme);
    saveSetting('theme', theme);
  };
  settingsForm.appendChild(apiKeyLabel);
  settingsForm.appendChild(apiKeyInput);
  settingsForm.appendChild(modelLabel);
  settingsForm.appendChild(modelSelect);
  settingsForm.appendChild(themeLabel);
  settingsForm.appendChild(themeToggle);
  settingsView.appendChild(settingsForm);
  contentArea.appendChild(settingsView);

  sendButton.addEventListener('click', () => sendMessage(cancelButton));
  cancelButton.addEventListener('click', () => cancelStream());
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(cancelButton);
    }
  });
}

function showView(view) {
  chatView.style.display = view === 'chat' ? 'block' : 'none';
  settingsView.style.display = view === 'settings' ? 'block' : 'none';
  if (view === 'settings') populateModels();
}

export { createUI, setTheme, showView, chatHistory, inputField, apiKeyInput, modelSelect, themeToggle };