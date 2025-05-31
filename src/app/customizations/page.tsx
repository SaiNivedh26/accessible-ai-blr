'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase'
import { VideoRecorder } from '@/components/ui/video-recorder'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FaPlay, FaTrash } from 'react-icons/fa'

interface CustomSign {
  id: string
  word: string
  video_path: string
  region: string
  created_at: string
}

export default function CustomizationsPage() {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [word, setWord] = useState('')
  const [region, setRegion] = useState('')
  const [customSigns, setCustomSigns] = useState<CustomSign[]>([])
  const [isLoadingCustomSigns, setIsLoadingCustomSigns] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    async function fetchCustomSigns() {
      if (user) {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('custom_signs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setCustomSigns(data)
        }
        setIsLoadingCustomSigns(false)
      }
    }

    fetchCustomSigns()
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recordedBlob || !word.trim() || !region.trim()) {
      alert('Please fill in all fields and record a video')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      // Upload video to Supabase Storage
      const videoFile = new File([recordedBlob], 'custom-sign.webm', {
        type: 'video/webm'
      })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('custom-signs')
        .upload(`${user.id}/${Date.now()}-${word}.webm`, videoFile)

      if (uploadError) throw uploadError

      // Save customization metadata to database
      const { data, error: dbError } = await supabase
        .from('custom_signs')
        .insert({
          user_id: user.id,
          word: word.toLowerCase().trim(),
          region: region.trim(),
          video_path: uploadData.path
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update local state
      if (data) {
        setCustomSigns([data, ...customSigns])
      }

      alert('Custom sign saved successfully!')
      setWord('')
      setRegion('')
      setRecordedBlob(null)
    } catch (error) {
      console.error('Error saving custom sign:', error)
      alert('There was an error saving your custom sign. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom sign?')) return

    try {
      const supabase = createClient()
      const signToDelete = customSigns.find(sign => sign.id === id)
      
      if (signToDelete) {
        // Delete video from storage
        const { error: storageError } = await supabase.storage
          .from('custom-signs')
          .remove([signToDelete.video_path])

        if (storageError) throw storageError

        // Delete record from database
        const { error: dbError } = await supabase
          .from('custom_signs')
          .delete()
          .eq('id', id)

        if (dbError) throw dbError

        // Update local state
        setCustomSigns(customSigns.filter(sign => sign.id !== id))
      }
    } catch (error) {
      console.error('Error deleting custom sign:', error)
      alert('There was an error deleting the custom sign.')
    }
  }

  if (authLoading || isLoadingCustomSigns) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                My Custom Signs
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Create your own regional variations of signs. These will be used when converting text to sign language.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label htmlFor="word" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Word to Sign
                    </label>
                    <input
                      type="text"
                      id="word"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter the word..."
                    />
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Region/Variation
                    </label>
                    <input
                      type="text"
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ASL, BSL, Regional Variation..."
                    />
                  </div>
                </div>

                <VideoRecorder
                  onRecordingComplete={(blob) => setRecordedBlob(blob)}
                />

                <div className="mt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !recordedBlob}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Custom Sign'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                My Custom Signs ({customSigns.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customSigns.map((sign) => (
                  <div
                    key={sign.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {sign.word}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sign.region}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(sign.id)}
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <video
                      className="w-full rounded-lg bg-gray-100 dark:bg-gray-700"
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/custom-signs/${sign.video_path}`}
                      controls
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
