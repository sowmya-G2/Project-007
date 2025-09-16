"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, RefreshCw, BarChart3 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useMultipleQuotes, useHistoricalData, useRealTimeData } from "@/hooks/use-market-data"

export default function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [watchlist] = useState<string[]>(["AAPL", "GOOGL", "TSLA", "MSFT", "NVDA"])
  const [period, setPeriod] = useState<"1d" | "5d" | "1m" | "3m" | "1y">("1m")

  const { data: marketData, loading: marketLoading, refetch: refetchMarket } = useMultipleQuotes(watchlist)
  const { data: historicalData, loading: historicalLoading } = useHistoricalData(selectedSymbol, period)
  const { data: realTimeData, connected } = useRealTimeData(watchlist)

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Overview</h1>
          <p className="text-gray-400">Real-time market data and charts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connected ? "default" : "destructive"} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
            {connected ? "Live" : "Offline"}
          </Badge>
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
            </CardContent>
          </Card>
        </div>

        {/* Market Watch */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Market Watch</CardTitle>
              {marketLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
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
                            className={`text-xs ${displayData.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
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
      </div>

      {/* Market Status */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Market Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-700">
              <p className="text-sm text-gray-300">NYSE</p>
              <p className="text-lg font-bold text-green-400">Open</p>
              <p className="text-xs text-gray-400">9:30 AM - 4:00 PM EST</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-700">
              <p className="text-sm text-gray-300">NASDAQ</p>
              <p className="text-lg font-bold text-green-400">Open</p>
              <p className="text-xs text-gray-400">9:30 AM - 4:00 PM EST</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-700">
              <p className="text-sm text-gray-300">Pre-Market</p>
              <p className="text-lg font-bold text-yellow-400">Active</p>
              <p className="text-xs text-gray-400">4:00 AM - 9:30 AM EST</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-700">
              <p className="text-sm text-gray-300">After Hours</p>
              <p className="text-lg font-bold text-blue-400">Active</p>
              <p className="text-xs text-gray-400">4:00 PM - 8:00 PM EST</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
