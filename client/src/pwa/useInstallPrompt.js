/**
 * useInstallPrompt.js
 *
 * Custom React hook that manages the PWA install prompt lifecycle.
 * Captures the `beforeinstallprompt` event, exposes install availability,
 * and provides a trigger function to invoke the native install dialog.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * @returns {{
 *   isInstallable: boolean,
 *   isInstalled: boolean,
 *   promptInstall: () => Promise<void>
 * }}
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Capture the browser's install prompt event before it fires
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    };

    // Detect when the app is successfully installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already running in standalone (installed) mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Trigger the native browser install prompt.
   * Resolves after the user accepts or dismisses the dialog.
   */
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    // Prompt can only be used once
    setDeferredPrompt(null);
    setIsInstallable(false);
  }, [deferredPrompt]);

  return { isInstallable, isInstalled, promptInstall };
}

export default useInstallPrompt;
