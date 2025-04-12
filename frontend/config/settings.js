let settingsForm;

function createSettingsForm() {
  settingsForm = document.querySelector('.settings-form');

  const fields = [
    { label: 'Fallback Models (comma-separated)', id: 'fallbackModels', type: 'text' },
    { label: 'Provider Order (comma-separated)', id: 'providerOrder', type: 'text' },
    { label: 'Allow Fallbacks', id: 'allowFallbacks', type: 'checkbox', default: true },
    { label: 'Require Parameters', id: 'requireParameters', type: 'checkbox' },
    { label: 'Data Collection', id: 'dataCollection', type: 'select', options: ['allow', 'deny'], default: 'allow' },
    { label: 'Ignore Providers (comma-separated)', id: 'ignoreProviders', type: 'text' },
    { label: 'Quantizations (comma-separated)', id: 'quantizations', type: 'text' },
    { label: 'Sort', id: 'sort', type: 'select', options: ['', 'price', 'throughput', 'latency'] },
    { label: 'Stream', id: 'stream', type: 'checkbox' },
    { label: 'Max Tokens', id: 'maxTokens', type: 'number', min: 1 },
    { label: 'Temperature (0-2)', id: 'temperature', type: 'number', min: 0, max: 2, step: 0.1, default: 1.0 },
    { label: 'Top P (0-1)', id: 'topP', type: 'number', min: 0, max: 1, step: 0.1, default: 1.0 },
    { label: 'Top K', id: 'topK', type: 'number', min: 0, default: 0 },
    { label: 'Frequency Penalty (-2-2)', id: 'frequencyPenalty', type: 'number', min: -2, max: 2, step: 0.1, default: 0 },
    { label: 'Presence Penalty (-2-2)', id: 'presencePenalty', type: 'number', min: -2, max: 2, step: 0.1, default: 0 },
    { label: 'Repetition Penalty (0-2)', id: 'repetitionPenalty', type: 'number', min: 0, max: 2, step: 0.1, default: 1.0 },
    { label: 'Min P (0-1)', id: 'minP', type: 'number', min: 0, max: 1, step: 0.1, default: 0 },
    { label: 'Top A (0-1)', id: 'topA', type: 'number', min: 0, max: 1, step: 0.1, default: 0 },
    { label: 'Seed', id: 'seed', type: 'number' },
    { label: 'Response Format (json_object)', id: 'responseFormat', type: 'text' },
    { label: 'Stop Sequences (comma-separated)', id: 'stop', type: 'text' },
    { label: 'Max Price Prompt ($/M)', id: 'maxPricePrompt', type: 'number', step: 0.1 },
    { label: 'Max Price Completion ($/M)', id: 'maxPriceCompletion', type: 'number', step: 0.1 }
  ];

  fields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = field.label;
    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt || 'None';
        input.appendChild(option);
      });
      if (field.default) input.value = field.default;
    } else if (field.type === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = field.default || false;
    } else {
      input = document.createElement('input');
      input.type = field.type;
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step) input.step = field.step;
      if (field.default !== undefined) input.value = field.default;
    }
    input.id = field.id;
    settingsForm.appendChild(label);
    settingsForm.appendChild(input);
  });
}

function getSettings() {
  const settings = {};
  const inputs = settingsForm.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') {
      settings[input.id] = input.checked;
    } else if (input.value) {
      if (['fallbackModels', 'providerOrder', 'ignoreProviders', 'quantizations', 'stop'].includes(input.id)) {
        settings[input.id] = input.value.split(',').map(s => s.trim()).filter(s => s);
      } else if (['maxPricePrompt', 'maxPriceCompletion'].includes(input.id)) {
        settings.maxPrice = settings.maxPrice || {};
        settings.maxPrice[input.id === 'maxPricePrompt' ? 'prompt' : 'completion'] = parseFloat(input.value);
      } else if (input.id === 'responseFormat' && input.value) {
        settings[input.id] = { type: input.value };
      } else {
        settings[input.id] = input.type === 'number' ? parseFloat(input.value) : input.value;
      }
    }
  });
  return settings;
}

export { createSettingsForm, getSettings };