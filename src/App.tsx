import { useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './modules/auth/AuthContext'
import { fetchSwedishHolidays } from './modules/calendar/holidays'

type TodoItem = {
  id: string
  text: string
  done: boolean
}

function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-[1100px] mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to="/" className="font-extrabold tracking-tight">myHome</NavLink>
        <nav className="flex gap-3 text-sm items-center">
          <a className="px-3 py-2 rounded-md hover:bg-white/10" href="#battery">Battery</a>
          <a className="px-3 py-2 rounded-md hover:bg-white/10" href="#prices">Prices</a>
          <a className="px-3 py-2 rounded-md hover:bg-white/10" href="#calendar">Calendar</a>
          <a className="px-3 py-2 rounded-md hover:bg-white/10" href="#weather">Weather</a>
          <a className="px-3 py-2 rounded-md hover:bg-white/10" href="#todo">Todo</a>
          <span className="mx-2 opacity-30">|</span>
          {!user && (
            <>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/login">Log in</NavLink>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/register">Sign up</NavLink>
            </>
          )}
          {user && (
            <>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/profile">Profile</NavLink>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/settings">Settings</NavLink>
              <button onClick={logout} className="px-3 py-2 rounded-md hover:bg-white/10">Sign out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function BatterySection() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [level, setLevel] = useState<number | null>(null)
  const [charging, setCharging] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    // navigator.getBattery is not supported everywhere
    // Use dynamic access to avoid TS lib dom issues on older targets
    const navAny = navigator as unknown as { getBattery?: () => Promise<any> }
    if (!navAny.getBattery) {
      setSupported(false)
      return
    }
    navAny
      .getBattery!()
      .then((battery) => {
        if (!isMounted) return
        setSupported(true)
        const update = () => {
          setLevel(Math.round(battery.level * 100))
          setCharging(!!battery.charging)
        }
        update()
        battery.addEventListener('levelchange', update)
        battery.addEventListener('chargingchange', update)
      })
      .catch(() => setSupported(false))
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="battery" className="py-14 border-b border-white/5">
      <div className="max-w-[1100px] mx-auto px-5">
        <h2 className="text-2xl mb-4">Battery</h2>
        {supported === false && (
          <p className="text-white/60">Battery API not supported on this device.</p>
        )}
        {supported && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid gap-3">
            <div className="relative h-[22px] rounded-full bg-white/10 overflow-hidden" aria-label="battery-level">
              <div
                className={`${(level ?? 0) > 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : (level ?? 0) > 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-500 to-rose-600'} h-full transition-[width] duration-300`}
                style={{ width: `${level ?? 0}%` }}
              />
            </div>
            <div className="flex items-center gap-3">
              <span>{level ?? 0}%</span>
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${charging ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/10 border-white/20'}`}>{charging ? 'Charging' : 'Not charging'}</span>
            </div>
          </div>
        )}
        {supported === null && <p className="text-white/60">Detecting battery status…</p>}
      </div>
    </section>
  )
}

function PricesSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateLabel, setDateLabel] = useState('')
  const [rows, setRows] = useState<Array<{
    key: string
    time: string
    SE1?: number
    SE2?: number
    SE3?: number
    SE4?: number
  }>>([])
  const [summary, setSummary] = useState<null | Record<string, any>>(null)
  // Keep for potential future use (e.g., charts); not used directly now
  // const [zonesData, setZonesData] = useState<any | null>(null)
  const [selectedZone, setSelectedZone] = useState<'SE1' | 'SE2' | 'SE3' | 'SE4'>('SE3')
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const today = new Date()
        const { fetchTodaySwedenPrices, bestWindows, bestSellHour, formatDateStockholm, formatTimeStockholm } = await import('./modules/prices/elspot')
        const data = await fetchTodaySwedenPrices(today)
        setDateLabel(formatDateStockholm(today))
        // Build time keys from SE3 (fallback any zone)
        const anyZone = data.SE3?.length ? 'SE3' : (Object.keys(data)[0] as any)
        const times = (data as any)[anyZone].map((e: any) => ({ key: e.start.toISOString(), start: e.start }))
        const map: Record<string, any> = {}
        for (const t of times) {
          map[t.key] = { key: t.key, time: `${formatTimeStockholm(t.start)}` }
        }
        ;(['SE1','SE2','SE3','SE4'] as const).forEach((z) => {
          const arr = (data as any)[z] as any[]
          if (!arr) return
          for (const e of arr) {
            const k = e.start.toISOString()
            if (!map[k]) map[k] = { key: k, time: `${formatTimeStockholm(e.start)}` }
            map[k][z] = e.sekPerKwh
          }
        })
        const rowArr = Object.values(map).sort((a: any, b: any) => a.key.localeCompare(b.key))
        setRows(rowArr)

        // Summary windows per zone
        const sum: any = {}
        ;(['SE1','SE2','SE3','SE4'] as const).forEach((z) => {
          const arr = (data as any)[z] as any[]
          if (!arr || !arr.length) return
          sum[z] = {
            w2: bestWindows(arr, 2),
            w4: bestWindows(arr, 4),
            sell1: bestSellHour(arr),
          }
        })
        setSummary(sum)
      } catch (e: any) {
        setError(e?.message || 'Failed to load spot prices')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <section id="prices" className="py-14 border-b border-white/5">
      <div className="max-w-[1100px] mx-auto px-5">
        <h2 className="text-2xl mb-4">Electricity Spot Prices (SE)</h2>
        <div className="text-white/70 text-sm mb-4">Date (Stockholm): {dateLabel}</div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-white/60">Zone:</span>
          {(['SE1','SE2','SE3','SE4'] as const).map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`text-sm rounded-md px-3 py-1 border ${selectedZone === z ? 'bg-indigo-600/30 border-indigo-400/50' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
            >
              {z}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => setShowTable((v) => !v)}
              className="text-sm rounded-md px-3 py-1 border bg-white/5 border-white/20 hover:bg-white/10"
            >
              {showTable ? 'Hide hourly prices' : 'Show hourly prices'}
            </button>
          </div>
        </div>
        {loading && <div className="text-white/70">Loading prices…</div>}
        {error && <div className="text-rose-400">{error}</div>}
        {!loading && !error && summary && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {(['SE1','SE2','SE3','SE4'] as const).map((z) => (
              <div key={z} className={`rounded-xl p-4 ${selectedZone === z ? 'bg-indigo-500/10 border border-indigo-400/40' : 'bg-white/5 border border-white/10'}`}>
                <div className="font-semibold mb-2">{z}</div>
                {summary[z] ? (
                  <div className="grid gap-1 text-sm">
                    <div className="text-white/70">Cheapest 2h</div>
                    <div>
                      {summary[z].w2 ? `${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w2.start)}–${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w2.end)} · ${summary[z].w2.average.toFixed(2)} SEK/kWh` : '—'}
                    </div>
                    <div className="text-white/70 mt-1">Cheapest 4h</div>
                    <div>
                      {summary[z].w4 ? `${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w4.start)}–${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w4.end)} · ${summary[z].w4.average.toFixed(2)} SEK/kWh` : '—'}
                    </div>
                    <div className="text-white/70 mt-1">Best 1h sell</div>
                    <div>
                      {summary[z].sell1 ? `${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].sell1.start)}–${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].sell1.end)} · ${summary[z].sell1.price.toFixed(2)} SEK/kWh` : '—'}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/60 text-sm">No data</div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && rows.length > 0 && showTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/70">
                <tr>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">SE1</th>
                  <th className="py-2 pr-3">SE2</th>
                  <th className="py-2 pr-3">SE3</th>
                  <th className="py-2 pr-3">SE4</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  // Row highlighting based on selected zone windows
                  const z = selectedZone
                  const s = summary?.[z]
                  const t = new Date(r.key)
                  const in2 = s?.w2 && t >= s.w2.start && t < s.w2.end
                  const in4 = s?.w4 && t >= s.w4.start && t < s.w4.end
                  const sell = s?.sell1 && t >= s.sell1.start && t < s.sell1.end
                  const rowClass = in4 ? 'bg-emerald-500/10' : in2 ? 'bg-teal-500/10' : sell ? 'bg-rose-500/10' : ''
                  return (
                  <tr key={r.key} className={`border-t border-white/10 ${rowClass}`}>
                    <td className="py-2 pr-3 text-white/90 tabular-nums">{r.time}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE1' ? 'font-semibold' : ''}`}>{r.SE1?.toFixed(2) ?? '—'}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE2' ? 'font-semibold' : ''}`}>{r.SE2?.toFixed(2) ?? '—'}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE3' ? 'font-semibold' : ''}`}>{r.SE3?.toFixed(2) ?? '—'}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE4' ? 'font-semibold' : ''}`}>{r.SE4?.toFixed(2) ?? '—'}</td>
                  </tr>
                )})}
              </tbody>
            </table>
            <div className="text-xs text-white/50 mt-2">Values in SEK/kWh. Times shown in Europe/Stockholm.</div>
          </div>
        )}
      </div>
    </section>
  )
}

