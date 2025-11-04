import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ProfileState = {
  avatarDataUrl: string | null
}

type ProfileContextValue = ProfileState & {
  setAvatarDataUrl: (dataUrl: string | null) => void
  resetProfile: () => void
}

export const DEFAULT_AVATAR_SIZE = 72

const DEFAULT_STATE: ProfileState = {
  avatarDataUrl: null,
}

const STORAGE_KEY = 'myhome.profile'

const ProfileContext = createContext<ProfileContextValue | null>(null)

function readStoredProfile(): ProfileState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return DEFAULT_STATE
    }
    const parsed = JSON.parse(raw) as Partial<ProfileState>
    return {
      avatarDataUrl: typeof parsed.avatarDataUrl === 'string' ? parsed.avatarDataUrl : DEFAULT_STATE.avatarDataUrl,
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProfileState>(() => readStoredProfile())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo<ProfileContextValue>(() => ({
    ...state,
    setAvatarDataUrl: (dataUrl) => setState((prev) => ({ ...prev, avatarDataUrl: dataUrl })),
    resetProfile: () => setState(DEFAULT_STATE),
  }), [state])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return ctx
}
