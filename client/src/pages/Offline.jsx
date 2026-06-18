/**
 * Offline.jsx
 *
 * A modern, responsive offline page shown when the user has no network
 * connectivity. Features a clean illustration, messaging, and a retry button.
 *
 * This page is created but NOT injected into any routes automatically.
 * To use it, import and render it in your routing configuration.
 *
 * Usage:
 *   import Offline from './pages/Offline';
 */

import React from 'react';

/**
 * Inline SVG illustration — a stylised cloud with a disconnected signal.
 */
function OfflineIllustration() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ marginBottom: '24px' }}
    >
      {/* Cloud body */}
      <ellipse cx="100" cy="115" rx="65" ry="35" fill="#e2e8f0" />
      <ellipse cx="72" cy="100" rx="35" ry="30" fill="#e2e8f0" />
      <ellipse cx="128" cy="95" rx="40" ry="35" fill="#e2e8f0" />
      <ellipse cx="100" cy="85" rx="30" ry="28" fill="#f1f5f9" />

      {/* Diagonal "no connection" line */}
      <line
        x1="55"
        y1="55"
        x2="145"
        y2="145"
        stroke="#ef4444"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="145"
        y1="55"
        x2="55"
        y2="145"
        stroke="#ef4444"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* WiFi arcs (greyed-out) */}
      <path
        d="M70 72 Q100 45 130 72"
        stroke="#cbd5e1"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M80 82 Q100 62 120 82"
        stroke="#cbd5e1"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="100" cy="92" r="4" fill="#cbd5e1" />

      {/* Subtle bottom shadow */}
      <ellipse cx="100" cy="160" rx="50" ry="6" fill="rgba(0,0,0,0.05)" />
    </svg>
  );
}

/**
 * Styles — fully self-contained so this page has zero external CSS dependencies.
 */
const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    textAlign: 'center',
    maxWidth: '440px',
    width: '100%',
    padding: '48px 32px',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    boxShadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.08)',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 12px',
  },
  description: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: 1.6,
    margin: '0 0 32px',
  },
  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 28px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
    fontFamily: 'inherit',
  },
  retryButtonHover: {
    backgroundColor: '#15803d',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
  },
  retryIcon: {
    width: '18px',
    height: '18px',
    fill: 'currentColor',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    marginBottom: '24px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
  },
};

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={styles.retryIcon}
      aria-hidden="true"
    >
      <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}

export function Offline() {
  const [hovered, setHovered] = React.useState(false);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Status badge */}
        <div style={styles.badge}>
          <span style={styles.dot} />
          No Connection
        </div>

        {/* Illustration */}
        <OfflineIllustration />

        {/* Messaging */}
        <h1 style={styles.heading}>You are offline</h1>
        <p style={styles.description}>
          It looks like you've lost your internet connection.
          Please check your network settings and try again.
        </p>

        {/* Retry */}
        <button
          id="offline-retry-button"
          onClick={handleRetry}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            ...styles.retryButton,
            ...(hovered ? styles.retryButtonHover : {}),
          }}
          aria-label="Retry connection"
        >
          <RefreshIcon />
          Try Again
        </button>
      </div>
    </div>
  );
}

export default Offline;
