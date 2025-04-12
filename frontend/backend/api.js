let apiKey = '';

async function fetchModels() {
  if (!apiKey) return [];
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    const freeModels = data.data.filter(model =>
      model.pricing.prompt === "0" && model.pricing.completion === "0"
    );
    return freeModels;
  } catch (e) {
    console.error('Error fetching free models:', e);
    return [];
  }
}

async function sendMessageToAPI(messages, options = {}) {
  const {
    model,
    models = [],
    provider = {},
    stream = false,
    maxTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    repetitionPenalty,
    minP,
    topA,
    seed,
    responseFormat,
    stop,
  } = options;

  const body = {
    model: model || 'openrouter/auto',
    models: models.length ? models : undefined,
    messages: messages.map(msg => ({
      role: msg.role,
      content: Array.isArray(msg.content) ? msg.content : [{ type: 'text', text: msg.content }]
    })),
    provider,
    stream,
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    top_k: topK,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    repetition_penalty: repetitionPenalty,
    min_p: minP,
    top_a: topA,
    seed,
    response_format: responseFormat,
    stop,
  };

  const controller = new AbortController();
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://DamionR.github.io/chatbot-project/',
    'X-Title': 'Chatbot Project',
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error ${response.status}: ${errorData.error.message}`);
    }

    if (!stream) {
      const data = await response.json();
      return { content: data.choices[0].message.content, controller };
    } else {
      return { stream: response.body, controller };
    }
  } catch (e) {
    throw e;
  }
}

async function checkCredits() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!response.ok) throw new Error('Failed to check credits');
    return await response.json();
  } catch (e) {
    console.error('Error checking credits:', e);
    return null;
  }
}

export { fetchModels, sendMessageToAPI, checkCredits };