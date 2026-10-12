/**
 * Utility helpers for the AI Assistant module.
 */

/** Maximum character count for a single user message. */
export const MAX_MESSAGE_LENGTH = 500

/** Welcome message shown when the chat is empty. */
export const WELCOME_MESSAGE =
  "Hello! I'm your AI farming assistant. Ask me about crops, irrigation, pests, diseases, fertilizers, or general farm management."

/** Generic error message shown to the farmer. */
export const ERROR_MESSAGE =
  "I'm having trouble connecting right now. Please try again in a moment."

/** Suggested questions for quick access. */
export const SUGGESTED_QUESTIONS = [
  'How should I manage irrigation for my crop?',
  'What should I do if my crop leaves are turning yellow?',
  'What fertilizer is suitable for my crop?',
]

/**
 * Generate a unique message ID.
 * Uses crypto.randomUUID when available, falls back to timestamp + random.
 */
export function generateMessageId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Create a message object for the chat history.
 *
 * @param {'user' | 'assistant'} role
 * @param {string} content
 * @returns {{ id: string, role: string, content: string, timestamp: number }}
 */
export function createMessage(role, content) {
  return {
    id: generateMessageId(),
    role,
    content,
    timestamp: Date.now(),
  }
}

/**
 * Extract the serializable history for the API request.
 * Strips internal fields (id, timestamp) and keeps only role + content.
 *
 * @param {Array} messages - Full message objects from state.
 * @returns {Array} History entries [{role, content}].
 */
export function toApiHistory(messages) {
  return messages.map(({ role, content }) => ({ role, content }))
}
