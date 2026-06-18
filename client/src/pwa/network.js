/**
 * network.js
 *
 * Standalone (non-React) utilities for monitoring online/offline status.
 * Useful for vanilla JS contexts or when you need network-state logic
 * outside of React component trees.
 */

/** @type {Set<function>} */
const _listeners = new Set();

/** @type {boolean} */
let _initialized = false;

/**
 * Initialize network status listeners on the window.
 * Safe to call multiple times — only attaches listeners once.
 */
export function initNetworkListeners() {
  if (_initialized) return;
  _initialized = true;

  window.addEventListener('online', () => _notifyListeners(true));
  window.addEventListener('offline', () => _notifyListeners(false));
}

/**
 * Returns the current online status.
 * @returns {boolean}
 */
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Returns the current offline status.
 * @returns {boolean}
 */
export function isOffline() {
  return !isOnline();
}

/**
 * Subscribe to network status changes.
 * @param {function} listener - Called with `{ isOnline: boolean }` on change.
 * @returns {function} Unsubscribe function.
 */
export function onNetworkChange(listener) {
  _listeners.add(listener);

  // Auto-initialize if not already done
  initNetworkListeners();

  return () => _listeners.delete(listener);
}

/**
 * Attempt to verify actual connectivity by fetching a small resource.
 * Useful because `navigator.onLine` can report false positives.
 * @param {string} [url='/favicon.svg'] - URL to ping.
 * @param {number} [timeout=5000] - Request timeout in ms.
 * @returns {Promise<boolean>}
 */
export async function checkConnectivity(url = '/favicon.svg', timeout = 5000) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(id);
    return response.ok;
  } catch {
    return false;
  }
}

/** Notify all subscribers of a network state change. */
function _notifyListeners(online) {
  const state = { isOnline: online };
  _listeners.forEach((fn) => fn(state));
}
