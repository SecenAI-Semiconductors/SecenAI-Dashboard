export function FieldSelector({ farmers, selectedFarmerId, onChange }) {
  const selected = farmers.find(f => f._id === selectedFarmerId)

  return (
    <div className="si-field-selector-container">
      <div className="si-field-selector-info">
        <h3>Select Field (Farmer Profile)</h3>
        {selected ? (
          <p className="si-field-details">
            <span className="si-detail-item"><strong>Location:</strong> {selected.district || 'N/A'}, {selected.state || 'N/A'}</span>
            <span className="si-detail-item"><strong>Area:</strong> {selected.totalLandArea || 0} Acres</span>
          </p>
        ) : (
          <p className="si-field-details">No field selected</p>
        )}
      </div>
      
      <div className="si-field-dropdown">
        <select 
          value={selectedFarmerId} 
          onChange={(e) => onChange(e.target.value)}
          className="si-select-input"
        >
          {farmers.map(farmer => (
            <option key={farmer._id} value={farmer._id}>
              {farmer.fullName}'s Farm
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
