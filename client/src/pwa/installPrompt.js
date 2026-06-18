/**
 * installPrompt.js
 *
 * Standalone (non-React) helper functions for managing the PWA install prompt.
 * Useful for vanilla JS contexts or when you need install-prompt logic
 * outside of React component trees.
 */

/** @type {BeforeInstallPromptEvent | null} */
let _deferredPrompt = null;

/** @type {boolean} */
let _isInstallable = false;

/** @type {Set<function>} */
const _listeners = new Set();

/**
 * Initialize install prompt listeners on the window.
 * Call this once at application startup (e.g., in main.jsx).
 */
export function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    _deferredPrompt = event;
    _isInstallable = true;
    _notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    _deferredPrompt = null;
    _isInstallable = false;
    _notifyListeners();
  });
}

/**
 * Returns true if the app can currently be installed.
 * @returns {boolean}
 */
export function isInstallAvailable() {
  return _isInstallable;
}

/**
 * Trigger the native browser install prompt.
 * @returns {Promise<'accepted' | 'dismissed' | null>}
 */
export async function triggerInstallPrompt() {
  if (!_deferredPrompt) return null;

  await _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;

  // Prompt can only be used once
  _deferredPrompt = null;
  _isInstallable = false;
  _notifyListeners();

  return outcome;
}

/**
 * Check if the app is currently running in standalone (installed) mode.
 * @returns {boolean}
 */
export function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Subscribe to install-state changes.
 * @param {function} listener - Called with `{ isInstallable: boolean }`.
 * @returns {function} Unsubscribe function.
 */
export function onInstallStateChange(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

/** Notify all subscribers of a state change. */
function _notifyListeners() {
  const state = { isInstallable: _isInstallable };
  _listeners.forEach((fn) => fn(state));
}
