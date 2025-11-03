export type UserRecord = {
  id: string
  email: string
  passwordHash: string
  createdAt: number
}

const USERS_KEY = 'app.users.v1'
const SESSION_KEY = 'app.session.v1'

function readUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as UserRecord[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email: string) {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function addUser(user: UserRecord) {
  const users = readUsers()
  users.push(user)
  writeUsers(users)
}

export function updateUser(user: UserRecord) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx === -1) return false
  users[idx] = user
  writeUsers(users)
  return true
}

export function removeUser(id: string) {
  const users = readUsers().filter((u) => u.id !== id)
  writeUsers(users)
}

export function setSession(userId: string | null) {
  if (!userId) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, userId)
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function getUserById(id: string) {
  return readUsers().find((u) => u.id === id) || null
}
