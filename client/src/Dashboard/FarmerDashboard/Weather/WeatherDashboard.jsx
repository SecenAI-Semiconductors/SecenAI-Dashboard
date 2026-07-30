import { useEffect, useMemo, useState } from 'react'
import { useWeather } from '../../../hooks/useWeather'
import { WeatherSearch } from './components/WeatherSearch'
import { WeatherHero } from './components/WeatherHero'
import { WeatherCards } from './components/WeatherCards'
import { HourlyForecast } from './components/HourlyForecast'
import { WeeklyForecast } from './components/WeeklyForecast'
import { WeatherAnalysis } from './components/WeatherAnalysis'
import { AgricultureAnalysis } from './components/AgricultureAnalysis'
import { WeatherRisks } from './components/WeatherRisks'
import { WeatherCharts } from './components/WeatherCharts'
import { AIRecommendation } from './components/AIRecommendation'
import { FarmingRecommendations } from './components/FarmingRecommendations'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import './WeatherDashboard.css'

export function WeatherDashboard() {
  const { searchTerm, setSearchTerm, weatherData, loading, error, search, hasData } = useWeather()
  const [chartMode, setChartMode] = useState('hourly')

  useEffect(() => {
    document.title = 'Weather Intelligence | SecenAI'
  }, [])

  const content = useMemo(() => {
    if (loading) {
      return <LoadingSkeleton />
    }

    if (error) {
      return (
        <div className="weather-empty-state weather-error-state">
          <h2>Unable to load weather data.</h2>
          <p>{error || 'Please try again.'}</p>
          <button type="button" className="weather-button" onClick={() => search(searchTerm)}>
            Retry
          </button>
        </div>
      )
    }

    if (!weatherData) {
      return (
        <div className="weather-empty-state">
          <h2>Search for a location to view weather intelligence.</h2>
        </div>
      )
    }

    return (
      <>
        <WeatherHero weather={weatherData.current} location={weatherData.locationName} summary={weatherData.summary} />
        <WeatherCards weather={weatherData.current} summary={weatherData.summary} />
        <HourlyForecast hourly={weatherData.hourly} />
        <WeeklyForecast daily={weatherData.daily} />
        <WeatherAnalysis summary={weatherData.summary} />
        <AgricultureAnalysis indicators={weatherData.agriculture} />
        <WeatherRisks risks={weatherData.risks} />
        <AIRecommendation />
        <FarmingRecommendations recommendations={weatherData.recommendations} />
        <WeatherCharts hourly={weatherData.hourly} daily={weatherData.daily} chartMode={chartMode} setChartMode={setChartMode} />
      </>
    )
  }, [chartMode, error, loading, search, searchTerm, weatherData])

  return (
    <div className="dashboard-view weather-view">
      <section className="dashboard-content weather-content">
        <div className="weather-header-row">
          <div>
            <h1 className="dashboard-heading">Weather Intelligence</h1>
            <p className="dashboard-subheading">
              Real-time weather insights and agricultural risk analysis for smarter farm decisions.
            </p>
          </div>
          <div className="weather-search-wrapper">
            <WeatherSearch
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              onSearch={() => search(searchTerm)}
            />
          </div>
        </div>

        {content}
      </section>
    </div>
  )
}
