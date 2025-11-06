import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/modules/supabase/client'
import { useSupabaseSession } from '@/components/SupabaseAuthGate'

type ProfileContextValue = {
  avatarUrl: string | null
  avatarPath: string | null
  isLoading: boolean
  uploadAvatar: (file: Blob) => Promise<void>
  removeAvatar: () => Promise<void>
  refreshAvatar: () => Promise<void>
}

type AvatarState = {
  avatarUrl: string | null
  avatarPath: string | null
  isLoading: boolean
}

const DEFAULT_STATE: AvatarState = {
  avatarUrl: null,
  avatarPath: null,
  isLoading: true,
}

export const DEFAULT_AVATAR_SIZE = 72
const BUCKET_NAME = 'SupaBucket'

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const session = useSupabaseSession()
  const userId = session.user.id
  const [state, setState] = useState<AvatarState>(DEFAULT_STATE)
  const avatarPathRef = useRef<string | null>(state.avatarPath)
  const mountedRef = useRef(true)
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    avatarPathRef.current = state.avatarPath
  }, [state.avatarPath])

  const loadAvatar = useCallback(async () => {
    if (mountedRef.current) {
      setState((prev) => ({ ...prev, isLoading: true }))
    }
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      if (mountedRef.current) {
        setState({ avatarUrl: null, avatarPath: null, isLoading: false })
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
      return
    }
    const avatarPath = (data.user.user_metadata?.avatar_path as string | undefined) ?? null
    if (!avatarPath) {
      if (mountedRef.current) {
        setState({ avatarUrl: null, avatarPath: null, isLoading: false })
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
      return
    }
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(avatarPath, 60 * 60)
    let publicUrl: string | null = null
    if (!signedError && signedData?.signedUrl) {
      publicUrl = signedData.signedUrl
    } else {
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(avatarPath)
      publicUrl = publicUrlData?.publicUrl ?? null
    }
    if (mountedRef.current) {
      setState({
        avatarUrl: publicUrl,
        avatarPath,
        isLoading: false,
      })
    }
    if (typeof window !== 'undefined') {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      refreshTimeoutRef.current = window.setTimeout(() => {
        loadAvatar().catch(() => undefined)
      }, 55 * 60 * 1000)
    }
  }, [userId])

  useEffect(() => {
    loadAvatar()
  }, [loadAvatar, userId])

  const removeAvatar = useCallback(async () => {
    const currentPath = avatarPathRef.current
    if (mountedRef.current) {
      setState((prev) => ({ ...prev, isLoading: true }))
    }
    try {
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_path: null } })
      if (updateError) throw updateError
      if (currentPath) {
        await supabase.storage.from(BUCKET_NAME).remove([currentPath])
      }
      if (mountedRef.current) {
        setState({ avatarUrl: null, avatarPath: null, isLoading: false })
      }
      avatarPathRef.current = null
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
    } catch (error) {
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
      throw error
    }
  }, [])

  const uploadAvatar = useCallback(
    async (file: Blob) => {
      const fileExt = 'png'
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`
      const previousPath = avatarPathRef.current
      if (mountedRef.current) {
        setState((prev) => ({ ...prev, isLoading: true }))
      }
      try {
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
          cacheControl: '3600',
          contentType: 'image/png',
          upsert: false,
        })
        if (uploadError) throw uploadError

        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_path: filePath },
        })
        if (updateError) {
          await supabase.storage.from(BUCKET_NAME).remove([filePath]).catch(() => undefined)
          throw updateError
        }

        if (previousPath && previousPath !== filePath) {
          await supabase.storage.from(BUCKET_NAME).remove([previousPath]).catch(() => undefined)
        }

        avatarPathRef.current = filePath
        await loadAvatar()
      } catch (error) {
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
        throw error
      }
    },
    [userId, loadAvatar]
  )

  const refreshAvatar = useCallback(async () => {
    await loadAvatar()
  }, [loadAvatar])

  const value = useMemo<ProfileContextValue>(
    () => ({
      avatarUrl: state.avatarUrl,
      avatarPath: state.avatarPath,
      isLoading: state.isLoading,
      uploadAvatar,
      removeAvatar,
      refreshAvatar,
    }),
    [state.avatarUrl, state.avatarPath, state.isLoading, uploadAvatar, removeAvatar, refreshAvatar]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return ctx
}
