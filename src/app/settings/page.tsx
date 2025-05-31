'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
    
    if (user) {
      setEmail(user.email || '')
      
      // Fetch additional user metadata if available
      const fetchUserMetadata = async () => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single()
            
          if (data && !error) {
            setFullName(data.full_name || '')
            setUsername(data.username || '')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      
      fetchUserMetadata()
    }
  }, [user, isLoading, router])
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    // Validate username
    if (username.length < 3) {
      setError('Username must be at least 3 characters long')
      setIsSaving(false)
      return
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      setIsSaving(false)
      return
    }
    
    try {
      const supabase = createClient()
      
      // Update email if it changed
      if (email !== user?.email) {
        const { error } = await supabase.auth.updateUser({ email })
        
        if (error) {
          setError(error.message)
          setIsSaving(false)
          return
        }
      }
      
      // Update profile information in profiles table
      // Create the profiles table if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user?.id,
          username: username,
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        setError(error.message)
        return
      }
      
      setSuccess('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordChanging(true)
    setError(null)
    setSuccess(null)
    
    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setPasswordChanging(false)
      return
    }
    
    try {
      const supabase = createClient()
      
      // For password change with current password, we would typically first verify
      // the current password but Supabase doesn't have a direct API for this
      // currentPassword is collected for potential future implementation
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        setError(error.message)
        return
      }
      
      setSuccess('Password changed successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setPasswordChanging(false)
    }
  }
  
  if (isLoading) {
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
          className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>
          
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {success}
            </div>
          )}
          
          <div className="space-y-8">
            {/* Profile Form */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    pattern="[a-zA-Z0-9_]+"
                    title="Username can only contain letters, numbers, and underscores"
                    minLength={3}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </form>
            </div>
            
            {/* Password Form */}
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={passwordChanging}
                >
                  Change Password
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
