'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { FaSignLanguage, FaBookmark, FaHandsHelping, FaCog, FaSignOutAlt } from 'react-icons/fa'

interface DashboardCard {
  title: string
  description: string
  icon: React.ReactNode
  link: string
  color: string
  size?: 'normal' | 'large'
}

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [username, setUsername] = useState<string | null>(null)
  const [stats] = useState({
    savedCount: 0,
    contributionsCount: 0
  })
  
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
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
    
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [user, isLoading, router])

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Start Signing',
      description: 'Convert text or speech to sign language and customize your signs',
      icon: <FaSignLanguage className="w-8 h-8" />,
      link: '/convert',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      size: 'large'
    },
    {
      title: 'My Library',
      description: 'Access your saved translations and custom signs',
      icon: <FaBookmark className="w-6 h-6" />,
      link: '/saved',
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      size: 'normal'
    },
    {
      title: 'Community Hub',
      description: 'Contribute signs and connect with the community',
      icon: <FaHandsHelping className="w-6 h-6" />,
      link: '/community',
      color: 'bg-gradient-to-br from-orange-500 to-pink-600',
      size: 'normal'
    },
    {
      title: 'Regional Signs',
      description: 'Create and manage your personalized sign variations for different regions',
      icon: <FaSignLanguage className="w-6 h-6" />,
      link: '/customizations',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      size: 'normal'
    }
  ]
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dot-pattern bg-fixed bg-blue-50/50 dark:bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      
      <div className="relative">
        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50">
          <div className="container mx-auto h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaSignLanguage className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">SignLang</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => router.push('/settings')}
              >
                <FaCog className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
                onClick={async () => {
                  await signOut()
                  router.push('/')
                }}
              >
                <FaSignOutAlt className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome Section */}
              <div className="mb-12">
                <div className="text-center space-y-3">
                  <motion.h1 
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {greeting}, {username || user.email?.split('@')[0]}!
                  </motion.h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Ready to make communication more accessible?
                  </p>
                </div>

                {/* Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                >
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-transform duration-300">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.savedCount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Saved Signs</p>
                  </div>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-transform duration-300">
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {stats.contributionsCount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contributions</p>
                  </div>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-transform duration-300">
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      24
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Days</p>
                  </div>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 text-center transform hover:scale-105 transition-transform duration-300">
                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      98%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                  </div>
                </motion.div>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={card.size === 'large' ? 'md:col-span-2 lg:col-span-3' : ''}
                  >
                    <Link href={card.link}>
                      <div className={`group relative overflow-hidden rounded-2xl ${card.color}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30 group-hover:from-black/20 group-hover:to-black/40 transition-all duration-300" />
                        <div className="relative p-6 md:p-8">
                          <div className="flex items-start gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                              {card.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className={`${card.size === 'large' ? 'text-3xl' : 'text-xl'} font-bold text-white mb-2`}>
                                {card.title}
                              </h3>
                              <p className="text-white/90">
                                {card.description}
                              </p>
                              {card.size === 'large' && (
                                <Button className="mt-6 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700" size="lg">
                                  Get Started →
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
