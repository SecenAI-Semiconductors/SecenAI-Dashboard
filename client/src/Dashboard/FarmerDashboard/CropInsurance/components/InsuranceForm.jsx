/**
 * InsuranceForm.jsx
 *
 * Insurance application form with live premium estimation.
 * Fields: farmerName, cropName, cropType, cropSeason, landArea,
 * soilType, irrigationType, district, state, sowingDate,
 * expectedHarvestDate, estimatedYield, requestedCoverage.
 *
 * Premium is calculated as: Coverage Amount × 2%
 */

import { useState, useMemo } from 'react'

const CROP_TYPES = ['Kharif', 'Rabi', 'Zaid', 'Cash Crop', 'Horticulture']
const CROP_SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Summer', 'Whole Year']
const SOIL_TYPES = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy']
const IRRIGATION_TYPES = ['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler', 'Flood']

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const INITIAL_FORM = {
  farmerName: '',
  cropName: '',
  cropType: '',
  cropSeason: '',
  landArea: '',
  soilType: '',
  irrigationType: '',
  district: '',
  state: '',
  sowingDate: '',
  expectedHarvestDate: '',
  estimatedYield: '',
  requestedCoverage: '',
}

export function InsuranceForm({ onSubmit, isSubmitting, farmers = [] }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [selectedFarmerId, setSelectedFarmerId] = useState('')

  // Live premium calculation
  const estimatedPremium = useMemo(() => {
    const coverage = parseFloat(form.requestedCoverage) || 0
    return coverage * 0.02
  }, [form.requestedCoverage])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function handleFarmerSelect(e) {
    const farmerId = e.target.value
    setSelectedFarmerId(farmerId)

    if (farmerId) {
      const farmer = farmers.find((f) => f._id === farmerId)
      if (farmer) {
        setForm((prev) => ({
          ...prev,
          farmerName: farmer.fullName || '',
          district: farmer.district || prev.district,
          state: farmer.state || prev.state,
        }))
      }
    } else {
      setForm((prev) => ({
        ...prev,
        farmerName: '',
      }))
    }
  }

  function validate() {
    const newErrors = {}

    if (!selectedFarmerId) newErrors.farmerId = 'Please select a farmer'
    if (!form.farmerName.trim()) newErrors.farmerName = 'Farmer name is required'
    if (!form.cropName.trim()) newErrors.cropName = 'Crop name is required'
    if (!form.cropType) newErrors.cropType = 'Select a crop type'
    if (!form.cropSeason) newErrors.cropSeason = 'Select a crop season'
    if (!form.landArea || parseFloat(form.landArea) <= 0) {
      newErrors.landArea = 'Enter a valid land area'
    }
    if (!form.soilType) newErrors.soilType = 'Select soil type'
    if (!form.irrigationType) newErrors.irrigationType = 'Select irrigation type'
    if (!form.district.trim()) newErrors.district = 'District is required'
    if (!form.state) newErrors.state = 'Select a state'
    if (!form.sowingDate) newErrors.sowingDate = 'Sowing date is required'
    if (!form.expectedHarvestDate) newErrors.expectedHarvestDate = 'Harvest date is required'
    if (form.sowingDate && form.expectedHarvestDate && form.expectedHarvestDate <= form.sowingDate) {
      newErrors.expectedHarvestDate = 'Harvest date must be after sowing date'
    }
    if (!form.estimatedYield || parseFloat(form.estimatedYield) <= 0) {
      newErrors.estimatedYield = 'Enter a valid estimated yield'
    }
    if (!form.requestedCoverage || parseFloat(form.requestedCoverage) <= 0) {
      newErrors.requestedCoverage = 'Enter a valid coverage amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      farmerId: selectedFarmerId,
      farmerName: form.farmerName.trim(),
      cropName: form.cropName.trim(),
      cropType: form.cropType,
      cropSeason: form.cropSeason,
      landArea: parseFloat(form.landArea),
      soilType: form.soilType,
      irrigationType: form.irrigationType,
      district: form.district.trim(),
      state: form.state,
      sowingDate: form.sowingDate,
      expectedHarvestDate: form.expectedHarvestDate,
      estimatedYield: parseFloat(form.estimatedYield),
      requestedCoverage: parseFloat(form.requestedCoverage),
      estimatedInsurancePremium: estimatedPremium,
    }

    const success = await onSubmit(payload)

    if (success) {
      setForm(INITIAL_FORM)
      setSelectedFarmerId('')
      setErrors({})
    }
  }

  return (
    <section className="ci-section" id="insurance-form-section">
      <div className="ci-section-header">
        <span className="ci-section-icon">📝</span>
        <h2 className="ci-section-title">Apply for Crop Insurance</h2>
      </div>
      <p className="ci-section-subtitle">
        Fill in the details below to submit an insurance application for your crop.
      </p>

      <div className="ci-form-layout">
        {/* ── Form Card ── */}
        <form className="ci-form-card" onSubmit={handleSubmit} id="insurance-application-form">
          <div className="ci-form-accent-bar" />

          {/* Farmer Selection */}
          <div className="ci-form-group ci-form-group--full">
            <label className="ci-form-label">Select Farmer *</label>
            <select
              className={`ci-form-select${errors.farmerId ? ' ci-form-input--error' : ''}`}
              value={selectedFarmerId}
              onChange={handleFarmerSelect}
              id="ci-farmer-select"
            >
              <option value="">— Choose a farmer —</option>
              {farmers.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.fullName} — {f.district || 'N/A'}, {f.state || 'N/A'}
                </option>
              ))}
            </select>
            {errors.farmerId && <span className="ci-form-error">{errors.farmerId}</span>}
          </div>

          {/* Farmer Name (auto-filled) */}
          <div className="ci-form-group">
            <label className="ci-form-label">Farmer Name *</label>
            <input
              type="text"
              className={`ci-form-input${errors.farmerName ? ' ci-form-input--error' : ''}`}
              name="farmerName"
              value={form.farmerName}
              onChange={handleChange}
              placeholder="Auto-filled from selection"
              readOnly={!!selectedFarmerId}
              id="ci-farmer-name"
            />
            {errors.farmerName && <span className="ci-form-error">{errors.farmerName}</span>}
          </div>

          {/* Crop Name */}
          <div className="ci-form-group">
            <label className="ci-form-label">Crop Name *</label>
            <input
              type="text"
              className={`ci-form-input${errors.cropName ? ' ci-form-input--error' : ''}`}
              name="cropName"
              value={form.cropName}
              onChange={handleChange}
              placeholder="e.g. Wheat, Rice, Cotton"
              id="ci-crop-name"
            />
            {errors.cropName && <span className="ci-form-error">{errors.cropName}</span>}
          </div>

          {/* Crop Type */}
          <div className="ci-form-group">
            <label className="ci-form-label">Crop Type *</label>
            <select
              className={`ci-form-select${errors.cropType ? ' ci-form-input--error' : ''}`}
              name="cropType"
              value={form.cropType}
              onChange={handleChange}
              id="ci-crop-type"
            >
              <option value="">— Select —</option>
              {CROP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.cropType && <span className="ci-form-error">{errors.cropType}</span>}
          </div>

          {/* Crop Season */}
          <div className="ci-form-group">
            <label className="ci-form-label">Crop Season *</label>
            <select
              className={`ci-form-select${errors.cropSeason ? ' ci-form-input--error' : ''}`}
              name="cropSeason"
              value={form.cropSeason}
              onChange={handleChange}
              id="ci-crop-season"
            >
              <option value="">— Select —</option>
              {CROP_SEASONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.cropSeason && <span className="ci-form-error">{errors.cropSeason}</span>}
          </div>

          {/* Land Area */}
          <div className="ci-form-group">
            <label className="ci-form-label">Land Area (acres) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className={`ci-form-input${errors.landArea ? ' ci-form-input--error' : ''}`}
              name="landArea"
              value={form.landArea}
              onChange={handleChange}
              placeholder="e.g. 5.0"
              id="ci-land-area"
            />
            {errors.landArea && <span className="ci-form-error">{errors.landArea}</span>}
          </div>

          {/* Soil Type */}
          <div className="ci-form-group">
            <label className="ci-form-label">Soil Type *</label>
            <select
              className={`ci-form-select${errors.soilType ? ' ci-form-input--error' : ''}`}
              name="soilType"
              value={form.soilType}
              onChange={handleChange}
              id="ci-soil-type"
            >
              <option value="">— Select —</option>
              {SOIL_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.soilType && <span className="ci-form-error">{errors.soilType}</span>}
          </div>

          {/* Irrigation Type */}
          <div className="ci-form-group">
            <label className="ci-form-label">Irrigation Type *</label>
            <select
              className={`ci-form-select${errors.irrigationType ? ' ci-form-input--error' : ''}`}
              name="irrigationType"
              value={form.irrigationType}
              onChange={handleChange}
              id="ci-irrigation-type"
            >
              <option value="">— Select —</option>
              {IRRIGATION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.irrigationType && <span className="ci-form-error">{errors.irrigationType}</span>}
          </div>

          {/* District */}
          <div className="ci-form-group">
            <label className="ci-form-label">District *</label>
            <input
              type="text"
              className={`ci-form-input${errors.district ? ' ci-form-input--error' : ''}`}
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="e.g. Guntur"
              id="ci-district"
            />
            {errors.district && <span className="ci-form-error">{errors.district}</span>}
          </div>

          {/* State */}
          <div className="ci-form-group">
            <label className="ci-form-label">State *</label>
            <select
              className={`ci-form-select${errors.state ? ' ci-form-input--error' : ''}`}
              name="state"
              value={form.state}
              onChange={handleChange}
              id="ci-state"
            >
              <option value="">— Select —</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <span className="ci-form-error">{errors.state}</span>}
          </div>

          {/* Sowing Date */}
          <div className="ci-form-group">
            <label className="ci-form-label">Sowing Date *</label>
            <input
              type="date"
              className={`ci-form-input${errors.sowingDate ? ' ci-form-input--error' : ''}`}
              name="sowingDate"
              value={form.sowingDate}
              onChange={handleChange}
              id="ci-sowing-date"
            />
            {errors.sowingDate && <span className="ci-form-error">{errors.sowingDate}</span>}
          </div>

          {/* Expected Harvest Date */}
          <div className="ci-form-group">
            <label className="ci-form-label">Expected Harvest Date *</label>
            <input
              type="date"
              className={`ci-form-input${errors.expectedHarvestDate ? ' ci-form-input--error' : ''}`}
              name="expectedHarvestDate"
              value={form.expectedHarvestDate}
              onChange={handleChange}
              id="ci-harvest-date"
            />
            {errors.expectedHarvestDate && <span className="ci-form-error">{errors.expectedHarvestDate}</span>}
          </div>

          {/* Estimated Yield */}
          <div className="ci-form-group">
            <label className="ci-form-label">Estimated Yield (quintals) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className={`ci-form-input${errors.estimatedYield ? ' ci-form-input--error' : ''}`}
              name="estimatedYield"
              value={form.estimatedYield}
              onChange={handleChange}
              placeholder="e.g. 25"
              id="ci-estimated-yield"
            />
            {errors.estimatedYield && <span className="ci-form-error">{errors.estimatedYield}</span>}
          </div>

          {/* Requested Coverage */}
          <div className="ci-form-group">
            <label className="ci-form-label">Requested Coverage Amount (₹) *</label>
            <input
              type="number"
              step="100"
              min="0"
              className={`ci-form-input${errors.requestedCoverage ? ' ci-form-input--error' : ''}`}
              name="requestedCoverage"
              value={form.requestedCoverage}
              onChange={handleChange}
              placeholder="e.g. 200000"
              id="ci-requested-coverage"
            />
            {errors.requestedCoverage && <span className="ci-form-error">{errors.requestedCoverage}</span>}
          </div>

          {/* Submit Button */}
          <div className="ci-form-group ci-form-group--full ci-form-actions">
            <button
              type="submit"
              className="ci-submit-btn"
              disabled={isSubmitting}
              id="ci-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="ci-spinner" />
                  Submitting…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Submit Insurance Request
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── Premium Estimate Card ── */}
        <div className="ci-premium-card" id="ci-premium-estimate">
          <div className="ci-premium-accent" />
          <div className="ci-premium-body">
            <div className="ci-premium-header">
              <div className="ci-premium-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="ci-premium-title">Estimated Premium</h3>
                <span className="ci-premium-badge">
                  <span className="ci-premium-badge-dot" />
                  Live Estimate
                </span>
              </div>
            </div>

            <div className="ci-premium-amount">
              ₹{estimatedPremium.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <div className="ci-premium-details">
              <div className="ci-premium-detail-row">
                <span className="ci-premium-detail-label">Coverage Amount</span>
                <span className="ci-premium-detail-value">
                  ₹{(parseFloat(form.requestedCoverage) || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="ci-premium-detail-row">
                <span className="ci-premium-detail-label">Premium Rate</span>
                <span className="ci-premium-detail-value">2.00%</span>
              </div>
              <div className="ci-premium-detail-row ci-premium-detail-row--total">
                <span className="ci-premium-detail-label">Estimated Premium</span>
                <span className="ci-premium-detail-value">
                  ₹{estimatedPremium.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="ci-premium-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>This is an estimated premium. Final premium will be determined after admin review.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
