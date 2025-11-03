import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    const res = await register(email, password)
    if (res.ok) navigate('/profile')
    else setError(res.message)
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white/5 border border-white/10 rounded-2xl">
      <h1 className="text-2xl mb-4">Create account</h1>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Email</span>
          <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Password</span>
          <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Confirm password</span>
          <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>
        {error && <div className="text-rose-400 text-sm">{error}</div>}
        <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20">Create account</button>
      </form>
      <p className="mt-4 text-sm text-white/70">
        Have an account? <Link className="underline" to="/login">Log in</Link>
      </p>
    </div>
  )
}

