/**
 * InstallButton.jsx
 *
 * A reusable PWA install button component.
 * Renders only when the app is installable (i.e., the browser has fired
 * a `beforeinstallprompt` event and the app is not yet installed).
 *
 * Usage:
 *   import { InstallButton } from './pwa/InstallButton';
 *   // Place <InstallButton /> wherever you'd like in your UI.
 */

import React from 'react';
import { useInstallPrompt } from './useInstallPrompt';

/**
 * Inline styles for the install button — self-contained so it can be
 * dropped into any layout without requiring external CSS.
 */
const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
    fontFamily: 'inherit',
  },
  buttonHover: {
    backgroundColor: '#15803d',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
  },
  icon: {
    width: '18px',
    height: '18px',
    fill: 'currentColor',
  },
};

/**
 * Download / install icon as inline SVG.
 */
function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={styles.icon}
      aria-hidden="true"
    >
      <path d="M12 16l-5-5 1.41-1.41L11 12.17V4h2v8.17l2.59-2.58L17 11l-5 5zm-6 2h12v2H6v-2z" />
    </svg>
  );
}

export function InstallButton() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [hovered, setHovered] = React.useState(false);

  // Only render when installable and not already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <button
      id="pwa-install-button"
      onClick={promptInstall}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.button,
        ...(hovered ? styles.buttonHover : {}),
      }}
      aria-label="Install SecenAI app"
    >
      <DownloadIcon />
      Install App
    </button>
  );
}

export default InstallButton;
