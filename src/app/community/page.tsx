'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase'
import { VideoRecorder } from '@/components/ui/video-recorder'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { uploadToPinata } from '@/lib/pinata'

export default function CommunityPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [keyword, setKeyword] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [ipfsStatus, setIpfsStatus] = useState({ uploaded: false, hash: '', url: '' })

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
    if (!user) {
      router.push('/login')
      return
    }

    if (!recordedBlob || !keyword.trim()) {
      setStatusMessage('Please record a video and enter a keyword')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Uploading your sign to IPFS...')
    
    try {
      // First upload to Pinata IPFS
      const pinataMetadata = {
        name: `Community Sign: ${keyword.trim()}`,
        word: keyword.toLowerCase().trim(),
        contributor: user.id,
        createdAt: new Date().toISOString(),
        type: 'community-sign'
      }
      
      const videoFile = new File([recordedBlob], `community-sign-${keyword}.webm`, {
        type: 'video/webm'
      })
      
      const pinataResult = await uploadToPinata(videoFile, pinataMetadata)
      
      if (!pinataResult.success) {
        throw new Error(pinataResult.error || 'Failed to upload to Pinata IPFS')
      }
      
      setIpfsStatus({
        uploaded: true,
        hash: pinataResult.ipfsHash || '',
        url: pinataResult.url || ''
      })
      
      setStatusMessage('Processing with AI model...')
      
      // Now send to Flask endpoint for community processing
      const formData = new FormData()
      formData.append('video', recordedBlob, 'sign-video.webm')
      formData.append('keyword', keyword.trim())
      formData.append('userId', user.id)
      formData.append('type', 'community') // To differentiate from customizations
      formData.append('ipfsHash', pinataResult.ipfsHash || '')
      formData.append('ipfsUrl', pinataResult.url || '')

      const flaskResponse = await fetch('http://localhost:5000/process-community-video', {
        method: 'POST',
        body: formData,
      })

      if (!flaskResponse.ok) {
        throw new Error('Failed to process video')
      }

      const processedData = await flaskResponse.json()

      const supabase = createClient()
      
      // Upload processed video to Supabase Storage as backup
      // Note: videoFile is already declared above with IPFS upload
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sign-videos')
        .upload(`${user.id}/${Date.now()}-${keyword}.webm`, videoFile)

      if (uploadError) throw uploadError

      // Save video metadata to database with processed data and IPFS info
      const { error: dbError } = await supabase
        .from('sign_contributions')
        .insert({
          user_id: user.id,
          keyword: keyword.toLowerCase().trim(),
          video_path: uploadData.path,
          ipfs_hash: ipfsStatus.hash,
          pinata_url: ipfsStatus.url,
          status: 'pending',
          processed_data: processedData, // Store the data from Flask processing
          quality_score: processedData.qualityScore || 0, // Optional: store quality metrics
          verification_status: processedData.verified ? 'verified' : 'pending'
        })

      if (dbError) throw dbError

      setStatusMessage('Thank you for your contribution! Your sign has been uploaded to IPFS.')
      setTimeout(() => setStatusMessage(''), 5000)
      setKeyword('')
      setRecordedBlob(null)
    } catch (error) {
      console.error('Error submitting contribution:', error)
      setStatusMessage(error instanceof Error ? error.message : 'Error submitting your contribution')
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
              
              {statusMessage && (
                <div className="mt-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {statusMessage}
                </div>
              )}
              
              {ipfsStatus.uploaded && (
                <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm">
                  <p className="font-semibold mb-1">Successfully uploaded to IPFS!</p>
                  <p className="text-xs mb-1">IPFS Hash: {ipfsStatus.hash.substring(0, 20)}...</p>
                  <a 
                    href={ipfsStatus.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline text-xs"
                  >
                    View on IPFS
                  </a>
                </div>
              )}
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
                  onRecordingComplete={(blob: Blob) => setRecordedBlob(blob)}
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