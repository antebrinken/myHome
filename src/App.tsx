 
import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Battery, Calendar as CalendarIcon, Cloud, Home, Bolt, Mail, Phone, Menu, X, User as UserIcon } from 'lucide-react'
import Hero from '@/components/ui/neural-network-hero'
import NeuralNetworkBackground from '@/components/ui/neural-network-background'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import NotFoundPage from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './modules/auth/AuthContext'
import BatteryPage from './pages/BatteryPage'
import PricesPage from './pages/PricesPage'
import CalendarPage from './pages/CalendarPage'
import WeatherPage from './pages/WeatherPage'
// import TodoPage from './pages/TodoPage'
import HomeControlPage from './pages/HomeControlPage'

 

function Header() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-[1100px] mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to="/" className="font-extrabold tracking-tight flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Bolt className="w-5 h-5" /> myHome
        </NavLink>
        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-3 text-sm items-center">
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/battery"><Battery className="w-4 h-4" /> Batteri</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/prices"><Bolt className="w-4 h-4" /> Priser</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/calendar"><CalendarIcon className="w-4 h-4" /> Kalender</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/weather"><Cloud className="w-4 h-4" /> Väder</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/home"><Home className="w-4 h-4" /> Hemma</NavLink>
          <span className="mx-2 opacity-30">|</span>
          {!user && (
            <>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/login">Logga in</NavLink>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/register">Registrera</NavLink>
            </>
          )}
          {user && (
            <div className="relative flex items-center">
              <button
                className="group w-8 h-8 rounded-full border border-white/20 bg-gradient-to-br from-indigo-600/40 to-sky-500/30 flex items-center justify-center text-sm font-semibold text-white/90 hover:ring-2 hover:ring-white/20"
                aria-label="Öppna användarmeny"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                {user.avatarDataUrl ? (
                  <img src={user.avatarDataUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />
                )}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-white/10 bg-slate-900/95 backdrop-blur shadow-lg">
                  <div className="py-1">
                    <NavLink className="block px-3 py-2 rounded-md hover:bg-white/10" to="/profile" onClick={() => setUserMenuOpen(false)}>Profil</NavLink>
                    <NavLink className="block px-3 py-2 rounded-md hover:bg-white/10" to="/settings" onClick={() => setUserMenuOpen(false)}>Inställningar</NavLink>
                    <button onClick={() => { logout(); setUserMenuOpen(false) }} className="block w-full text-left px-3 py-2 rounded-md hover:bg-white/10">Logga ut</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
        {/* Mobile actions: hamburger + avatar */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            className="p-2 rounded-md hover:bg-white/10"
            aria-label="Öppna meny"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          {user && (
            <NavLink to="/profile" aria-label="Profil">
              <div className="w-8 h-8 rounded-full border border-white/20 bg-gradient-to-br from-indigo-600/40 to-sky-500/30 flex items-center justify-center text-sm font-semibold text-white/90 overflow-hidden">
                {user.avatarDataUrl ? (
                  <img src={user.avatarDataUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />
                )}
              </div>
            </NavLink>
          )}
        </div>
      </div>
      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur">
          <div className="max-w-[1100px] mx-auto px-5 py-3 flex flex-col gap-1">
            <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/battery" onClick={() => setMobileOpen(false)}><Battery className="w-4 h-4" /> Batteri</NavLink>
            <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/prices" onClick={() => setMobileOpen(false)}><Bolt className="w-4 h-4" /> Priser</NavLink>
            <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/calendar" onClick={() => setMobileOpen(false)}><CalendarIcon className="w-4 h-4" /> Kalender</NavLink>
            <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/weather" onClick={() => setMobileOpen(false)}><Cloud className="w-4 h-4" /> Väder</NavLink>
            <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/home" onClick={() => setMobileOpen(false)}><Home className="w-4 h-4" /> Hemma</NavLink>
            <div className="h-px bg-white/10 my-2" />
            {!user && (
              <>
                <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/login" onClick={() => setMobileOpen(false)}>Logga in</NavLink>
                <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/register" onClick={() => setMobileOpen(false)}>Registrera</NavLink>
              </>
            )}
            {user && (
              <>
                <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/profile" onClick={() => setMobileOpen(false)}>Profil</NavLink>
                <NavLink className="px-3 py-2 rounded-md hover:bg-white/10" to="/settings" onClick={() => setMobileOpen(false)}>Inställningar</NavLink>
                <button onClick={() => { logout(); setMobileOpen(false) }} className="px-3 py-2 text-left rounded-md hover:bg-white/10">Logga ut</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}







 





function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="py-4 sm:h-20 bg-slate-900/80 border-t border-white/10">
      <div className="max-w-[1100px] mx-auto px-5 h-full flex items-center justify-center">
        <div className="w-full flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-2 text-sm sm:text-base sm:flex-row sm:gap-6">
            <span className="font-medium">&copy; {year} Philip Antebrink</span>
            <a className="hover:underline inline-flex items-center gap-2" href="mailto:antebrinken@live.se"><Mail className="w-4 h-4" /> antebrinken@live.se</a>
            <a className="hover:underline inline-flex items-center gap-2" href="tel:+46734177109"><Phone className="w-4 h-4" /> 0734177109</a>
          </div>
         
        </div>
      </div>
    </footer>
  )
}

function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative z-0 min-h-[70vh]">
        <Hero title="Välkommen hem" centered />
      </section>

      {/* Info sections */}
      <section id="about" className="min-h-screen flex items-center py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-5 w-full">
          <div className="relative glass-card reveal-left max-w-[700px]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Om sidan</h2>
            <p className="text-white/70 text-sm sm:text-base">Detta är en samlingssida för olika typer av hjälpredor för en framtida Home Assistant..</p>
          </div>
        </div>
      </section>

      <section id="battery" className="min-h-screen flex items-center py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-5 w-full">
          <div className="relative glass-card reveal-right max-w-[700px] sm:ml-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Batteri</h2>
            <p className="text-white/70 text-sm sm:text-base mb-3">Här kommer man kunna se olika enheters batteriprocenter.</p>
            <NavLink to="/battery" className="inline-block mt-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm sm:text-base hover:bg-white/20">Gå till Batteri</NavLink>
          </div>
        </div>
      </section>

      <section id="prices" className="min-h-screen flex items-center py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-5 w-full">
          <div className="relative glass-card reveal-left max-w-[700px]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Elpriser</h2>
            <p className="text-white/70 text-sm sm:text-base mb-3">Se SE1–SE4 spotpriser i realtid och hitta bästa fönster för förbrukning och försäljning.</p>
            <NavLink to="/prices" className="inline-block mt-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm sm:text-base hover:bg-white/20">Gå till Priser</NavLink>
          </div>
        </div>
      </section>

      <section id="calendar" className="min-h-screen flex items-center py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-5 w-full">
          <div className="relative glass-card reveal-right max-w-[700px] sm:ml-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Kalender</h2>
            <p className="text-white/70 text-sm sm:text-base mb-3">En samlingssida för en gemensam kalender.</p>
            <NavLink to="/calendar" className="inline-block mt-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm sm:text-base hover:bg-white/20">Gå till Kalender</NavLink>
          </div>
        </div>
      </section>

      <section id="weather" className="min-h-screen flex items-center py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-5 w-full">
          <div className="relative glass-card reveal-left max-w-[700px]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Väder</h2>
            <p className="text-white/70 text-sm sm:text-base mb-3">Enkelt att kunna se väder via Open‑Meteo.</p>
            <NavLink to="/weather" className="inline-block mt-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm sm:text-base hover:bg-white/20">Gå till Väder</NavLink>
          </div>
        </div>
      </section>

      <section id="home" className="min-h-screen flex items-center py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-5 w-full">
          <div className="relative glass-card reveal-right max-w-[700px] sm:ml-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Hemma</h2>
            <p className="text-white/70 text-sm sm:text-base mb-3">Styr lampor i olika rum. Detta är en förhandsvy av en kommande funktion.</p>
            <NavLink to="/home" className="inline-block mt-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm sm:text-base hover:bg-white/20">Gå till Hemma</NavLink>
          </div>
        </div>
      </section>
    </main>
  )
}

 

function App() {
  return (
    <div id="top" className="min-h-screen flex flex-col">
      <NeuralNetworkBackground />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/battery" element={<BatteryPage />} />
          <Route path="/prices" element={<PricesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/home" element={<HomeControlPage />} />
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
