 
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
    <main className="min-h-screen flex flex-col">
      {/* Hero: text follows scroll (sticky near top) then disappears under the black block */}
      <section className="relative z-0">
        <div className="h-[50vh]" />
        <h1 className="sticky top-16 text-4xl sm:text-5xl font-extrabold tracking-tight px-5 text-center">Välkommen hem</h1>
      </section>

      
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



