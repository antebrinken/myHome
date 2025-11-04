import { useEffect, useRef, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Battery, Calendar as CalendarIcon, Cloud, Home, Bolt, Mail, Phone, Menu, X, User, Settings, LogOut } from 'lucide-react'
import Hero from '@/components/ui/neural-network-hero'
import NeuralNetworkBackground from '@/components/ui/neural-network-background'
import NotFoundPage from './pages/NotFound'
import BatteryPage from './pages/BatteryPage'
import PricesPage from './pages/PricesPage'
import CalendarPage from './pages/CalendarPage'
import WeatherPage from './pages/WeatherPage'
import HomeControlPage from './pages/HomeControlPage'
import SupabaseAuthGate, { useSupabaseSession } from '@/components/SupabaseAuthGate'
import { ProfileProvider, useProfile } from '@/modules/profile/ProfileContext'
import { supabase } from '@/modules/supabase/client'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

 

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const session = useSupabaseSession()
  const { avatarDataUrl } = useProfile()
  const userEmail = session.user?.email ?? 'Profile'
  const initials = userEmail.slice(0, 1).toUpperCase()
  const avatarDimension = 48

  const AvatarCircle = ({ dimension }: { dimension: number }) => (
    avatarDataUrl ? (
      <img
        src={avatarDataUrl}
        alt="Profile avatar"
        className="rounded-full border border-indigo-400/50 object-cover"
        style={{ width: dimension, height: dimension }}
      />
    ) : (
      <div
        className="flex items-center justify-center rounded-full border border-indigo-400/50 bg-indigo-500/20 text-sm font-semibold"
        style={{ width: dimension, height: dimension }}
      >
        {initials}
      </div>
    )
  )

  useEffect(() => {
    if (!profileOpen) {
      return
    }
    function handleClick(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [profileOpen])

  async function handleLogout() {
    setProfileOpen(false)
    setMobileOpen(false)
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-[1100px] mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to="/" className="font-extrabold tracking-tight flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Bolt className="w-5 h-5" /> Hem
        </NavLink>
        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-3 text-sm items-center ml-auto">
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/battery"><Battery className="w-4 h-4" /> Batteri</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/prices"><Bolt className="w-4 h-4" /> Priser</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/calendar"><CalendarIcon className="w-4 h-4" /> Kalender</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/weather"><Cloud className="w-4 h-4" /> Väder</NavLink>
          <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/home"><Home className="w-4 h-4" /> Hemma</NavLink>
        </nav>
        <div className="hidden sm:flex items-center gap-3 ml-4">
          <div className="relative" ref={profileMenuRef}>
            <button
              className="flex items-center gap-2 rounded-full p-1 hover:bg-white/10"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((v) => !v)}
            >
              <AvatarCircle dimension={avatarDimension} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-slate-900/95 p-1 text-sm shadow-lg backdrop-blur">
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="w-4 h-4" /> Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" /> Settings
                </NavLink>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-white/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Mobile actions: hamburger + avatar */}
        <div className="sm:hidden flex items-center gap-2 ml-auto">
          <button
            className="p-2 rounded-md hover:bg-white/10"
            aria-label="Öppna meny"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <AvatarCircle dimension={40} />
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
            <div className="mt-4 border-t border-white/10 pt-3 flex flex-col gap-1">
              <span className="px-3 text-xs font-semibold uppercase tracking-wide text-white/40">Profile</span>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/profile" onClick={() => setMobileOpen(false)}><User className="w-4 h-4" /> Profile</NavLink>
              <NavLink className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2" to="/settings" onClick={() => setMobileOpen(false)}><Settings className="w-4 h-4" /> Settings</NavLink>
              <button className="px-3 py-2 rounded-md hover:bg-white/10 flex items-center gap-2 text-left" onClick={handleLogout}><LogOut className="w-4 h-4" /> Logout</button>
            </div>
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
        <Hero title="Min framtida app" centered />
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
      <SupabaseAuthGate>
        <ProfileProvider>
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/battery" element={<BatteryPage />} />
              <Route path="/prices" element={<PricesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/home" element={<HomeControlPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </ProfileProvider>
      </SupabaseAuthGate>
    </div>
  )
}

export default App
