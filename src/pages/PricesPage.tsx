import { useEffect, useState } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'

export default function PricesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateLabel, setDateLabel] = useState('')
  const [rows, setRows] = useState<Array<{ key: string; time: string; SE1?: number; SE2?: number; SE3?: number; SE4?: number }>>([])
  const [summary, setSummary] = useState<null | Record<string, any>>(null)
  const [selectedZone, setSelectedZone] = useState<'SE1' | 'SE2' | 'SE3' | 'SE4'>('SE3')
  const [showTable, setShowTable] = useState(false)
  const [includeVAT, setIncludeVAT] = useState(false)

  const ZONE_LABEL: Record<'SE1'|'SE2'|'SE3'|'SE4', string> = {
    SE1: 'Luleå – Norra Sverige',
    SE2: 'Sundsvall – Norra Mellansverige',
    SE3: 'Stockholm – Mellersta Sverige',
    SE4: 'Malmö – Södra Sverige',
  }

  useEffect(() => {
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const today = new Date()
        const { fetchTodaySwedenPrices, bestWindows, bestSellHour, formatDateStockholm, formatTimeStockholm } = await import('../modules/prices/elspot')
        const data = await fetchTodaySwedenPrices(today)
        setDateLabel(formatDateStockholm(today))
        const anyZone = (data as any).SE3?.length ? 'SE3' : (Object.keys(data)[0] as any)
        const times = (data as any)[anyZone].map((e: any) => ({ key: e.start.toISOString(), start: e.start }))
        const map: Record<string, any> = {}
        for (const t of times) map[t.key] = { key: t.key, time: `${formatTimeStockholm(t.start)}` }
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

        const sum: any = {}
        ;(['SE1','SE2','SE3','SE4'] as const).forEach((z) => {
          const arr = (data as any)[z] as any[]
          if (!arr || !arr.length) return
          sum[z] = { w2: bestWindows(arr, 2), w4: bestWindows(arr, 4), sell1: bestSellHour(arr) }
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
    <Page id="prices">
      <h2 className="text-2xl mb-4">Elspotpriser (Sverige)</h2>
      <div className="text-white/70 text-sm mb-4">Datum (Stockholm): {dateLabel}</div>
      <div className="mb-3 grid gap-2 sm:flex sm:items-center sm:flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-white/60">Elområde:</span>
          {(['SE1','SE2','SE3','SE4'] as const).map((z) => (
            <button key={z} onClick={() => setSelectedZone(z)} title={`${z}: ${ZONE_LABEL[z]}`}
              className={`text-sm rounded-md px-3 py-1 border ${selectedZone === z ? 'bg-indigo-600/30 border-indigo-400/50' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}>
              {z}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:ml-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-emerald-500" checked={includeVAT} onChange={(e) => setIncludeVAT(e.target.checked)} />
            Inkl. moms 25 %
          </label>
          <button onClick={() => setShowTable((v) => !v)} className="text-sm rounded-md px-3 py-1 border bg-white/5 border-white/20 hover:bg-white/10">
            {showTable ? 'Dölj timpriser' : 'Visa timpriser'}
          </button>
        </div>
      </div>
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="h-5 w-16 bg-white/10 rounded mb-2"></div>
              <div className="h-3 w-40 bg-white/10 rounded mb-1"></div>
              <div className="h-3 w-48 bg-white/10 rounded mb-1"></div>
              <div className="h-3 w-36 bg-white/10 rounded"></div>
            </Card>
          ))}
        </div>
      )}
      {error && <div className="text-rose-400">{error}</div>}
      {!loading && !error && summary && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {(['SE1','SE2','SE3','SE4'] as const).map((z) => (
            <Card key={z} className={`${selectedZone === z ? 'bg-indigo-500/10 border border-indigo-400/40' : ''} p-4`}>
              <div className="font-semibold">{z}</div>
              <div className="text-xs text-white/60 mb-2">{ZONE_LABEL[z]}</div>
              <div className="grid gap-1 text-sm">
                <div className="text-white/70">Billigaste 2 h</div>
                <div>{summary[z] ? `${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w2.start)}–${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w2.end)} · ${(summary[z].w2.average*(includeVAT?1.25:1)).toFixed(2)} SEK/kWh` : '-'}</div>
                <div className="text-white/70 mt-1">Billigaste 4 h</div>
                <div>{summary[z] ? `${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w4.start)}–${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].w4.end)} · ${(summary[z].w4.average*(includeVAT?1.25:1)).toFixed(2)} SEK/kWh` : '-'}</div>
                <div className="text-white/70 mt-1">Bästa 1 h försäljning</div>
                <div>{summary[z] ? `${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].sell1.start)}–${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' }).format(summary[z].sell1.end)} · ${(summary[z].sell1.price*(includeVAT?1.25:1)).toFixed(2)} SEK/kWh` : '-'}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && rows.length > 0 && showTable && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/70">
              <tr>
                <th className="py-2 pr-3">Tid</th>
                {(['SE1','SE2','SE3','SE4'] as const).map((z) => (
                  <th key={z} className="py-2 pr-3">
                    <div>{z}</div>
                    <div className="text-xs text-white/50">{ZONE_LABEL[z]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const z = selectedZone
                const s = summary?.[z]
                const t = new Date(r.key)
                const in2 = s?.w2 && t >= s.w2.start && t < s.w2.end
                const in4 = s?.w4 && t >= s.w4.start && t < s.w4.end
                const sell = s?.sell1 && t >= s.sell1.start && t < s.sell1.end
                const rowClass = in4 ? 'bg-emerald-500/10' : in2 ? 'bg-teal-500/10' : sell ? 'bg-rose-500/10' : ''
                const vat = includeVAT ? 1.25 : 1
                return (
                  <tr key={r.key} className={`border-t border-white/10 ${rowClass}`}>
                    <td className="py-2 pr-3 text-white/90 tabular-nums">{r.time}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE1' ? 'font-semibold' : ''}`}>{r.SE1!=null ? (r.SE1*vat).toFixed(2) : '-'}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE2' ? 'font-semibold' : ''}`}>{r.SE2!=null ? (r.SE2*vat).toFixed(2) : '-'}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE3' ? 'font-semibold' : ''}`}>{r.SE3!=null ? (r.SE3*vat).toFixed(2) : '-'}</td>
                    <td className={`py-2 pr-3 tabular-nums ${selectedZone==='SE4' ? 'font-semibold' : ''}`}>{r.SE4!=null ? (r.SE4*vat).toFixed(2) : '-'}</td>
                  </tr>
                )})}
            </tbody>
          </table>
          <div className="text-xs text-white/50 mt-2">Värden i SEK/kWh. Tider visas i Europe/Stockholm.</div>
        </div>
      )}
    </Page>
  )
}
