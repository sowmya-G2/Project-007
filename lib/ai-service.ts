import { generateText, streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export interface LearningSession {
  id: string
  userId?: string
  topic: string
  concepts: string[]
  progress: number
  interactions: number
  startedAt: Date
  lastActivity: Date
}

export interface TradingInsight {
  id: string
  symbol?: string
  analysis: string
  confidence: number
  timeframe: string
  riskLevel: "low" | "medium" | "high"
  generatedAt: Date
}

export class AITradingService {
  private learningHistory: Map<string, LearningSession[]> = new Map()
  private tradingInsights: TradingInsight[] = []

  async generateResponse(message: string, mode: "chat" | "learning" | "trading", context?: any) {
    const systemPrompts = {
      chat: `You are an intelligent AI trading assistant. Provide helpful, accurate information about trading and finance. Always remind users about risks.`,

      learning: `You are a patient trading educator. Adapt your teaching to the user's level. Break complex concepts into simple steps. Encourage questions and provide examples.`,

      trading: `You are a professional trading analyst. Provide specific, actionable insights while emphasizing risk management. Be clear about assumptions and limitations.`,
    }

    try {
      const { text } = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        system: systemPrompts[mode],
        prompt: message,
        maxTokens: 800,
      })

      return text
    } catch (error) {
      console.error("AI Service Error:", error)
      throw new Error("Failed to generate AI response")
    }
  }

  async streamResponse(message: string, mode: "chat" | "learning" | "trading", onChunk?: (chunk: string) => void) {
    const systemPrompts = {
      chat: `You are an intelligent AI trading assistant with expertise in financial markets.`,
      learning: `You are an expert trading educator focused on clear, progressive learning.`,
      trading: `You are a professional trading analyst providing actionable market insights.`,
    }

    try {
      const result = streamText({
        model: groq("llama-3.1-70b-versatile"),
        system: systemPrompts[mode],
        prompt: message,
        maxTokens: 800,
      })

      return result
    } catch (error) {
      console.error("AI Streaming Error:", error)
      throw new Error("Failed to stream AI response")
    }
  }

  // Learning progress tracking
  updateLearningProgress(userId: string, topic: string, concepts: string[]) {
    const userSessions = this.learningHistory.get(userId) || []
    const existingSession = userSessions.find((s) => s.topic === topic)

    if (existingSession) {
      existingSession.concepts = [...new Set([...existingSession.concepts, ...concepts])]
      existingSession.interactions += 1
      existingSession.progress = Math.min(100, existingSession.interactions * 10)
      existingSession.lastActivity = new Date()
    } else {
      const newSession: LearningSession = {
        id: Date.now().toString(),
        userId,
        topic,
        concepts,
        progress: 10,
        interactions: 1,
        startedAt: new Date(),
        lastActivity: new Date(),
      }
      userSessions.push(newSession)
    }

    this.learningHistory.set(userId, userSessions)
    return existingSession || userSessions[userSessions.length - 1]
  }

  getLearningProgress(userId: string): LearningSession[] {
    return this.learningHistory.get(userId) || []
  }

  // Trading insights storage
  addTradingInsight(insight: Omit<TradingInsight, "id" | "generatedAt">) {
    const newInsight: TradingInsight = {
      ...insight,
      id: Date.now().toString(),
      generatedAt: new Date(),
    }

    this.tradingInsights.push(newInsight)

    // Keep only last 100 insights
    if (this.tradingInsights.length > 100) {
      this.tradingInsights = this.tradingInsights.slice(-100)
    }

    return newInsight
  }

  getRecentInsights(limit = 10): TradingInsight[] {
    return this.tradingInsights.slice(-limit).reverse()
  }
}

// Singleton instance
export const aiTradingService = new AITradingService()
