import { useEffect, useState } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'

export default function BatteryPage() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [level, setLevel] = useState<number | null>(null)
  const [charging, setCharging] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    const navAny = navigator as unknown as { getBattery?: () => Promise<any> }
    if (!navAny.getBattery) {
      setSupported(false)
      return
    }
    navAny.getBattery!()
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
    return () => { isMounted = false }
  }, [])

  return (
    <Page id="battery">
      <h2 className="text-2xl mb-4">Batteri</h2>
      {supported === false && (
        <p className="text-white/60">Batteri‑API stöds inte på den här enheten.</p>
      )}
      {supported && (
        <Card className="p-4 grid gap-3">
          <div className="relative h-[22px] rounded-full bg-white/10 overflow-hidden" aria-label="battery-level">
            <div
              className={`${(level ?? 0) > 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : (level ?? 0) > 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-500 to-rose-600'} h-full transition-[width] duration-300`}
              style={{ width: `${level ?? 0}%` }}
            />
          </div>
          <div className="flex items-center gap-3">
            <span>{level ?? 0}%</span>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${charging ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/10 border-white/20'}`}>{charging ? 'Laddar' : 'Laddar inte'}</span>
          </div>
        </Card>
      )}
      {supported === null && <p className="text-white/60">Upptäcker batteristatus.</p>}
    </Page>
  )
}
