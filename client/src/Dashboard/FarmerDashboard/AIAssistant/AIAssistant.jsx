/**
 * AIAssistant.jsx
 *
 * Main page component for the AI farming assistant chat interface.
 * Follows the same dashboard-view / dashboard-content layout as
 * WeatherDashboard and other Farmer Dashboard modules.
 *
 * Chat history is persisted per farmer account in the database so it
 * survives page reloads and language switches. Capped at 50 messages.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { SuggestedQuestions } from './components/SuggestedQuestions'
import {
  sendChatMessage,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory as clearChatHistoryApi,
} from './api'
import {
  WELCOME_MESSAGE,
  ERROR_MESSAGE,
  createMessage,
  toApiHistory,
} from './utils'
import './AIAssistant.css'

/** Maximum messages to keep (server also enforces this). */
const MAX_MESSAGES = 50

/**
 * Re-trigger Google Translate on newly rendered DOM content.
 * GTranslate only translates at page load; SPA navigation and dynamic
 * content (like chat messages loaded from DB) need a manual nudge.
 */
function retriggerTranslation() {
  try {
    const combo = document.querySelector('.goog-te-combo')
    if (combo && combo.value && combo.value !== 'en') {
      combo.dispatchEvent(new Event('change'))
    }
  } catch (_) {
    // GTranslate not loaded or not active — ignore
  }
}

export function AIAssistant() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const chatEndRef = useRef(null)
  const saveTimeoutRef = useRef(null)

  // ── Load chat history from DB on mount ──
  useEffect(() => {
    let cancelled = false

    async function load() {
      const saved = await loadChatHistory()
      if (cancelled) return

      if (saved.length > 0) {
        // Restore messages with proper structure
        const restored = saved.map((m) => ({
          id: m.id || `restored-${m.timestamp || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || Date.now(),
        }))
        setMessages(restored)
      }
      setHistoryLoaded(true)

      // After messages render, retrigger translation so saved messages
      // appear in the farmer's chosen language
      setTimeout(retriggerTranslation, 500)
    }

    load()
    return () => { cancelled = true }
  }, [])

  // ── Set page title + retrigger GTranslate for SPA navigation ──
  useEffect(() => {
    document.title = 'AI Assistant | SecenAI'
    const timer = setTimeout(retriggerTranslation, 300)
    return () => clearTimeout(timer)
  }, [])

  // ── Auto-scroll to latest message ──
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading])

  // ── Debounced save to DB (300ms after last message change) ──
  // Skip the initial load to avoid overwriting with empty state.
  useEffect(() => {
    if (!historyLoaded) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      const toSave = messages.map(({ role, content, timestamp }) => ({
        role,
        content,
        timestamp,
      }))
      // Cap before sending (server also caps, but trim here too)
      const capped = toSave.length > MAX_MESSAGES
        ? toSave.slice(-MAX_MESSAGES)
        : toSave
      saveChatHistory(capped)
    }, 800)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [messages, historyLoaded])

  // ── Retrigger translation whenever messages change ──
  // So new assistant replies and loaded history get translated.
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(retriggerTranslation, 200)
      return () => clearTimeout(timer)
    }
  }, [messages])

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
        setMessages((prev) => {
          const updated = [...prev, assistantMsg]
          // Cap locally too
          return updated.length > MAX_MESSAGES
            ? updated.slice(-MAX_MESSAGES)
            : updated
        })
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

  function handleClearChat() {
    setMessages([])
    clearChatHistoryApi()
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
            <div className="ai-chat-bottom-actions">
              <SuggestedQuestions
                onSelect={handleSuggestedQuestion}
                disabled={loading}
              />
              <button
                type="button"
                className="ai-clear-chat-btn"
                onClick={handleClearChat}
                title="Clear chat history"
                id="ai-clear-chat-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear
              </button>
            </div>
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
