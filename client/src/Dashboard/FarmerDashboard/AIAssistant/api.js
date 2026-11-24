/**
 * AI Assistant API module.
 * Sends chat messages to the backend POST /api/ai-assistant/chat endpoint.
 * Also handles loading/saving chat history per farmer account.
 * Uses the shared Axios instance from services/api.js.
 */

import api from '../../../services/api'

/**
 * Send a chat message and receive an AI reply.
 *
 * @param {string} message - The user's message (max 500 chars).
 * @param {Array}  history - Conversation history [{role, content}].
 * @returns {Promise<string>} The assistant's reply text.
 * @throws {Error} On network failure or server error.
 */
export async function sendChatMessage(message, history = []) {
  const response = await api.post('/api/ai-assistant/chat', {
    message,
    history,
  })

  const { reply } = response.data

  if (!reply || typeof reply !== 'string') {
    throw new Error('Invalid response from server')
  }

  return reply
}

// ── Chat History persistence (per farmer account) ────────────────────────

/**
 * Load the farmer's saved chat history from the server.
 * Returns an empty array if none exists or the user is not logged in.
 */
export async function loadChatHistory() {
  try {
    const response = await api.get('/api/farmer/chat-history')
    return response.data.messages || []
  } catch (err) {
    // Silently return empty on 401 (not logged in) or any error
    console.warn('[AIAssistant] Could not load chat history:', err.message)
    return []
  }
}

/**
 * Save the farmer's chat history to the server.
 * The server caps at 50 messages (oldest pruned).
 *
 * @param {Array} messages - Full messages array [{role, content, timestamp}].
 */
export async function saveChatHistory(messages) {
  try {
    await api.put('/api/farmer/chat-history', { messages })
  } catch (err) {
    console.warn('[AIAssistant] Could not save chat history:', err.message)
  }
}

/**
 * Clear the farmer's chat history on the server.
 */
export async function clearChatHistory() {
  try {
    await api.delete('/api/farmer/chat-history')
  } catch (err) {
    console.warn('[AIAssistant] Could not clear chat history:', err.message)
  }
}
