"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { voiceService } from "@/lib/voice-service"

export interface UseVoiceOptions {
  onTranscript?: (transcript: string) => void
  onError?: (error: string) => void
  autoSpeak?: boolean
  language?: string
}

export function useVoice(options: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>("")

  const listeningRef = useRef(false)
  const speakingRef = useRef(false)

  useEffect(() => {
    setIsSupported(voiceService.isVoiceSupported())
  }, [])

  const startListening = useCallback(async () => {
    if (!isSupported || listeningRef.current) return

    try {
      setError(null)
      listeningRef.current = true

      await voiceService.startListening(
        (transcript) => {
          setTranscript(transcript)
          options.onTranscript?.(transcript)
          listeningRef.current = false
          setIsListening(false)
        },
        (error) => {
          setError(error)
          options.onError?.(error)
          listeningRef.current = false
          setIsListening(false)
        },
        () => {
          setIsListening(true)
        },
        () => {
          listeningRef.current = false
          setIsListening(false)
        },
      )
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setError(errorMsg)
      options.onError?.(errorMsg)
      listeningRef.current = false
      setIsListening(false)
    }
  }, [isSupported, options])

  const stopListening = useCallback(() => {
    if (listeningRef.current) {
      voiceService.stopListening()
      listeningRef.current = false
      setIsListening(false)
    }
  }, [])

  const speak = useCallback(
    async (text: string) => {
      if (!isSupported || speakingRef.current) return

      try {
        setError(null)
        speakingRef.current = true

        await voiceService.speak(
          text,
          () => {
            setIsSpeaking(true)
          },
          () => {
            speakingRef.current = false
            setIsSpeaking(false)
          },
          (error) => {
            setError(error)
            options.onError?.(error)
            speakingRef.current = false
            setIsSpeaking(false)
          },
        )
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        setError(errorMsg)
        options.onError?.(errorMsg)
        speakingRef.current = false
        setIsSpeaking(false)
      }
    },
    [isSupported, options],
  )

  const stopSpeaking = useCallback(() => {
    if (speakingRef.current) {
      voiceService.stopSpeaking()
      speakingRef.current = false
      setIsSpeaking(false)
    }
  }, [])

  const parseCommand = useCallback((transcript: string) => {
    return voiceService.parseVoiceCommand(transcript)
  }, [])

  return {
    isListening,
    isSpeaking,
    isSupported,
    error,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    parseCommand,
  }
}
