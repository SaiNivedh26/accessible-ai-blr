'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FaVideo, FaStop, FaRedo, FaPlay, FaCheck } from 'react-icons/fa';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxLength?: number; // in seconds
}

export function VideoRecorder({ 
  onRecordingComplete, 
  maxLength = 30 
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const startRecording = async () => {
    try {
      setError(null);
      chunksRef.current = [];
      
      // Reset the preview if it exists
      if (isPreviewAvailable) {
        setIsPreviewAvailable(false);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = '';
        }
      }
      
      // Get user media
      const constraints = { audio: true, video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Set the stream as the video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available event
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        // Create blob and set as video source
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Stop the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Set preview
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
          videoRef.current.muted = false;
        }
        
        setIsPreviewAvailable(true);
        onRecordingComplete(blob);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const intervalId = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxLength - 1) {
            stopRecording();
            return maxLength;
          }
          return prev + 1;
        });
      }, 1000);
      
      setTimer(intervalId);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please ensure you have granted the necessary permissions.');
    }
  };

  const stopRecording = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    setIsPreviewAvailable(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-md h-64 bg-gray-900 rounded-lg overflow-hidden relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900 p-4">
            <p className="text-red-700 dark:text-red-200 text-center">{error}</p>
          </div>
        )}
        
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
        />
        
        {isRecording && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded-md flex items-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
            {formatTime(recordingTime)} / {formatTime(maxLength)}
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        {!isRecording && !isPreviewAvailable && (
          <Button 
            onClick={startRecording}
            className="flex items-center space-x-2"
          >
            <FaVideo className="mr-1" /> Start Recording
          </Button>
        )}
        
        {isRecording && (
          <Button 
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <FaStop className="mr-1" /> Stop Recording
          </Button>
        )}
        
        {isPreviewAvailable && (
          <>
            <Button 
              onClick={resetRecording}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FaRedo className="mr-1" /> Re-record
            </Button>
            <Button 
              onClick={() => videoRef.current?.play()}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <FaPlay className="mr-1" /> Play
            </Button>
          </>
        )}
      </div>
      
      {isPreviewAvailable && (
        <p className="text-green-600 dark:text-green-400 flex items-center">
          <FaCheck className="mr-1" /> Recording complete! You can submit or re-record.
        </p>
      )}
    </div>
  );
}