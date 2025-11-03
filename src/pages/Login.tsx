import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext'
import { useToast } from '../components/Toast'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'

  const { push } = useToast()
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await login(email, password)
    if (res.ok) {
      push('success', 'Inloggad')
      navigate(from, { replace: true })
    } else {
      setError(res.message)
      push('error', res.message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white/5 border border-white/10 rounded-2xl">
      <h1 className="text-2xl mb-4">Logga in</h1>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">E‑post</span>
          <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Lösenord</span>
          <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <div className="text-rose-400 text-sm">{error}</div>}
        <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20">Logga in</button>
      </form>
      <p className="mt-4 text-sm text-white/70">
        Inget konto? <Link className="underline" to="/register">Skapa ett</Link>
      </p>
    </div>
  )
}
