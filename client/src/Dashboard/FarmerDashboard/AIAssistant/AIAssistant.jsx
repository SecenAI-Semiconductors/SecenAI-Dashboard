/**
 * AIAssistant.jsx
 *
 * Main page component for the AI farming assistant chat interface.
 * Follows the same dashboard-view / dashboard-content layout as
 * WeatherDashboard and other Farmer Dashboard modules.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { SuggestedQuestions } from './components/SuggestedQuestions'
import { sendChatMessage } from './api'
import {
  WELCOME_MESSAGE,
  ERROR_MESSAGE,
  createMessage,
  toApiHistory,
} from './utils'
import './AIAssistant.css'

export function AIAssistant() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  // Set page title + re-trigger GTranslate for SPA navigation.
  // GTranslate translates on page load, but client-side React Router
  // navigation renders new content that GTranslate hasn't processed.
  // Dispatching a "change" on the hidden Google Translate <select>
  // forces a re-translation pass over the new DOM content.
  useEffect(() => {
    document.title = 'AI Assistant | SecenAI'

    const timer = setTimeout(() => {
      try {
        const combo = document.querySelector('.goog-te-combo')
        if (combo && combo.value && combo.value !== 'en') {
          combo.dispatchEvent(new Event('change'))
        }
      } catch (_) {
        // GTranslate not loaded or not active — ignore
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  const handleSend = useCallback(
    async (text) => {
      const messageText = (text || inputValue).trim()
      if (!messageText || loading) return

      // Add user message to chat
      const userMsg = createMessage('user', messageText)
      setMessages((prev) => [...prev, userMsg])
      setInputValue('')
      setLoading(true)

      try {
        // Build API history from existing messages (before this new one)
        const apiHistory = toApiHistory([...messages, userMsg])
        const reply = await sendChatMessage(messageText, apiHistory)
        const assistantMsg = createMessage('assistant', reply)
        setMessages((prev) => [...prev, assistantMsg])
      } catch (err) {
        console.error('AI Assistant error:', err)
        const errorMsg = createMessage('assistant', ERROR_MESSAGE)
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setLoading(false)
      }
    },
    [inputValue, loading, messages]
  )

  function handleSuggestedQuestion(question) {
    if (loading) return
    handleSend(question)
  }

  const isEmpty = messages.length === 0

  return (
    <div className="dashboard-view ai-assistant-view" id="ai-assistant-page">
      <section className="dashboard-content ai-assistant-content">
        {/* Header */}
        <div className="ai-assistant-header">
          <h1 className="dashboard-heading">AI Assistant</h1>
          <p className="dashboard-subheading">
            Your personal farming assistant for queries and recommendations.
          </p>
        </div>

        {/* Chat area */}
        <div className="ai-chat-container" id="ai-chat-container">
          <div className="ai-chat-messages" id="ai-chat-messages">
            {isEmpty && (
              <div className="ai-chat-welcome" id="ai-chat-welcome">
                <div className="ai-chat-welcome-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" />
                    <rect x="4" y="8" width="16" height="12" rx="2" />
                    <path d="M9 15h0" /><path d="M15 15h0" />
                    <path d="M10 18h4" />
                  </svg>
                </div>
                <p className="ai-chat-welcome-text">{WELCOME_MESSAGE}</p>
                <SuggestedQuestions
                  onSelect={handleSuggestedQuestion}
                  disabled={loading}
                />
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="chat-message chat-message--assistant" id="chat-loading-indicator">
                <div className="chat-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8" />
                    <rect x="4" y="8" width="16" height="12" rx="2" />
                    <path d="M9 15h0" /><path d="M15 15h0" />
                    <path d="M10 18h4" />
                  </svg>
                </div>
                <div className="chat-bubble">
                  <div className="chat-typing-indicator">
                    <span className="chat-typing-dot"></span>
                    <span className="chat-typing-dot"></span>
                    <span className="chat-typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested questions (after conversation has started) */}
          {!isEmpty && !loading && (
            <SuggestedQuestions
              onSelect={handleSuggestedQuestion}
              disabled={loading}
            />
          )}

          {/* Input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={() => handleSend()}
            disabled={loading}
          />
        </div>
      </section>
    </div>
  )
}
