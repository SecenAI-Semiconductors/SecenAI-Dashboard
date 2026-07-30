export function WeatherSearch({ value, onChange, onSearch }) {
  return (
    <div className="weather-search-card">
      <label htmlFor="weather-search" className="weather-search-label">
        Search location
      </label>
      <div className="weather-search-field">
        <input
          id="weather-search"
          name="weather-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onSearch()
            }
          }}
          placeholder="Search by village, city, district, state"
          className="weather-search-input"
        />
        <button type="button" className="weather-search-button" onClick={onSearch}>
          Search
        </button>
      </div>
    </div>
  )
}
