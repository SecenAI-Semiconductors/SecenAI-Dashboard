/**
 * AI Assistant API module.
 * Sends chat messages to the backend POST /api/ai-assistant/chat endpoint.
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
