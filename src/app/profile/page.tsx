'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/auth/logout-button'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'

// Remove unused signOut since we're using LogoutButton component

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])
  
  // Fetch user profile data
  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        
        if (data && !error) {
          setUsername(data.username)
        }
      }
      setIsLoading(false)
    }
    
    fetchProfile()
  }, [user])
  
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return null // Will redirect in the useEffect
  }
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Account Information</h2>
              <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Username:</span> {username}</p>
              <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Email:</span> {user.email}</p>
              <p className="text-gray-600 dark:text-gray-300"><span className="font-medium">Account ID:</span> {user.id.substring(0, 8)}...</p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Email verified:</span> {user.email_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Preferences</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Configure your account preferences here.</p>
              <div className="mt-4">
                <Link href="/settings">
                  <Button
                    variant="outline"
                    className="mr-4"
                  >
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button
                    variant="outline"
                  >
                    Change Password
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="pt-2">
              <LogoutButton />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
