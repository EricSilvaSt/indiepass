import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

export type AccountRole = 'buyer' | 'producer'

export interface Profile {
  id: string
  full_name: string
  whatsapp: string
  role: AccountRole
  cpf: string
  address_street: string
  address_number: string
  address_city: string
  address_state: string
  address_zip: string
}

interface AuthCtx {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    setProfile((data as Profile) ?? null)
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) setTimeout(() => loadProfile(s.user.id), 0)
      else setProfile(null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) loadProfile(data.session.user.id)
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut: async () => {
          await supabase.auth.signOut()
          setProfile(null)
        },
        refreshProfile: async () => {
          if (user) await loadProfile(user.id)
        },
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
