'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// Web Speech API type declarations
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

interface UseVoiceSearchReturn {
  /** Whether speech recognition is currently active */
  isListening: boolean
  /** Whether the Web Speech API is supported in the current browser */
  isSupported: boolean
  /** Start listening and return a Promise that resolves with the transcribed text */
  startListening: () => Promise<string>
  /** Manually stop listening */
  stopListening: () => void
}

const STORAGE_KEY = 'sb_search_history'

/**
 * Custom hook for Web Speech API voice search.
 * Provides a clean interface for starting/stopping speech recognition
 * and returns transcribed text via a Promise.
 */
export function useVoiceSearch(): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const resolveRef = useRef<((text: string) => void) | null>(null)
  const rejectRef = useRef<((error: Error) => void) | null>(null)
  const finalTranscriptRef = useRef<string>('')

  // Detect browser support
  const isSupported = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  const createRecognition = useCallback((): SpeechRecognitionInstance => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      throw new Error('Speech recognition is not supported in this browser')
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      finalTranscriptRef.current = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      // If we have a final transcript and recognition will end, resolve
      // The actual resolution happens in onend
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false)
      recognitionRef.current = null

      if (event.error === 'no-speech') {
        // No speech detected - this is not a critical error
        if (rejectRef.current) {
          rejectRef.current(new Error('No speech detected. Please try again.'))
          rejectRef.current = null
        }
        resolveRef.current = null
      } else if (event.error === 'not-allowed') {
        if (rejectRef.current) {
          rejectRef.current(new Error('Microphone access denied. Please allow microphone permissions.'))
          rejectRef.current = null
        }
        resolveRef.current = null
      } else {
        if (rejectRef.current) {
          rejectRef.current(new Error(`Speech recognition error: ${event.error}`))
          rejectRef.current = null
        }
        resolveRef.current = null
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null

      const transcript = finalTranscriptRef.current.trim()
      if (resolveRef.current) {
        if (transcript) {
          resolveRef.current(transcript)
        } else {
          rejectRef.current?.(new Error('No speech detected. Please try again.'))
        }
        resolveRef.current = null
        rejectRef.current = null
      }
    }

    return recognition
  }, [])

  const startListening = useCallback((): Promise<string> => {
    if (!isSupported) {
      return Promise.reject(new Error('Speech recognition is not supported in this browser'))
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    finalTranscriptRef.current = ''

    return new Promise<string>((resolve, reject) => {
      resolveRef.current = resolve
      rejectRef.current = reject

      try {
        const recognition = createRecognition()
        recognitionRef.current = recognition
        recognition.start()
      } catch (err) {
        setIsListening(false)
        recognitionRef.current = null
        resolveRef.current = null
        rejectRef.current = null
        reject(new Error('Failed to start speech recognition'))
      }
    })
  }, [isSupported, createRecognition])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      // Don't null it out - onend handler will resolve the promise
    }
  }, [])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  }
}