'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase'
import { VideoRecorder } from '@/components/ui/video-recorder'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [keyword, setKeyword] = useState('')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recordedBlob || !keyword.trim()) {
      alert('Please record a video and enter a keyword')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      // Upload video to Supabase Storage
      const videoFile = new File([recordedBlob], 'sign-video.webm', {
        type: 'video/webm'
      })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sign-videos')
        .upload(`${user.id}/${Date.now()}-${keyword}.webm`, videoFile)

      if (uploadError) throw uploadError

      // Save video metadata to database
      const { error: dbError } = await supabase
        .from('sign_contributions')
        .insert({
          user_id: user.id,
          keyword: keyword.toLowerCase().trim(),
          video_path: uploadData.path,
          status: 'pending' // Contributions might need approval
        })

      if (dbError) throw dbError

      alert('Thank you for your contribution!')
      setKeyword('')
      setRecordedBlob(null)
    } catch (error) {
      console.error('Error submitting contribution:', error)
      alert('There was an error submitting your contribution. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                Contribute to the Community
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Share your sign language knowledge by recording signs for words. Your contributions help make sign language more accessible to everyone.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="mb-8">
                  <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    What word are you signing?
                  </label>
                  <input
                    type="text"
                    id="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the word you're demonstrating..."
                  />
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
                    {isSubmitting ? 'Submitting...' : 'Share with Community'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}