import { saveChat } from '../backend/db.js';

export async function addMessageToHistory(role, content, sessionId, metadata = null) {
  try {
    const maxLength = 1000;
    const truncatedContent = content.length > maxLength ? content.substring(0, maxLength) + '...' : content;

    const msgDiv = document.createElement('div');
    msgDiv.className = role === 'user' ? 'user-message' : role === 'assistant' ? 'assistant-message' : 'system-message';
    msgDiv.textContent = truncatedContent;

    if (metadata) {
      const metaDiv = document.createElement('div');
      metaDiv.className = 'system-message';
      metaDiv.textContent = `Metadata: ${JSON.stringify(metadata)}`;
      metaDiv.style.fontSize = '0.8em';
      metaDiv.style.opacity = '0.7';
      document.getElementById('chat-history').appendChild(metaDiv);
    }

    document.getElementById('chat-history').appendChild(msgDiv);
    document.getElementById('chat-history').scrollTop = document.getElementById('chat-history').scrollHeight;

    if (sessionId) {
      await saveChat({ role, content: truncatedContent }, sessionId);
    } else {
      throw new Error('No sessionId provided');
    }
  } catch (error) {
    console.error('Error adding message to history:', error);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'system-message';
    errorDiv.textContent = `Error displaying message: ${error.message}`;
    document.getElementById('chat-history').appendChild(errorDiv);
    document.getElementById('chat-history').scrollTop = document.getElementById('chat-history').scrollHeight;
  }
}

export async function processStream(stream, controller, sessionId, context = null, retries = 3) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let reply = '';

  try {
    while (true) {
      let attempt = 0;
      let readResult = null;
      while (attempt < retries) {
        try {
          readResult = await reader.read();
          break;
        } catch (error) {
          attempt++;
          if (attempt === retries) {
            throw new Error(`Failed to read stream after ${retries} attempts: ${error.message}`);
          }
          console.warn(`Stream read attempt ${attempt}/${retries} failed: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      const { done, value } = readResult;
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          attempt = 0;
          while (attempt < retries) {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                let shouldAppend = true;
                if (context) {
                  const contextData = JSON.parse(context);
                  const lastChat = contextData[contextData.length - 1];
                  if (lastChat?.content) {
                    const queryWords = lastChat.content.toLowerCase().split(/\s+/);
                    const contentWords = content.toLowerCase().split(/\s+/);
                    shouldAppend = queryWords.some(q => contentWords.includes(q));
                  }
                }

                if (shouldAppend) {
                  reply += content;
                  await addMessageToHistory('assistant', reply, sessionId);
                }
              }
              break;
            } catch (e) {
              attempt++;
              if (attempt === retries) {
                throw new Error(`Invalid JSON in stream after ${retries} attempts: ${e.message}`);
              }
              console.warn(`JSON parse attempt ${attempt}/${retries} failed: ${e.message}`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
      }
    }
    await saveChat({ role: 'assistant', content: reply }, sessionId);
    return reply;
  } catch (error) {
    console.error('Stream processing error:', error);
    await addMessageToHistory('system', `Error processing stream: ${error.message}`, sessionId);
    throw error;
  } finally {
    reader.releaseLock();
    if (controller) controller.abort();
  }
}