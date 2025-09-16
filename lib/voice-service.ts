export interface VoiceSettings {
  language: string
  voice?: string
  rate: number
  pitch: number
  volume: number
}

export class VoiceService {
  private recognition: any | null = null
  private synthesis: SpeechSynthesis
  private isSupported: boolean
  private settings: VoiceSettings

  constructor() {
    this.synthesis = window.speechSynthesis
    this.isSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    this.settings = {
      language: "en-US",
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
    }

    if (this.isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.setupRecognition()
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = this.settings.language
    this.recognition.maxAlternatives = 1
  }

  // Speech Recognition
  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
    onStart?: () => void,
    onEnd?: () => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.recognition) {
        const error = "Speech recognition not supported"
        onError?.(error)
        reject(new Error(error))
        return
      }

      this.recognition.onstart = () => {
        onStart?.()
        resolve()
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        onResult(transcript)
      }

      this.recognition.onerror = (event) => {
        const error = `Speech recognition error: ${event.error}`
        onError?.(error)
        reject(new Error(error))
      }

      this.recognition.onend = () => {
        onEnd?.()
      }

      try {
        this.recognition.start()
      } catch (error) {
        const errorMsg = "Failed to start speech recognition"
        onError?.(errorMsg)
        reject(new Error(errorMsg))
      }
    })
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  // Text-to-Speech
  speak(text: string, onStart?: () => void, onEnd?: () => void, onError?: (error: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        const error = "Speech synthesis not supported"
        onError?.(error)
        reject(new Error(error))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = this.settings.language
      utterance.rate = this.settings.rate
      utterance.pitch = this.settings.pitch
      utterance.volume = this.settings.volume

      // Get available voices and set preferred voice
      const voices = this.synthesis.getVoices()
      if (voices.length > 0) {
        // Try to find a good English voice
        const preferredVoice =
          voices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Google")) ||
          voices.find((voice) => voice.lang.startsWith("en")) ||
          voices[0]

        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        onStart?.()
      }

      utterance.onend = () => {
        onEnd?.()
        resolve()
      }

      utterance.onerror = (event) => {
        const error = `Speech synthesis error: ${event.error}`
        onError?.(error)
        reject(new Error(error))
      }

      this.synthesis.speak(utterance)
    })
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  // Utility methods
  isVoiceSupported(): boolean {
    return this.isSupported && !!this.synthesis
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : []
  }

  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings }
    if (this.recognition) {
      this.recognition.lang = this.settings.language
    }
  }

  // Trading-specific voice commands
  parseVoiceCommand(transcript: string): { action: string; params?: any } | null {
    const lowerTranscript = transcript.toLowerCase().trim()

    // Trading commands
    if (lowerTranscript.includes("buy") || lowerTranscript.includes("purchase")) {
      const symbolMatch = lowerTranscript.match(/(?:buy|purchase)\s+(\w+)/i)
      return {
        action: "buy",
        params: { symbol: symbolMatch?.[1]?.toUpperCase() },
      }
    }

    if (lowerTranscript.includes("sell")) {
      const symbolMatch = lowerTranscript.match(/sell\s+(\w+)/i)
      return {
        action: "sell",
        params: { symbol: symbolMatch?.[1]?.toUpperCase() },
      }
    }

    // Analysis commands
    if (lowerTranscript.includes("analyze") || lowerTranscript.includes("analysis")) {
      const symbolMatch = lowerTranscript.match(/(?:analyze|analysis)\s+(\w+)/i)
      return {
        action: "analyze",
        params: { symbol: symbolMatch?.[1]?.toUpperCase() },
      }
    }

    // Learning commands
    if (lowerTranscript.includes("learn") || lowerTranscript.includes("teach")) {
      return { action: "learn" }
    }

    // Market commands
    if (lowerTranscript.includes("market") && lowerTranscript.includes("trend")) {
      return { action: "market_trends" }
    }

    // Portfolio commands
    if (lowerTranscript.includes("portfolio") || lowerTranscript.includes("positions")) {
      return { action: "portfolio" }
    }

    // General chat
    return { action: "chat", params: { message: transcript } }
  }
}

// Global voice service instance
export const voiceService = new VoiceService()

// Type declarations for Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
