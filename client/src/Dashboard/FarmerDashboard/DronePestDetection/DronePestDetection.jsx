import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PestImage from '../../../assets/Pest.png'
import './DronePestDetection.css'

/* ───── Static analysis data (will be replaced by backend later) ───── */
const pestAnalysisData = {
  scanInfo: {
    scanId: 'DRN-2026-0619-A1',
    droneModel: 'SecenAI AgriDrone X4',
    scanDate: 'June 19, 2026',
    scanTime: '08:32 AM IST',
    fieldArea: '4.2 acres',
    altitude: '25 meters',
    resolution: '0.8 cm/pixel',
    gpsCoords: '17.3850° N, 78.4867° E',
  },

  cropHealth: {
    overallStatus: 'At Risk',
    healthScore: 42,
    ndviAvg: 0.38,
    affectedArea: '1.7 acres (40%)',
    healthyArea: '2.5 acres (60%)',
    trend: 'Declining',
    lastHealthyDate: 'June 12, 2026',
  },

  detectedIssue: {
    name: 'Leaf Blight & Leaf Spot Disease Complex',
    scientificName: 'Exserohilum turcicum (Northern Leaf Blight) & Bipolaris maydis (Southern Leaf Spot)',
    confidence: 94,
    severity: 'High',
    cropAffected: 'Corn (Maize) & Chili Pepper',
    detectionMethod: 'AI Multispectral + RGB Analysis',
    firstDetected: 'June 15, 2026',
    spreadRate: 'Rapid — 12% increase in 4 days',
  },

  whatIsIt: {
    summary:
      'Leaf Blight (aaku endu tegulu) and Leaf Spot (aaku macha tegulu) are fungal diseases that severely impact corn and chili crops. These diseases are caused by fungal pathogens that thrive in warm, humid environments and can spread rapidly through wind-borne spores and contaminated water splashes.',
    details: [
      'Northern Corn Leaf Blight (NCLB) is caused by Exserohilum turcicum, producing long, elliptical, grayish-green to tan lesions on leaves that can grow 2–15 cm in length.',
      'Southern Corn Leaf Spot is caused by Bipolaris maydis, creating smaller, oval to rectangular tan lesions with reddish-brown borders.',
      'Chili Leaf Spot (Cercospora capsici) causes circular to irregular spots with gray centers and dark brown margins on chili pepper foliage.',
      'These diseases often occur together as a "disease complex" in fields where both crops are cultivated, sharing common environmental triggers.',
    ],
  },

  whyDidItHappen: {
    primaryCauses: [
      {
        cause: 'High Humidity & Prolonged Moisture',
        detail:
          'Recent monsoon onset brought 85–95% relative humidity for 5 consecutive days, creating ideal conditions for fungal spore germination.',
        icon: '💧',
      },
      {
        cause: 'Warm Temperatures (22–30°C)',
        detail:
          'Sustained temperatures of 26–29°C over the past week fall exactly in the optimal growth range for both Exserohilum and Bipolaris fungi.',
        icon: '🌡️',
      },
      {
        cause: 'Susceptible Crop Varieties',
        detail:
          'The planted corn hybrid (DHM-117) and chili variety (Teja) have moderate-to-low resistance to these pathogens.',
        icon: '🌱',
      },
      {
        cause: 'Poor Air Circulation',
        detail:
          'Dense planting spacing (20 cm row gap) restricted airflow between plants, trapping moisture on leaf surfaces.',
        icon: '🌀',
      },
      {
        cause: 'Residue from Previous Season',
        detail:
          'Infected crop debris left from the previous rabi season harbored dormant fungal spores that reactivated with monsoon rains.',
        icon: '🍂',
      },
    ],
    environmentalFactors: {
      temperature: '27°C avg (last 7 days)',
      humidity: '89% avg (last 7 days)',
      rainfall: '142mm (last 10 days)',
      windSpeed: '12 km/h NE (spore dispersal vector)',
      dewDuration: '6+ hours/night',
    },
  },

  symptomsFound: [
    {
      symptom: 'Long Elliptical Lesions on Corn Leaves',
      description:
        'Grayish-green to tan, cigar-shaped lesions 3–12 cm long appearing on lower and middle canopy leaves. Lesions have wavy, dark margins.',
      severity: 'High',
      prevalence: '72% of sampled plants',
    },
    {
      symptom: 'White-Gray Streaks on Leaf Surface',
      description:
        'Linear chlorotic streaking running parallel to leaf veins, often preceding full lesion development. Visible in drone RGB imagery.',
      severity: 'Moderate',
      prevalence: '58% of sampled plants',
    },
    {
      symptom: 'Necrotic Brown Spots on Chili Foliage',
      description:
        'Circular to irregular spots (0.5–2 cm) with gray centers and dark brown halos on chili leaves. Some spots show concentric rings.',
      severity: 'High',
      prevalence: '65% of chili plants',
    },
    {
      symptom: 'Premature Leaf Yellowing & Wilting',
      description:
        'Lower canopy showing accelerated senescence with chlorosis progressing from leaf tips inward. Reduces photosynthetic capacity.',
      severity: 'Moderate',
      prevalence: '45% of field area',
    },
    {
      symptom: 'Fungal Sporulation on Leaf Undersides',
      description:
        'Dark olive-green to black velvety spore masses visible on underside of lesions during morning hours with dew present.',
      severity: 'Critical',
      prevalence: '30% of heavily affected zones',
    },
  ],

  impactOnCrop: {
    yieldLoss: {
      estimated: '25–40%',
      detail:
        'If untreated, photosynthesis reduction from leaf damage will significantly reduce grain filling in corn and fruit set in chili.',
    },
    qualityImpact: {
      grade: 'Downgraded from A to C',
      detail:
        'Affected corn ears show poor kernel development. Chili fruits from infected plants have reduced capsaicin content and smaller size.',
    },
    economicLoss: {
      estimated: '₹45,000 – ₹72,000',
      detail:
        'Based on current market rates (corn: ₹2,100/quintal, chili: ₹12,500/quintal) and projected yield reduction for the 4.2-acre plot.',
    },
    timelineThreat:
      'Without intervention within the next 5–7 days, disease will likely spread to 80%+ of the field, making recovery significantly harder and more expensive.',
    secondaryRisks: [
      'Weakened plants become susceptible to secondary infections (Fusarium stalk rot, Aspergillus ear rot).',
      'Reduced plant vigor increases vulnerability to pest attacks (stem borers, aphids).',
      'Late-season infections can contaminate grain with mycotoxins, posing food safety risks.',
    ],
  },

  recommendedTreatment: {
    immediate: [
      {
        action: 'Foliar Fungicide Application',
        product: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)',
        dosage: '1 mL per liter of water',
        method: 'Drone spray at 25L/acre volume, 3m flight height',
        timing: 'Apply within 48 hours, early morning (6–8 AM)',
        cost: '₹850/acre',
      },
      {
        action: 'Infected Leaf Removal',
        product: 'Manual removal & field disposal',
        dosage: 'N/A',
        method: 'Remove heavily infected lower leaves (>50% lesion coverage) and destroy by burning away from field',
        timing: 'Before fungicide application',
        cost: '₹200/acre (labor)',
      },
    ],
    followUp: [
      {
        action: 'Second Fungicide Spray',
        product: 'Propiconazole 25% EC (Tilt)',
        dosage: '1 mL per liter of water',
        method: 'Ground sprayer or drone, ensure thorough lower canopy coverage',
        timing: '10–14 days after first application',
        cost: '₹600/acre',
      },
      {
        action: 'Biological Control Agent',
        product: 'Trichoderma viride (2% WP)',
        dosage: '4g per liter of water',
        method: 'Foliar spray + soil drench around root zone',
        timing: '7 days after chemical spray',
        cost: '₹300/acre',
      },
      {
        action: 'Nutrient Boost Application',
        product: 'Potassium Silicate (K₂SiO₃) foliar spray',
        dosage: '3 mL per liter',
        method: 'Strengthens cell walls and improves disease resistance',
        timing: 'Weekly for 3 weeks alongside treatment',
        cost: '₹250/acre',
      },
    ],
    totalEstimatedCost: '₹2,200/acre (₹9,240 total for 4.2 acres)',
  },

  preventionTips: [
    {
      tip: 'Practice Crop Rotation',
      detail:
        'Rotate corn with non-host crops (legumes, rice) every 2 seasons to break the disease cycle and reduce soil-borne inoculum.',
      priority: 'Essential',
      icon: '🔄',
    },
    {
      tip: 'Use Resistant Varieties',
      detail:
        'Switch to Ht-gene resistant corn hybrids (e.g., NK-6240, DKC-9164) and disease-tolerant chili varieties (Arka Lohit, LCA-334).',
      priority: 'High',
      icon: '🛡️',
    },
    {
      tip: 'Optimize Plant Spacing',
      detail:
        'Maintain 60×25 cm spacing for corn and 60×45 cm for chili to ensure adequate air circulation and faster leaf drying.',
      priority: 'High',
      icon: '📏',
    },
    {
      tip: 'Remove & Destroy Crop Residue',
      detail:
        'After harvest, deep-plough infected residue into soil (>15 cm depth) or remove from field entirely. Never leave standing stubble.',
      priority: 'Essential',
      icon: '🧹',
    },
    {
      tip: 'Seed Treatment Before Planting',
      detail:
        'Treat seeds with Carboxin + Thiram (Vitavax Power) at 2g/kg seed to protect early-stage seedlings from soil-borne infections.',
      priority: 'Moderate',
      icon: '💊',
    },
    {
      tip: 'Monitor Weather & Schedule Preventive Sprays',
      detail:
        'When forecasts predict >3 days of humidity >85% with temperatures 22–30°C, apply preventive Mancozeb spray (2.5g/L) before symptoms appear.',
      priority: 'High',
      icon: '🌦️',
    },
    {
      tip: 'Balanced Fertilization',
      detail:
        'Avoid excess nitrogen (promotes lush, susceptible growth). Maintain balanced N:P:K ratio and supplement with silicon and potassium for stronger cell walls.',
      priority: 'Moderate',
      icon: '⚖️',
    },
  ],

  aiRecommendations: [
    {
      recommendation: 'Schedule Immediate Drone Spray Mission',
      detail:
        'Based on wind speed forecast (8 km/h tomorrow 6 AM), optimal spray window is June 20, 2026 at 06:00–08:00 AM. AI has pre-calculated flight path for maximum coverage with minimal drift.',
      confidence: 96,
      type: 'action',
    },
    {
      recommendation: 'Install IoT Microclimate Sensors',
      detail:
        'Deploy 3 wireless humidity/temperature sensors at field quadrants to enable real-time disease risk alerts. ROI analysis shows payback within 2 seasons.',
      confidence: 88,
      type: 'infrastructure',
    },
    {
      recommendation: 'Predicted Recovery Timeline',
      detail:
        'With recommended treatment protocol, AI models predict disease containment within 14 days and 70% leaf recovery by Day 28. Follow-up drone scan recommended on July 3.',
      confidence: 91,
      type: 'forecast',
    },
    {
      recommendation: 'Adjacent Field Risk Alert',
      detail:
        'Wind pattern analysis indicates spore dispersal risk to neighboring field (Plot #B-14, 200m NE). Alert neighboring farmer Rajesh Kumar for preventive spray.',
      confidence: 85,
      type: 'warning',
    },
    {
      recommendation: 'Crop Insurance Claim Eligibility',
      detail:
        'Current damage level (40% affected area, High severity) qualifies for PMFBY claim under "Disease/Pest Attack" category. Drone scan report can serve as digital evidence.',
      confidence: 93,
      type: 'financial',
    },
    {
      recommendation: 'Next Season Planting Optimization',
      detail:
        'AI recommends shifting to NK-6240 corn hybrid (Ht2 + Ht3 resistance genes) and staggered planting dates (7-day intervals) to reduce synchronized disease risk.',
      confidence: 90,
      type: 'planning',
    },
  ],
}

