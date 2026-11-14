/**
 * SuggestedQuestions.jsx
 *
 * Collapsible "Try asking…" dropdown.
 * The trigger row shows the label + a chevron; clicking it toggles
 * the list of question chips open/closed.
 */

import { useState } from 'react'
import { SUGGESTED_QUESTIONS } from '../utils'

export function SuggestedQuestions({ onSelect, disabled }) {
  const [open, setOpen] = useState(false)

  function handleSelect(question) {
    setOpen(false)
    onSelect(question)
  }

  return (
    <div className={`suggested-questions${open ? ' suggested-questions--open' : ''}`} id="suggested-questions">
      {/* ── Toggle trigger ── */}
      <button
        type="button"
        className="suggested-questions-toggle"
        id="suggested-questions-toggle"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={open}
        aria-controls="suggested-questions-list"
      >
        <span className="suggested-questions-label">Try asking</span>
        {/* Chevron */}
        <svg
          className="suggested-questions-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Collapsible chip list ── */}
      <div
        className="suggested-questions-list"
        id="suggested-questions-list"
        role="list"
      >
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <button
            key={index}
            type="button"
            role="listitem"
            className="suggested-question-chip"
            id={`suggested-question-${index}`}
            onClick={() => handleSelect(question)}
            disabled={disabled}
            tabIndex={open ? 0 : -1}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
