import { useState, useEffect } from 'react'

/**
 * Add / Edit farmer modal.
 * Handles form validation, loading state, and submits via callback.
 */
export function FarmerModal({ farmer, isSubmitting, onSubmit, onClose }) {
  const isEdit = Boolean(farmer?._id)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    district: '',
    state: '',
    language: 'English',
    totalLandArea: '',
  })

  const [errors, setErrors] = useState({})

  // Pre-populate form when editing
  useEffect(() => {
    if (farmer) {
      setFormData({
        fullName: farmer.fullName || '',
        email: farmer.email || '',
        phone: farmer.phone || '',
        district: farmer.district || '',
        state: farmer.state || '',
        language: farmer.language || 'English',
        totalLandArea: farmer.totalLandArea || '',
      })
    }
  }, [farmer])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validate() {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[+]?[\d\s()-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      ...formData,
      totalLandArea: formData.totalLandArea
        ? Number(formData.totalLandArea)
        : 0,
    }

    onSubmit(payload)
  }

  return (
    <div className="fm-modal-overlay" onClick={onClose} id="farmer-modal-overlay">
      <div
        className="fm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="farmer-modal-title"
      >
        {/* Header */}
        <div className="fm-modal-header">
          <h2 id="farmer-modal-title">
            {isEdit ? 'Edit Farmer' : 'Add New Farmer'}
          </h2>
          <button className="fm-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="fm-modal-body">
            <div className="fm-form-grid">
              {/* Full Name */}
              <div className="fm-form-group fm-form-group--full">
                <label className="fm-label" htmlFor="fm-fullName">
                  Full Name *
                </label>
                <input
                  id="fm-fullName"
                  name="fullName"
                  type="text"
                  className={`fm-input${errors.fullName ? ' fm-input--error' : ''}`}
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  disabled={isSubmitting}
                />
                {errors.fullName && (
                  <span className="fm-error-text">{errors.fullName}</span>
                )}
              </div>

              {/* Email */}
              <div className="fm-form-group">
                <label className="fm-label" htmlFor="fm-email">
                  Email *
                </label>
                <input
                  id="fm-email"
                  name="email"
                  type="email"
                  className={`fm-input${errors.email ? ' fm-input--error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="farmer@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="fm-error-text">{errors.email}</span>
                )}
              </div>

              {/* Phone */}
              <div className="fm-form-group">
                <label className="fm-label" htmlFor="fm-phone">
                  Phone *
                </label>
                <input
                  id="fm-phone"
                  name="phone"
                  type="tel"
                  className={`fm-input${errors.phone ? ' fm-input--error' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <span className="fm-error-text">{errors.phone}</span>
                )}
              </div>

              {/* District */}
              <div className="fm-form-group">
                <label className="fm-label" htmlFor="fm-district">
                  District *
                </label>
                <input
                  id="fm-district"
                  name="district"
                  type="text"
                  className={`fm-input${errors.district ? ' fm-input--error' : ''}`}
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district"
                  disabled={isSubmitting}
                />
                {errors.district && (
                  <span className="fm-error-text">{errors.district}</span>
                )}
              </div>

              {/* State */}
              <div className="fm-form-group">
                <label className="fm-label" htmlFor="fm-state">
                  State *
                </label>
                <select
                  id="fm-state"
                  name="state"
                  className={`fm-select${errors.state ? ' fm-input--error' : ''}`}
                  value={formData.state}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select state</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <optgroup label="Union Territories">
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Puducherry">Puducherry</option>
                  </optgroup>
                </select>
                {errors.state && (
                  <span className="fm-error-text">{errors.state}</span>
                )}
              </div>

              {/* Preferred Language */}
              <div className="fm-form-group">
                <label className="fm-label" htmlFor="fm-language">
                  Preferred Language
                </label>
                <select
                  id="fm-language"
                  name="language"
                  className="fm-select"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>

              {/* Total Land Area */}
              <div className="fm-form-group">
                <label className="fm-label" htmlFor="fm-totalLandArea">
                  Total Land Area (acres)
                </label>
                <input
                  id="fm-totalLandArea"
                  name="totalLandArea"
                  type="number"
                  min="0"
                  step="0.1"
                  className="fm-input"
                  value={formData.totalLandArea}
                  onChange={handleChange}
                  placeholder="e.g. 5.5"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="fm-modal-footer">
            <button
              type="button"
              className="fm-btn fm-btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
              id="farmer-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fm-btn fm-btn--primary"
              disabled={isSubmitting}
              id="farmer-modal-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="fm-spinner" />
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Add Farmer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
