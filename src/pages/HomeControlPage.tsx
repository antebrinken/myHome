import { useState } from 'react'
import Page from '../components/Page'
import Card from '../components/Card'

type RoomKey = 'Kök' | 'Vardagsrum' | 'Sovrum'

function RoomCard({ name }: { name: RoomKey }) {
  const [lamps, setLamps] = useState([false, false, false, false])
  const allOff = lamps.every((lamp) => !lamp)

  function setAll(on: boolean) {
    setLamps([on, on, on, on])
  }
  function toggleOne(idx: number) {
    setLamps((prev) => prev.map((v, i) => (i === idx ? !v : v)))
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{name}</h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setAll(true)} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">Tänd alla lampor</button>
        <button onClick={() => setAll(false)} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">Släck alla lampor</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {lamps.map((on, i) => (
          <button
            key={i}
            onClick={() => toggleOne(i)}
            className={`rounded-lg border px-3 py-3 text-sm text-left transition-colors ${on
              ? 'bg-indigo-600/30 border-indigo-400/50'
              : allOff
                ? 'bg-red-600/30 border-red-400/50'
                : 'bg-white/5 border-white/20 hover:bg-white/10'
            }`}
            aria-pressed={on}
          >
            <div className="font-medium">Lampa {i + 1}</div>
            <div className="text-xs text-white/70">{on ? 'På' : 'Av'}</div>
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs text-white/50">(Kommer att kopplas till lampor i framtiden)</div>
    </Card>
  )
}

export default function HomeControlPage() {
  return (
    <Page id="home">
      <h2 className="text-2xl mb-4"></h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RoomCard name="Kök" />
        <RoomCard name="Vardagsrum" />
        <RoomCard name="Sovrum" />
      </div>
    </Page>
  )
}
