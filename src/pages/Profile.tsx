import { useAuth } from '../modules/auth/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  if (!user) return null
  const created = new Date(user.createdAt).toLocaleString()
  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white/5 border border-white/10 rounded-2xl">
      <h1 className="text-2xl mb-4">Your Profile</h1>
      <div className="space-y-2">
        <div><span className="text-white/70">User ID:</span> <code>{user.id}</code></div>
        <div><span className="text-white/70">Email:</span> {user.email}</div>
        <div><span className="text-white/70">Created:</span> {created}</div>
      </div>
      <button onClick={logout} className="mt-6 rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20">Sign out</button>
    </div>
  )
}

