/**
 * NetworkStatus.jsx
 *
 * A small, reusable network status indicator component.
 * Displays a pill-shaped badge showing online/offline state.
 *
 * Usage:
 *   import { NetworkStatus } from './pwa/NetworkStatus';
 *   // Place <NetworkStatus /> wherever you'd like in your UI.
 */

import React, { useState, useEffect } from 'react';

/**
 * Inline styles — self-contained so it can be dropped in without external CSS.
 */
const styles = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    userSelect: 'none',
  },
  online: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    color: '#16a34a',
    border: '1px solid rgba(22, 163, 74, 0.25)',
  },
  offline: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.3s ease',
  },
  dotOnline: {
    backgroundColor: '#16a34a',
    boxShadow: '0 0 6px rgba(22, 163, 74, 0.5)',
  },
  dotOffline: {
    backgroundColor: '#ef4444',
    boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
  },
};

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <div
      id="pwa-network-status"
      role="status"
      aria-live="polite"
      style={{
        ...styles.container,
        ...(isOnline ? styles.online : styles.offline),
      }}
    >
      <span
        style={{
          ...styles.dot,
          ...(isOnline ? styles.dotOnline : styles.dotOffline),
        }}
      />
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}

export default NetworkStatus;
