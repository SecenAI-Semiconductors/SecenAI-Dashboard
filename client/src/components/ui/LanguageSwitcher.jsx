/**
 * LanguageSwitcher.jsx
 *
 * Reusable language translation widget powered by GTranslate.
 * Renders a custom dropdown in the navbar that triggers GTranslate
 * page translation. The GTranslate script is loaded once globally.
 *
 * Usage:
 *   import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
 *   <LanguageSwitcher />
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import './LanguageSwitcher.css'

/* ── Supported languages (code → display name) ── */
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te', name: 'Telugu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
]

const STORAGE_KEY = 'gtranslate_lang'
const SCRIPT_SRC = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js'

/* ── Read config from env with fallbacks ── */
const DEFAULT_LANGUAGE =
  import.meta.env.VITE_GTRANSLATE_DEFAULT_LANGUAGE || 'en'

/**
 * Loads the GTranslate script exactly once, no matter how many
 * LanguageSwitcher instances mount across routes.
 */
function loadGTranslateScript() {
  if (window.__gtranslateLoaded) return

  window.__gtranslateLoaded = true

  // Set GTranslate config before loading the script
  window.gtranslateSettings = {
    default_language: DEFAULT_LANGUAGE,
    languages: SUPPORTED_LANGUAGES.map((l) => l.code),
    wrapper_selector: '.gtranslate_wrapper',
    detect_browser_language: false,
  }

  const script = document.createElement('script')
  script.src = SCRIPT_SRC
  script.defer = true

  script.onerror = () => {
    console.error('[LanguageSwitcher] Failed to load GTranslate script.')
    window.__gtranslateLoaded = false // allow retry on next mount
  }

  document.body.appendChild(script)
}

/**
 * Triggers GTranslate to change the page language.
 * GTranslate uses a cookie named "googtrans" and manipulates the DOM.
 * We set the cookie and reload the translate engine.
 */
function doGTranslate(langCode) {
  if (langCode === DEFAULT_LANGUAGE) {
    // Reset to original language
    document.cookie =
      'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    document.cookie =
      'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' +
      window.location.hostname

    // Attempt to restore original content
    if (typeof window.location.reload === 'function') {
      window.location.reload()
    }
    return
  }

  // Set the googtrans cookie for GTranslate
  const value = `/${DEFAULT_LANGUAGE}/${langCode}`
  document.cookie = `googtrans=${value}; path=/`
  document.cookie = `googtrans=${value}; path=/; domain=.${window.location.hostname}`

  // Reload the page so GTranslate picks up the new cookie
  window.location.reload()
}

/**
 * Get the currently active language from cookie or localStorage.
 */
function getActiveLanguage() {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
    return stored
  }

  // Check googtrans cookie
  const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/)
  if (match && match[1]) {
    return match[1]
  }

  return DEFAULT_LANGUAGE
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

function LanguageSwitcherInner() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeLang, setActiveLang] = useState(getActiveLanguage)
  const wrapperRef = useRef(null)
  const menuRef = useRef(null)
  const btnRef = useRef(null)

  /* ── Load GTranslate script on first mount ── */
  useEffect(() => {
    try {
      loadGTranslateScript()
    } catch (err) {
      console.error('[LanguageSwitcher] Script load error:', err)
    }
  }, [])

  /* ── Restore persisted language on mount ── */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved !== DEFAULT_LANGUAGE && saved !== activeLang) {
      setActiveLang(saved)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  /* ── Close on Escape key ── */
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        btnRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  /* ── Handle language selection ── */
  const handleSelect = useCallback(
    (langCode) => {
      if (langCode === activeLang) {
        setIsOpen(false)
        return
      }

      setActiveLang(langCode)
      localStorage.setItem(STORAGE_KEY, langCode)
      setIsOpen(false)

      // Give the UI a moment to update before triggering translation
      requestAnimationFrame(() => {
        try {
          doGTranslate(langCode)
        } catch (err) {
          console.error('[LanguageSwitcher] Translation error:', err)
        }
      })
    },
    [activeLang]
  )

  /* ── Keyboard nav inside menu ── */
  const handleMenuKeyDown = useCallback(
    (e) => {
      if (!isOpen || !menuRef.current) return

      const items = menuRef.current.querySelectorAll(
        '.language-switcher-option'
      )
      const currentIndex = Array.from(items).indexOf(document.activeElement)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          items[Math.min(currentIndex + 1, items.length - 1)]?.focus()
          break
        case 'ArrowUp':
          e.preventDefault()
          items[Math.max(currentIndex - 1, 0)]?.focus()
          break
        case 'Home':
          e.preventDefault()
          items[0]?.focus()
          break
        case 'End':
          e.preventDefault()
          items[items.length - 1]?.focus()
          break
        case 'Tab':
          setIsOpen(false)
          break
        default:
          break
      }
    },
    [isOpen]
  )

  const activeLangObj = SUPPORTED_LANGUAGES.find(
    (l) => l.code === activeLang
  ) || SUPPORTED_LANGUAGES[0]

  return (
    <div
      className={`language-switcher${isOpen ? ' language-switcher--open' : ''}`}
      ref={wrapperRef}
      id="language-switcher"
    >
      {/* ── Trigger button ── */}
      <button
        type="button"
        className="language-switcher-btn"
        ref={btnRef}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Language: ${activeLangObj.name}. Click to change language.`}
        id="language-switcher-toggle"
      >
        {/* Globe icon */}
        <svg
          className="language-switcher-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        <span className="language-switcher-label">{activeLangObj.name}</span>

        {/* Chevron */}
        <svg
          className="language-switcher-chevron"
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

      {/* ── Dropdown menu ── */}
      <ul
        className="language-switcher-menu"
        ref={menuRef}
        role="listbox"
        aria-label="Select language"
        onKeyDown={handleMenuKeyDown}
        id="language-switcher-menu"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <li key={lang.code} role="presentation">
            <button
              type="button"
              role="option"
              className={`language-switcher-option${
                lang.code === activeLang
                  ? ' language-switcher-option--active'
                  : ''
              }`}
              aria-selected={lang.code === activeLang}
              onClick={() => handleSelect(lang.code)}
              tabIndex={isOpen ? 0 : -1}
              id={`language-option-${lang.code}`}
            >
              {lang.name}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Hidden GTranslate wrapper (functional, visually hidden) ── */}
      <div className="gtranslate_wrapper" aria-hidden="true" />
    </div>
  )
}

export const LanguageSwitcher = memo(LanguageSwitcherInner)
export default LanguageSwitcher
