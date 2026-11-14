/**
 * ChatInput.jsx
 *
 * Textarea + Send button for the AI Assistant chat.
 * - Enter sends the message; Shift+Enter inserts a newline.
 * - Disabled while a request is in flight or input is empty.
 * - Enforces MAX_MESSAGE_LENGTH (500 characters).
 */

import { useRef, useEffect } from 'react'
import { MAX_MESSAGE_LENGTH } from '../utils'

export function ChatInput({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null)

  // Auto-focus the textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim().length > 0) {
        onSend()
      }
    }
  }

  function handleChange(e) {
    const newValue = e.target.value
    if (newValue.length <= MAX_MESSAGE_LENGTH) {
      onChange(newValue)
    }
  }

  const canSend = !disabled && value.trim().length > 0

  return (
    <div className="chat-input-container" id="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          id="chat-input-textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about farming..."
          disabled={disabled}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          aria-label="Type your message"
        />
        <div className="chat-input-footer">
          <span className="chat-input-counter">
            {value.length}/{MAX_MESSAGE_LENGTH}
          </span>
          <button
            type="button"
            className="chat-send-btn"
            id="chat-send-button"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send message"
            title="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
