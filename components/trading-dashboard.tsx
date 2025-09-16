"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Shield,
  Zap,
  RefreshCw,
  Newspaper,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useMultipleQuotes, useHistoricalData, useMarketNews, useRealTimeData } from "@/hooks/use-market-data"

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

interface TradingSignal {
  id: string
  symbol: string
  type: "buy" | "sell"
  confidence: number
  reason: string
  targetPrice: number
  stopLoss: number
  timestamp: Date
}

// Mock positions and signals
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

const mockSignals: TradingSignal[] = [
  {
    id: "1",
    symbol: "AAPL",
    type: "buy",
    confidence: 85,
    reason: "Bullish breakout above resistance",
    targetPrice: 180.0,
    stopLoss: 172.0,
    timestamp: new Date(),
  },
  {
    id: "2",
    symbol: "GOOGL",
    type: "sell",
    confidence: 72,
    reason: "Bearish divergence on RSI",
    targetPrice: 2800.0,
    stopLoss: 2870.0,
    timestamp: new Date(),
  },
]

export default function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [watchlist, setWatchlist] = useState<string[]>(["AAPL", "GOOGL", "TSLA", "MSFT", "NVDA"])
  const [portfolioValue, setPortfolioValue] = useState(125847.32)
  const [dayPnL, setDayPnL] = useState(1247.85)
  const [period, setPeriod] = useState<"1d" | "5d" | "1m" | "3m" | "1y">("1m")

  const { data: marketData, loading: marketLoading, refetch: refetchMarket } = useMultipleQuotes(watchlist)
  const { data: historicalData, loading: historicalLoading } = useHistoricalData(selectedSymbol, period)
  const { data: newsData, loading: newsLoading } = useMarketNews(watchlist, 5)
  const { data: realTimeData, connected } = useRealTimeData(watchlist)

  // Convert historical data for chart
  const chartData = historicalData.map((item) => ({
    time: new Date(item.date).toLocaleDateString(),
    price: item.close,
    volume: item.volume,
  }))

  const selectedMarketData =
    marketData.find((data) => data.symbol === selectedSymbol) ||
    (realTimeData.has(selectedSymbol) ? realTimeData.get(selectedSymbol) : null)

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-300">Market Status</p>
                <p className="text-lg font-bold flex items-center gap-2 text-white">
                  <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
                  {connected ? "Live" : "Offline"}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-blue-400" />
                  {selectedSymbol} Chart
                  {connected && (
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Live
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                    <SelectTrigger className="w-20 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1D</SelectItem>
                      <SelectItem value="5d">5D</SelectItem>
                      <SelectItem value="1m">1M</SelectItem>
                      <SelectItem value="3m">3M</SelectItem>
                      <SelectItem value="1y">1Y</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {watchlist.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMarketData && (
                    <Badge variant={selectedMarketData.change >= 0 ? "default" : "destructive"}>
                      {selectedMarketData.change >= 0 ? "+" : ""}
                      {selectedMarketData.change.toFixed(2)}({selectedMarketData.changePercent.toFixed(2)}%)
                    </Badge>
                  )}
                  <Button
                    onClick={refetchMarket}
                    variant="outline"
                    size="icon"
                    className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                    disabled={marketLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${marketLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {historicalLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        fill="rgba(59,130,246,0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Quick Trade Panel */}
              <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <h4 className="font-medium mb-3 text-white">Quick Trade</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Quantity</Label>
                    <Input type="number" placeholder="100" className="bg-gray-600 border-gray-500 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Order Type</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                        <SelectValue placeholder="Market" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Buy ${selectedMarketData?.price.toFixed(2) || "0.00"}
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700">
                    Sell ${selectedMarketData?.price.toFixed(2) || "0.00"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Watch */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Market Watch</CardTitle>
                {marketLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {marketData.map((stock) => {
                    const realtimeData = realTimeData.get(stock.symbol)
                    const displayData = realtimeData || stock

                    return (
                      <div
                        key={stock.symbol}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedSymbol === stock.symbol
                            ? "bg-blue-600/30 border border-blue-400/50"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => setSelectedSymbol(stock.symbol)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{stock.symbol}</p>
                              {realtimeData && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                            </div>
                            <p className="text-sm text-gray-300">${displayData.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-medium ${
                                displayData.change >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {displayData.change >= 0 ? "+" : ""}
                              {displayData.change.toFixed(2)}
                            </p>
                            <p
                              className={`text-xs ${
                                displayData.changePercent >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {displayData.changePercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Market News */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Newspaper className="h-5 w-5 text-blue-400" />
                Market News
                {newsLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {newsData.map((news) => (
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

          {/* AI Trading Signals */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                AI Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSignals.map((signal) => (
                  <div key={signal.id} className="p-3 rounded-lg bg-gray-700 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={signal.type === "buy" ? "default" : "destructive"}>
                          {signal.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium text-white">{signal.symbol}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            signal.confidence >= 80
                              ? "bg-green-400"
                              : signal.confidence >= 60
                                ? "bg-yellow-400"
                                : "bg-red-400"
                          }`}
                        />
                        <span className="text-xs text-gray-400">{signal.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{signal.reason}</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Target: ${signal.targetPrice}</span>
                      <span>Stop: ${signal.stopLoss}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Positions */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-green-400" />
            Active Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 text-gray-300">Symbol</th>
                  <th className="text-left py-2 text-gray-300">Side</th>
                  <th className="text-left py-2 text-gray-300">Quantity</th>
                  <th className="text-left py-2 text-gray-300">Entry Price</th>
                  <th className="text-left py-2 text-gray-300">Current Price</th>
                  <th className="text-left py-2 text-gray-300">P&L</th>
                  <th className="text-left py-2 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPositions.map((position) => {
                  const realtimeData = realTimeData.get(position.symbol)
                  const currentPrice = realtimeData?.price || position.currentPrice
                  const pnl =
                    (currentPrice - position.entryPrice) * position.quantity * (position.side === "long" ? 1 : -1)
                  const pnlPercent = (pnl / (position.entryPrice * position.quantity)) * 100

                  return (
                    <tr key={position.id} className="border-b border-gray-700">
                      <td className="py-3 font-medium text-white">{position.symbol}</td>
                      <td className="py-3">
                        <Badge variant={position.side === "long" ? "default" : "secondary"}>
                          {position.side.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-white">{position.quantity}</td>
                      <td className="py-3 text-white">${position.entryPrice.toFixed(2)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white">${currentPrice.toFixed(2)}</span>
                          {realtimeData && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className={pnl >= 0 ? "text-green-400" : "text-red-400"}>
                          ${pnl.toFixed(2)}
                          <div className="text-xs">
                            ({pnlPercent >= 0 ? "+" : ""}
                            {pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-white border-gray-600 hover:bg-gray-700 bg-transparent"
                        >
                          Close
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
