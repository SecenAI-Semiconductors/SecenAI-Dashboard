import axios from 'axios'

const OPENWEATHER_BASE = 'https://api.openweathermap.org'
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const DEFAULT_UNITS = 'metric'

function getGeocodeUrl(query) {
  return `${OPENWEATHER_BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`
}

function getCurrentWeatherUrl(lat, lon) {
  return `${OPENWEATHER_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${DEFAULT_UNITS}&appid=${API_KEY}`
}

function getForecastUrl(lat, lon) {
  return `${OPENWEATHER_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${DEFAULT_UNITS}&appid=${API_KEY}`
}

export function getIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`
}

function formatHour(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDay(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

function getUvRisk(uvi) {
  if (uvi == null) return 'Unavailable'
  if (uvi >= 8) return 'Severe'
  if (uvi >= 6) return 'High'
  if (uvi >= 3) return 'Moderate'
  return 'Low'
}

function getRiskColor(level) {
  if (level === 'Severe') return 'risk-red'
  if (level === 'High') return 'risk-orange'
  if (level === 'Moderate') return 'risk-yellow'
  return 'risk-green'
}

function buildLocationName(place) {
  return [place.name, place.state, place.country].filter(Boolean).join(', ')
}

function normalizeCurrentWeather(rawCurrent) {
  return {
    temp: Math.round(rawCurrent.main?.temp ?? 0),
    feelsLike: Math.round(rawCurrent.main?.feels_like ?? 0),
    humidity: rawCurrent.main?.humidity ?? 0,
    windSpeed: Math.round(rawCurrent.wind?.speed ?? 0),
    visibility: Math.round((rawCurrent.visibility ?? 0) / 1000),
    uvi: rawCurrent.uvi ?? 0,
    pressure: rawCurrent.main?.pressure ?? 0,
    sunrise: rawCurrent.sys?.sunrise ?? 0,
    sunset: rawCurrent.sys?.sunset ?? 0,
    description: rawCurrent.weather?.[0]?.description || 'Clear sky',
    icon: rawCurrent.weather?.[0]?.icon || '01d',
    lastUpdated: rawCurrent.dt ?? 0,
  }
}

function normalizeForecastEntries(rawForecast) {
  return (rawForecast.list || []).map((entry) => ({
    dt: entry.dt,
    temp: entry.main?.temp ?? 0,
    humidity: entry.main?.humidity ?? 0,
    windSpeed: entry.wind?.speed ?? 0,
    description: entry.weather?.[0]?.description || 'Clear sky',
    icon: entry.weather?.[0]?.icon || '01d',
    pop: entry.pop ?? 0,
    rainAmount: entry.rain?.['3h'] ?? 0,
  }))
}

export async function getLocationCoordinates(location) {
  if (!API_KEY) {
    throw new Error('Missing VITE_WEATHER_API_KEY')
  }

  const response = await axios.get(getGeocodeUrl(location))
  const data = response.data

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Location not found')
  }

  const [place] = data
  return {
    name: buildLocationName(place),
    lat: place.lat,
    lon: place.lon,
  }
}

export async function getWeatherForCoordinates(lat, lon) {
  if (!API_KEY) {
    throw new Error('Missing VITE_WEATHER_API_KEY')
  }

  const [currentResponse, forecastResponse] = await Promise.all([
    axios.get(getCurrentWeatherUrl(lat, lon)),
    axios.get(getForecastUrl(lat, lon)),
  ])

  return {
    current: currentResponse.data,
    forecast: forecastResponse.data,
  }
}

function buildHourlyData(forecastEntries) {
  return forecastEntries.slice(0, 8).map((hour) => ({
    time: formatHour(hour.dt),
    temp: Math.round(hour.temp),
    icon: hour.icon,
    pop: Math.round((hour.pop || 0) * 100),
    windSpeed: Math.round(hour.windSpeed),
    humidity: hour.humidity,
  }))
}

function buildDailyData(forecastEntries) {
  const groupedDays = forecastEntries.reduce((groups, entry) => {
    const dateKey = new Date(entry.dt * 1000).toISOString().split('T')[0]
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(entry)
    return groups
  }, {})

  return Object.values(groupedDays)
    .slice(0, 5)
    .map((group) => {
      const temps = group.map((entry) => entry.temp)
      const humidities = group.map((entry) => entry.humidity)
      const windSpeeds = group.map((entry) => entry.windSpeed)
      const pops = group.map((entry) => entry.pop)

      return {
        day: formatDay(group[0].dt),
        maxTemp: Math.round(Math.max(...temps)),
        minTemp: Math.round(Math.min(...temps)),
        icon: group[Math.floor(group.length / 2)].icon,
        pop: Math.round((pops.reduce((sum, value) => sum + value, 0) / pops.length) * 100),
        windSpeed: Math.round(windSpeeds.reduce((sum, value) => sum + value, 0) / windSpeeds.length),
        humidity: Math.round(humidities.reduce((sum, value) => sum + value, 0) / humidities.length),
      }
    })
}

function computeSummary(current, forecastEntries) {
  const hourly = forecastEntries.slice(0, 8)
  const daily = buildDailyData(forecastEntries)

  const highestTemperature = Math.round(Math.max(current.temp, ...daily.map((day) => day.maxTemp)))
  const lowestTemperature = Math.round(Math.min(current.temp, ...daily.map((day) => day.minTemp)))
  const averageTemperature = Math.round((current.temp + hourly.reduce((sum, hour) => sum + hour.temp, 0)) / (hourly.length + 1))
  const avgHumidity = Math.round(hourly.reduce((sum, hour) => sum + hour.humidity, 0) / hourly.length)
  const highestWindSpeed = Math.round(Math.max(current.windSpeed, ...hourly.map((hour) => hour.windSpeed)))
  const averageWindSpeed = Math.round(hourly.reduce((sum, hour) => sum + hour.windSpeed, 0) / hourly.length)
  const expectedRainfall = hourly.reduce((sum, hour) => sum + (hour.rainAmount || 0), 0).toFixed(1)
  const uvRisk = getUvRisk(current.uvi)
  const dayRainChance = Math.round((hourly.reduce((sum, hour) => sum + (hour.pop || 0), 0) / hourly.length) * 100)

  return {
    highestTemperature,
    lowestTemperature,
    avgHumidity,
    highestWindSpeed,
    averageTemperature,
    averageWindSpeed,
    expectedRainfall,
    uvRisk,
    dayRainChance,
    rainProbability: dayRainChance,
  }
}

function buildRisks(current, summary) {
  const risks = []
  const { dayRainChance } = summary
  const wind = current.windSpeed
  const temp = current.temp

  const rainRisk = dayRainChance >= 70 ? 'Severe' : dayRainChance >= 40 ? 'High' : dayRainChance >= 20 ? 'Moderate' : 'Low'
  const windRisk = wind >= 18 ? 'High' : wind >= 12 ? 'Moderate' : 'Low'
  const heatRisk = temp >= 38 ? 'High' : temp >= 32 ? 'Moderate' : 'Low'
  const coldRisk = temp <= 8 ? 'High' : temp <= 15 ? 'Moderate' : 'Low'
  const uvRisk = summary.uvRisk

  risks.push({
    title: 'Heavy Rain Risk',
    value: `${dayRainChance}%`,
    level: rainRisk,
    colorClass: getRiskColor(rainRisk),
  })
  risks.push({
    title: 'Flood Risk',
    value: rainRisk === 'Severe' ? 'High' : rainRisk === 'High' ? 'Moderate' : 'Low',
    level: rainRisk === 'Severe' ? 'High' : rainRisk === 'High' ? 'Moderate' : 'Low',
    colorClass: getRiskColor(rainRisk === 'Severe' ? 'High' : rainRisk === 'High' ? 'Moderate' : 'Low'),
  })
  risks.push({
    title: 'Strong Wind Risk',
    value: `${Math.round(wind)} km/h`,
    level: windRisk,
    colorClass: getRiskColor(windRisk),
  })
  risks.push({
    title: 'Heatwave Risk',
    value: temp >= 32 ? 'Elevated' : 'Low',
    level: heatRisk,
    colorClass: getRiskColor(heatRisk),
  })
  risks.push({
    title: 'Cold Stress',
    value: temp <= 15 ? 'Possible' : 'Low',
    level: coldRisk,
    colorClass: getRiskColor(coldRisk),
  })
  risks.push({
    title: 'UV Exposure',
    value: uvRisk,
    level: uvRisk,
    colorClass: getRiskColor(uvRisk),
  })

  return risks
}

function buildAgriculture(current, summary) {
  const humidity = current.humidity
  const temp = current.temp
  const wind = current.windSpeed
  const rainChance = summary.dayRainChance

  const indicators = []
  if (humidity >= 80) {
    indicators.push({
      title: 'Crop Growth Conditions',
      label: 'High Humidity',
      note: 'Possible fungal disease risk; keep drainage monitored.',
      level: 'Moderate',
    })
  } else if (humidity >= 60) {
    indicators.push({
      title: 'Crop Growth Conditions',
      label: 'Favourable Moisture',
      note: 'Soil humidity supports healthy leaf expansion.',
      level: 'Low',
    })
  } else {
    indicators.push({
      title: 'Crop Growth Conditions',
      label: 'Dry Air',
      note: 'Warm and dry conditions may stress young crops.',
      level: 'Moderate',
    })
  }

  if (temp >= 38) {
    indicators.push({
      title: 'Heat Stress',
      label: 'High Heat Stress',
      note: 'Increase irrigation frequency and avoid midday activity.',
      level: 'High',
    })
  } else if (temp >= 32) {
    indicators.push({
      title: 'Heat Stress',
      label: 'Moderate Heat',
      note: 'Early morning irrigation recommended.',
      level: 'Moderate',
    })
  } else {
    indicators.push({
      title: 'Heat Stress',
      label: 'Comfortable Temperature',
      note: 'Conditions are stable for sensitive crops.',
      level: 'Low',
    })
  }

  if (rainChance >= 50) {
    indicators.push({
      title: 'Rainfall Suitability',
      label: 'Good Rain Window',
      note: 'Natural moisture expected; delay manual watering.',
      level: 'Low',
    })
  } else {
    indicators.push({
      title: 'Rainfall Suitability',
      label: 'Dry Forecast',
      note: 'Supplement irrigation if soil moisture is low.',
      level: 'Moderate',
    })
  }

  if (wind >= 15) {
    indicators.push({
      title: 'Wind Impact',
      label: 'Strong Wind',
      note: 'Avoid pesticide spray and secure shade nets.',
      level: 'High',
    })
  } else {
    indicators.push({
      title: 'Wind Impact',
      label: 'Light Wind',
      note: 'Conditions are suitable for fieldwork.',
      level: 'Low',
    })
  }

  indicators.push({
    title: 'Irrigation Need',
    label: temp >= 34 || humidity <= 45 ? 'High' : 'Moderate',
    note: temp >= 34 || humidity <= 45 ? 'Supplement watering for row crops.' : 'Soil moisture remains manageable.',
    level: temp >= 34 || humidity <= 45 ? 'High' : 'Moderate',
  })

  indicators.push({
    title: 'Soil Moisture Expectation',
    label: rainChance >= 40 || humidity >= 70 ? 'Moderately High' : 'Stable',
    note: 'Rain probability and humidity suggest current soil moisture is likely adequate.',
    level: rainChance >= 40 || humidity >= 70 ? 'Low' : 'Moderate',
  })

  return indicators
}

function buildRecommendations(current, summary) {
  const recommendations = []
  const temp = current.temp
  const wind = current.windSpeed
  const rainChance = summary.dayRainChance

  recommendations.push({
    title: 'Recommended Irrigation Time',
    note: rainChance < 40 ? 'Use early morning hours to reduce evaporation.' : 'Delay irrigation until after expected showers.',
  })

  recommendations.push({
    title: 'Suitable Fertilizer Window',
    note: wind < 12 && rainChance < 50 ? 'Mid-morning application is suitable.' : 'Wait for calmer conditions before spreading fertilizer.',
  })

  recommendations.push({
    title: 'Pesticide Spray Recommendation',
    note: wind < 12 && rainChance < 30 ? 'Safe to spray in the next 2-3 hours.' : 'Avoid spraying until wind and rain chance reduce.',
  })

  recommendations.push({
    title: 'Harvest Suitability',
    note: temp < 34 && rainChance < 30 ? 'Good conditions for harvesting and post-harvest handling.' : 'Hold off until weather improves.',
  })

  recommendations.push({
    title: 'Field Work Recommendation',
    note: wind < 15 && rainChance < 40 ? 'Suitable for general field tasks today.' : 'Limit field work during adverse weather.',
  })

  return recommendations
}

export async function searchWeather(location) {
  const place = await getLocationCoordinates(location)
  const rawWeather = await getWeatherForCoordinates(place.lat, place.lon)
  const forecastEntries = normalizeForecastEntries(rawWeather.forecast)
  const current = normalizeCurrentWeather(rawWeather.current)
  const hourly = buildHourlyData(forecastEntries)
  const daily = buildDailyData(forecastEntries)
  const summary = computeSummary(current, forecastEntries)
  const risks = buildRisks(current, summary)
  const agriculture = buildAgriculture(current, summary)
  const recommendations = buildRecommendations(current, summary)

  return {
    locationName: place.name,
    coords: { lat: place.lat, lon: place.lon },
    current: {
      ...current,
      lastUpdated: current.lastUpdated,
    },
    hourly,
    daily,
    summary,
    risks,
    agriculture,
    recommendations,
  }
}
