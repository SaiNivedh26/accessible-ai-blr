'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { FaUserCircle, FaSignOutAlt, FaCog, FaSignLanguage, FaTools } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

export default function UserProfileWidget() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    async function fetchUsername() {
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
    }
    
    fetchUsername()
  }, [user])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef])
  
  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }
  
  if (!user) return null
  
  return (
    <div className="relative" ref={wrapperRef}>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-full py-1 px-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaUserCircle className="text-gray-700 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {username || user.email?.split('@')[0]}
        </span>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Logged in</p>
            </div>
            <div className="py-1">
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaSignLanguage className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaUserCircle className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link 
                href="/settings" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaCog className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <Link 
                href="/development" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaTools className="w-4 h-4" />
                <span>What's New</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
