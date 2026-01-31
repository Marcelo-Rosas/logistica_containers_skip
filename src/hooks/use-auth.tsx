import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { SplashScreen } from '@/components/SplashScreen'

interface AuthContextType {
  user: User | null
  session: Session | null
  organizationId: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
  updatePassword: (password: string) => Promise<{ data: any; error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for changes FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setOrganizationId(
        (session?.user?.app_metadata?.organization_id as string) ?? null,
      )
      setLoading(false)
    })

    // THEN check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setOrganizationId(
        (session?.user?.app_metadata?.organization_id as string) ?? null,
      )
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase()
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
      setOrganizationId(null)
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    )
    return { data, error }
  }

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    })
    return { data, error }
  }

  const value = {
    user,
    session,
    organizationId,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    loading,
  }

  // Global Loading State to prevent flickering
  if (loading) {
    return <SplashScreen />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
