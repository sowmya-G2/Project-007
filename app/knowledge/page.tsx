"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import KnowledgeDashboard from "@/components/knowledge-dashboard"

export default function KnowledgePage() {
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
              <h1 className="text-4xl font-bold text-white mb-2 text-balance">Knowledge Base</h1>
              <p className="text-blue-200 text-lg">Your personalized AI memory and insights dashboard</p>
            </div>
          </div>
        </div>

        {/* Knowledge Dashboard */}
        <KnowledgeDashboard />
      </div>
    </div>
  )
}
