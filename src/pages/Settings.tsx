import { type FormEvent, useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext'

export default function SettingsPage() {
  const { user, updateEmail, changePassword, deleteAccount, logout } = useAuth()
  const [email, setEmail] = useState(user?.email ?? '')
  const [emailMsg, setEmailMsg] = useState<string | null>(null)
  const [pwdMsg, setPwdMsg] = useState<string | null>(null)
  const [currPwd, setCurrPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  if (!user) return null

  const onEmailSave = async (e: FormEvent) => {
    e.preventDefault()
    setEmailMsg(null)
    const res = await updateEmail(email)
    setEmailMsg(res.ok ? 'Email updated.' : res.message)
  }

  const onPasswordSave = async (e: FormEvent) => {
    e.preventDefault()
    setPwdMsg(null)
    if (newPwd !== confirmPwd) {
      setPwdMsg('New passwords do not match.')
      return
    }
    const res = await changePassword(currPwd, newPwd)
    setPwdMsg(res.ok ? 'Password changed.' : res.message)
    if (res.ok) {
      setCurrPwd(''); setNewPwd(''); setConfirmPwd('')
    }
  }

  const exportData = () => {
    const data = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'account-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onDelete = async () => {
    if (!confirm('Delete your account? This cannot be undone.')) return
    await deleteAccount()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 grid gap-8">
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-xl mb-3">General</h2>
        <form className="grid gap-3" onSubmit={onEmailSave}>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Email</span>
            <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="submit">Save</button>
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="button" onClick={exportData}>Export data</button>
          </div>
          {emailMsg && <div className="text-sm text-white/70">{emailMsg}</div>}
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-xl mb-3">Security</h2>
        <form className="grid gap-3" onSubmit={onPasswordSave}>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Current password</span>
            <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="password" value={currPwd} onChange={(e) => setCurrPwd(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">New password</span>
            <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-white/70">Confirm new password</span>
            <input className="bg-white/10 border border-white/20 rounded-lg px-3 py-2" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
          </label>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="submit">Change password</button>
            <button className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20" type="button" onClick={logout}>Log out</button>
          </div>
          {pwdMsg && <div className="text-sm text-white/70">{pwdMsg}</div>}
        </form>
      </section>

      <section className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5">
        <h2 className="text-xl mb-2 text-rose-300">Danger zone</h2>
        <p className="text-sm text-white/70 mb-3">This will permanently delete your account and data stored locally.</p>
        <button className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-4 py-2 hover:bg-rose-500/30" onClick={onDelete}>Delete account</button>
      </section>
    </div>
  )
}
