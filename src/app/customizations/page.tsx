'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase'
import { VideoRecorder } from '@/components/ui/video-recorder'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FaPlay, FaTrash, FaSearch, FaDownload, FaExternalLinkAlt } from 'react-icons/fa'
import { 
  searchByWord, 
  searchByPartialMatch, 
  searchAndUploadSign, 
  listAllVideos, 
  downloadVideo,
  PinataVideo
} from '@/lib/pinata'

interface CustomSign {
  id: string
  user_id: string
  word: string
  video_path: string
  region: string
  created_at: string
  ipfs_hash?: string
  pinata_url?: string
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
  const [searchResults, setSearchResults] = useState<PinataVideo[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    async function fetchCustomSigns() {
      if (user) {
        setIsLoadingCustomSigns(true)
        const supabase = createClient()
        const { data, error } = await supabase
          .from('custom_signs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setCustomSigns(data)
        } else if (error) {
          console.error('Error fetching custom signs:', error)
          setStatusMessage('Failed to load your custom signs')
        }
        setIsLoadingCustomSigns(false)
      }
    }

    fetchCustomSigns()
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    if (!recordedBlob || !word.trim() || !region.trim()) {
      setStatusMessage('Please fill in all fields and record a video')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Uploading your sign to IPFS...')
    
    try {
      // First upload to Pinata
      const pinataResult = await searchAndUploadSign(word, region, recordedBlob);
      
      if (!pinataResult.success) {
        throw new Error(pinataResult.error || 'Failed to upload to Pinata');
      }
      
      setStatusMessage('Processing with AI model...')
      
      // Now also send to Flask endpoint for processing
      const formData = new FormData()
      formData.append('video', recordedBlob, 'custom-sign.webm')
      formData.append('word', word.trim())
      formData.append('region', region.trim())
      formData.append('userId', user.id)
      formData.append('ipfsHash', pinataResult.ipfsHash || '')

      // Try Flask processing, but don't block if it fails
      try {
        const flaskResponse = await fetch('http://localhost:5000/process-video', {
          method: 'POST',
          body: formData,
        })
        
        if (!flaskResponse.ok) {
          console.warn('Flask processing failed, but continuing with Pinata upload');
        }
      } catch (flaskError) {
        console.warn('Flask server unavailable, continuing with Pinata upload only');
      }

      setStatusMessage('Saving to your account...')
      const supabase = createClient()
      
      // Upload video to Supabase Storage as backup
      const videoFile = new File([recordedBlob], 'custom-sign.webm', {
        type: 'video/webm'
      })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('custom-signs')
        .upload(`${user.id}/${Date.now()}-${word}.webm`, videoFile)

      if (uploadError) throw uploadError

      // Save customization metadata to database with IPFS data
      const { data, error: dbError } = await supabase
        .from('custom_signs')
        .insert({
          user_id: user.id,
          word: word.toLowerCase().trim(),
          region: region.trim(),
          video_path: uploadData.path,
          ipfs_hash: pinataResult.ipfsHash,
          pinata_url: pinataResult.url
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update local state
      if (data) {
        setCustomSigns([data, ...customSigns])
      }

      setStatusMessage('Custom sign saved successfully and uploaded to IPFS!')
      setTimeout(() => setStatusMessage(''), 5000)
      
      setWord('')
      setRegion('')
      setRecordedBlob(null)
    } catch (error) {
      console.error('Error saving custom sign:', error)
      setStatusMessage(error instanceof Error ? error.message : 'Error saving custom sign')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setStatusMessage('Please enter a search term')
      return
    }

    setIsSearching(true)
    setStatusMessage(`Searching IPFS for "${searchQuery}"...`)
    
    try {
      // First try exact match
      const exactMatches = await searchByWord(searchQuery);
      
      // If no exact matches, try partial match
      if (exactMatches.length === 0) {
        setStatusMessage(`No exact matches found, trying partial matches for "${searchQuery}"...`)
        const partialMatches = await searchByPartialMatch(searchQuery);
        setSearchResults(partialMatches);
        
        if (partialMatches.length === 0) {
          setStatusMessage(`No signs found for "${searchQuery}". Try a different term or record your own.`)
        } else {
          setStatusMessage(`Found ${partialMatches.length} signs matching "${searchQuery}"`)
        }
      } else {
        setSearchResults(exactMatches);
        setStatusMessage(`Found ${exactMatches.length} exact matches for "${searchQuery}"`)
      }
    } catch (error) {
      console.error('Search error:', error);
      setStatusMessage('Error searching for signs')
    } finally {
      setIsSearching(false);
    }
  };

  // Display all videos for testing/demo
  const handleListAll = async () => {
    setIsSearching(true);
    setStatusMessage('Fetching all available signs from IPFS...')
    
    try {
      const allVideos = await listAllVideos();
      setSearchResults(allVideos);
      
      if (allVideos.length === 0) {
        setStatusMessage('No signs found in the IPFS network.')
      } else {
        setStatusMessage(`Found ${allVideos.length} signs in the IPFS network.`)
      }
    } catch (error) {
      console.error('Error listing all videos:', error);
      setStatusMessage('Error fetching signs from IPFS')
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleDownload = async (video: PinataVideo) => {
    setIsDownloading(true);
    setStatusMessage(`Downloading "${video.name}"...`);
    
    try {
      const result = await downloadVideo(video);
      if (result.success) {
        setStatusMessage(`Successfully downloaded "${video.name}"`)
      } else {
        setStatusMessage(`Failed to download "${video.name}": ${result.error}`)
      }
    } catch (error) {
      console.error('Download error:', error);
      setStatusMessage('Error downloading video')
    } finally {
      setIsDownloading(false);
    }
  };

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
        setStatusMessage('Custom sign deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting custom sign:', error)
      setStatusMessage('There was an error deleting the custom sign.')
    }
  }

  const handleUseExistingSign = (video: PinataVideo) => {
    if (!user) return;
    
    // Pre-fill the form with the video data
    setWord(video.key);
    setRegion('IPFS');
    setStatusMessage(`Selected "${video.name}" - You can re-record or customize it`);
    
    // Scroll to recording section
    document.getElementById('record-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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
                Create your own regional variations of signs or find existing signs in the IPFS network.
              </p>
              
              {statusMessage && (
                <div className="mt-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Pinata Search Feature */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Search Existing Signs on IPFS
              </h2>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for existing signs..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="flex items-center gap-2"
                  >
                    <FaSearch className="w-4 h-4" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button 
                    onClick={handleListAll}
                    disabled={isSearching}
                    variant="outline"
                  >
                    List All
                  </Button>
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Results ({searchResults.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((result, index) => (
                      <div 
                        key={index}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                      >
                        <h4 className="font-medium">{result.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Key: {result.key}
                        </p>
                        
                        {/* Mini player */}
                        {result.url && (
                          <div className="relative rounded-md overflow-hidden bg-black aspect-video mb-3">
                            <video 
                              className="w-full h-full object-contain" 
                              src={result.url}
                              controls
                              preload="metadata"
                            />
                          </div>
                        )}
                        
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(result)}
                            disabled={isDownloading}
                            title="Download this sign"
                          >
                            <FaDownload className="mr-1 h-3 w-3" />
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUseExistingSign(result)}
                            title="Use this sign as a starting point"
                          >
                            Use
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                            title="View in IPFS gateway"
                          >
                            <FaExternalLinkAlt className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" id="record-section">
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
                  onRecordingComplete={(blob: Blob) => setRecordedBlob(blob)}
                />

                <div className="mt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !recordedBlob}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? 'Saving & Uploading to IPFS...' : 'Save Custom Sign'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                My Custom Signs ({customSigns.length})
              </h2>
              
              {customSigns.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    You haven't created any custom signs yet. 
                    Record your first sign above or search for existing signs on IPFS.
                  </p>
                </div>
              ) : (
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
                          {sign.ipfs_hash && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              IPFS: {sign.ipfs_hash.substring(0, 12)}...
                            </p>
                          )}
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
                        src={sign.pinata_url || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/custom-signs/${sign.video_path}`}
                        controls
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
