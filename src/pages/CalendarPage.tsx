import { useEffect, useMemo, useState } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'
import Modal from '../components/Modal'
import { fetchSwedishHolidays } from '../modules/calendar/holidays'

type DayEvent = { id: string; time: string; text: string }

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const STORAGE_KEY = 'calendar.events.v1'
  const [events, setEvents] = useState<Record<string, DayEvent[]>>(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {} } catch { return {} }
  })
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch {} }, [events])

  const [selected, setSelected] = useState<Date | null>(null)
  const [note, setNote] = useState('')
  const [time, setTime] = useState('')

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startDay = firstOfMonth.getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  function keyFor(d: Date) {
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const [holidays, setHolidays] = useState<Record<string, { localName: string; name: string }[]>>({})
  useEffect(() => { let cancelled = false; fetchSwedishHolidays(viewYear).then((data) => { if (!cancelled) setHolidays(data) }).catch(() => {}); return () => { cancelled = true } }, [viewYear])

  function addEvent(date: Date) {
    const k = keyFor(date)
    const trimmed = note.trim(); if (!trimmed || !time) return
    const ev: DayEvent = { id: crypto.randomUUID(), time, text: trimmed }
    setEvents((prev) => { const arr = [...(prev[k] ?? []), ev]; arr.sort((a, b) => a.time.localeCompare(b.time)); return { ...prev, [k]: arr } })
    setNote(''); setTime('')
  }
  function removeEvent(date: Date, id: string) {
    const k = keyFor(date)
    setEvents((prev) => { const arr = (prev[k] ?? []).filter((e) => e.id !== id); const next = { ...prev }; if (arr.length) next[k] = arr; else delete next[k]; return next })
  }

  const cells: Array<{ label: string; isToday: boolean; isCurrentMonth: boolean; date?: Date; hasEvents?: boolean; isHoliday?: boolean; holidayNames?: string[] }>=[]
  for (let i = 0; i < startDay; i++) cells.push({ label: '', isToday: false, isCurrentMonth: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d)
    const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
    const k = keyFor(date); const hol = holidays[k]
    cells.push({ label: String(d), isToday, isCurrentMonth: true, date, hasEvents: !!events[k]?.length, isHoliday: !!hol?.length, holidayNames: hol?.map(h => h.localName || h.name) })
  }
  while (cells.length % 7 !== 0) cells.push({ label: '', isToday: false, isCurrentMonth: false })

  const weekdays = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']

  return (
    <Page id="calendar">
      <h2 className="text-2xl mb-4">Kalender</h2>
      <Card className="overflow-visible">
        <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous month"
              className="rounded-md border border-white/20 bg-white/5 px-2 py-1 hover:bg-white/10"
              onClick={() => {
                setSelected(null)
                const m = viewMonth
                const y = viewYear
                if (m === 0) {
                  setViewMonth(11)
                  setViewYear(y - 1)
                } else {
                  setViewMonth(m - 1)
                }
              }}
            >
              ◀
            </button>
            <button
              aria-label="Next month"
              className="rounded-md border border-white/20 bg-white/5 px-2 py-1 hover:bg-white/10"
              onClick={() => {
                setSelected(null)
                const m = viewMonth
                const y = viewYear
                if (m === 11) {
                  setViewMonth(0)
                  setViewYear(y + 1)
                } else {
                  setViewMonth(m + 1)
                }
              }}
            >
              ▶
            </button>
          </div>
          <div className="font-bold">
            {(() => {
              const monthName = new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: 'long' })
              return monthName.charAt(0).toUpperCase() + monthName.slice(1)
            })()} {viewYear}
          </div>
          <div className="w-[72px]" />
        </div>
        <div className="grid grid-cols-7 bg-white/5 border-b border-white/10">
          {weekdays.map((w) => (<div key={w} className="px-2 py-3 text-xs font-semibold text-white/70 border-r border-white/5">{w}</div>))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => (
            <button key={i} disabled={!c.isCurrentMonth} onClick={() => c.date && setSelected(c.date)} className={`group relative text-left px-2 py-3 min-h-12 border-r border-b border-white/5 ${c.isCurrentMonth ? 'hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50' : 'text-white/40'} ${c.isToday ? 'outline outline-2 outline-indigo-500/80 -outline-offset-2 rounded-md' : ''}`}>
              <span className={`${c.isHoliday ? 'text-rose-300 font-semibold' : ''}`}>{c.label}</span>
              {(c.hasEvents || c.isHoliday) && (
                <>
                  <span className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {(c.date || c.isHoliday) && (
                    <div className="pointer-events-none absolute z-50 left-2 top-full mt-1 hidden group-hover:block">
                      <div className="rounded-md border border-white/10 bg-slate-900/95 backdrop-blur p-2 shadow-lg min-w-[200px]">
                        {c.date && (events[keyFor(c.date)] ?? []).length > 0 && (
                          <>
                            <div className="text-xs text-white/60 mb-1">Anteckningar</div>
                            <ul className="text-xs text-white/90 mb-1">{(events[keyFor(c.date)] ?? []).map((ev) => (<li key={ev.id} className="whitespace-nowrap">{ev.time} - {ev.text}</li>))}</ul>
                          </>
                        )}
                        {c.isHoliday && c.holidayNames && (
                          <>
                            <div className="text-xs text-white/60 mt-1 mb-1">Helgdagar</div>
                            <ul className="text-xs text-rose-300">{c.holidayNames.map((n, idx) => (<li key={idx} className="whitespace-nowrap">{n}</li>))}</ul>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              {c.isHoliday && (<span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-400" />)}
            </button>
          ))}
        </div>
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? (() => { const t = selected.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }); return t.charAt(0).toUpperCase() + t.slice(1) })() : undefined}
      >
        <form className="flex flex-col sm:flex-row gap-2 mb-4" onSubmit={(e) => { e.preventDefault(); if (selected) addEvent(selected) }}>
          <input type="time" className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 w-full sm:w-40" value={time} onChange={(e) => setTime(e.target.value)} required />
          <input type="text" placeholder="Lägg till anteckning…" className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2" value={note} onChange={(e) => setNote(e.target.value)} required />
          <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="submit">Lägg till</button>
        </form>
        {selected && holidays[keyFor(selected)] && (
          <div className="mb-2 text-sm text-rose-300">{holidays[keyFor(selected)]!.map((h, i) => (<div key={i}>Helgdag: {h.localName || h.name}</div>))}</div>
        )}
        <ul className="grid gap-2">
          {selected && (events[keyFor(selected)] ?? []).length === 0 && (<li className="text-white/60">Inga anteckningar för denna dag.</li>)}
          {selected && (events[keyFor(selected)] ?? []).map((ev) => (
            <li key={ev.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <div className="flex items-center gap-3"><span className="text-sm text-white/70 w-16 tabular-nums">{ev.time}</span><span>{ev.text}</span></div>
              <button className="text-slate-300 hover:text-white" onClick={() => selected && removeEvent(selected, ev.id)}>Ta bort</button>
            </li>
          ))}
        </ul>
      </Modal>
    </Page>
  )
}
