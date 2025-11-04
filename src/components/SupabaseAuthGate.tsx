import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/modules/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

type MaybeSession = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']
type Session = NonNullable<MaybeSession>

const SupabaseSessionContext = createContext<Session | null>(null)

export function useSupabaseSession(): Session {
  const session = useContext(SupabaseSessionContext)
  if (!session) {
    throw new Error('useSupabaseSession must be used within SupabaseAuthGate')
  }
  return session
}

export default function SupabaseAuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MaybeSession>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => { subscription.unsubscribe() }
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={["google", "github"]} />
        </div>
      </div>
    )
  }

  return (
    <SupabaseSessionContext.Provider value={session}>
      {children}
    </SupabaseSessionContext.Provider>
  )
}


