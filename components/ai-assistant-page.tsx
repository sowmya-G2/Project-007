"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Send,
  Settings,
  Brain,
  Sparkles,
  Wand2,
} from "lucide-react"
import { useVoice } from "@/hooks/use-voice"

const AI_ASSISTANTS = [
  {
    id: "gpt-4",
    name: "Friday",
    description: "Your intelligent trading companion with advanced reasoning",
    personality: "Professional and analytical",
    responseTime: "~1.2s",
    icon: Brain,
  },
  {
    id: "groq-llama",
    name: "Velocity",
    description: "Lightning-fast responses for quick market insights",
    personality: "Quick and decisive",
    responseTime: "~0.3s",
    icon: Zap,
  },
  {
    id: "groq-mixtral",
    name: "Sage",
    description: "Balanced wisdom for comprehensive market analysis",
    personality: "Thoughtful and balanced",
    responseTime: "~0.4s",
    icon: Sparkles,
  },
  {
    id: "claude-3",
    name: "Oracle",
    description: "Deep reasoning for complex trading strategies",
    personality: "Insightful and thorough",
    responseTime: "~1.5s",
    icon: Wand2,
  },
  {
    id: "gpt-3.5",
    name: "Scout",
    description: "Efficient assistant for everyday trading tasks",
    personality: "Helpful and efficient",
    responseTime: "~0.8s",
    icon: Bot,
  },
  {
    id: "gemini-pro",
    name: "Navigator",
    description: "Multi-modal analysis with visual chart understanding",
    personality: "Visual and intuitive",
    responseTime: "~1.0s",
    icon: TrendingUp,
  },
]

interface AIAssistantPageProps {
  selectedAssistant?: string
  onAssistantChange?: (assistant: string) => void
}

