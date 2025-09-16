"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Volume2, VolumeX, Headphones } from "lucide-react"
import { useVoice } from "@/hooks/use-voice"

interface VoiceControlsProps {
  onVoiceInput?: (transcript: string) => void
  onVoiceCommand?: (command: { action: string; params?: any }) => void
  autoSpeak?: boolean
  className?: string
}

export default function VoiceControls({
  onVoiceInput,
  onVoiceCommand,
  autoSpeak = false,
  className = "",
}: VoiceControlsProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  const {
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
  } = useVoice({
    onTranscript: (transcript) => {
      setShowTranscript(true)
      onVoiceInput?.(transcript)

      // Parse voice command
      const command = parseCommand(transcript)
      if (command) {
        onVoiceCommand?.(command)
      }

      // Hide transcript after 3 seconds
      setTimeout(() => setShowTranscript(false), 3000)
    },
    onError: (error) => {
      console.error("Voice error:", error)
    },
    autoSpeak,
  })

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking()
    }
  }

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button variant="outline" size="icon" disabled className="border-white/20 text-white/40 bg-transparent">
          <MicOff className="h-4 w-4" />
        </Button>
        <span className="text-xs text-white/40">Voice not supported</span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Microphone Button */}
        <Button
          onClick={toggleListening}
          variant="outline"
          size="icon"
          className={`border-white/20 transition-all ${
            isListening ? "bg-red-600 text-white border-red-400 animate-pulse" : "text-white hover:bg-white/10"
          }`}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        {/* Speaker Button */}
        <Button
          onClick={toggleSpeaking}
          variant="outline"
          size="icon"
          className={`border-white/20 transition-all ${
            isSpeaking ? "bg-blue-600 text-white border-blue-400" : "text-white hover:bg-white/10"
          }`}
        >
          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        {/* Status Indicators */}
        <div className="flex gap-1">
          {isListening && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              <Headphones className="h-3 w-3 mr-1" />
              Listening
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="default" className="text-xs">
              <Volume2 className="h-3 w-3 mr-1" />
              Speaking
            </Badge>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {showTranscript && transcript && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Mic className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/60 mb-1">You said:</p>
                <p className="text-sm text-white">{transcript}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-3">
            <p className="text-xs text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Voice Commands Help */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-3">
          <p className="text-xs text-white/60 mb-2">Voice Commands:</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-white/80">
            <div>"Buy AAPL"</div>
            <div>"Sell TSLA"</div>
            <div>"Analyze GOOGL"</div>
            <div>"Market trends"</div>
            <div>"Learn trading"</div>
            <div>"Show portfolio"</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