/* ───── Severity / Status color helper ───── */
function severityColor(level) {
  switch (level?.toLowerCase()) {
    case 'critical':
      return 'var(--pest-critical)'
    case 'high':
      return 'var(--pest-high)'
    case 'moderate':
      return 'var(--pest-moderate)'
    case 'low':
      return 'var(--pest-low)'
    default:
      return 'var(--text-secondary)'
  }
}

function confidenceColor(score) {
  if (score >= 90) return 'var(--pest-high)'
  if (score >= 75) return 'var(--pest-moderate)'
  return 'var(--pest-low)'
}

function typeIcon(type) {
  switch (type) {
    case 'action': return '⚡'
    case 'infrastructure': return '🏗️'
    case 'forecast': return '📈'
    case 'warning': return '⚠️'
    case 'financial': return '💰'
    case 'planning': return '📋'
    default: return '🤖'
  }
}

/* ───── Circular Progress Ring ───── */
function HealthRing({ score }) {
  const radius = 54
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score > 60 ? '#2e9e50' : score > 35 ? '#e5a117' : '#d94040'

  return (
    <svg className="health-ring" viewBox="0 0 128 128" width="128" height="128">
      <circle
        cx="64" cy="64" r={radius}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}
      />
      <circle
        cx="64" cy="64" r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text x="64" y="58" textAnchor="middle" className="ring-score">{score}</text>
      <text x="64" y="76" textAnchor="middle" className="ring-label">Health</text>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export function DronePestDetection({ onBack }) {
  const navigate = useNavigate()
  const d = pestAnalysisData
  const [openSections, setOpenSections] = useState(new Set())

  const toggleSection = (id) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const isSectionOpen = (id) => openSections.has(id)

  return (
    <div className="pest-detection-page" id="drone-pest-detection-page">
      {/* ──── Top Bar ──── */}
      <nav className="dashboard-topbar pest-topbar">
        <div className="topbar-left">
          <div
            className="topbar-brand-icon"
            onClick={() => navigate('/')}
            title="Go to home"
            style={{ cursor: 'pointer' }}
          >
            S
          </div>
          <span className="topbar-title">Drone Pest Detection</span>
        </div>
        <div className="topbar-right">
          <span className="pest-scan-badge" id="scan-badge">
            Scan #{d.scanInfo.scanId}
          </span>
          <button
            type="button"
            className="topbar-back-btn"
            onClick={onBack ?? (() => navigate('/farmer'))}
            id="pest-back-button"
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* ──── Hero / Scan Summary ──── */}
      <section className="pest-hero" id="pest-hero">
        <div className="pest-hero-inner">
          {/* ──── Drone Footage Video ──── */}
          <div className="pest-hero-video-wrap" id="pest-drone-video">
            <video
              className="pest-hero-video"
              src="https://res.cloudinary.com/dil1zgzdb/video/upload/v1782214985/corn1_zmbozl.mp4"
              controls
              muted
              playsInline
              preload="metadata"
              poster=""
            />
            <div className="pest-video-label">
              <span className="pest-video-badge">
                🎥 Drone Footage
              </span>
              <span className="pest-video-badge pest-video-badge--source">
                SecenAI AgriDrone X4 · {d.scanInfo.scanDate}
              </span>
            </div>
          </div>

          {/* ──── AI Analysed Image ──── */}
          <div className="pest-hero-image-wrap">
            <img
              src={PestImage}
              alt="AI-detected corn leaf blight, leaf spot, and chili disease with bounding box annotations"
              className="pest-hero-image"
              id="pest-scan-image"
            />
            <div className="pest-image-overlay">
              <span className="pest-image-badge pest-image-badge--ai">
                🤖 AI Analyzed
              </span>
              <span className="pest-image-badge pest-image-badge--confidence">
                {d.detectedIssue.confidence}% Confidence
              </span>
            </div>
          </div>

          <div className="pest-hero-info">
            <div className="pest-hero-status-row">
              <HealthRing score={d.cropHealth.healthScore} />
              <div className="pest-hero-status-text">
                <span className="pest-status-label">{d.cropHealth.overallStatus}</span>
                <span className="pest-status-detail">
                  {d.cropHealth.affectedArea} affected
                </span>
                <span className="pest-status-trend pest-status-trend--declining">
                  ↓ {d.cropHealth.trend}
                </span>
              </div>
            </div>

            <div className="pest-scan-meta">
              <div className="scan-meta-item">
                <span className="scan-meta-label">Drone</span>
                <span className="scan-meta-value">{d.scanInfo.droneModel}</span>
              </div>
              <div className="scan-meta-item">
                <span className="scan-meta-label">Date & Time</span>
                <span className="scan-meta-value">
                  {d.scanInfo.scanDate} · {d.scanInfo.scanTime}
                </span>
              </div>
              <div className="scan-meta-item">
                <span className="scan-meta-label">Field Area</span>
                <span className="scan-meta-value">{d.scanInfo.fieldArea}</span>
              </div>
              <div className="scan-meta-item">
                <span className="scan-meta-label">Altitude / Res.</span>
                <span className="scan-meta-value">
                  {d.scanInfo.altitude} · {d.scanInfo.resolution}
                </span>
              </div>
              <div className="scan-meta-item">
                <span className="scan-meta-label">GPS</span>
                <span className="scan-meta-value">{d.scanInfo.gpsCoords}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Pipeline Navigation ──── */}
      <div className="pest-pipeline-nav" id="pest-pipeline-nav">
        {[
          { id: 'crop-health', label: 'Crop Health', icon: '🌾' },
          { id: 'detected-issue', label: 'Detected Issue', icon: '🔍' },
          { id: 'what-is-it', label: 'What Is It?', icon: '🧬' },
          { id: 'why-did-it-happen', label: 'Why?', icon: '❓' },
          { id: 'symptoms', label: 'Symptoms', icon: '🍃' },
          { id: 'impact', label: 'Impact', icon: '📉' },
          { id: 'treatment', label: 'Treatment', icon: '💊' },
          { id: 'prevention', label: 'Prevention', icon: '🛡️' },
          { id: 'ai-recommendations', label: 'AI Recs', icon: '🤖' },
        ].map((item, i) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`pipeline-nav-item ${isSectionOpen(item.id) ? 'pipeline-nav-item--active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              if (!isSectionOpen(item.id)) toggleSection(item.id)
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span className="pipeline-nav-icon">{item.icon}</span>
            <span className="pipeline-nav-label">{item.label}</span>
            {i < 8 && <span className="pipeline-nav-arrow">→</span>}
          </a>
        ))}
      </div>

      {/* ──── Analysis Sections ──── */}
      <main className="pest-analysis-content" id="pest-analysis-content">

        {/* ① Crop Health Status */}
        <section className="pest-section" id="crop-health">
          <div className="pest-section-header" onClick={() => toggleSection('crop-health')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">01</span>
              <h2 className="pest-section-title">Crop Health Status</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('crop-health') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('crop-health') ? 'pest-section-body--open' : ''}`}>
            <div className="health-metrics-grid">
              <div className="health-metric-card">
                <span className="metric-label">Overall Status</span>
                <span className="metric-value metric-value--warning">{d.cropHealth.overallStatus}</span>
              </div>
              <div className="health-metric-card">
                <span className="metric-label">Health Score</span>
                <span className="metric-value">{d.cropHealth.healthScore}/100</span>
              </div>
              <div className="health-metric-card">
                <span className="metric-label">NDVI Average</span>
                <span className="metric-value">{d.cropHealth.ndviAvg}</span>
              </div>
              <div className="health-metric-card">
                <span className="metric-label">Affected Area</span>
                <span className="metric-value metric-value--danger">{d.cropHealth.affectedArea}</span>
              </div>
              <div className="health-metric-card">
                <span className="metric-label">Healthy Area</span>
                <span className="metric-value metric-value--success">{d.cropHealth.healthyArea}</span>
              </div>
              <div className="health-metric-card">
                <span className="metric-label">Trend</span>
                <span className="metric-value metric-value--warning">↓ {d.cropHealth.trend}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ② Detected Issue */}
        <section className="pest-section" id="detected-issue">
          <div className="pest-section-header" onClick={() => toggleSection('detected-issue')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">02</span>
              <h2 className="pest-section-title">Detected Issue</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('detected-issue') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('detected-issue') ? 'pest-section-body--open' : ''}`}>
            <div className="detected-issue-card">
              <div className="detected-issue-header">
                <h3 className="detected-issue-name">{d.detectedIssue.name}</h3>
                <span className="detected-issue-scientific">{d.detectedIssue.scientificName}</span>
              </div>
              <div className="detected-issue-stats">
                <div className="issue-stat">
                  <span className="issue-stat-label">Confidence</span>
                  <div className="confidence-bar-wrap">
                    <div className="confidence-bar" style={{ width: `${d.detectedIssue.confidence}%` }} />
                    <span className="confidence-text">{d.detectedIssue.confidence}%</span>
                  </div>
                </div>
                <div className="issue-stat">
                  <span className="issue-stat-label">Severity</span>
                  <span className="severity-badge severity-badge--high">{d.detectedIssue.severity}</span>
                </div>
                <div className="issue-stat">
                  <span className="issue-stat-label">Crop Affected</span>
                  <span className="issue-stat-value">{d.detectedIssue.cropAffected}</span>
                </div>
                <div className="issue-stat">
                  <span className="issue-stat-label">Detection Method</span>
                  <span className="issue-stat-value">{d.detectedIssue.detectionMethod}</span>
                </div>
                <div className="issue-stat">
                  <span className="issue-stat-label">First Detected</span>
                  <span className="issue-stat-value">{d.detectedIssue.firstDetected}</span>
                </div>
                <div className="issue-stat">
                  <span className="issue-stat-label">Spread Rate</span>
                  <span className="issue-stat-value issue-stat-value--danger">{d.detectedIssue.spreadRate}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ③ What Is It? */}
        <section className="pest-section" id="what-is-it">
          <div className="pest-section-header" onClick={() => toggleSection('what-is-it')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">03</span>
              <h2 className="pest-section-title">What Is It?</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('what-is-it') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('what-is-it') ? 'pest-section-body--open' : ''}`}>
            <p className="pest-body-summary">{d.whatIsIt.summary}</p>
            <ul className="pest-detail-list">
              {d.whatIsIt.details.map((item, i) => (
                <li key={i} className="pest-detail-item">
                  <span className="pest-detail-bullet" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ④ Why Did It Happen? */}
        <section className="pest-section" id="why-did-it-happen">
          <div className="pest-section-header" onClick={() => toggleSection('why-did-it-happen')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">04</span>
              <h2 className="pest-section-title">Why Did It Happen?</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('why-did-it-happen') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('why-did-it-happen') ? 'pest-section-body--open' : ''}`}>
            <div className="causes-grid">
              {d.whyDidItHappen.primaryCauses.map((c, i) => (
                <div key={i} className="cause-card">
                  <span className="cause-icon">{c.icon}</span>
                  <h4 className="cause-title">{c.cause}</h4>
                  <p className="cause-detail">{c.detail}</p>
                </div>
              ))}
            </div>

            <div className="env-factors-card">
              <h4 className="env-factors-title">📊 Environmental Factors (7-day avg)</h4>
              <div className="env-factors-grid">
                {Object.entries(d.whyDidItHappen.environmentalFactors).map(([key, val]) => (
                  <div key={key} className="env-factor-item">
                    <span className="env-factor-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                    <span className="env-factor-value">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ⑤ Symptoms Found */}
        <section className="pest-section" id="symptoms">
          <div className="pest-section-header" onClick={() => toggleSection('symptoms')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">05</span>
              <h2 className="pest-section-title">Symptoms Found</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('symptoms') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('symptoms') ? 'pest-section-body--open' : ''}`}>
            <div className="symptoms-list">
              {d.symptomsFound.map((s, i) => (
                <div key={i} className="symptom-card">
                  <div className="symptom-header">
                    <h4 className="symptom-name">{s.symptom}</h4>
                    <span
                      className="severity-pill"
                      style={{ background: severityColor(s.severity), color: '#fff' }}
                    >
                      {s.severity}
                    </span>
                  </div>
                  <p className="symptom-desc">{s.description}</p>
                  <span className="symptom-prevalence">Prevalence: {s.prevalence}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⑥ Impact on Crop */}
        <section className="pest-section" id="impact">
          <div className="pest-section-header" onClick={() => toggleSection('impact')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">06</span>
              <h2 className="pest-section-title">Impact on Crop</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('impact') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('impact') ? 'pest-section-body--open' : ''}`}>
            <div className="impact-cards-grid">
              <div className="impact-card impact-card--yield">
                <span className="impact-card-icon">📉</span>
                <h4>Yield Loss</h4>
                <span className="impact-value impact-value--danger">{d.impactOnCrop.yieldLoss.estimated}</span>
                <p>{d.impactOnCrop.yieldLoss.detail}</p>
              </div>
              <div className="impact-card impact-card--quality">
                <span className="impact-card-icon">⭐</span>
                <h4>Quality Impact</h4>
                <span className="impact-value impact-value--warning">{d.impactOnCrop.qualityImpact.grade}</span>
                <p>{d.impactOnCrop.qualityImpact.detail}</p>
              </div>
              <div className="impact-card impact-card--economic">
                <span className="impact-card-icon">💸</span>
                <h4>Economic Loss</h4>
                <span className="impact-value impact-value--danger">{d.impactOnCrop.economicLoss.estimated}</span>
                <p>{d.impactOnCrop.economicLoss.detail}</p>
              </div>
            </div>

            <div className="impact-timeline-alert">
              <span className="alert-icon">⏰</span>
              <p>{d.impactOnCrop.timelineThreat}</p>
            </div>

            <div className="secondary-risks">
              <h4>Secondary Risks</h4>
              <ul>
                {d.impactOnCrop.secondaryRisks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ⑦ Recommended Treatment */}
        <section className="pest-section" id="treatment">
          <div className="pest-section-header" onClick={() => toggleSection('treatment')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">07</span>
              <h2 className="pest-section-title">Recommended Treatment</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('treatment') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('treatment') ? 'pest-section-body--open' : ''}`}>
            <h3 className="treatment-phase-title">
              <span className="phase-badge phase-badge--urgent">Urgent</span>
              Immediate Actions
            </h3>
            <div className="treatment-cards">
              {d.recommendedTreatment.immediate.map((t, i) => (
                <div key={i} className="treatment-card treatment-card--immediate">
                  <h4 className="treatment-action">{t.action}</h4>
                  <div className="treatment-details">
                    <div className="treatment-detail-row">
                      <span className="td-label">Product</span>
                      <span className="td-value">{t.product}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Dosage</span>
                      <span className="td-value">{t.dosage}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Method</span>
                      <span className="td-value">{t.method}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Timing</span>
                      <span className="td-value">{t.timing}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Cost</span>
                      <span className="td-value td-value--cost">{t.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="treatment-phase-title" style={{ marginTop: '24px' }}>
              <span className="phase-badge phase-badge--followup">Follow-up</span>
              Follow-up Actions
            </h3>
            <div className="treatment-cards">
              {d.recommendedTreatment.followUp.map((t, i) => (
                <div key={i} className="treatment-card treatment-card--followup">
                  <h4 className="treatment-action">{t.action}</h4>
                  <div className="treatment-details">
                    <div className="treatment-detail-row">
                      <span className="td-label">Product</span>
                      <span className="td-value">{t.product}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Dosage</span>
                      <span className="td-value">{t.dosage}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Method</span>
                      <span className="td-value">{t.method}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Timing</span>
                      <span className="td-value">{t.timing}</span>
                    </div>
                    <div className="treatment-detail-row">
                      <span className="td-label">Cost</span>
                      <span className="td-value td-value--cost">{t.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="treatment-total-cost">
              <span>Total Estimated Treatment Cost</span>
              <strong>{d.recommendedTreatment.totalEstimatedCost}</strong>
            </div>
          </div>
        </section>

        {/* ⑧ Prevention Tips */}
        <section className="pest-section" id="prevention">
          <div className="pest-section-header" onClick={() => toggleSection('prevention')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">08</span>
              <h2 className="pest-section-title">Prevention Tips</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('prevention') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('prevention') ? 'pest-section-body--open' : ''}`}>
            <div className="prevention-grid">
              {d.preventionTips.map((p, i) => (
                <div key={i} className="prevention-card">
                  <div className="prevention-card-top">
                    <span className="prevention-icon">{p.icon}</span>
                    <span className={`priority-badge priority-badge--${p.priority.toLowerCase()}`}>
                      {p.priority}
                    </span>
                  </div>
                  <h4 className="prevention-title">{p.tip}</h4>
                  <p className="prevention-detail">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ⑨ AI Recommendations */}
        <section className="pest-section" id="ai-recommendations">
          <div className="pest-section-header" onClick={() => toggleSection('ai-recommendations')}>
            <div className="pest-section-title-wrap">
              <span className="pest-section-number">09</span>
              <h2 className="pest-section-title">AI Recommendations</h2>
            </div>
            <span className={`pest-section-chevron ${isSectionOpen('ai-recommendations') ? 'open' : ''}`}>▾</span>
          </div>
          <div className={`pest-section-body ${isSectionOpen('ai-recommendations') ? 'pest-section-body--open' : ''}`}>
            <div className="ai-recs-list">
              {d.aiRecommendations.map((r, i) => (
                <div key={i} className={`ai-rec-card ai-rec-card--${r.type}`}>
                  <div className="ai-rec-header">
                    <span className="ai-rec-type-icon">{typeIcon(r.type)}</span>
                    <h4 className="ai-rec-title">{r.recommendation}</h4>
                    <div className="ai-rec-confidence">
                      <div
                        className="ai-rec-confidence-bar"
                        style={{
                          width: `${r.confidence}%`,
                          background: confidenceColor(r.confidence),
                        }}
                      />
                      <span className="ai-rec-confidence-text">{r.confidence}%</span>
                    </div>
                  </div>
                  <p className="ai-rec-detail">{r.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ──── Footer ──── */}
      <footer className="pest-footer">
        <p>Report generated by SecenAI AgriDrone Platform · {d.scanInfo.scanDate}</p>
      </footer>
    </div>
  )
}
