import { useEffect, useState } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'
import { geocodeCity, reverseGeocode, getCurrentWeather, type CurrentWeather } from '../modules/weather/openmeteo'

export default function WeatherPage() {
  const [city, setCity] = useState('')
  const [location, setLocation] = useState<{ name: string; lat: number; lon: number } | null>(null)
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const LAST_KEY = 'weather.last.v1'

  async function loadByCoords(lat: number, lon: number, name = 'Your location') {
    setLoading(true)
    setError(null)
    try {
      const w = await getCurrentWeather(lat, lon)
      setLocation({ name, lat, lon })
      setWeather(w)
      setLastUpdated(Date.now())
      try {
        localStorage.setItem(LAST_KEY, JSON.stringify({ name, lat, lon, ts: Date.now() }))
      } catch {}
      try {
        const place = await reverseGeocode(lat, lon)
        if (place && place.displayName && place.displayName !== name) {
          setLocation({ name: place.displayName, lat, lon })
          localStorage.setItem(LAST_KEY, JSON.stringify({ name: place.displayName, lat, lon, ts: Date.now() }))
        }
      } catch {}
    } catch (e) {
      setError('Failed to load weather. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { name: string; lat: number; lon: number; ts?: number }
        setLastUpdated(parsed.ts ?? null)
        loadByCoords(parsed.lat, parsed.lon, parsed.name)
      }
    } catch {}
  }, [])

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!city.trim()) return
    setLoading(true)
    setError(null)
    setWeather(null)
    try {
      const geo = await geocodeCity(city.trim())
      if (!geo) {
        setError('City not found.')
      } else {
        await loadByCoords(geo.latitude, geo.longitude, geo.displayName)
      }
    } finally {
      setLoading(false)
    }
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported in this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        let name = 'Your location'
        try {
          const place = await reverseGeocode(latitude, longitude)
          if (place) name = place.displayName
        } catch {}
        loadByCoords(latitude, longitude, name)
      },
      () => setError('Failed to get your location.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <Page id="weather">
      <h2 className="text-2xl mb-4">Väder</h2>
      <Card className="p-4 grid gap-4">
        <form onSubmit={onSearch} className="flex gap-2">
          <input className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2" placeholder="Sök stad (t.ex. Berlin)" value={city} onChange={(e) => setCity(e.target.value)} />
          <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="submit">Sök</button>
          <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="button" onClick={useMyLocation}>Använd min plats</button>
        </form>

        {loading && (
          <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
            <Card className="p-4">
              <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
              <div className="h-6 w-48 bg-white/10 rounded mb-1"></div>
              <div className="h-3 w-40 bg-white/10 rounded"></div>
            </Card>
            <Card className="p-4">
              <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
              <div className="h-8 w-28 bg-white/10 rounded mb-2"></div>
              <div className="h-3 w-52 bg-white/10 rounded"></div>
            </Card>
          </div>
        )}
        {error && <div className="text-rose-400">{error}</div>}
        {weather && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-sm text-white/60">Plats</div>
              <div className="text-lg font-semibold">{location?.name}</div>
              <div className="text-white/60 text-sm">{location?.lat.toFixed(3)}, {location?.lon.toFixed(3)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-white/60">Förhållanden</div>
              <div className="text-2xl font-semibold">{Math.round(weather.temperatureC)}°C</div>
              <div className="text-white/70">Känns som {Math.round(weather.apparentC)}°C · {weather.weatherDescription}</div>
              <div className="text-white/60 text-sm">Vind {Math.round(weather.windSpeedKmh)} km/h · {Math.round(weather.windDirectionDeg)}° · {weather.isDay ? 'Dag' : 'Natt'}</div>
              {lastUpdated && (
                <div className="text-white/50 text-xs mt-2">Senast uppdaterad {new Date(lastUpdated).toLocaleTimeString('sv-SE')}</div>
              )}
            </Card>
          </div>
        )}
        {!loading && !weather && !error && (
          <p className="text-white/60">Sök en stad eller använd din plats för att se aktuellt väder via Open‑Meteo.</p>
        )}
      </Card>
    </Page>
  )
}
