export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  marketCap?: number
  pe?: number
  timestamp: Date
}

export interface HistoricalData {
  symbol: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicators {
  symbol: string
  sma20: number
  sma50: number
  rsi: number
  macd: number
  bollinger: {
    upper: number
    middle: number
    lower: number
  }
  timestamp: Date
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: Date
  sentiment: "positive" | "negative" | "neutral"
  symbols: string[]
}

export class MarketDataService {
  private cache: Map<string, { data: any; timestamp: Date }> = new Map()
  private cacheTimeout = 60000 // 1 minute cache

  // Simulated API endpoints - in production, these would connect to real data providers
  private readonly API_BASE = "https://api.example.com/v1"

  constructor() {
    // Initialize with some demo data
    this.initializeDemoData()
  }

  private initializeDemoData() {
    // Pre-populate cache with demo data for immediate use
    const demoSymbols = ["AAPL", "GOOGL", "TSLA", "MSFT", "NVDA", "AMZN", "META", "NFLX"]

    demoSymbols.forEach((symbol, index) => {
      const basePrice = 100 + index * 50
      const change = (Math.random() - 0.5) * 10
      const changePercent = (change / basePrice) * 100

      const marketData: MarketData = {
        symbol,
        price: basePrice + change,
        change,
        changePercent,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        high: basePrice + change + Math.random() * 5,
        low: basePrice + change - Math.random() * 5,
        open: basePrice + (Math.random() - 0.5) * 3,
        previousClose: basePrice,
        marketCap: (basePrice + change) * 1000000000,
        pe: 15 + Math.random() * 20,
        timestamp: new Date(),
      }

      this.cache.set(`market_${symbol}`, { data: marketData, timestamp: new Date() })
    })
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp.getTime() < this.cacheTimeout
  }

  private generateRealtimePrice(symbol: string, basePrice: number): MarketData {
    // Simulate real-time price movement
    const volatility = 0.02 // 2% volatility
    const change = (Math.random() - 0.5) * basePrice * volatility
    const newPrice = basePrice + change
    const changePercent = (change / basePrice) * 100

    return {
      symbol,
      price: Number(newPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      high: Number((newPrice + Math.random() * 5).toFixed(2)),
      low: Number((newPrice - Math.random() * 5).toFixed(2)),
      open: Number((basePrice + (Math.random() - 0.5) * 2).toFixed(2)),
      previousClose: basePrice,
      marketCap: newPrice * 1000000000,
      pe: 15 + Math.random() * 20,
      timestamp: new Date(),
    }
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    const cacheKey = `market_${symbol}`

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // In production, this would be a real API call
      // const response = await fetch(`${this.API_BASE}/quote/${symbol}`)
      // const data = await response.json()

      // For demo, generate realistic data
      const basePrice = 100 + Math.random() * 300
      const marketData = this.generateRealtimePrice(symbol, basePrice)

      this.cache.set(cacheKey, { data: marketData, timestamp: new Date() })
      return marketData
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error)
      throw new Error(`Failed to fetch market data for ${symbol}`)
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<MarketData[]> {
    const promises = symbols.map((symbol) => this.getMarketData(symbol))
    return Promise.all(promises)
  }

  async getHistoricalData(symbol: string, period: "1d" | "5d" | "1m" | "3m" | "1y" = "1m"): Promise<HistoricalData[]> {
    const cacheKey = `historical_${symbol}_${period}`

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // Generate demo historical data
      const days = period === "1d" ? 1 : period === "5d" ? 5 : period === "1m" ? 30 : period === "3m" ? 90 : 365
      const data: HistoricalData[] = []
      const basePrice = 100 + Math.random() * 200

      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        const dailyChange = (Math.random() - 0.5) * 10
        const open = basePrice + dailyChange
        const close = open + (Math.random() - 0.5) * 5
        const high = Math.max(open, close) + Math.random() * 3
        const low = Math.min(open, close) - Math.random() * 3

        data.push({
          symbol,
          date: date.toISOString().split("T")[0],
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.floor(Math.random() * 10000000) + 1000000,
        })
      }

      this.cache.set(cacheKey, { data, timestamp: new Date() })
      return data
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error)
      throw new Error(`Failed to fetch historical data for ${symbol}`)
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    const cacheKey = `technical_${symbol}`

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      const marketData = await this.getMarketData(symbol)

      // Generate demo technical indicators
      const indicators: TechnicalIndicators = {
        symbol,
        sma20: marketData.price * (0.95 + Math.random() * 0.1),
        sma50: marketData.price * (0.9 + Math.random() * 0.2),
        rsi: 30 + Math.random() * 40, // RSI between 30-70
        macd: (Math.random() - 0.5) * 2,
        bollinger: {
          upper: marketData.price * 1.05,
          middle: marketData.price,
          lower: marketData.price * 0.95,
        },
        timestamp: new Date(),
      }

