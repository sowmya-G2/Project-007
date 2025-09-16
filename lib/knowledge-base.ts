export interface UserProfile {
  id: string
  name?: string
  email?: string
  tradingExperience: "beginner" | "intermediate" | "advanced"
  riskTolerance: "conservative" | "moderate" | "aggressive"
  preferredAssets: string[]
  tradingGoals: string[]
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface TradingPattern {
  id: string
  userId: string
  patternType: "entry" | "exit" | "risk_management" | "asset_selection"
  description: string
  frequency: number
  successRate: number
  avgReturn: number
  conditions: Record<string, any>
  examples: string[]
  createdAt: Date
}

export interface ConversationMemory {
  id: string
  userId: string
  sessionId: string
  topic: string
  context: Record<string, any>
  keyPoints: string[]
  sentiment: "positive" | "negative" | "neutral"
  timestamp: Date
  expiresAt?: Date
}

export interface LearningInsight {
  id: string
  userId: string
  concept: string
  understanding: "poor" | "basic" | "good" | "excellent"
  strugglingAreas: string[]
  strengths: string[]
  recommendedActions: string[]
  lastAssessed: Date
}

export interface MarketInsight {
  id: string
  symbol: string
  insightType: "technical" | "fundamental" | "sentiment" | "news"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high"
  timeframe: "short" | "medium" | "long"
  tags: string[]
  createdAt: Date
  validUntil?: Date
}

export interface UserPreference {
  id: string
  userId: string
  category: "ui" | "trading" | "notifications" | "learning"
  key: string
  value: any
  updatedAt: Date
}

export class KnowledgeBase {
  private userProfiles: Map<string, UserProfile> = new Map()
  private tradingPatterns: Map<string, TradingPattern[]> = new Map()
  private conversationMemory: Map<string, ConversationMemory[]> = new Map()
  private learningInsights: Map<string, LearningInsight[]> = new Map()
  private marketInsights: Map<string, MarketInsight[]> = new Map()
  private userPreferences: Map<string, UserPreference[]> = new Map()

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    // Demo user profile
    const demoProfile: UserProfile = {
      id: "demo-user",
      name: "Demo Trader",
      email: "demo@example.com",
      tradingExperience: "intermediate",
      riskTolerance: "moderate",
      preferredAssets: ["AAPL", "GOOGL", "TSLA", "SPY"],
      tradingGoals: ["Long-term growth", "Income generation", "Risk management"],
      timezone: "America/New_York",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.userProfiles.set("demo-user", demoProfile)

    // Demo trading patterns
    const demoPatterns: TradingPattern[] = [
      {
        id: "pattern-1",
        userId: "demo-user",
        patternType: "entry",
        description: "Tends to buy on RSI oversold conditions with volume confirmation",
        frequency: 15,
        successRate: 68,
        avgReturn: 4.2,
        conditions: { rsi: "< 30", volume: "> avg_volume * 1.5" },
        examples: ["AAPL entry at $170 when RSI hit 28", "TSLA entry at $240 with high volume"],
        createdAt: new Date(),
      },
      {
        id: "pattern-2",
        userId: "demo-user",
        patternType: "risk_management",
        description: "Consistently uses 2% position sizing rule",
        frequency: 95,
        successRate: 85,
        avgReturn: 0,
        conditions: { position_size: "2% of portfolio" },
        examples: ["Never risks more than $2000 on $100k portfolio"],
        createdAt: new Date(),
      },
    ]
    this.tradingPatterns.set("demo-user", demoPatterns)

    // Demo learning insights
    const demoInsights: LearningInsight[] = [
      {
        id: "insight-1",
        userId: "demo-user",
        concept: "Technical Analysis",
        understanding: "good",
        strugglingAreas: ["Elliott Wave Theory", "Fibonacci retracements"],
        strengths: ["Support/Resistance", "Moving Averages", "RSI"],
        recommendedActions: ["Practice Elliott Wave patterns", "Study Fibonacci applications"],
        lastAssessed: new Date(),
      },
      {
        id: "insight-2",
        userId: "demo-user",
        concept: "Risk Management",
        understanding: "excellent",
        strugglingAreas: [],
        strengths: ["Position sizing", "Stop losses", "Diversification"],
        recommendedActions: ["Explore advanced hedging strategies"],
        lastAssessed: new Date(),
      },
    ]
    this.learningInsights.set("demo-user", demoInsights)

    // Demo market insights
    const demoMarketInsights: MarketInsight[] = [
      {
        id: "market-1",
        symbol: "AAPL",
        insightType: "technical",
        title: "Strong Support at $170",
        description: "AAPL has consistently bounced from the $170 level, showing strong institutional support",
        confidence: 85,
        impact: "medium",
        timeframe: "short",
        tags: ["support", "bounce", "institutional"],
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        id: "market-2",
        symbol: "TSLA",
        insightType: "sentiment",
        title: "Bullish Sentiment on EV Growth",
        description: "Increasing positive sentiment around electric vehicle adoption driving TSLA interest",
        confidence: 72,
        impact: "high",
        timeframe: "long",
        tags: ["ev", "growth", "sentiment"],
        createdAt: new Date(),
      },
    ]
    this.marketInsights.set("general", demoMarketInsights)
  }

  // User Profile Management
  getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId)
  }

  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const existing = this.userProfiles.get(userId) || {
      id: userId,
      tradingExperience: "beginner",
      riskTolerance: "conservative",
      preferredAssets: [],
      tradingGoals: [],
      timezone: "UTC",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updated = { ...existing, ...updates, updatedAt: new Date() }
    this.userProfiles.set(userId, updated)
    return updated
  }

  // Trading Pattern Analysis
  getTradingPatterns(userId: string): TradingPattern[] {
    return this.tradingPatterns.get(userId) || []
  }

  addTradingPattern(pattern: Omit<TradingPattern, "id" | "createdAt">): TradingPattern {
    const newPattern: TradingPattern = {
      ...pattern,
      id: `pattern-${Date.now()}`,
      createdAt: new Date(),
    }

    const existing = this.tradingPatterns.get(pattern.userId) || []
    existing.push(newPattern)
    this.tradingPatterns.set(pattern.userId, existing)

    return newPattern
  }

  updateTradingPattern(userId: string, patternId: string, updates: Partial<TradingPattern>): TradingPattern | null {
    const patterns = this.tradingPatterns.get(userId) || []
    const index = patterns.findIndex((p) => p.id === patternId)

    if (index === -1) return null

    patterns[index] = { ...patterns[index], ...updates }
    this.tradingPatterns.set(userId, patterns)

    return patterns[index]
  }

  // Conversation Memory
  getConversationMemory(userId: string, sessionId?: string): ConversationMemory[] {
    const memories = this.conversationMemory.get(userId) || []
    if (sessionId) {
      return memories.filter((m) => m.sessionId === sessionId)
    }
    return memories.slice(-10) // Return last 10 conversations
  }

  addConversationMemory(memory: Omit<ConversationMemory, "id" | "timestamp">): ConversationMemory {
    const newMemory: ConversationMemory = {
      ...memory,
      id: `memory-${Date.now()}`,
      timestamp: new Date(),
    }

    const existing = this.conversationMemory.get(memory.userId) || []
    existing.push(newMemory)

    // Keep only last 50 memories per user
    if (existing.length > 50) {
      existing.splice(0, existing.length - 50)
    }

    this.conversationMemory.set(memory.userId, existing)
    return newMemory
  }

  // Learning Insights
  getLearningInsights(userId: string): LearningInsight[] {
    return this.learningInsights.get(userId) || []
  }

  updateLearningInsight(userId: string, concept: string, updates: Partial<LearningInsight>): LearningInsight {
    const insights = this.learningInsights.get(userId) || []
    const existingIndex = insights.findIndex((i) => i.concept === concept)

    if (existingIndex >= 0) {
      insights[existingIndex] = { ...insights[existingIndex], ...updates, lastAssessed: new Date() }
    } else {
      const newInsight: LearningInsight = {
        id: `insight-${Date.now()}`,
        userId,
        concept,
        understanding: "basic",
        strugglingAreas: [],
        strengths: [],
        recommendedActions: [],
        lastAssessed: new Date(),
        ...updates,
      }
      insights.push(newInsight)
    }

    this.learningInsights.set(userId, insights)
    return insights[existingIndex >= 0 ? existingIndex : insights.length - 1]
  }

  // Market Insights
  getMarketInsights(symbol?: string): MarketInsight[] {
    if (symbol) {
      const symbolInsights = this.marketInsights.get(symbol) || []
      const generalInsights = this.marketInsights.get("general") || []
      return [...symbolInsights, ...generalInsights.filter((i) => i.symbol === symbol)]
    }

    // Return all insights
    const allInsights: MarketInsight[] = []
    for (const insights of this.marketInsights.values()) {
      allInsights.push(...insights)
    }
    return allInsights.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  addMarketInsight(insight: Omit<MarketInsight, "id" | "createdAt">): MarketInsight {
    const newInsight: MarketInsight = {
      ...insight,
      id: `insight-${Date.now()}`,
      createdAt: new Date(),
    }

    const key = insight.symbol || "general"
    const existing = this.marketInsights.get(key) || []
    existing.push(newInsight)

    // Keep only last 20 insights per symbol
    if (existing.length > 20) {
      existing.splice(0, existing.length - 20)
    }

    this.marketInsights.set(key, existing)
    return newInsight
  }

  // User Preferences
  getUserPreferences(userId: string, category?: string): UserPreference[] {
    const prefs = this.userPreferences.get(userId) || []
    if (category) {
      return prefs.filter((p) => p.category === category)
    }
    return prefs
  }

  setUserPreference(userId: string, category: string, key: string, value: any): UserPreference {
    const prefs = this.userPreferences.get(userId) || []
    const existingIndex = prefs.findIndex((p) => p.category === category && p.key === key)

    const preference: UserPreference = {
      id: `pref-${Date.now()}`,
      userId,
      category: category as any,
      key,
      value,
      updatedAt: new Date(),
    }

    if (existingIndex >= 0) {
      prefs[existingIndex] = preference
    } else {
      prefs.push(preference)
    }

    this.userPreferences.set(userId, prefs)
    return preference
  }

  // Context-aware recommendations
  getPersonalizedRecommendations(userId: string): {
    learningTopics: string[]
    tradingOpportunities: string[]
    riskAlerts: string[]
  } {
    const profile = this.getUserProfile(userId)
    const patterns = this.getTradingPatterns(userId)
    const insights = this.getLearningInsights(userId)

    const learningTopics: string[] = []
    const tradingOpportunities: string[] = []
    const riskAlerts: string[] = []

    // Learning recommendations based on insights
    insights.forEach((insight) => {
      if (insight.understanding === "poor" || insight.understanding === "basic") {
        learningTopics.push(`Improve ${insight.concept} understanding`)
      }
      insight.recommendedActions.forEach((action) => {
        learningTopics.push(action)
      })
    })

    // Trading opportunities based on patterns and preferences
    if (profile) {
      profile.preferredAssets.forEach((asset) => {
        const marketInsights = this.getMarketInsights(asset)
        marketInsights.forEach((insight) => {
          if (insight.confidence > 70 && insight.impact !== "low") {
            tradingOpportunities.push(`${asset}: ${insight.title}`)
          }
        })
      })
    }

    // Risk alerts based on patterns
    patterns.forEach((pattern) => {
      if (pattern.successRate < 50) {
        riskAlerts.push(`Review ${pattern.description} - low success rate`)
      }
    })

    return {
      learningTopics: learningTopics.slice(0, 5),
      tradingOpportunities: tradingOpportunities.slice(0, 5),
      riskAlerts: riskAlerts.slice(0, 3),
    }
  }

  // Search and query capabilities
  searchMemory(
    userId: string,
    query: string,
  ): {
    conversations: ConversationMemory[]
    patterns: TradingPattern[]
    insights: MarketInsight[]
  } {
    const lowerQuery = query.toLowerCase()

    const conversations = this.getConversationMemory(userId).filter(
      (c) =>
        c.topic.toLowerCase().includes(lowerQuery) ||
        c.keyPoints.some((point) => point.toLowerCase().includes(lowerQuery)),
    )

    const patterns = this.getTradingPatterns(userId).filter(
      (p) =>
        p.description.toLowerCase().includes(lowerQuery) ||
        p.examples.some((ex) => ex.toLowerCase().includes(lowerQuery)),
    )

    const insights = this.getMarketInsights().filter(
      (i) =>
        i.title.toLowerCase().includes(lowerQuery) ||
        i.description.toLowerCase().includes(lowerQuery) ||
        i.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )

    return { conversations, patterns, insights }
  }

  // Analytics and insights
  getUserAnalytics(userId: string): {
    totalConversations: number
    learningProgress: number
    tradingPatternCount: number
    riskScore: number
    engagementScore: number
  } {
    const conversations = this.getConversationMemory(userId)
    const patterns = this.getTradingPatterns(userId)
    const insights = this.getLearningInsights(userId)

    const learningProgress =
      insights.length > 0
        ? insights.reduce((sum, i) => {
            const score = { poor: 1, basic: 2, good: 3, excellent: 4 }[i.understanding]
            return sum + score
          }, 0) /
          (insights.length * 4)
        : 0

    const riskScore =
      patterns.reduce((sum, p) => {
        if (p.patternType === "risk_management") return sum + p.successRate
        return sum
      }, 0) / Math.max(patterns.filter((p) => p.patternType === "risk_management").length, 1)

    const engagementScore = Math.min(conversations.length / 10, 1) * 100

    return {
      totalConversations: conversations.length,
      learningProgress: Math.round(learningProgress * 100),
      tradingPatternCount: patterns.length,
      riskScore: Math.round(riskScore),
      engagementScore: Math.round(engagementScore),
    }
  }
}

// Global knowledge base instance
export const knowledgeBase = new KnowledgeBase()
