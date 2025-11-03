import { NavLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="py-16">
      <div className="max-w-[1100px] mx-auto px-5 grid gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Sidan kunde inte hittas</h1>
          <p className="text-white/70 mb-4">Sidan du letar efter finns inte. Prova någon av dessa:</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <NavLink className="px-3 py-2 rounded-md bg-white/5 border border-white/20 hover:bg-white/10" to="/">Hem</NavLink>
            <NavLink className="px-3 py-2 rounded-md bg-white/5 border border-white/20 hover:bg-white/10" to="/prices">Priser</NavLink>
            <NavLink className="px-3 py-2 rounded-md bg-white/5 border border-white/20 hover:bg-white/10" to="/calendar">Kalender</NavLink>
            <NavLink className="px-3 py-2 rounded-md bg-white/5 border border-white/20 hover:bg-white/10" to="/weather">Väder</NavLink>
            <NavLink className="px-3 py-2 rounded-md bg-white/5 border border-white/20 hover:bg-white/10" to="/todo">Att göra</NavLink>
          </div>
        </div>
      </div>
    </main>
  )
}
