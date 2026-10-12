/**
 * ChatMessage.jsx
 *
 * Renders a single chat message bubble.
 * User messages appear on the right; assistant messages on the left.
 */

export function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}
      id={`msg-${message.id}`}
    >
      {!isUser && (
        <div className="chat-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect x="4" y="8" width="16" height="12" rx="2" />
            <path d="M9 15h0" /><path d="M15 15h0" />
            <path d="M10 18h4" />
          </svg>
        </div>
      )}
      <div className="chat-bubble">
        <div className="chat-bubble-content">
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
