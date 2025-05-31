'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { type User, type Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type AuthError = {
  message: string;
  status?: number;
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error(error)
      }

      if (session) {
        setSession(session)
        setUser(session.user)
      }
      
      setIsLoading(false)
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        router.refresh()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, username: string) => {
    // Sign up the user first
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    
    if (authError) {
      return { error: authError }
    }

    if (!authData.user) {
      return { error: { message: "Failed to create user" } }
    }

    // Then create their profile with the username
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username: username,
          created_at: new Date().toISOString(),
        }
      ])

    if (profileError) {
      // If profile creation fails, we should clean up the auth record
      await supabase.auth.signOut()
      return { error: { message: profileError.message } }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
