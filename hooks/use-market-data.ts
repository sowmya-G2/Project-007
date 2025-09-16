"use client"

import { useState, useEffect, useCallback } from "react"
import { marketDataService, type MarketData, type HistoricalData, type NewsItem } from "@/lib/market-data-service"

export function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!symbol) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/market/quote/${symbol}`)

      if (!response.ok) {
        throw new Error("Failed to fetch market data")
      }

      const marketData = await response.json()
      setData(marketData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useMultipleQuotes(symbols: string[]) {
  const [data, setData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/market/quotes?symbols=${symbols.join(",")}`)

      if (!response.ok) {
        throw new Error("Failed to fetch market data")
      }

      const marketData = await response.json()
      setData(marketData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [symbols])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useHistoricalData(symbol: string, period: "1d" | "5d" | "1m" | "3m" | "1y" = "1m") {
  const [data, setData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!symbol) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/market/historical/${symbol}?period=${period}`)

      if (!response.ok) {
        throw new Error("Failed to fetch historical data")
      }

      const historicalData = await response.json()
      setData(historicalData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [symbol, period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useMarketNews(symbols?: string[], limit = 10) {
  const [data, setData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (symbols && symbols.length > 0) {
        params.set("symbols", symbols.join(","))
      }
      params.set("limit", limit.toString())

      const response = await fetch(`/api/market/news?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch market news")
      }

      const news = await response.json()
      setData(news)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [symbols, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useRealTimeData(symbols: string[]) {
  const [data, setData] = useState<Map<string, MarketData>>(new Map())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (symbols.length === 0) return

    setConnected(true)

    // Subscribe to real-time updates
    const unsubscribe = marketDataService.subscribeToRealTimeData(symbols, (marketData) => {
      setData((prev) => new Map(prev.set(marketData.symbol, marketData)))
    })

    return () => {
      unsubscribe()
      setConnected(false)
    }
  }, [symbols])

  return { data, connected }
}
