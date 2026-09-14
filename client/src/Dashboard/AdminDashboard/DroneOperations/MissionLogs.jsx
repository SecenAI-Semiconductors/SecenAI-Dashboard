import { useState, useEffect, useMemo } from 'react';
import { getMissions, MISSION_TYPES } from './api';
import { MissionDetailDrawer } from './MissionDetailDrawer';

const ALL_STATUSES = ['All', 'Completed', 'In Progress', 'Aborted'];
const ALL_TYPES    = ['All', ...MISSION_TYPES];

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

export function MissionLogs() {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatus]       = useState('All');
  const [typeFilter, setType]           = useState('All');
  const [selectedMission, setSelected]  = useState(null);

  const [missions, setMissions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Fetch whenever any filter changes (server-side filtering)
  useEffect(() => {
    setLoading(true);
    getMissions({ search, status: statusFilter, type: typeFilter })
      .then(data => { setMissions(data); setError(null); })
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, statusFilter, typeFilter]);

  return (
    <>
      {/* ── Filters ── */}
      <div className="dom-filters-section">
        <div className="dom-search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="dom-search-input"
            placeholder="Search by Mission ID, Drone, Operator, Field..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="dom-filter-select"
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>
        <select
          className="dom-filter-select"
          value={typeFilter}
          onChange={e => setType(e.target.value)}
        >
          {ALL_TYPES.map(t => (
            <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
          ))}
        </select>
      </div>

      {/* ── Mission Table ── */}
      {loading ? (
        <div className="cim-loading">Loading missions...</div>
      ) : error ? (
        <div className="cim-error">{error}</div>
      ) : (
        <div className="dom-table-container">
          <table className="dom-table">
            <thead>
              <tr>
                <th>Mission ID</th>
                <th>Date</th>
                <th>Drone</th>
                <th>Operator</th>
                <th>Field</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {missions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No missions match your filters.
                  </td>
                </tr>
              ) : (
                missions.map(mission => (
                  <tr
                    key={mission.id}
                    className="clickable"
                    onClick={() => setSelected(mission)}
                    title="Click to view mission details"
                  >
                    <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{mission.id}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(mission.date)}</td>
                    <td style={{ fontWeight: 500 }}>{mission.droneId}</td>
                    <td>{mission.operatorName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{mission.fieldName}</td>
                    <td style={{ fontSize: 13 }}>{mission.missionType}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{mission.duration}</td>
                    <td>
                      <span className={`dom-badge ${statusClass(mission.status)}`}>
                        {mission.status}
                      </span>
                      {mission.alerts.length > 0 && (
                        <span style={{
                          marginLeft: 6,
                          fontSize: 11,
                          color: mission.alerts.some(a => a.level === 'error') ? '#ef4444' : '#f59e0b',
                          fontWeight: 600,
                        }}>
                          ⚠ {mission.alerts.length}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedMission && (
        <MissionDetailDrawer
          mission={selectedMission}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
