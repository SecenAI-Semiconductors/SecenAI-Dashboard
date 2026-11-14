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

const STORAGE_KEY = 'googtrans_lang'
const DEFAULT_LANGUAGE = 'en'

/**
 * Loads the official Google Translate Element script exactly once.
 * Works on localhost with no API key — free and no GTranslate CDN plan needed.
 * The script injects a hidden <select class="goog-te-combo"> which we drive
 * programmatically to change the page language without a page reload.
 */
function loadGTranslateScript() {
  if (window.__gTranslateLoaded) return
  window.__gTranslateLoaded = true

  // Callback the Translate Element calls once it's ready
  window.googleTranslateElementInit = function () {
    // eslint-disable-next-line no-new
    new window.google.translate.TranslateElement(
      {
        pageLanguage: DEFAULT_LANGUAGE,
        includedLanguages: SUPPORTED_LANGUAGES.map((l) => l.code).join(','),
        autoDisplay: false,
      },
      'google_translate_element'
    )

    // ── Kill the Google Translate toolbar banner ──
    // Google injects a fixed iframe + shifts body.style.top by ~40px.
    // We use both CSS (LanguageSwitcher.css) AND this observer so that
    // inline-style overrides are also caught and reversed immediately.
    const stripBanner = () => {
      // Remove the banner iframe
      const banner = document.querySelector('.goog-te-banner-frame')
      if (banner) banner.style.display = 'none'
      // Reset body top offset that Google adds
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px'
      }
    }

    stripBanner()

    const observer = new MutationObserver(stripBanner)
    observer.observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['style'] })
  }

  const script = document.createElement('script')
  script.src =
    'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  script.onerror = () => {
    console.error('[LanguageSwitcher] Failed to load Google Translate script.')
    window.__gTranslateLoaded = false
  }
  document.body.appendChild(script)
}

/**
 * Change page language by setting the value on the hidden goog-te-combo
 * <select> that Google Translate injects, then firing a change event.
 * Falls back to cookie + reload if the element isn't ready yet.
 */
function doGTranslate(langCode) {
  // Try the live Google Translate combo select (no reload needed)
  const combo = document.querySelector('.goog-te-combo')
  if (combo) {
    combo.value = langCode
    combo.dispatchEvent(new Event('change'))
    return
  }

  // Fallback: set googtrans cookie and reload
  // (only needed on first load before the element has initialised)
  if (langCode === DEFAULT_LANGUAGE) {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    window.location.reload()
    return
  }
  const value = `/${DEFAULT_LANGUAGE}/${langCode}`
  document.cookie = `googtrans=${value}; path=/`
  // NOTE: do NOT set domain=.localhost — browsers silently reject it
  window.location.reload()
}

/**
 * Get the currently active language from cookie or localStorage.
 */
function getActiveLanguage() {
  // Cookie is the source of truth after a Google Translate reload.
  // If no cookie exists the page is in the default language (English),
  // so ignore any stale localStorage value.
  const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/)
  if (match && match[1] && SUPPORTED_LANGUAGES.some((l) => l.code === match[1])) {
    return match[1]
  }

  // No cookie → page is in English (or cookie was cleared).
  // Trust localStorage only when there IS an active translation cookie,
  // otherwise it may be stale from a previous session.
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

  /* ── Load Google Translate Element script on first mount ── */
  useEffect(() => {
    try {
      loadGTranslateScript()
    } catch (err) {
      console.error('[LanguageSwitcher] Script load error:', err)
    }
  }, [])

  /* ── Restore persisted language on mount ── */
  // (getActiveLanguage already reads the cookie on init, so activeLang
  //  is correct; this effect is kept only as a no-op safety net.)
  useEffect(() => {
    // activeLang is already initialised from the cookie in getActiveLanguage().
    // Nothing extra needed here.
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

      // When switching to English, clear localStorage so that after the
      // page reload (which clears the cookie) activeLang is not stale.
      if (langCode === DEFAULT_LANGUAGE) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, langCode)
      }

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

        <span className="language-switcher-label notranslate" translate="no">{activeLangObj.name}</span>

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
        className="language-switcher-menu notranslate"
        ref={menuRef}
        role="listbox"
        aria-label="Select language"
        onKeyDown={handleMenuKeyDown}
        id="language-switcher-menu"
        translate="no"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <li key={lang.code} role="presentation">
            <button
              type="button"
              role="option"
              className={`language-switcher-option notranslate${
                lang.code === activeLang
                  ? ' language-switcher-option--active'
                  : ''
              }`}
              aria-selected={lang.code === activeLang}
              onClick={() => handleSelect(lang.code)}
              tabIndex={isOpen ? 0 : -1}
              id={`language-option-${lang.code}`}
              translate="no"
            >
              {lang.name}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Hidden Google Translate Element mount point (visually hidden, functional) ── */}
      <div id="google_translate_element" aria-hidden="true" style={{ display: 'none' }} />
    </div>
  )
}

export const LanguageSwitcher = memo(LanguageSwitcherInner)
export default LanguageSwitcher
