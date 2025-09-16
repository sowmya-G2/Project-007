"use client"

import { knowledgeBase } from "@/lib/knowledge-base"

interface SharedData {
  sandboxData: {
    portfolioValue: number
    positions: Array<{
      symbol: string
      quantity: number
      avgPrice: number
      currentPrice: number
      pnl: number
    }>
    watchlist: string[]
    notes: string[]
  }
  userPreferences: {
    theme: string
    notifications: boolean
    riskLevel: string
  }
  lastUpdated: Date
}

class SharedDataStore {
  private data: Map<string, SharedData> = new Map()
  private listeners: Map<string, Array<(data: SharedData) => void>> = new Map()

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    const defaultData: SharedData = {
      sandboxData: {
        portfolioValue: 100000,
        positions: [
          { symbol: "AAPL", quantity: 50, avgPrice: 175.0, currentPrice: 178.5, pnl: 175.0 },
          { symbol: "GOOGL", quantity: 25, avgPrice: 140.0, currentPrice: 142.75, pnl: 68.75 },
          { symbol: "TSLA", quantity: 30, avgPrice: 245.0, currentPrice: 248.2, pnl: 96.0 },
        ],
        watchlist: ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN", "NVDA"],
        notes: ["Monitor AAPL earnings next week", "TSLA showing strong momentum", "Consider adding NVDA on dip"],
      },
      userPreferences: {
        theme: "dark",
        notifications: true,
        riskLevel: "moderate",
      },
      lastUpdated: new Date(),
    }

    this.data.set("demo-user", defaultData)
  }

  getUserData(userId: string): SharedData | null {
    return this.data.get(userId) || null
  }

  updateUserData(userId: string, updates: Partial<SharedData>): void {
    const existing = this.data.get(userId) || this.getDefaultData()
    const updated = {
      ...existing,
      ...updates,
      lastUpdated: new Date(),
    }

    this.data.set(userId, updated)
    this.notifyListeners(userId, updated)
  }

  updateSandboxData(userId: string, sandboxUpdates: Partial<SharedData["sandboxData"]>): void {
    const existing = this.data.get(userId) || this.getDefaultData()
    const updated = {
      ...existing,
      sandboxData: {
        ...existing.sandboxData,
        ...sandboxUpdates,
      },
      lastUpdated: new Date(),
    }

    this.data.set(userId, updated)
    this.notifyListeners(userId, updated)
  }

  subscribe(userId: string, callback: (data: SharedData) => void): () => void {
    const userListeners = this.listeners.get(userId) || []
    userListeners.push(callback)
    this.listeners.set(userId, userListeners)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(userId) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
        this.listeners.set(userId, listeners)
      }
    }
  }

  private notifyListeners(userId: string, data: SharedData): void {
    const listeners = this.listeners.get(userId) || []
    listeners.forEach((callback) => callback(data))
  }

  private getDefaultData(): SharedData {
    return {
      sandboxData: {
        portfolioValue: 100000,
        positions: [],
        watchlist: [],
        notes: [],
      },
      userPreferences: {
        theme: "dark",
        notifications: true,
        riskLevel: "moderate",
      },
      lastUpdated: new Date(),
    }
  }

  // Integration with knowledge base
  syncWithKnowledgeBase(userId: string): void {
    const profile = knowledgeBase.getUserProfile(userId)
    const patterns = knowledgeBase.getTradingPatterns(userId)

    if (profile) {
      this.updateUserData(userId, {
        userPreferences: {
          theme: "dark",
          notifications: true,
          riskLevel: profile.riskTolerance,
        },
      })
    }

    // Update watchlist based on preferred assets
    if (profile?.preferredAssets) {
      this.updateSandboxData(userId, {
        watchlist: profile.preferredAssets,
      })
    }
  }
}

export const sharedDataStore = new SharedDataStore()
