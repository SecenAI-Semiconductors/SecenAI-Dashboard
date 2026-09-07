/**
 * soilThresholds.js
 * Centralized logic for soil condition evaluation and scoring.
 */

// General status indicators
export const STATUS = {
  GOOD: 'Good',
  MODERATE: 'Moderate',
  POOR: 'Poor',
}

// Detailed indicators for nutrients
export const LEVEL = {
  LOW: 'Low',
  OPTIMAL: 'Optimal',
  HIGH: 'High',
}

// ==========================================
// 1. Parameter Evaluations
// ==========================================

export function evaluatePH(ph) {
  if (!ph) return { status: STATUS.POOR, message: 'No data' }
  if (ph >= 6.0 && ph <= 7.5) return { status: STATUS.GOOD, message: 'Optimal range for most crops.' }
  if (ph >= 5.5 && ph < 6.0) return { status: STATUS.MODERATE, message: 'Slightly acidic. May need liming.' }
  if (ph > 7.5 && ph <= 8.0) return { status: STATUS.MODERATE, message: 'Slightly alkaline.' }
  return { status: STATUS.POOR, message: 'Outside ideal range. Soil amendment strongly recommended.' }
}

export function evaluateMoisture(moisture) {
  if (moisture === undefined || moisture === null) return { status: STATUS.POOR, message: 'No data' }
  if (moisture >= 30 && moisture <= 60) return { status: STATUS.GOOD, message: 'Adequate moisture.' }
  if (moisture > 60) return { status: STATUS.MODERATE, message: 'High moisture. Ensure good drainage.' }
  return { status: STATUS.POOR, message: 'Low moisture. Irrigation needed.' }
}

export function evaluateNitrogen(n) {
  if (n === undefined || n === null) return { level: LEVEL.LOW, message: 'No data' }
  if (n < 250) return { level: LEVEL.LOW, message: 'Your soil may need additional nitrogen to support healthy vegetative growth.' }
  if (n <= 500) return { level: LEVEL.OPTIMAL, message: 'Adequate nitrogen for healthy crop development.' }
  return { level: LEVEL.HIGH, message: 'High nitrogen. Avoid over-fertilizing to prevent runoff.' }
}

export function evaluatePhosphorus(p) {
  if (p === undefined || p === null) return { level: LEVEL.LOW, message: 'No data' }
  if (p < 10) return { level: LEVEL.LOW, message: 'Phosphorus is low. Consider P-rich fertilizers for root development.' }
  if (p <= 25) return { level: LEVEL.OPTIMAL, message: 'Optimal phosphorus levels.' }
  return { level: LEVEL.HIGH, message: 'High phosphorus. No immediate action required.' }
}

export function evaluatePotassium(k) {
  if (k === undefined || k === null) return { level: LEVEL.LOW, message: 'No data' }
  if (k < 110) return { level: LEVEL.LOW, message: 'Potassium is low. Add potash to improve drought and disease resistance.' }
  if (k <= 280) return { level: LEVEL.OPTIMAL, message: 'Optimal potassium levels.' }
  return { level: LEVEL.HIGH, message: 'High potassium.' }
}

export function evaluateOC(oc) {
  if (oc === undefined || oc === null) return { status: STATUS.POOR, message: 'No data' }
  if (oc < 0.5) return { status: STATUS.POOR, message: 'Low organic carbon. Add compost or manure.' }
  if (oc <= 0.75) return { status: STATUS.MODERATE, message: 'Moderate organic carbon.' }
  return { status: STATUS.GOOD, message: 'Good organic carbon level.' }
}

export function evaluateEC(ec) {
  if (ec === undefined || ec === null) return { status: STATUS.POOR, message: 'No data' }
  if (ec < 1.0) return { status: STATUS.GOOD, message: 'Normal salinity.' }
  if (ec <= 2.0) return { status: STATUS.MODERATE, message: 'Slightly saline.' }
  return { status: STATUS.POOR, message: 'High salinity. May restrict crop growth.' }
}

// ==========================================
// 2. Health Score Calculation
// ==========================================

