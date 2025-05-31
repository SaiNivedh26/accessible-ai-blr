'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase'
import { FaMicrophone, FaStop, FaTrash, FaSignLanguage } from 'react-icons/fa'
import { MdTextFields } from 'react-icons/md'

interface ConversionResult {
  text: string
  videoUrl: string | null
  isCustom: boolean
}

export default function ConvertPage() {
  const { user } = useAuth()
  const [inputMethod, setInputMethod] = useState<'text' | 'voice'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioFileName, setAudioFileName] = useState<string>('')
  const [text, setText] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    // Clear any existing recording first
    setAudioBlob(null)
    setAudioFileName('')
    setRecordingTime(0)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioFileName('recorded-audio.webm')
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please ensure you have granted permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      const tracks = mediaRecorderRef.current.stream.getTracks()
      tracks.forEach(track => track.stop())
      setIsRecording(false)
      setAudioBlob(null)
      setAudioFileName('')
      setRecordingTime(0)
    }
  }

  const handleConvert = async () => {
    if (!text && !audioBlob) {
      alert('Please enter text or provide audio first')
      return
    }

    setIsConverting(true)
    try {
      const supabase = createClient()
      let transcribedText = text

      if (audioBlob) {
        // Upload audio for transcription
        const audioFile = new File([audioBlob], audioFileName, {
          type: audioBlob.type
        })
        
        const { error: uploadError } = await supabase.storage
          .from('voice-inputs')
          .upload(`${user?.id}/${Date.now()}-${audioFileName}`, audioFile)

        if (uploadError) throw uploadError

        // TODO: Implement actual transcription service
        transcribedText = "Sample transcribed text" // This would be replaced with actual transcription
      }

      // TODO: Implement actual sign language conversion
      // For now, we'll simulate a conversion result
      setTimeout(() => {
        setConversionResult({
          text: transcribedText,
          videoUrl: null, // This would be the URL to the sign language video
          isCustom: false
        })
        setIsConverting(false)
      }, 2000)
    } catch (error) {
      console.error('Error during conversion:', error)
      alert('There was an error converting your input. Please try again.')
      setIsConverting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Convert to Sign Language
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Enter text or provide voice input to convert into sign language
            </p>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8">
            {/* Input Method Selector */}
            <div className="flex gap-4 mb-8">
              <Button
                variant={inputMethod === 'text' ? 'default' : 'outline'}
                onClick={() => setInputMethod('text')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <MdTextFields className="w-5 h-5" />
                Text Input
              </Button>
              <Button
                variant={inputMethod === 'voice' ? 'default' : 'outline'}
                onClick={() => setInputMethod('voice')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <FaMicrophone className="w-5 h-5" />
                Voice Input
              </Button>
            </div>

            {/* Text Input */}
            {inputMethod === 'text' && (
              <div className="space-y-4">
                <label htmlFor="text-input" className="sr-only">Enter text to convert</label>
                <textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to sign language..."
                  className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {/* Voice Input */}
            {inputMethod === 'voice' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                  {!isRecording && !audioBlob ? (
                    <Button
                      size="lg"
                      onClick={handleStartRecording}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                    >
                      <FaMicrophone className="w-5 h-5" />
                      Start Recording
                    </Button>
                  ) : isRecording ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse flex items-center justify-center">
                        <FaMicrophone className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xl font-mono">{formatTime(recordingTime)}</p>
                      <div className="flex gap-4">
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={handleCancelRecording}
                          className="flex items-center gap-2"
                        >
                          <FaTrash className="w-5 h-5" />
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={stopRecording}
                          className="flex items-center gap-2"
                        >
                          <FaStop className="w-5 h-5" />
                          Finish
                        </Button>
                      </div>
                    </div>
                  ) : audioBlob ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {audioFileName}
                      </p>
                      <audio
                        src={audioBlob ? URL.createObjectURL(audioBlob) : ''}
                        controls
                        className="w-full"
                        aria-label="Audio preview"
                      />
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAudioBlob(null)
                            setRecordingTime(0)
                            setAudioFileName('')
                          }}
                          className="flex items-center gap-2"
                        >
                          <FaTrash className="w-5 h-5" />
                          Delete
                        </Button>
                        <Button
                          onClick={handleStartRecording}
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          <FaMicrophone className="w-5 h-5" />
                          Record New
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Convert Button */}
            <div className="mt-8">
              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleConvert}
                disabled={isConverting || (!text && !audioBlob)}
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Converting...
                  </>
                ) : (
                  <>
                    <FaSignLanguage className="w-5 h-5" />
                    Convert to Sign Language
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Conversion Result */}
          {conversionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Conversion Result
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Text: {conversionResult.text}
                </p>
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                  {conversionResult.videoUrl ? (
                    <video
                      src={conversionResult.videoUrl}
                      controls
                      className="w-full h-full rounded-xl"
                      aria-label="Sign language translation"
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Sign language video will appear here
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
