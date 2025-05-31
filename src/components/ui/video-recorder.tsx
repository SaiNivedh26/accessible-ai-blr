'use client'

import React, { useRef, useState } from 'react'
import { Button } from './button'
import { FaVideo, FaStop, FaUndo } from 'react-icons/fa'

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void
}

export function VideoRecorder({ onRecordingComplete }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false // No audio since it's for sign language
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        onRecordingComplete(blob)
        stopStream()
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please ensure you have granted permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const resetRecording = () => {
    setPreviewUrl(null)
    setIsRecording(false)
    if (streamRef.current) {
      stopStream()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full max-w-2xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          src={previewUrl || undefined}
        />
      </div>

      <div className="flex justify-center gap-4">
        {!isRecording && !previewUrl && (
          <Button
            onClick={startRecording}
            className="flex items-center gap-2"
            size="lg"
          >
            <FaVideo className="w-5 h-5" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center gap-2"
            size="lg"
          >
            <FaStop className="w-5 h-5" />
            Stop Recording
          </Button>
        )}

        {previewUrl && (
          <Button
            onClick={resetRecording}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <FaUndo className="w-5 h-5" />
            Record Again
          </Button>
        )}
      </div>
    </div>
  )
}
