"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Shield, Newspaper, RefreshCw } from "lucide-react"
import { useMultipleQuotes, useMarketNews, useRealTimeData } from "@/hooks/use-market-data"

interface Position {
  id: string
  symbol: string
  side: "long" | "short"
  quantity: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

const mockPositions: Position[] = [
  {
    id: "1",
    symbol: "AAPL",
    side: "long",
    quantity: 100,
    entryPrice: 170.5,
    currentPrice: 175.43,
    pnl: 493,
    pnlPercent: 2.89,
  },
  {
    id: "2",
    symbol: "TSLA",
    side: "short",
    quantity: 50,
    entryPrice: 255.2,
    currentPrice: 248.87,
    pnl: 316.5,
    pnlPercent: 2.48,
  },
]

export default function TradingDashboardCards() {
  const [watchlist] = useState<string[]>(["AAPL", "GOOGL", "TSLA", "MSFT", "NVDA"])
  const [portfolioValue] = useState(125847.32)
  const [dayPnL] = useState(1247.85)

  const { data: marketData, loading: marketLoading, refetch: refetchMarket } = useMultipleQuotes(watchlist)
  const { data: newsData, loading: newsLoading } = useMarketNews(watchlist, 3)
  const { data: realTimeData } = useRealTimeData(watchlist)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
          <p className="text-gray-400">Portfolio overview and active positions</p>
        </div>
        <Button
          onClick={refetchMarket}
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
          disabled={marketLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${marketLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">${portfolioValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Day P&L</p>
                <p className={`text-2xl font-bold ${dayPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {dayPnL >= 0 ? "+" : ""}${dayPnL.toLocaleString()}
                </p>
              </div>
              {dayPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-400" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active Positions</p>
                <p className="text-2xl font-bold text-white">{mockPositions.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Win Rate</p>
                <p className="text-2xl font-bold text-white">73%</p>
              </div>
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Positions */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-green-400" />
              Active Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPositions.map((position) => {
                const realtimeData = realTimeData.get(position.symbol)
                const currentPrice = realtimeData?.price || position.currentPrice
                const pnl =
                  (currentPrice - position.entryPrice) * position.quantity * (position.side === "long" ? 1 : -1)
                const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100

                return (
                  <div key={position.id} className="p-3 rounded-lg bg-gray-700 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{position.symbol}</span>
                        <Badge variant={position.side === "long" ? "default" : "secondary"}>
                          {position.side.toUpperCase()}
                        </Badge>
                        {realtimeData && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                      </div>
                      <div className={`text-right ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        <p className="font-medium">${pnl.toFixed(2)}</p>
                        <p className="text-xs">
                          ({pnlPercent >= 0 ? "+" : ""}
                          {pnlPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Qty: {position.quantity}</span>
                      <span>Entry: ${position.entryPrice.toFixed(2)}</span>
                      <span>Current: ${currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trending News */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Newspaper className="h-5 w-5 text-blue-400" />
              Trending News
              {newsLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {newsData.slice(0, 3).map((news) => (
                  <div key={news.id} className="p-3 rounded-lg bg-gray-700 border border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={
                          news.sentiment === "positive"
                            ? "default"
                            : news.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {news.symbols[0]}
                      </Badge>
                      <span className="text-xs text-gray-400">{news.source}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-1 text-white">{news.title}</h4>
                    <p className="text-xs text-gray-300 mb-2">{news.summary}</p>
                    <p className="text-xs text-gray-400">{new Date(news.publishedAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