function CalendarSection() {
  const today = useMemo(() => new Date(), [])
  const year = today.getFullYear()
  const month = today.getMonth()
  const [viewYear, setViewYear] = useState(year)
  const [viewMonth, setViewMonth] = useState(month)

  // Local storage for events keyed by YYYY-MM-DD
  type DayEvent = { id: string; time: string; text: string }
  const STORAGE_KEY = 'calendar.events.v1'
  const [events, setEvents] = useState<Record<string, DayEvent[]>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Record<string, DayEvent[]>) : {}
    } catch {
      return {}
    }
  })
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch {}
  }, [events])

  const [selected, setSelected] = useState<Date | null>(null)
  const [note, setNote] = useState('')
  const [time, setTime] = useState('')

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startDay = firstOfMonth.getDay() // 0-6, Sun-Sat
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  function keyFor(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Swedish holidays for the viewed year
  const [holidays, setHolidays] = useState<Record<string, { localName: string; name: string }[]>>({})
  useEffect(() => {
    let cancelled = false
    fetchSwedishHolidays(viewYear)
      .then((data) => { if (!cancelled) setHolidays(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [viewYear])

  function addEvent(date: Date) {
    const k = keyFor(date)
    const trimmed = note.trim()
    if (!trimmed || !time) return
    const ev: DayEvent = { id: crypto.randomUUID(), time, text: trimmed }
    setEvents((prev) => {
      const arr = [...(prev[k] ?? []), ev]
      // sort by time ascending
      arr.sort((a, b) => a.time.localeCompare(b.time))
      return { ...prev, [k]: arr }
    })
    setNote('')
    setTime('')
  }

  function removeEvent(date: Date, id: string) {
    const k = keyFor(date)
    setEvents((prev) => {
      const arr = (prev[k] ?? []).filter((e) => e.id !== id)
      const next = { ...prev }
      if (arr.length) next[k] = arr
      else delete next[k]
      return next
    })
  }

  const cells: Array<{
    label: string
    isToday: boolean
    isCurrentMonth: boolean
    date?: Date
    hasEvents?: boolean
    isHoliday?: boolean
    holidayNames?: string[]
  }> = []
  for (let i = 0; i < startDay; i++) cells.push({ label: '', isToday: false, isCurrentMonth: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d)
    const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
    const k = keyFor(date)
    const hol = holidays[k]
    cells.push({
      label: String(d),
      isToday,
      isCurrentMonth: true,
      date,
      hasEvents: !!events[k]?.length,
      isHoliday: !!hol?.length,
      holidayNames: hol?.map((h) => h.localName || h.name),
    })
  }
  while (cells.length % 7 !== 0) cells.push({ label: '', isToday: false, isCurrentMonth: false })

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <section id="calendar" className="py-14 border-b border-white/5">
      <div className="max-w-[1100px] mx-auto px-5">
        <h2 className="text-2xl mb-4">Calendar</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-visible relative">
          <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous month"
                className="rounded-md border border-white/20 bg-white/5 px-2 py-1 hover:bg-white/10"
                onClick={() => {
                  setSelected(null)
                  setViewMonth((m) => {
                    if (m === 0) { setViewYear((y) => y - 1); return 11 }
                    return m - 1
                  })
                }}
              >
                ◀
              </button>
              <button
                aria-label="Next month"
                className="rounded-md border border-white/20 bg-white/5 px-2 py-1 hover:bg-white/10"
                onClick={() => {
                  setSelected(null)
                  setViewMonth((m) => {
                    if (m === 11) { setViewYear((y) => y + 1); return 0 }
                    return m + 1
                  })
                }}
              >
                ▶
              </button>
            </div>
            <div className="font-bold">
              {new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: 'long' })} {viewYear}
            </div>
            <div className="w-[72px]" />
          </div>
          <div className="grid grid-cols-7 bg-white/5 border-b border-white/10">
            {weekdays.map((w) => (
              <div key={w} className="px-2 py-3 text-xs font-semibold text-white/70 border-r border-white/5">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, i) => (
              <button
                key={i}
                disabled={!c.isCurrentMonth}
                onClick={() => c.date && setSelected(c.date)}
                className={`group relative text-left px-2 py-3 min-h-12 border-r border-b border-white/5 ${c.isCurrentMonth ? 'hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50' : 'text-white/40'} ${c.isToday ? 'outline outline-2 outline-indigo-500/80 -outline-offset-2 rounded-md' : ''}`}
              >
                <span className={`${c.isHoliday ? 'text-rose-300 font-semibold' : ''}`}>{c.label}</span>
                {(c.hasEvents || c.isHoliday) && (
                  <>
                    <span className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {(c.date || c.isHoliday) && (
                      <div className="pointer-events-none absolute z-50 left-2 top-full mt-1 hidden group-hover:block">
                        <div className="rounded-md border border-white/10 bg-slate-900/95 backdrop-blur p-2 shadow-lg min-w-[200px]">
                          {c.date && (events[keyFor(c.date)] ?? []).length > 0 && (
                            <>
                              <div className="text-xs text-white/60 mb-1">Notes</div>
                              <ul className="text-xs text-white/90 mb-1">
                                {(events[keyFor(c.date)] ?? []).map((ev) => (
                                  <li key={ev.id} className="whitespace-nowrap">{ev.time} - {ev.text}</li>
                                ))}
                              </ul>
                            </>
                          )}
                          {c.isHoliday && c.holidayNames && (
                            <>
                              <div className="text-xs text-white/60 mt-1 mb-1">Holidays</div>
                              <ul className="text-xs text-rose-300">
                                {c.holidayNames.map((n, idx) => (
                                  <li key={idx} className="whitespace-nowrap">{n}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {c.isHoliday && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </button>
            ))}
          </div>

          {selected && (
            <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">
                    {selected.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <button className="text-slate-300 hover:text-white" onClick={() => setSelected(null)}>Close</button>
                </div>
                <form
                  className="flex flex-col sm:flex-row gap-2 mb-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    addEvent(selected)
                  }}
                >
                  <input
                    type="time"
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 w-full sm:w-40"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Add note…"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                  />
                  <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="submit">Add</button>
                </form>
                {selected && holidays[keyFor(selected)] && (
                  <div className="mb-2 text-sm text-rose-300">
                    {holidays[keyFor(selected)]!.map((h, i) => (
                      <div key={i}>Helgdag: {h.localName || h.name}</div>
                    ))}
                  </div>
                )}
                <ul className="grid gap-2">
                  {(events[keyFor(selected)] ?? []).length === 0 && (
                    <li className="text-white/60">No notes for this day.</li>
                  )}
                  {(events[keyFor(selected)] ?? []).map((ev) => (
                    <li key={ev.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/70 w-16 tabular-nums">{ev.time}</span>
                        <span>{ev.text}</span>
                      </div>
                      <button className="text-slate-300 hover:text-white" onClick={() => removeEvent(selected, ev.id)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

import { geocodeCity, reverseGeocode, getCurrentWeather, type CurrentWeather } from './modules/weather/openmeteo'

function WeatherSection() {
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
        localStorage.setItem(
          LAST_KEY,
          JSON.stringify({ name, lat, lon, ts: Date.now() })
        )
      } catch {}
      // Always attempt reverse-geocode to refine the name
      try {
        const place = await reverseGeocode(lat, lon)
        if (place && place.displayName && place.displayName !== name) {
          setLocation({ name: place.displayName, lat, lon })
          try {
            localStorage.setItem(
              LAST_KEY,
              JSON.stringify({ name: place.displayName, lat, lon, ts: Date.now() })
            )
          } catch {}
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
        // Fire and forget; loadByCoords will set loading state and improve the name
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
    <section id="weather" className="py-14 border-b border-white/5">
      <div className="max-w-[1100px] mx-auto px-5">
        <h2 className="text-2xl mb-4">Weather</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid gap-4">
          <form onSubmit={onSearch} className="flex gap-2">
            <input
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2"
              placeholder="Search city (e.g. Berlin)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="submit">
              Search
            </button>
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="button" onClick={useMyLocation}>
              Use my location
            </button>
          </form>

          {loading && <div className="text-white/70">Loading weather…</div>}
          {error && <div className="text-rose-400">{error}</div>}

          {weather && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-sm text-white/60">Location</div>
                <div className="text-lg font-semibold">{location?.name}</div>
                <div className="text-white/60 text-sm">{location?.lat.toFixed(3)}, {location?.lon.toFixed(3)}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-sm text-white/60">Conditions</div>
                <div className="text-2xl font-semibold">{Math.round(weather.temperatureC)}°C</div>
                <div className="text-white/70">Feels like {Math.round(weather.apparentC)}°C · {weather.weatherDescription}</div>
                <div className="text-white/60 text-sm">
                  Wind {Math.round(weather.windSpeedKmh)} km/h · {Math.round(weather.windDirectionDeg)}° · {weather.isDay ? 'Day' : 'Night'}
                </div>
                {lastUpdated && (
                  <div className="text-white/50 text-xs mt-2">Last updated {new Date(lastUpdated).toLocaleTimeString()}</div>
                )}
              </div>
            </div>
          )}

          {!loading && !weather && !error && (
            <p className="text-white/60">
              Search a city or use your location to see live conditions powered by Open‑Meteo.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function TodoSection() {
  const [items, setItems] = useState<TodoItem[]>([])
  const [text, setText] = useState('')

  const add = () => {
    const value = text.trim()
    if (!value) return
    setItems((prev) => [
      { id: crypto.randomUUID(), text: value, done: false },
      ...prev,
    ])
    setText('')
  }

  const toggle = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)))
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  return (
    <section id="todo" className="py-14 border-b border-white/5">
      <div className="max-w-[1100px] mx-auto px-5">
        <h2 className="text-2xl mb-4">Todo</h2>
        <div className="flex gap-3 mb-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a task..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
            }}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button onClick={add} className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20">Add</button>
        </div>
        <ul className="grid gap-2 list-none p-0 m-0">
          {items.length === 0 && <li className="text-white/60">No tasks yet.</li>}
          {items.map((it) => (
            <li key={it.id} className={`flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 ${it.done ? 'opacity-70' : ''}`}>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={it.done} onChange={() => toggle(it.id)} />
                <span className={`${it.done ? 'line-through' : ''}`}>{it.text}</span>
              </label>
              <button className="text-slate-300 hover:text-white" onClick={() => remove(it.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="py-6 bg-slate-900/80 border-t border-white/10">
      <div className="max-w-[1100px] mx-auto px-5 flex items-center justify-between">
        <span>© {year} myHome</span>
        <a href="#top" className="">Back to top</a>
      </div>
    </footer>
  )
}

function HomePage() {
  return (
    <main>
      <BatterySection />
      <PricesSection />
      <CalendarSection />
      <WeatherSection />
      <TodoSection />
    </main>
  )
}

function App() {
  return (
    <div id="top">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  )
}

export default App
