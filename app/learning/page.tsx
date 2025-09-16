"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import LearningModule from "@/components/learning-module"

export default function LearningPage() {
  const [completedConcepts, setCompletedConcepts] = useState<string[]>([])

  const handleConceptComplete = (conceptId: string, score: number) => {
    setCompletedConcepts((prev) => [...prev, conceptId])
    // Here you could also trigger notifications, update user stats, etc.
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="icon"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 text-balance">Learning Center</h1>
              <p className="text-blue-200 text-lg">Master trading concepts with interactive lessons and quizzes</p>
            </div>
          </div>
        </div>

        {/* Learning Module */}
        <LearningModule onConceptComplete={handleConceptComplete} />
      </div>
    </div>
  )
}
