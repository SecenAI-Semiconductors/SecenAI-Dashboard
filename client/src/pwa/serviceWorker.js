/**
 * serviceWorker.js
 *
 * Service worker registration utilities for the PWA.
 * Uses the virtual module provided by vite-plugin-pwa for auto-registration.
 *
 * This module wraps the registration logic so it can be imported and invoked
 * from the application entry point (main.jsx).
 */

/**
 * Register the service worker using vite-plugin-pwa's virtual module.
 * Calling this function with `immediate: true` registers the SW right away
 * without waiting for the page to fully load.
 *
 * @param {Object} [options]
 * @param {boolean} [options.immediate=true] - Register immediately on import.
 * @param {function} [options.onRegisteredSW] - Callback after successful registration.
 * @param {function} [options.onRegisterError] - Callback on registration failure.
 */
export async function registerServiceWorker(options = {}) {
  const { immediate = true, onRegisteredSW, onRegisterError } = options;

  try {
    // Dynamic import so the virtual module is only resolved at build time
    const { registerSW } = await import('virtual:pwa-register');

    const updateSW = registerSW({
      immediate,
      onRegisteredSW(swUrl, registration) {
        if (onRegisteredSW) {
          onRegisteredSW(swUrl, registration);
        }
        // eslint-disable-next-line no-console
        console.log('[PWA] Service worker registered:', swUrl);
      },
      onRegisterError(error) {
        if (onRegisterError) {
          onRegisterError(error);
        }
        // eslint-disable-next-line no-console
        console.error('[PWA] Service worker registration failed:', error);
      },
    });

    return updateSW;
  } catch (error) {
    // Gracefully degrade — SW registration failure should never break the app
    // eslint-disable-next-line no-console
    console.warn('[PWA] Service worker registration skipped:', error.message);
    return null;
  }
}

export default registerServiceWorker;
