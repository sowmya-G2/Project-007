"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bot,
  Zap,
  Brain,
  Sparkles,
  Wand2,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Settings,
  Cpu,
  Edit3,
} from "lucide-react"

interface AIAssistant {
  id: string
  name: string
  description: string
  personality: string
  strengths: string[]
  icon: React.ComponentType<any>
  color: string
  responseTime: string
  type: "prebuilt" | "active"
  customName?: string // Added customName field for user-defined names
}

const PREBUILT_ASSISTANTS: AIAssistant[] = [
  {
    id: "gpt-4",
    name: "Friday",
    description: "Your intelligent trading companion with advanced reasoning capabilities",
    personality: "Professional, analytical, and detail-oriented",
    strengths: ["Complex analysis", "Risk assessment", "Strategic planning"],
    icon: Brain,
    color: "bg-blue-500",
    responseTime: "~1.2s",
    type: "prebuilt",
  },
  {
    id: "groq-llama",
    name: "Velocity",
    description: "Lightning-fast responses for quick trading decisions",
    personality: "Quick, decisive, and action-oriented",
    strengths: ["Rapid analysis", "Real-time alerts", "Quick decisions"],
    icon: Zap,
    color: "bg-yellow-500",
    responseTime: "~0.3s",
    type: "prebuilt",
  },
  {
    id: "claude-3",
    name: "Oracle",
    description: "Deep market insights with sophisticated reasoning",
    personality: "Wise, thoughtful, and comprehensive",
    strengths: ["Market prediction", "Deep analysis", "Long-term strategy"],
    icon: Wand2,
    color: "bg-purple-500",
    responseTime: "~1.5s",
    type: "prebuilt",
  },
  {
    id: "groq-mixtral",
    name: "Sage",
    description: "Balanced wisdom for comprehensive market analysis",
    personality: "Thoughtful and balanced",
    strengths: ["Balanced insights", "Multi-perspective analysis", "Comprehensive reports"],
    icon: Sparkles,
    color: "bg-pink-500",
    responseTime: "~0.4s",
    type: "prebuilt",
  },
  {
    id: "gpt-3.5",
    name: "Scout",
    description: "Efficient assistant for everyday trading tasks",
    personality: "Helpful and efficient",
    strengths: ["Task automation", "Quick responses", "Daily operations"],
    icon: Bot,
    color: "bg-green-500",
    responseTime: "~0.8s",
    type: "prebuilt",
  },
  {
    id: "gemini-pro",
    name: "Navigator",
    description: "Multi-modal analysis with visual chart understanding",
    personality: "Visual and intuitive",
    strengths: ["Chart analysis", "Visual insights", "Pattern recognition"],
    icon: TrendingUp,
    color: "bg-indigo-500",
    responseTime: "~1.0s",
    type: "prebuilt",
  },
]

const ACTIVE_AI: AIAssistant = {
  id: "active-ai",
  name: "Active AI",
  description: "Train your own personalized AI assistant tailored to your trading style",
  personality: "Adaptive and personalized to your preferences",
  strengths: ["Custom training", "Personal adaptation", "Unique insights"],
  icon: Cpu,
  color: "bg-gradient-to-r from-orange-500 to-red-500",
  responseTime: "Variable",
  type: "active",
}

interface AIOnboardingFlowProps {
  onComplete: (assistant: AIAssistant) => void
  onSkip: () => void
}

