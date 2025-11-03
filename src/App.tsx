 
import { NavLink, Route, Routes } from 'react-router-dom'
import { Battery, Calendar as CalendarIcon, Cloud, ListTodo, Bolt, Mail, Phone } from 'lucide-react'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import NotFoundPage from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './modules/auth/AuthContext'
// Pages extracted
import BatteryPage from './pages/BatteryPage'
import PricesPage from './pages/PricesPage'
import CalendarPage from './pages/CalendarPage'
import WeatherPage from './pages/WeatherPage'
import TodoPage from './pages/TodoPage'

 

function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-[1100px] mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to="/" className="font-extrabold tracking-tight flex items-center gap-2">
          <Bolt className="w-5 h-5" /> myHome
        </NavLink>
        <nav className="flex gap-3 text-sm items-center">
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/battery"><Battery className="w-4 h-4" /> Batteri</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/prices"><Bolt className="w-4 h-4" /> Priser</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/calendar"><CalendarIcon className="w-4 h-4" /> Kalender</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/weather"><Cloud className="w-4 h-4" /> Väder</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/todo"><ListTodo className="w-4 h-4" /> Att göra</NavLink>
          <span className="mx-2 opacity-30">|</span>
          {!user && (
            <>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/login">Logga in</NavLink>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/register">Registrera</NavLink>
            </>
          )}
          {user && (
            <>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/profile">Profil</NavLink>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/settings">Inställningar</NavLink>
              <button onClick={logout} className="px-3 py-2 rounded-md hover:bg-white/10">Logga ut</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}







 





function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="h-16 sm:h-20 bg-slate-900/80 border-t border-white/10">
      <div className="max-w-[1100px] mx-auto px-5 h-full flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm sm:text-base">
          <span className="font-medium">&copy; {year} Philip Antebrink</span>
          <a className="hover:underline inline-flex items-center gap-2" href="mailto:antebrinken@live.se"><Mail className="w-4 h-4" /> antebrinken@live.se</a>
          <a className="hover:underline inline-flex items-center gap-2" href="tel:+46734177109"><Phone className="w-4 h-4" /> 0734177109</a>
        </div>
        <a href="#top" className="text-sm sm:text-base hover:underline">Till toppen</a>
      </div>
    </footer>
  )
}

function HomePage() {
  return (
    <main className="py-16">
      <div className="max-w-[1100px] mx-auto px-5 grid gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Välkommen till myHome</h1>
          <p className="text-white/70 max-w-2xl">En ren översikt för din dag: batteristatus, svenska elpriser, kalenderanteckningar med helgdagar, aktuellt väder och en enkel att‑göra‑lista.</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <NavLink to="/battery" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="font-semibold mb-1 flex items-center gap-2"><Battery className="w-4 h-4" /> Battery</div>
            <div className="text-white/70 text-sm">Check device battery status.</div>
          </NavLink>
          <NavLink to="/prices" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="font-semibold mb-1 flex items-center gap-2"><Bolt className="w-4 h-4" /> Prices</div>
            <div className="text-white/70 text-sm">SE1–SE4 spot prices and best windows.</div>
          </NavLink>
          <NavLink to="/calendar" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="font-semibold mb-1 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Calendar</div>
            <div className="text-white/70 text-sm">Notes per day + Swedish holidays.</div>
          </NavLink>
          <NavLink to="/weather" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="font-semibold mb-1 flex items-center gap-2"><Cloud className="w-4 h-4" /> Weather</div>
            <div className="text-white/70 text-sm">City search and my location.</div>
          </NavLink>
          <NavLink to="/todo" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10">
            <div className="font-semibold mb-1 flex items-center gap-2"><ListTodo className="w-4 h-4" /> Todo</div>
            <div className="text-white/70 text-sm">Simple tasks for your day.</div>
          </NavLink>
        </div>
      </div>
    </main>
  )
}

 

function App() {
  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/battery" element={<BatteryPage />} />
          <Route path="/prices" element={<PricesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App



