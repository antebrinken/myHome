import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { addUser, findUserByEmail, getSession, getUserById, setSession, updateUser, removeUser, type UserRecord } from './storage'
import { sha256 } from './crypto'

export type AuthUser = Pick<UserRecord, 'id' | 'email' | 'createdAt'>

type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  register: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => void
  updateEmail: (newEmail: string) => Promise<{ ok: true } | { ok: false; message: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: true } | { ok: false; message: string }>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = getSession()
    if (!id) {
      setLoading(false)
      return
    }
    const u = getUserById(id)
    if (u) setUser({ id: u.id, email: u.email, createdAt: u.createdAt })
    setLoading(false)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    email = email.trim()
    if (!email || !password) return { ok: false as const, message: 'Email and password are required.' }
    if (findUserByEmail(email)) return { ok: false as const, message: 'Email already registered.' }
    const passwordHash = await sha256(password)
    const record: UserRecord = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: Date.now(),
    }
    addUser(record)
    setSession(record.id)
    setUser({ id: record.id, email: record.email, createdAt: record.createdAt })
    return { ok: true as const }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const existing = findUserByEmail(email.trim())
    if (!existing) return { ok: false as const, message: 'Invalid credentials.' }
    const hash = await sha256(password)
    if (hash !== existing.passwordHash) return { ok: false as const, message: 'Invalid credentials.' }
    setSession(existing.id)
    setUser({ id: existing.id, email: existing.email, createdAt: existing.createdAt })
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    setUser(null)
  }, [])

  const updateEmail = useCallback(async (newEmail: string) => {
    if (!user) return { ok: false as const, message: 'Not authenticated.' }
    newEmail = newEmail.trim()
    if (!newEmail) return { ok: false as const, message: 'Email is required.' }
    const existing = findUserByEmail(newEmail)
    if (existing && existing.id !== user.id) return { ok: false as const, message: 'Email already in use.' }
    const current = getUserById(user.id)
    if (!current) return { ok: false as const, message: 'User not found.' }
    const updated: UserRecord = { ...current, email: newEmail }
    updateUser(updated)
    setUser({ id: updated.id, email: updated.email, createdAt: updated.createdAt })
    return { ok: true as const }
  }, [user])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) return { ok: false as const, message: 'Not authenticated.' }
    const record = getUserById(user.id)
    if (!record) return { ok: false as const, message: 'User not found.' }
    const currentHash = await sha256(currentPassword)
    if (currentHash !== record.passwordHash) return { ok: false as const, message: 'Current password is incorrect.' }
    const newHash = await sha256(newPassword)
    const updated: UserRecord = { ...record, passwordHash: newHash }
    updateUser(updated)
    return { ok: true as const }
  }, [user])

  const deleteAccount = useCallback(async () => {
    if (!user) return
    removeUser(user.id)
    setSession(null)
    setUser(null)
  }, [user])

  const value = useMemo<AuthContextType>(() => ({ user, loading, register, login, logout, updateEmail, changePassword, deleteAccount }), [user, loading, register, login, logout, updateEmail, changePassword, deleteAccount])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