export default function AIAssistantPage({
  selectedAssistant: propSelectedAssistant,
  onAssistantChange,
}: AIAssistantPageProps) {
  const [message, setMessage] = useState("")
  const [selectedAssistant, setSelectedAssistant] = useState(propSelectedAssistant || "gpt-4")
  const [voiceSpeed, setVoiceSpeed] = useState([1])
  const [voiceVolume, setVoiceVolume] = useState([0.8])
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [chatHistory, setChatHistory] = useState([
    {
      id: "1",
      type: "ai" as const,
      content: "Hello! I'm your AI trading assistant. How can I help you analyze the markets today?",
      timestamp: new Date(),
    },
  ])

  const { isListening, isSupported, transcript, toggleListening, speak, isSpeaking, toggleSpeaking } = useVoice()

  const getCurrentAssistant = () => {
    return AI_ASSISTANTS.find((a) => a.id === selectedAssistant) || AI_ASSISTANTS[0]
  }

  useEffect(() => {
    if (propSelectedAssistant && propSelectedAssistant !== selectedAssistant) {
      setSelectedAssistant(propSelectedAssistant)
      // Update chat history with new assistant greeting
      const newAssistant = AI_ASSISTANTS.find((a) => a.id === propSelectedAssistant) || AI_ASSISTANTS[0]
      setChatHistory([
        {
          id: "1",
          type: "ai" as const,
          content: `Hello! I'm ${newAssistant.name}, your AI trading assistant. How can I help you analyze the markets today?`,
          timestamp: new Date(),
        },
      ])
    }
  }, [propSelectedAssistant, selectedAssistant])

  const quickActions = [
    {
      id: "analyze",
      label: "Analyze Portfolio",
      icon: BarChart3,
      action: "Analyze my current portfolio performance and suggest optimizations",
    },
    {
      id: "market",
      label: "Market Summary",
      icon: TrendingUp,
      action: "Give me a comprehensive market summary with key movers",
    },
    { id: "signals", label: "Trading Signals", icon: Zap, action: "Show me current trading signals and entry points" },
    {
      id: "news",
      label: "Market News",
      icon: MessageSquare,
      action: "What's the latest market news affecting my positions?",
    },
    { id: "risk", label: "Risk Analysis", icon: Bot, action: "Perform a risk analysis of my current positions" },
    {
      id: "opportunities",
      label: "Find Opportunities",
      icon: Sparkles,
      action: "Identify new trading opportunities in the current market",
    },
  ]

  useEffect(() => {
    if (autoSpeak && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1]
      if (lastMessage.type === "ai") {
        speak(lastMessage.content, { rate: voiceSpeed[0], volume: voiceVolume[0] })
      }
    }
  }, [chatHistory, autoSpeak, speak, voiceSpeed, voiceVolume])

  useEffect(() => {
    if (transcript && !isListening && transcript.trim()) {
      handleSendMessage(transcript)
    }
  }, [isListening, transcript])

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content,
      timestamp: new Date(),
    }

    setChatHistory((prev) => [...prev, userMessage])

    setTimeout(() => {
      const currentAssistant = getCurrentAssistant()
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "ai" as const,
        content: `I understand you want to ${content.toLowerCase()}. Let me analyze that for you using my ${currentAssistant.personality.toLowerCase()} approach...`,
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, aiResponse])
    }, 1000)

    setMessage("")
  }

  const handleQuickAction = (action: string) => {
    handleSendMessage(action)
  }

  const handleAssistantChange = (assistantId: string) => {
    setSelectedAssistant(assistantId)
    if (onAssistantChange) {
      const assistant = AI_ASSISTANTS.find((a) => a.id === assistantId)
      onAssistantChange(assistant?.name || assistantId)
    }

    // Update chat history with new assistant greeting
    const newAssistant = AI_ASSISTANTS.find((a) => a.id === assistantId) || AI_ASSISTANTS[0]
    setChatHistory([
      {
        id: "1",
        type: "ai" as const,
        content: `Hello! I'm ${newAssistant.name}, your AI trading assistant. How can I help you analyze the markets today?`,
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{getCurrentAssistant().name}</h1>
          <p className="text-gray-400">Get intelligent trading insights with {getCurrentAssistant().name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Settings className="h-4 w-4" />
            <span>Assistant:</span>
          </div>
          <Select value={selectedAssistant} onValueChange={handleAssistantChange}>
            <SelectTrigger className="w-56 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {AI_ASSISTANTS.map((assistant) => {
                const Icon = assistant.icon
                return (
                  <SelectItem key={assistant.id} value={assistant.id} className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{assistant.name}</span>
                        <span className="text-xs text-gray-400">{assistant.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                {getCurrentAssistant().icon({ className: "h-5 w-5 text-purple-400" })}
                {getCurrentAssistant().name} Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 mb-4">
                <div className="space-y-4">
                  {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.type === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Ask ${getCurrentAssistant().name} anything about trading...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white resize-none"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(message)
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleSendMessage(message)}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleListening}
                    disabled={!isSupported}
                    className={`border-gray-600 ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        : "text-white hover:bg-gray-700 bg-transparent"
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? "Listening..." : "Voice Input"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`border-gray-600 ${
                      autoSpeak
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "text-white hover:bg-gray-700 bg-transparent"
                    }`}
                  >
                    {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Auto-Speak
                  </Button>
                  {transcript && (
                    <Badge variant="outline" className="text-xs max-w-xs truncate">
                      {isListening ? "Listening: " : "Heard: "}
                      {transcript}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mic className="h-5 w-5 text-green-400" />
                Voice Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all ${
                      isListening ? "bg-red-600 animate-pulse scale-110" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    {isListening ? "Listening for your command..." : "Click to start voice input"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Speech Speed</label>
                    <Slider
                      value={voiceSpeed}
                      onValueChange={setVoiceSpeed}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Slow</span>
                      <span>{voiceSpeed[0]}x</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Volume</label>
                    <Slider
                      value={voiceVolume}
                      onValueChange={setVoiceVolume}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Quiet</span>
                      <span>{Math.round(voiceVolume[0] * 100)}%</span>
                      <span>Loud</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={toggleListening}
                  disabled={!isSupported}
                  className={`w-full ${
                    isListening ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isListening ? "Stop Listening" : "Start Voice Input"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="w-full justify-start border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                {getCurrentAssistant().icon({ className: "h-5 w-5 text-purple-400" })}
                {getCurrentAssistant().name} Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Status</span>
                  <Badge variant="default" className="bg-green-600">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Personality</span>
                  <span className="text-sm text-white">{getCurrentAssistant().personality}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Response Time</span>
                  <span className="text-sm text-white">{getCurrentAssistant().responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Voice Support</span>
                  <Badge variant={isSupported ? "default" : "destructive"}>
                    {isSupported ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Auto-Speak</span>
                  <Badge variant={autoSpeak ? "default" : "secondary"}>{autoSpeak ? "On" : "Off"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