export function calculateHealthScore(soil) {
  if (!soil) return { score: 0, condition: STATUS.POOR, issues: [], good: [] }
  
  let score = 100
  const issues = []
  const good = []

  // pH (Max 20 pts)
  const phEval = evaluatePH(soil.ph)
  if (phEval.status === STATUS.GOOD) good.push('pH is suitable')
  else if (phEval.status === STATUS.MODERATE) { score -= 10; issues.push('pH is slightly imbalanced') }
  else { score -= 20; issues.push('pH is outside preferred range') }

  // Moisture (Max 20 pts)
  const moistEval = evaluateMoisture(soil.moisture)
  if (moistEval.status === STATUS.GOOD) good.push('Moisture is adequate')
  else if (moistEval.status === STATUS.MODERATE) { score -= 5; issues.push('Moisture is high') }
  else { score -= 20; issues.push('Soil is too dry') }

  // NPK (Max 30 pts, 10 each)
  const nEval = evaluateNitrogen(soil.nitrogen)
  if (nEval.level === LEVEL.OPTIMAL) good.push('Nitrogen is optimal')
  else if (nEval.level === LEVEL.LOW) { score -= 10; issues.push('Nitrogen is low') }
  else { score -= 5; issues.push('Nitrogen is high') }

  const pEval = evaluatePhosphorus(soil.phosphorus)
  if (pEval.level === LEVEL.OPTIMAL) good.push('Phosphorus is optimal')
  else if (pEval.level === LEVEL.LOW) { score -= 10; issues.push('Phosphorus is low') }
  else { score -= 5; issues.push('Phosphorus is high') }

  const kEval = evaluatePotassium(soil.potassium)
  if (kEval.level === LEVEL.OPTIMAL) good.push('Potassium is optimal')
  else if (kEval.level === LEVEL.LOW) { score -= 10; issues.push('Potassium is low') }
  else { score -= 5; issues.push('Potassium is high') }

  // OC (Max 15 pts)
  const ocEval = evaluateOC(soil.organicCarbon)
  if (ocEval.status === STATUS.GOOD) good.push('Organic Carbon is good')
  else if (ocEval.status === STATUS.MODERATE) { score -= 5; issues.push('Organic Carbon is moderate') }
  else { score -= 15; issues.push('Organic Carbon is low') }

  // EC (Max 15 pts)
  const ecEval = evaluateEC(soil.electricalConductivity)
  if (ecEval.status === STATUS.GOOD) good.push('Salinity is normal')
  else if (ecEval.status === STATUS.MODERATE) { score -= 5; issues.push('Slightly saline') }
  else { score -= 15; issues.push('High salinity') }

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  let condition = STATUS.POOR
  if (score >= 75) condition = STATUS.GOOD
  else if (score >= 50) condition = STATUS.MODERATE

  return { score, condition, issues, good }
}

// ==========================================
// 3. Alerts Generation
// ==========================================

export function generateAlerts(soil) {
  if (!soil) return []
  const alerts = []

  const n = evaluateNitrogen(soil.nitrogen)
  if (n.level === LEVEL.LOW) alerts.push({ type: 'warning', title: 'Low Nitrogen', desc: n.message })
  
  const p = evaluatePhosphorus(soil.phosphorus)
  if (p.level === LEVEL.LOW) alerts.push({ type: 'info', title: 'Low Phosphorus', desc: p.message })
  
  const k = evaluatePotassium(soil.potassium)
  if (k.level === LEVEL.LOW) alerts.push({ type: 'info', title: 'Low Potassium', desc: k.message })

  const ph = evaluatePH(soil.ph)
  if (ph.status === STATUS.POOR) alerts.push({ type: 'critical', title: 'pH Imbalance', desc: ph.message })

  const m = evaluateMoisture(soil.moisture)
  if (m.status === STATUS.POOR) alerts.push({ type: 'warning', title: 'Low Soil Moisture', desc: m.message })

  const ec = evaluateEC(soil.electricalConductivity)
  if (ec.status === STATUS.POOR) alerts.push({ type: 'critical', title: 'High Soil Salinity', desc: ec.message })

  return alerts
}

// ==========================================
// 4. Fertilizer & AI Recommendations
// ==========================================

export function generateFertilizerRecs(soil) {
  if (!soil) return []
  const recs = []

  const n = evaluateNitrogen(soil.nitrogen)
  if (n.level === LEVEL.LOW) recs.push({ nutrient: 'Nitrogen', action: 'Increase nitrogen availability', desc: 'Apply urea or nitrogen-rich compost.' })
  else recs.push({ nutrient: 'Nitrogen', action: 'Maintain current level', desc: 'No immediate action required.' })

  const p = evaluatePhosphorus(soil.phosphorus)
  if (p.level === LEVEL.LOW) recs.push({ nutrient: 'Phosphorus', action: 'Increase phosphorus availability', desc: 'Apply DAP or bone meal.' })
  else recs.push({ nutrient: 'Phosphorus', action: 'Maintain current level', desc: 'No immediate action required.' })

  const k = evaluatePotassium(soil.potassium)
  if (k.level === LEVEL.LOW) recs.push({ nutrient: 'Potassium', action: 'Increase potassium availability', desc: 'Apply MOP or wood ash.' })
  else recs.push({ nutrient: 'Potassium', action: 'Maintain current level', desc: 'No immediate action required.' })

  return recs
}

export function generateAIRecommendation(soil, health) {
  if (!soil || !health) return null

  let summary = `Your soil condition is generally ${health.condition.toLowerCase()}. `
  
  if (health.condition === STATUS.GOOD) {
    if (health.issues.length > 0) {
      summary += `However, ${health.issues[0].toLowerCase()}, so improving that may support better crop growth.`
    } else {
      summary += `Keep up the good work maintaining balanced nutrients.`
    }
  } else {
    summary += `Primary concerns include ${health.issues.slice(0, 2).map(i => i.toLowerCase()).join(' and ')}. Focus on addressing these first.`
  }

  let irrigation = ''
  const m = evaluateMoisture(soil.moisture)
  if (m.status === STATUS.GOOD) irrigation = 'Current moisture levels are adequate, so immediate irrigation is not required.'
  else if (m.status === STATUS.POOR) irrigation = 'Soil is dry. Immediate irrigation is recommended to prevent water stress.'
  else irrigation = 'Monitor soil moisture closely to prevent waterlogging.'

  return { summary, irrigation }
}
