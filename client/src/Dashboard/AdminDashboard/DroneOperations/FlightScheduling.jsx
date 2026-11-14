import { useState, useEffect } from 'react';
import { getDrones, getOperators, getFarmers, getFarmerById, scheduleFlight, MISSION_TYPES } from './api';
import { ScheduleFlightModal } from './ScheduleFlightModal';

const emptyForm = {
  farmerId:    '',
  droneId:     '',
  operatorId:  '',
  missionType: '',
  date:        '',
  time:        '',
  // auto-filled from farmer
  fieldId:     '',
  fieldName:   '',
  district:    '',
  state:       '',
  cropId:      '',   // which crop/plot (if farmer has multiple)
};

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function FlightScheduling({ scheduledFlights, flightsLoading, flightsError, onFlightScheduled }) {
  const [form, setForm]               = useState(emptyForm);
  const [showModal, setShowModal]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Server-returned pre-flight readiness check and flight record
  const [preflightCheck, setPreflightCheck] = useState(null);
  const [pendingFlight, setPendingFlight]   = useState(null);

  // Reference data
  const [availableDrones, setAvailableDrones] = useState([]);
  const [operators, setOperators]             = useState([]);
  const [farmers, setFarmers]                 = useState([]);
  const [refLoading, setRefLoading]           = useState(true);
  const [refError, setRefError]               = useState(null);

  // Selected farmer's profile (for auto-fill + crop list)
  const [farmerProfile, setFarmerProfile]     = useState(null);
  const [farmerLoading, setFarmerLoading]     = useState(false);

  useEffect(() => {
    setRefLoading(true);
    Promise.all([getOperators(), getFarmers()])
      .then(([ops, fms]) => {
        setOperators(ops);
        setFarmers(fms);
        setRefError(null);
      })
      .catch(err => setRefError(err.message))
      .finally(() => setRefLoading(false));
  }, []);

  // Load available drones
  useEffect(() => {
    getDrones()
      .then(drones => setAvailableDrones(drones.filter(d => d.status === 'Available')))
      .catch(() => {});
  }, []);

  // When farmer changes: fetch profile and auto-fill field/location
  useEffect(() => {
    if (!form.farmerId) {
      setFarmerProfile(null);
      setForm(prev => ({
        ...prev,
        fieldId: '', fieldName: '', district: '', state: '', cropId: '',
      }));
      return;
    }
    setFarmerLoading(true);
    getFarmerById(form.farmerId)
      .then(profile => {
        setFarmerProfile(profile);
        // Auto-fill location from farmer's record
        setForm(prev => ({
          ...prev,
          fieldId:   profile._id,            // use farmer's _id as field reference
          fieldName: profile.village
            ? `${profile.village}, ${profile.district}`
            : profile.district || '',
          district:  profile.district || '',
          state:     profile.state || '',
          cropId:    '',
        }));
      })
      .catch(() => setFarmerProfile(null))
      .finally(() => setFarmerLoading(false));
  }, [form.farmerId]);

  const isFormValid =
    form.farmerId && form.droneId && form.operatorId &&
    form.missionType && form.date && form.time;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleScheduleClick() {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { readiness, flight } = await scheduleFlight({
        droneId:     form.droneId,
        operatorId:  form.operatorId,
        // Use a "virtual" field: build fieldId from farmer + crop selection
        // The backend still needs a real field doc; use first available field
        // tied to this farmer's location. For now, pass farmer location as the field reference.
        fieldId:     form.cropId || 'FLD-01',   // fallback to first field doc
        missionType: form.missionType,
        date:        form.date,
        time:        form.time,
        farmerId:    form.farmerId,
      });
      setPreflightCheck(readiness);
      setPendingFlight(flight);
      setShowModal(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleConfirm() {
    if (pendingFlight) {
      onFlightScheduled(pendingFlight);
    }
    setForm(emptyForm);
    setPendingFlight(null);
    setPreflightCheck(null);
    setShowModal(false);
  }

  function handleModalClose() {
    setShowModal(false);
    setPendingFlight(null);
    setPreflightCheck(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (refError) {
    return <div className="cim-error">{refError}</div>;
  }

  return (
    <>
      <div className="dom-schedule-layout">
        {/* ── Schedule Form ── */}
        <div className="dom-form-card">
          <h2>Schedule a Flight</h2>

          {refLoading ? (
            <div className="cim-loading">Loading form data...</div>
          ) : (
            <div className="dom-form-grid">
              {/* Step 1: Farmer */}
              <div className="dom-form-field full">
                <label className="dom-form-label">Farmer</label>
                <select
                  name="farmerId"
                  className="dom-form-select"
                  value={form.farmerId}
                  onChange={handleChange}
                >
                  <option value="">Select farmer</option>
                  {farmers.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.fullName} — {f.district}, {f.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled location (read-only display) */}
              {form.farmerId && (
                <div className="dom-form-field full">
                  <label className="dom-form-label">Field / Location (auto-filled)</label>
                  {farmerLoading ? (
                    <div className="cim-loading" style={{ fontSize: 13 }}>Loading farmer data...</div>
                  ) : farmerProfile ? (
                    <div style={{ padding: '8px 12px', background: 'var(--bg-secondary, #f5f5f5)', borderRadius: 6, fontSize: 13 }}>
                      {farmerProfile.village ? `${farmerProfile.village}, ` : ''}
                      {farmerProfile.district}, {farmerProfile.state}
                      {farmerProfile.totalLandArea ? ` · ${farmerProfile.totalLandArea} acres` : ''}
                    </div>
                  ) : null}

                  {/* If farmer has multiple crops, show crop/plot selector */}
                  {farmerProfile?.crops?.length > 1 && (
                    <>
                      <label className="dom-form-label" style={{ marginTop: 8 }}>Crop / Plot</label>
                      <select
                        name="cropId"
                        className="dom-form-select"
                        value={form.cropId}
                        onChange={handleChange}
                      >
                        <option value="">All crops / entire field</option>
                        {farmerProfile.crops.map((c, i) => (
                          <option key={i} value={c._id || i}>
                            {c.name} — {c.area} acres
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Drone */}
              <div className="dom-form-field">
                <label className="dom-form-label">Drone</label>
                <select
                  name="droneId"
                  className="dom-form-select"
                  value={form.droneId}
                  onChange={handleChange}
                >
                  <option value="">Select drone</option>
                  {availableDrones.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.id} — {d.model} ({d.battery}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Operator */}
              <div className="dom-form-field">
                <label className="dom-form-label">Operator</label>
                <select
                  name="operatorId"
                  className="dom-form-select"
                  value={form.operatorId}
                  onChange={handleChange}
                >
                  <option value="">Select operator</option>
                  {operators.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              {/* Mission Type */}
              <div className="dom-form-field full">
                <label className="dom-form-label">Mission / Operation Type</label>
                <select
                  name="missionType"
                  className="dom-form-select"
                  value={form.missionType}
                  onChange={handleChange}
                >
                  <option value="">Select mission type</option>
                  {MISSION_TYPES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="dom-form-field">
                <label className="dom-form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  className="dom-form-input"
                  value={form.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time */}
              <div className="dom-form-field">
                <label className="dom-form-label">Time</label>
                <input
                  type="time"
                  name="time"
                  className="dom-form-input"
                  value={form.time}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {submitError && (
            <div className="dom-alert-item error" style={{ marginTop: 12 }}>
              {submitError}
            </div>
          )}

          <div className="dom-form-actions">
            <button
              className="dom-btn dom-btn-primary"
              onClick={handleScheduleClick}
              disabled={!isFormValid || submitting || refLoading}
            >
              {submitting ? (
                'Checking...'
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                    <path d="M8 2v4" /><path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  Schedule Flight
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Upcoming Scheduled Flights ── */}
        <div className="dom-upcoming-card">
          <h2>Upcoming Scheduled Flights</h2>
          {flightsLoading ? (
            <div className="cim-loading">Loading flights...</div>
          ) : flightsError ? (
            <div className="cim-error">{flightsError}</div>
          ) : scheduledFlights.length === 0 ? (
            <p className="dom-empty">No upcoming flights scheduled.</p>
          ) : (
            scheduledFlights.map(flight => (
              <div key={flight.id} className="dom-flight-item">
                <div className="dom-flight-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7h4l2 3h6l2-3h4" />
                    <circle cx="12" cy="13" r="3" />
                    <path d="M5 7V5" /><path d="M19 7V5" />
                    <path d="M9 19h6" /><path d="M12 16v3" />
                  </svg>
                </div>
                <div className="dom-flight-info">
                  <div className="dom-flight-title">{flight.missionType} — {flight.fieldName}</div>
                  <div className="dom-flight-meta">{flight.droneId} · {flight.operatorName}</div>
                </div>
                <div className="dom-flight-time">{formatDateTime(flight.scheduledAt)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Pre-flight Modal ── */}
      {showModal && (
        <ScheduleFlightModal
          drone={availableDrones.find(d => d.id === form.droneId) || null}
          preflightCheck={preflightCheck}
          onConfirm={handleConfirm}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