export default function AIOnboardingFlow({ onComplete, onSkip }: AIOnboardingFlowProps) {
  const [step, setStep] = useState<"selection" | "naming" | "confirmation">("selection")
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistant | null>(null)
  const [customName, setCustomName] = useState("")
  const [nameError, setNameError] = useState("")

  const allAssistants = [...PREBUILT_ASSISTANTS, ACTIVE_AI]

  const handleSelect = (assistant: AIAssistant) => {
    setSelectedAssistant(assistant)
  }

  const handleNext = () => {
    if (selectedAssistant) {
      if (selectedAssistant.type === "active") {
        setStep("naming")
      } else {
        setStep("confirmation")
      }
    }
  }

  const handleBack = () => {
    if (step === "naming") {
      setStep("selection")
    } else if (step === "confirmation") {
      if (selectedAssistant?.type === "active") {
        setStep("naming")
      } else {
        setStep("selection")
      }
    }
  }

  const handleNamingNext = () => {
    if (!customName.trim()) {
      setNameError("Please enter a name for your AI assistant")
      return
    }
    if (customName.trim().length < 2) {
      setNameError("Name must be at least 2 characters long")
      return
    }
    if (customName.trim().length > 20) {
      setNameError("Name must be 20 characters or less")
      return
    }
    setNameError("")
    setStep("confirmation")
  }

  const handleConfirm = () => {
    if (selectedAssistant) {
      const assistantToSave =
        selectedAssistant.type === "active" && customName.trim()
          ? { ...selectedAssistant, name: customName.trim(), customName: customName.trim() }
          : selectedAssistant
      onComplete(assistantToSave)
    }
  }

  const handleChange = () => {
    setStep("selection")
  }

  if (step === "naming") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Name Your AI Assistant</h1>
            <p className="text-gray-400 text-lg">Give your custom AI assistant a unique name</p>
          </div>

          {selectedAssistant && (
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader className="text-center">
                <div
                  className={`w-20 h-20 ${selectedAssistant.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <selectedAssistant.icon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-white text-2xl flex items-center justify-center gap-2">
                  <Edit3 className="h-6 w-6 text-orange-400" />
                  Custom AI Assistant
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Choose a name that reflects your assistant's personality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="assistant-name" className="text-white text-sm font-medium">
                    Assistant Name
                  </Label>
                  <Input
                    id="assistant-name"
                    type="text"
                    placeholder="e.g., Alex, Phoenix, Quantum, etc."
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value)
                      setNameError("")
                    }}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                    maxLength={20}
                  />
                  {nameError && <p className="text-red-400 text-sm">{nameError}</p>}
                  <p className="text-gray-500 text-xs">{customName.length}/20 characters</p>
                </div>

                <Alert className="bg-blue-900/20 border-blue-500/50">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200 text-sm">
                    <strong>Tip:</strong> Choose a name that's easy to remember and reflects how you want your AI to
                    feel - professional, friendly, or creative. This name will appear throughout your trading interface.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <Button onClick={handleNamingNext} className="bg-orange-600 hover:bg-orange-700 text-white">
              Continue with "{customName || "Custom AI"}"
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "confirmation") {
    const displayName =
      selectedAssistant?.type === "active" && customName.trim() ? customName.trim() : selectedAssistant?.name

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Confirm Your AI Assistant</h1>
            <p className="text-gray-400 text-lg">Review your selection before proceeding</p>
          </div>

          {selectedAssistant && (
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader className="text-center">
                <div
                  className={`w-20 h-20 ${selectedAssistant.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <selectedAssistant.icon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-white text-2xl">{displayName}</CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  {selectedAssistant.type === "active" && customName.trim()
                    ? "Your personalized AI trading assistant"
                    : selectedAssistant.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Personality</p>
                    <p className="text-sm text-gray-300">{selectedAssistant.personality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Response Time</p>
                    <p className="text-sm text-gray-300">{selectedAssistant.responseTime}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Key Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssistant.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Alert className="bg-orange-900/20 border-orange-500/50 mb-6">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-200">
              <strong>Important:</strong> Once you select an AI assistant, this choice cannot be changed. Your assistant
              will be permanently linked to your account and will learn from your interactions.
              {selectedAssistant?.type === "active" && (
                <span className="block mt-2">
                  <strong>Active AI Note:</strong> This option requires additional setup time and will need training
                  data to become effective.
                </span>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Change Selection
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm {displayName}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your AI Trading Assistant</h1>
          <p className="text-gray-400 text-lg">Select from our prebuilt assistants or train your own</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            Prebuilt AI Assistants
          </h2>
          <p className="text-gray-400 mb-6">Ready-to-use AI assistants with specialized trading expertise</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {PREBUILT_ASSISTANTS.map((assistant) => {
              const Icon = assistant.icon
              const isSelected = selectedAssistant?.id === assistant.id

              return (
                <Card
                  key={assistant.id}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "bg-gray-700 border-blue-500 border-2 shadow-lg shadow-blue-500/20"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                  }`}
                  onClick={() => handleSelect(assistant)}
                >
                  <CardHeader className="text-center">
                    <div
                      className={`w-16 h-16 ${assistant.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white flex items-center justify-center gap-2">
                      {assistant.name}
                      {isSelected && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    </CardTitle>
                    <CardDescription className="text-gray-400">{assistant.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Personality</p>
                      <p className="text-sm text-gray-300">{assistant.personality}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {assistant.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Response Time</span>
                      <span className="text-gray-300">{assistant.responseTime}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-400" />
            Custom AI Assistant
          </h2>
          <p className="text-gray-400 mb-6">
            Train your own AI assistant tailored to your specific trading style and preferences
          </p>

          <div className="max-w-md mx-auto">
            <Card
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedAssistant?.id === ACTIVE_AI.id
                  ? "bg-gray-700 border-orange-500 border-2 shadow-lg shadow-orange-500/20"
                  : "bg-gray-800 border-gray-700 hover:bg-gray-750"
              }`}
              onClick={() => handleSelect(ACTIVE_AI)}
            >
              <CardHeader className="text-center">
                <div
                  className={`w-16 h-16 ${ACTIVE_AI.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                >
                  <ACTIVE_AI.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white flex items-center justify-center gap-2">
                  {ACTIVE_AI.name}
                  {selectedAssistant?.id === ACTIVE_AI.id && <CheckCircle className="h-5 w-5 text-orange-500" />}
                </CardTitle>
                <CardDescription className="text-gray-400">{ACTIVE_AI.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Personality</p>
                  <p className="text-sm text-gray-300">{ACTIVE_AI.personality}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Features</p>
                  <div className="flex flex-wrap gap-1">
                    {ACTIVE_AI.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Alert className="bg-orange-900/20 border-orange-500/50">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-orange-200 text-xs">
                    Requires additional setup and training time. Best for experienced users.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={onSkip}
            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAssistant}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            Continue with {selectedAssistant?.name || "Selection"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