      this.cache.set(cacheKey, { data: indicators, timestamp: new Date() })
      return indicators
    } catch (error) {
      console.error(`Error fetching technical indicators for ${symbol}:`, error)
      throw new Error(`Failed to fetch technical indicators for ${symbol}`)
    }
  }

  async getMarketNews(symbols?: string[], limit = 10): Promise<NewsItem[]> {
    const cacheKey = `news_${symbols?.join(",") || "general"}_${limit}`

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // Generate demo news items
      const newsTemplates = [
        { title: "Stock reaches new highs amid strong earnings", sentiment: "positive" as const },
        { title: "Market volatility increases due to economic uncertainty", sentiment: "negative" as const },
        { title: "Company announces new product launch", sentiment: "positive" as const },
        { title: "Regulatory concerns impact sector performance", sentiment: "negative" as const },
        { title: "Analyst upgrades stock rating", sentiment: "positive" as const },
        { title: "Quarterly results meet expectations", sentiment: "neutral" as const },
      ]

      const news: NewsItem[] = []
      const targetSymbols = symbols || ["AAPL", "GOOGL", "TSLA", "MSFT"]

      for (let i = 0; i < limit; i++) {
        const template = newsTemplates[Math.floor(Math.random() * newsTemplates.length)]
        const symbol = targetSymbols[Math.floor(Math.random() * targetSymbols.length)]

        news.push({
          id: `news_${i}_${Date.now()}`,
          title: `${symbol}: ${template.title}`,
          summary: `Latest developments regarding ${symbol} and its market performance. This news item provides insights into recent market movements and potential impacts on trading decisions.`,
          url: `https://example.com/news/${i}`,
          source: ["Reuters", "Bloomberg", "MarketWatch", "CNBC"][Math.floor(Math.random() * 4)],
          publishedAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
          sentiment: template.sentiment,
          symbols: [symbol],
        })
      }

      this.cache.set(cacheKey, { data: news, timestamp: new Date() })
      return news
    } catch (error) {
      console.error("Error fetching market news:", error)
      throw new Error("Failed to fetch market news")
    }
  }

  async searchSymbols(query: string): Promise<{ symbol: string; name: string; type: string }[]> {
    // Demo symbol search
    const allSymbols = [
      { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
      { symbol: "GOOGL", name: "Alphabet Inc.", type: "stock" },
      { symbol: "TSLA", name: "Tesla Inc.", type: "stock" },
      { symbol: "MSFT", name: "Microsoft Corporation", type: "stock" },
      { symbol: "NVDA", name: "NVIDIA Corporation", type: "stock" },
      { symbol: "AMZN", name: "Amazon.com Inc.", type: "stock" },
      { symbol: "META", name: "Meta Platforms Inc.", type: "stock" },
      { symbol: "NFLX", name: "Netflix Inc.", type: "stock" },
      { symbol: "BTC-USD", name: "Bitcoin USD", type: "crypto" },
      { symbol: "ETH-USD", name: "Ethereum USD", type: "crypto" },
      { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "etf" },
    ]

    const lowerQuery = query.toLowerCase()
    return allSymbols
      .filter((item) => item.symbol.toLowerCase().includes(lowerQuery) || item.name.toLowerCase().includes(lowerQuery))
      .slice(0, 10)
  }

  // Real-time data simulation
  subscribeToRealTimeData(symbols: string[], callback: (data: MarketData) => void): () => void {
    const intervals: NodeJS.Timeout[] = []

    symbols.forEach((symbol) => {
      const interval = setInterval(async () => {
        try {
          const data = await this.getMarketData(symbol)
          // Simulate small price movements
          const newData = this.generateRealtimePrice(symbol, data.price)
          this.cache.set(`market_${symbol}`, { data: newData, timestamp: new Date() })
          callback(newData)
        } catch (error) {
          console.error(`Error in real-time data for ${symbol}:`, error)
        }
      }, 5000) // Update every 5 seconds

      intervals.push(interval)
    })

    // Return cleanup function
    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }

  // Market status
  async getMarketStatus(): Promise<{
    isOpen: boolean
    nextOpen: Date | null
    nextClose: Date | null
    timezone: string
  }> {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    // Simplified market hours (9:30 AM - 4:00 PM ET, Mon-Fri)
    const isWeekday = day >= 1 && day <= 5
    const isMarketHours = hour >= 9 && hour < 16
    const isOpen = isWeekday && isMarketHours

    return {
      isOpen,
      nextOpen: isOpen ? null : new Date(now.getTime() + 3600000), // Next hour for demo
      nextClose: isOpen ? new Date(now.getTime() + 3600000) : null,
      timezone: "America/New_York",
    }
  }
}

// Global market data service instance
export const marketDataService = new MarketDataService()
