import { useState, useEffect } from 'react';
import './DroneOperations.css';
import { FlightScheduling } from './FlightScheduling';
import { FleetMonitoring }  from './FleetMonitoring';
import { MissionLogs }      from './MissionLogs';
import { getFlights }       from './api';

const TABS = [
  { id: 'schedule', label: 'Flight Scheduling' },
  { id: 'fleet',    label: 'Fleet Monitoring' },
  { id: 'logs',     label: 'Mission Logs' },
];

export function DroneOperations() {
  const [activeTab, setActiveTab] = useState('schedule');

  // Scheduled flights — fetched from API, then updated optimistically on new schedule
  const [scheduledFlights, setScheduledFlights] = useState([]);
  const [flightsLoading, setFlightsLoading]     = useState(true);
  const [flightsError, setFlightsError]         = useState(null);

  useEffect(() => {
    setFlightsLoading(true);
    getFlights()
      .then(data => {
        setScheduledFlights(data);
        setFlightsError(null);
      })
      .catch(err => setFlightsError(err.message))
      .finally(() => setFlightsLoading(false));
  }, []);

  /** Called by FlightScheduling after a successful POST — prepend the new flight. */
  function handleFlightScheduled(newFlight) {
    setScheduledFlights(prev => [newFlight, ...prev]);
  }

  return (
    <div className="dashboard-view" id="drone-ops-dashboard">
      <section className="dashboard-content" style={{ maxWidth: 1100 }}>
        {/* ── Page Header ── */}
        <div className="dom-header">
          <div className="dom-header-left">
            <h1>Drone Operations</h1>
            <p>Schedule flights, monitor your drone fleet, and review mission logs.</p>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="dom-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`dom-tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`dom-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Panels ── */}
        {activeTab === 'schedule' && (
          <FlightScheduling
            scheduledFlights={scheduledFlights}
            flightsLoading={flightsLoading}
            flightsError={flightsError}
            onFlightScheduled={handleFlightScheduled}
          />
        )}
        {activeTab === 'fleet' && <FleetMonitoring />}
        {activeTab === 'logs'  && <MissionLogs />}
      </section>
    </div>
  );
}
