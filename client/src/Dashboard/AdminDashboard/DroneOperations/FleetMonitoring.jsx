import { useState, useEffect, useMemo } from 'react';
import { getDrones } from './api';

const STATUS_ORDER = ['Available', 'Flying', 'Scheduled', 'Charging', 'Maintenance', 'Offline'];

function BatteryBar({ pct }) {
  const level = pct >= 50 ? 'high' : pct >= 20 ? 'medium' : 'low';
  return (
    <div className="dom-battery">
      <div className="dom-battery-bar">
        <div className={`dom-battery-fill ${level}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="dom-battery-pct">{pct}%</span>
    </div>
  );
}

function statusClass(status) {
  return status.toLowerCase().replace(/[\s/]+/g, '-');
}

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function FleetMonitoring() {
  const [drones, setDrones]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getDrones()
      .then(data => { setDrones(data); setError(null); })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => ({
    total:    drones.length,
    available: drones.filter(d => d.status === 'Available').length,
    scheduled: drones.filter(d => d.status === 'Scheduled').length,
    flying:    drones.filter(d => d.status === 'Flying').length,
    charging:  drones.filter(d => d.status === 'Charging' || d.status === 'Maintenance').length,
    offline:   drones.filter(d => d.status === 'Offline').length,
  }), [drones]);

  const sortedDrones = useMemo(() =>
    [...drones].sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    ), [drones]
  );

  if (loading) return <div className="cim-loading">Loading fleet data...</div>;
  if (error)   return <div className="cim-error">{error}</div>;

  return (
    <>
      {/* ── Overview Metrics ── */}
      <div className="dom-metrics-grid">
        <div className="dom-metric-card">
          <span className="dom-metric-title">Total Drones</span>
          <span className="dom-metric-value">{metrics.total}</span>
        </div>
        <div className="dom-metric-card available">
          <span className="dom-metric-title">Available</span>
          <span className="dom-metric-value">{metrics.available}</span>
        </div>
        <div className="dom-metric-card scheduled">
          <span className="dom-metric-title">Scheduled</span>
          <span className="dom-metric-value">{metrics.scheduled}</span>
        </div>
        <div className="dom-metric-card flying">
          <span className="dom-metric-title">Flying</span>
          <span className="dom-metric-value">{metrics.flying}</span>
        </div>
        <div className="dom-metric-card charging">
          <span className="dom-metric-title">Charging / Maint.</span>
          <span className="dom-metric-value">{metrics.charging}</span>
        </div>
        <div className="dom-metric-card offline">
          <span className="dom-metric-title">Offline</span>
          <span className="dom-metric-value">{metrics.offline}</span>
        </div>
      </div>

      {/* ── Drone Table ── */}
      <div className="dom-table-container">
        <table className="dom-table">
          <thead>
            <tr>
              <th>Drone ID</th>
              <th>Model</th>
              <th>Status</th>
              <th>Battery</th>
              <th>Assigned Mission</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {sortedDrones.map(drone => (
              <tr key={drone.id}>
                <td style={{ fontWeight: 600 }}>{drone.id}</td>
                <td>{drone.model}</td>
                <td>
                  <span className={`dom-badge ${statusClass(drone.status)}`}>
                    {drone.status}
                  </span>
                </td>
                <td>
                  {drone.battery > 0 ? (
                    <BatteryBar pct={drone.battery} />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                  )}
                </td>
                <td style={{ color: drone.mission ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: drone.mission ? 'monospace' : 'inherit', fontSize: 13 }}>
                  {drone.mission || '—'}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  {timeAgo(drone.lastActivity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
