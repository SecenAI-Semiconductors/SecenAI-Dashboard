import { useState, useEffect } from 'react'
import { getCaseById } from './api'

const TABS = [
  { id: 'crop-health', label: 'Crop Health', icon: '🌾' },
  { id: 'detected-issue', label: 'Detected Issue', icon: '🔍' },
  { id: 'what-is-it', label: 'What Is It?', icon: '🧬' },
  { id: 'why', label: 'Why?', icon: '❓' },
  { id: 'symptoms', label: 'Symptoms', icon: '🍃' },
  { id: 'impact', label: 'Impact', icon: '📉' },
  { id: 'treatment', label: 'Treatment', icon: '💊' },
  { id: 'prevention', label: 'Prevention', icon: '🛡️' },
  { id: 'ai-recs', label: 'AI Recs', icon: '🤖' },
]

function severityColor(level) {
  switch (level?.toLowerCase()) {
    case 'critical': return '#dc2626'
    case 'high': return '#f97316'
    case 'moderate': return '#eab308'
    case 'low': return '#22c55e'
    default: return '#6b7280'
  }
}

export function CaseDetailDrawer({ detectionId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('crop-health')

  useEffect(() => {
    if (!detectionId) return
    setLoading(true)
    setError(null)
    getCaseById(detectionId)
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [detectionId])

  if (!detectionId) return null

  return (
    <div className="da-drawer-overlay" onClick={onClose} id="case-detail-drawer">
      <div className="da-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="da-drawer-header">
          <div>
            <h2>{detectionId}</h2>
            {data && <span className="da-drawer-sub">{data.crop} · {data.fieldName} · {data.region}</span>}
          </div>
          <button className="da-drawer-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Tab navigation */}
        <div className="da-drawer-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`da-drawer-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="da-drawer-tab-icon">{tab.icon}</span>
              <span className="da-drawer-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="da-drawer-body">
          {loading && (
            <div className="da-drawer-loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="da-skeleton da-skeleton--text" style={{ marginBottom: 12, width: `${80 - i * 10}%` }} />
              ))}
            </div>
          )}

          {error && <div className="da-drawer-error">Error: {error}</div>}

          {data && !loading && (
            <>
              {activeTab === 'crop-health' && data.cropHealth && (
                <div className="da-drawer-section">
                  <div className="da-detail-grid">
                    {Object.entries(data.cropHealth).map(([key, val]) => (
                      <div key={key} className="da-detail-field">
                        <span className="da-detail-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                        <span className="da-detail-value">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'detected-issue' && data.detectedIssue && (
                <div className="da-drawer-section">
                  <h3 className="da-drawer-issue-name">{data.detectedIssue.name}</h3>
                  <p className="da-drawer-scientific">{data.detectedIssue.scientificName}</p>
                  <div className="da-detail-grid">
                    <div className="da-detail-field">
                      <span className="da-detail-label">Confidence</span>
                      <div className="da-confidence-bar-wrap">
                        <div className="da-confidence-bar" style={{ width: `${data.detectedIssue.confidence}%` }} />
                        <span>{data.detectedIssue.confidence}%</span>
                      </div>
                    </div>
                    <div className="da-detail-field">
                      <span className="da-detail-label">Severity</span>
                      <span className="da-severity-badge" style={{ background: severityColor(data.detectedIssue.severity), color: '#fff' }}>
                        {data.detectedIssue.severity}
                      </span>
                    </div>
                    <div className="da-detail-field">
                      <span className="da-detail-label">Crop</span>
                      <span className="da-detail-value">{data.detectedIssue.cropAffected}</span>
                    </div>
                    <div className="da-detail-field">
                      <span className="da-detail-label">Detection Method</span>
                      <span className="da-detail-value">{data.detectedIssue.detectionMethod}</span>
                    </div>
                    <div className="da-detail-field">
                      <span className="da-detail-label">First Detected</span>
                      <span className="da-detail-value">{data.detectedIssue.firstDetected}</span>
                    </div>
                    <div className="da-detail-field">
                      <span className="da-detail-label">Spread Rate</span>
                      <span className="da-detail-value" style={{ color: '#dc2626' }}>{data.detectedIssue.spreadRate}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'what-is-it' && data.whatIsIt && (
                <div className="da-drawer-section">
                  <p className="da-drawer-summary">{data.whatIsIt.summary}</p>
                  <ul className="da-drawer-list">
                    {data.whatIsIt.details?.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}

              {activeTab === 'why' && data.whyDidItHappen && (
                <div className="da-drawer-section">
                  <div className="da-causes-list">
                    {data.whyDidItHappen.primaryCauses?.map((c, i) => (
                      <div key={i} className="da-cause-item">
                        <span className="da-cause-icon">{c.icon}</span>
                        <div>
                          <strong>{c.cause}</strong>
                          <p>{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.whyDidItHappen.environmentalFactors && (
                    <div className="da-env-factors">
                      <h4>Environmental Factors</h4>
                      <div className="da-detail-grid">
                        {Object.entries(data.whyDidItHappen.environmentalFactors).map(([k, v]) => (
                          <div key={k} className="da-detail-field">
                            <span className="da-detail-label">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                            <span className="da-detail-value">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'symptoms' && data.symptomsFound && (
                <div className="da-drawer-section">
                  {data.symptomsFound.map((s, i) => (
                    <div key={i} className="da-symptom-item">
                      <div className="da-symptom-header">
                        <strong>{s.symptom}</strong>
                        <span className="da-severity-pill" style={{ background: severityColor(s.severity), color: '#fff' }}>{s.severity}</span>
                      </div>
                      <p>{s.description}</p>
                      <span className="da-symptom-prevalence">Prevalence: {s.prevalence}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'impact' && data.impactOnCrop && (
                <div className="da-drawer-section">
                  {data.impactOnCrop.yieldLoss && (
                    <div className="da-impact-item">
                      <span className="da-impact-icon">📉</span>
                      <div>
                        <strong>Yield Loss: {data.impactOnCrop.yieldLoss.estimated}</strong>
                        <p>{data.impactOnCrop.yieldLoss.detail}</p>
                      </div>
                    </div>
                  )}
                  {data.impactOnCrop.economicLoss && (
                    <div className="da-impact-item">
                      <span className="da-impact-icon">💸</span>
                      <div>
                        <strong>Economic Loss: {data.impactOnCrop.economicLoss.estimated}</strong>
                        <p>{data.impactOnCrop.economicLoss.detail}</p>
                      </div>
                    </div>
                  )}
                  {data.impactOnCrop.timelineThreat && (
                    <div className="da-timeline-alert">
                      <span>⏰</span>
                      <p>{data.impactOnCrop.timelineThreat}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'treatment' && data.recommendedTreatment && (
                <div className="da-drawer-section">
                  {data.recommendedTreatment.immediate?.map((t, i) => (
                    <div key={i} className="da-treatment-item da-treatment-item--urgent">
                      <span className="da-treatment-badge da-treatment-badge--urgent">Urgent</span>
                      <h4>{t.action}</h4>
                      <div className="da-detail-grid">
                        <div className="da-detail-field"><span className="da-detail-label">Product</span><span className="da-detail-value">{t.product}</span></div>
                        <div className="da-detail-field"><span className="da-detail-label">Dosage</span><span className="da-detail-value">{t.dosage}</span></div>
                        <div className="da-detail-field"><span className="da-detail-label">Method</span><span className="da-detail-value">{t.method}</span></div>
                        <div className="da-detail-field"><span className="da-detail-label">Timing</span><span className="da-detail-value">{t.timing}</span></div>
                        <div className="da-detail-field"><span className="da-detail-label">Cost</span><span className="da-detail-value" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{t.cost}</span></div>
                      </div>
                    </div>
                  ))}
                  {data.recommendedTreatment.followUp?.map((t, i) => (
                    <div key={i} className="da-treatment-item">
                      <span className="da-treatment-badge">Follow-up</span>
                      <h4>{t.action}</h4>
                      <div className="da-detail-grid">
                        <div className="da-detail-field"><span className="da-detail-label">Product</span><span className="da-detail-value">{t.product}</span></div>
                        <div className="da-detail-field"><span className="da-detail-label">Timing</span><span className="da-detail-value">{t.timing}</span></div>
                        <div className="da-detail-field"><span className="da-detail-label">Cost</span><span className="da-detail-value">{t.cost}</span></div>
                      </div>
                    </div>
                  ))}
                  <div className="da-treatment-total">
                    <span>Total Estimated Cost</span>
                    <strong>{data.recommendedTreatment.totalEstimatedCost}</strong>
                  </div>
                </div>
              )}

              {activeTab === 'prevention' && data.preventionTips && (
                <div className="da-drawer-section">
                  {data.preventionTips.map((p, i) => (
                    <div key={i} className="da-prevention-item">
                      <span className="da-prevention-icon">{p.icon}</span>
                      <div>
                        <div className="da-prevention-header">
                          <strong>{p.tip}</strong>
                          <span className={`da-priority-badge da-priority--${p.priority?.toLowerCase()}`}>{p.priority}</span>
                        </div>
                        <p>{p.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ai-recs' && data.aiRecommendations && (
                <div className="da-drawer-section">
                  {data.aiRecommendations.map((r, i) => (
                    <div key={i} className="da-ai-rec-item">
                      <div className="da-ai-rec-header">
                        <strong>{r.recommendation}</strong>
                        <span className="da-confidence-text">{r.confidence}%</span>
                      </div>
                      <p>{r.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
