import { fetchWeatherApi } from 'openmeteo'

export type CurrentWeather = {
  temperatureC: number
  apparentC: number
  windSpeedKmh: number
  windDirectionDeg: number
  weatherCode: number
  weatherDescription: string
  isDay: boolean
}

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_SEARCH_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const GEOCODE_REVERSE_URL = 'https://geocoding-api.open-meteo.com/v1/reverse'

export async function geocodeCity(name: string): Promise<
  | { latitude: number; longitude: number; displayName: string }
  | null
> {
  const url = `${GEOCODE_SEARCH_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as any
  const first = data?.results?.[0]
  if (!first) return null
  return {
    latitude: first.latitude,
    longitude: first.longitude,
    displayName: `${first.name}, ${first.country_code}`,
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<
  | { latitude: number; longitude: number; displayName: string }
  | null
> {
  const url = `${GEOCODE_REVERSE_URL}?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as any
  const first = data?.results?.[0]
  if (!first) return null
  const primary =
    first.city ||
    first.town ||
    first.village ||
    first.municipality ||
    first.locality ||
    first.name
  const region = first.admin2 || first.admin1
  const cc = first.country_code
  const display = primary
    ? cc ? `${primary}, ${cc}` : primary
    : region
    ? cc ? `${region}, ${cc}` : region
    : `${lat.toFixed(3)}, ${lon.toFixed(3)}`
  return {
    latitude: first.latitude,
    longitude: first.longitude,
    displayName: display,
  }
}

export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const params = {
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'is_day',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ],
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  } as const

  const responses = await fetchWeatherApi(WEATHER_URL, params)
  const response = responses[0]
  const current = response.current()
  if (!current) throw new Error('No current weather data')

  const temperatureC = current.variables(0)!.value()
  const apparentC = current.variables(1)!.value()
  const isDay = current.variables(2)!.value() === 1
  const weatherCode = current.variables(3)!.value()
  const windSpeedKmh = current.variables(4)!.value()
  const windDirectionDeg = current.variables(5)!.value()

  return {
    temperatureC,
    apparentC,
    isDay,
    weatherCode,
    windSpeedKmh,
    windDirectionDeg,
    weatherDescription: describeWmo(weatherCode),
  }
}

function describeWmo(code: number): string {
  // Minimal mapping for common codes; fallback to numeric code
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }
  return map[Math.round(code)] ?? `Code ${code}`
}
