"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Zap, Brain, Sparkles, Target, Shield, Clock, CheckCircle } from "lucide-react"

interface AIAssistant {
  id: string
  name: string
  description: string
  personality: string
  strengths: string[]
  icon: React.ComponentType<any>
  color: string
  speed: string
}

const aiAssistants: AIAssistant[] = [
  {
    id: "friday",
    name: "Friday",
    description: "Your reliable trading companion with advanced reasoning capabilities",
    personality: "Professional, analytical, and detail-oriented",
    strengths: ["Complex analysis", "Risk assessment", "Strategic planning"],
    icon: Bot,
    color: "bg-blue-500",
    speed: "Standard",
  },
  {
    id: "velocity",
    name: "Velocity",
    description: "Lightning-fast responses for quick trading decisions",
    personality: "Quick, decisive, and action-oriented",
    strengths: ["Rapid analysis", "Real-time alerts", "Quick decisions"],
    icon: Zap,
    color: "bg-yellow-500",
    speed: "Ultra Fast",
  },
  {
    id: "oracle",
    name: "Oracle",
    description: "Deep market insights with sophisticated reasoning",
    personality: "Wise, thoughtful, and comprehensive",
    strengths: ["Market prediction", "Deep analysis", "Long-term strategy"],
    icon: Brain,
    color: "bg-purple-500",
    speed: "Thoughtful",
  },
  {
    id: "nova",
    name: "Nova",
    description: "Creative problem solver with innovative approaches",
    personality: "Creative, innovative, and adaptive",
    strengths: ["Creative solutions", "Pattern recognition", "Innovation"],
    icon: Sparkles,
    color: "bg-pink-500",
    speed: "Creative",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    description: "Risk-focused guardian for your trading portfolio",
    personality: "Cautious, protective, and thorough",
    strengths: ["Risk management", "Portfolio protection", "Compliance"],
    icon: Shield,
    color: "bg-green-500",
    speed: "Careful",
  },
  {
    id: "apex",
    name: "Apex",
    description: "High-performance assistant for professional traders",
    personality: "Elite, precise, and performance-driven",
    strengths: ["Advanced strategies", "Performance optimization", "Elite insights"],
    icon: Target,
    color: "bg-red-500",
    speed: "Premium",
  },
]

interface AIOnboardingProps {
  onAssistantSelect: (assistant: AIAssistant) => void
  onSkip: () => void
}

export default function AIOnboarding({ onAssistantSelect, onSkip }: AIOnboardingProps) {
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistant | null>(null)

  const handleSelect = (assistant: AIAssistant) => {
    setSelectedAssistant(assistant)
  }

  const handleConfirm = () => {
    if (selectedAssistant) {
      onAssistantSelect(selectedAssistant)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your AI Trading Assistant</h1>
          <p className="text-gray-400 text-lg">Select the AI personality that best matches your trading style</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {aiAssistants.map((assistant) => {
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
                    <span className="text-gray-500">Response Speed</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-300">{assistant.speed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
            onClick={handleConfirm}
            disabled={!selectedAssistant}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            Continue with {selectedAssistant?.name || "Selection"}
          </Button>
        </div>
      </div>
    </div>
  )
}
