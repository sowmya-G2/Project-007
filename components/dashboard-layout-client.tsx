"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import CustomizableHome from "@/components/customizable-home"
import TradingDashboardCards from "@/components/trading-dashboard-cards"
import MarketPage from "@/components/market-page"
import NewsPage from "@/components/news-page"
import AIAssistantPage from "@/components/ai-assistant-page"
import KnowledgeDashboard from "@/components/knowledge-dashboard"
import LearningModule from "@/components/learning-module"
import InteractiveTraining from "@/components/interactive-training"
import AIOnboardingFlow from "@/components/ai-onboarding-flow"

interface Profile {
  id: string
  email: string
  display_name: string
  selected_ai_assistant: string
  ai_assistant_configured: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

interface DashboardLayoutClientProps {
  user: User
  profile: Profile | null
  children: React.ReactNode
}

export default function DashboardLayoutClient({ user, profile, children }: DashboardLayoutClientProps) {
  const [activeWorkspace, setActiveWorkspace] = useState<"trading" | "research" | "refinery">("trading")
  const [activeMenu, setActiveMenu] = useState("home")
  const [selectedAssistant, setSelectedAssistant] = useState<string>(profile?.selected_ai_assistant || "Friday")
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(profile?.onboarding_completed || false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setSelectedAssistant(profile.selected_ai_assistant || "Friday")
      setHasCompletedOnboarding(profile.onboarding_completed || false)
    }
  }, [profile])

  const handleOnboardingComplete = async (assistant: any) => {
    setIsLoading(true)
    try {
      setSelectedAssistant(assistant.name)
      setHasCompletedOnboarding(true)

      await supabase
        .from("profiles")
        .update({
          selected_ai_assistant: assistant.name,
          ai_assistant_configured: true,
          onboarding_completed: true,
        })
        .eq("id", user.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingSkip = async () => {
    setIsLoading(true)
    try {
      setHasCompletedOnboarding(true)

      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
        })
        .eq("id", user.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssistantChange = async (assistantName: string) => {
    setIsLoading(true)
    try {
      setSelectedAssistant(assistantName)

      await supabase
        .from("profiles")
        .update({
          selected_ai_assistant: assistantName,
          ai_assistant_configured: true,
        })
        .eq("id", user.id)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-white">Updating preferences...</p>
        </div>
      </div>
    )
  }

  if (!hasCompletedOnboarding) {
    return <AIOnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
  }

  const renderActivePage = () => {
    if (activeWorkspace === "research") {
      switch (activeMenu) {
        case "ai-assistant":
          return <AIAssistantPage selectedAssistant={selectedAssistant} onAssistantChange={handleAssistantChange} />
        case "home":
          return <CustomizableHome />
        default:
          return <AIAssistantPage selectedAssistant={selectedAssistant} onAssistantChange={handleAssistantChange} />
      }
    }

    if (activeWorkspace === "refinery") {
      switch (activeMenu) {
        case "knowledge-base":
          return <KnowledgeDashboard />
        case "learning-center":
          return (
            <LearningModule
              onConceptComplete={(conceptId, score) => {
                // Concept completion tracking can be handled silently
              }}
            />
          )
        case "interactive-training":
          return <InteractiveTraining />
        case "home":
          return <CustomizableHome />
        default:
          return <KnowledgeDashboard />
      }
    }

    switch (activeMenu) {
      case "home":
        return <CustomizableHome />
      case "dashboard":
        return <TradingDashboardCards />
      case "market":
        return <MarketPage />
      case "news":
        return <NewsPage />
      case "ai-assistant":
        return <AIAssistantPage selectedAssistant={selectedAssistant} onAssistantChange={handleAssistantChange} />
      case "knowledge-base":
        return <KnowledgeDashboard />
      case "learning-center":
        return (
          <LearningModule
            onConceptComplete={(conceptId, score) => {
              // Concept completion tracking can be handled silently
            }}
          />
        )
      case "interactive-training":
        return <InteractiveTraining />
      default:
        return <CustomizableHome />
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        activeWorkspace={activeWorkspace}
        activeMenu={activeMenu}
        onWorkspaceChange={setActiveWorkspace}
        onMenuChange={setActiveMenu}
        selectedAssistant={selectedAssistant}
        user={user}
        profile={profile}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{renderActivePage()}</div>
      </main>
    </div>
  )
}
