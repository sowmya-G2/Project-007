"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
} from "lucide-react"

interface TrainingScenario {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number
  objectives: string[]
  initialBalance: number
  marketCondition: "bullish" | "bearish" | "volatile" | "sideways"
}

interface SimulatedTrade {
  id: string
  symbol: string
  type: "buy" | "sell"
  quantity: number
  price: number
  timestamp: Date
  pnl?: number
}

interface TrainingSession {
  scenario: TrainingScenario
  balance: number
  trades: SimulatedTrade[]
  currentPrice: Record<string, number>
  isActive: boolean
  startTime?: Date
  feedback: string[]
}

const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: "trend-following",
    title: "Trend Following Strategy",
    description: "Learn to identify and follow market trends using technical indicators",
    difficulty: "beginner",
    duration: 15,
    objectives: [
      "Identify upward and downward trends",
      "Use moving averages for entry signals",
      "Practice proper position sizing",
      "Implement stop-loss orders",
    ],
    initialBalance: 10000,
    marketCondition: "bullish",
  },
  {
    id: "risk-management",
    title: "Risk Management Fundamentals",
    description: "Master the art of protecting your capital through proper risk management",
    difficulty: "intermediate",
    duration: 20,
    objectives: [
      "Calculate position sizes based on risk tolerance",
      "Set appropriate stop-loss levels",
      "Understand risk-reward ratios",
      "Practice portfolio diversification",
    ],
    initialBalance: 25000,
    marketCondition: "volatile",
  },
  {
    id: "market-analysis",
    title: "Technical Analysis Deep Dive",
    description: "Advanced chart patterns and technical indicator analysis",
    difficulty: "advanced",
    duration: 30,
    objectives: [
      "Recognize complex chart patterns",
      "Combine multiple technical indicators",
      "Analyze market sentiment",
      "Time entries and exits precisely",
    ],
    initialBalance: 50000,
    marketCondition: "sideways",
  },
]

export default function InteractiveTraining() {
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null)
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(null)
  const [tradeForm, setTradeForm] = useState({
    symbol: "AAPL",
    type: "buy" as "buy" | "sell",
    quantity: 10,
    orderType: "market" as "market" | "limit",
    limitPrice: 0,
  })
  const [aiGuidance, setAiGuidance] = useState<string>("")
  const [showHint, setShowHint] = useState(false)

  // Simulate market price movements
  useEffect(() => {
    if (!trainingSession?.isActive) return

    const interval = setInterval(() => {
      setTrainingSession((prev) => {
        if (!prev) return prev

        const newPrices = { ...prev.currentPrice }
        Object.keys(newPrices).forEach((symbol) => {
          const volatility = prev.scenario.marketCondition === "volatile" ? 0.02 : 0.01
          const trend =
            prev.scenario.marketCondition === "bullish"
              ? 0.001
              : prev.scenario.marketCondition === "bearish"
                ? -0.001
                : 0
          const change = (Math.random() - 0.5) * volatility + trend
          newPrices[symbol] = Math.max(1, newPrices[symbol] * (1 + change))
        })

        return {
          ...prev,
          currentPrice: newPrices,
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [trainingSession?.isActive])

  const startTraining = (scenario: TrainingScenario) => {
    const initialPrices = {
      AAPL: 150 + Math.random() * 50,
      GOOGL: 2500 + Math.random() * 500,
      MSFT: 300 + Math.random() * 100,
      TSLA: 200 + Math.random() * 100,
    }

    setTrainingSession({
      scenario,
      balance: scenario.initialBalance,
      trades: [],
      currentPrice: initialPrices,
      isActive: true,
      startTime: new Date(),
      feedback: [`Training session started! Initial balance: $${scenario.initialBalance.toLocaleString()}`],
    })
    setSelectedScenario(scenario)
    generateAIGuidance(scenario, "start")
  }

  const pauseTraining = () => {
    setTrainingSession((prev) => (prev ? { ...prev, isActive: false } : null))
  }

  const resumeTraining = () => {
    setTrainingSession((prev) => (prev ? { ...prev, isActive: true } : null))
  }

  const resetTraining = () => {
    if (selectedScenario) {
      startTraining(selectedScenario)
    }
  }

  const executeTrade = () => {
    if (!trainingSession) return

    const currentPrice = trainingSession.currentPrice[tradeForm.symbol]
    const tradePrice = tradeForm.orderType === "market" ? currentPrice : tradeForm.limitPrice
    const tradeCost = tradePrice * tradeForm.quantity

    if (tradeForm.type === "buy" && tradeCost > trainingSession.balance) {
      setTrainingSession((prev) =>
        prev
          ? {
              ...prev,
              feedback: [
                ...prev.feedback,
                `❌ Insufficient funds for this trade. Available: $${prev.balance.toFixed(2)}`,
              ],
            }
          : null,
      )
      return
    }

    const newTrade: SimulatedTrade = {
      id: Date.now().toString(),
      symbol: tradeForm.symbol,
      type: tradeForm.type,
      quantity: tradeForm.quantity,
      price: tradePrice,
      timestamp: new Date(),
    }

    const balanceChange = tradeForm.type === "buy" ? -tradeCost : tradeCost

    setTrainingSession((prev) => {
      if (!prev) return null

      const newBalance = prev.balance + balanceChange
      const feedback = [
        ...prev.feedback,
        `✅ ${tradeForm.type.toUpperCase()} ${tradeForm.quantity} ${tradeForm.symbol} at $${tradePrice.toFixed(2)} - Balance: $${newBalance.toFixed(2)}`,
      ]

      return {
        ...prev,
        balance: newBalance,
        trades: [...prev.trades, newTrade],
        feedback,
      }
    })

    generateAIGuidance(selectedScenario!, "trade", newTrade)
  }

  const generateAIGuidance = async (scenario: TrainingScenario, context: string, trade?: SimulatedTrade) => {
    const prompts = {
      start: `You're starting a ${scenario.title} training session. The market condition is ${scenario.marketCondition}. Provide initial guidance and what to look for.`,
      trade: `The user just executed a ${trade?.type} order for ${trade?.quantity} shares of ${trade?.symbol} at $${trade?.price.toFixed(2)}. Provide feedback on this trade in the context of ${scenario.title}.`,
      hint: `The user requested a hint for the ${scenario.title} scenario. Provide a helpful tip without giving away the complete strategy.`,
    }

    // Simulate AI response (in real implementation, this would call your AI service)
    setTimeout(() => {
      const responses = {
        start: `Welcome to ${scenario.title}! In ${scenario.marketCondition} market conditions, focus on ${scenario.objectives[0].toLowerCase()}. Watch for key indicators and remember to manage your risk.`,
        trade: trade
          ? `Good ${trade.type} on ${trade.symbol}! Consider your position size relative to your total portfolio. Monitor the price action and be ready to adjust your strategy.`
          : "",
        hint: `💡 Hint: For ${scenario.title}, pay attention to the relationship between price and volume. Look for confirmation signals before entering positions.`,
      }
      setAiGuidance(responses[context as keyof typeof responses])
    }, 1000)
  }

  const calculatePnL = () => {
    if (!trainingSession) return 0

    let totalPnL = 0
    const positions: Record<string, { quantity: number; avgPrice: number }> = {}

    trainingSession.trades.forEach((trade) => {
      if (!positions[trade.symbol]) {
        positions[trade.symbol] = { quantity: 0, avgPrice: 0 }
      }

      if (trade.type === "buy") {
        const newQuantity = positions[trade.symbol].quantity + trade.quantity
        positions[trade.symbol].avgPrice =
          (positions[trade.symbol].avgPrice * positions[trade.symbol].quantity + trade.price * trade.quantity) /
          newQuantity
        positions[trade.symbol].quantity = newQuantity
      } else {
        positions[trade.symbol].quantity -= trade.quantity
        totalPnL += (trade.price - positions[trade.symbol].avgPrice) * trade.quantity
      }
    })

    // Add unrealized PnL for open positions
    Object.entries(positions).forEach(([symbol, position]) => {
      if (position.quantity > 0) {
        const currentPrice = trainingSession.currentPrice[symbol]
        totalPnL += (currentPrice - position.avgPrice) * position.quantity
      }
    })

    return totalPnL
  }

  const getPerformanceMetrics = () => {
    if (!trainingSession) return null

    const totalPnL = calculatePnL()
    const totalValue = trainingSession.balance + totalPnL
    const returnPercentage =
      ((totalValue - trainingSession.scenario.initialBalance) / trainingSession.scenario.initialBalance) * 100
    const winningTrades = trainingSession.trades.filter((trade) => trade.pnl && trade.pnl > 0).length
    const totalTrades = trainingSession.trades.length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    return {
      totalValue,
      totalPnL,
      returnPercentage,
      winRate,
      totalTrades,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Interactive Trading Training</h2>
          <p className="text-gray-400 mt-2">Practice trading strategies in a risk-free environment with AI guidance</p>
        </div>
        {trainingSession && (
          <div className="flex gap-2">
            {trainingSession.isActive ? (
              <Button onClick={pauseTraining} variant="outline" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button onClick={resumeTraining} variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            <Button onClick={resetTraining} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {!trainingSession ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRAINING_SCENARIOS.map((scenario) => (
            <Card key={scenario.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{scenario.title}</CardTitle>
                  <Badge
                    variant={
                      scenario.difficulty === "beginner"
                        ? "default"
                        : scenario.difficulty === "intermediate"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {scenario.difficulty}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {scenario.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />${scenario.initialBalance.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Objectives:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {scenario.objectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                    {scenario.objectives.length > 2 && (
                      <li className="text-xs text-gray-500">+{scenario.objectives.length - 2} more objectives</li>
                    )}
                  </ul>
                </div>

                <Button onClick={() => startTraining(scenario)} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="trading" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="trading" className="data-[state=active]:bg-blue-600">
              Trading Interface
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="guidance" className="data-[state=active]:bg-blue-600">
              AI Guidance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trading Panel */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Execute Trade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Symbol</Label>
                    <Select
                      value={tradeForm.symbol}
                      onValueChange={(value) => setTradeForm((prev) => ({ ...prev, symbol: value }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(trainingSession.currentPrice).map((symbol) => (
                          <SelectItem key={symbol} value={symbol}>
                            {symbol} - ${trainingSession.currentPrice[symbol].toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Type</Label>
                      <Select
                        value={tradeForm.type}
                        onValueChange={(value: "buy" | "sell") => setTradeForm((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Quantity</Label>
                      <Input
                        type="number"
                        value={tradeForm.quantity}
                        onChange={(e) =>
                          setTradeForm((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))
                        }
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Order Type</Label>
                    <Select
                      value={tradeForm.orderType}
                      onValueChange={(value: "market" | "limit") =>
                        setTradeForm((prev) => ({ ...prev, orderType: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {tradeForm.orderType === "limit" && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Limit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tradeForm.limitPrice}
                        onChange={(e) =>
                          setTradeForm((prev) => ({ ...prev, limitPrice: Number.parseFloat(e.target.value) || 0 }))
                        }
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  )}

                  <Button onClick={executeTrade} className="w-full bg-blue-600 hover:bg-blue-700">
                    Execute Trade
                  </Button>
                </CardContent>
              </Card>

              {/* Market Data */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Live Prices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(trainingSession.currentPrice).map(([symbol, price]) => (
                    <div key={symbol} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="font-medium text-white">{symbol}</span>
                      <span className="text-green-400 font-mono">${price.toFixed(2)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cash Balance</span>
                      <span className="text-white font-mono">${trainingSession.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unrealized P&L</span>
                      <span className={`font-mono ${calculatePnL() >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ${calculatePnL().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Value</span>
                      <span className="text-white font-mono font-bold">
                        ${(trainingSession.balance + calculatePnL()).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Scenario Progress</span>
                      <span className="text-blue-400">
                        {trainingSession.trades.length} / {trainingSession.scenario.objectives.length} objectives
                      </span>
                    </div>
                    <Progress
                      value={(trainingSession.trades.length / trainingSession.scenario.objectives.length) * 100}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {trainingSession.feedback.map((message, index) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-gray-700 rounded">
                      {message}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {(() => {
              const metrics = getPerformanceMetrics()
              return metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Return</p>
                          <p
                            className={`text-2xl font-bold ${metrics.returnPercentage >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {metrics.returnPercentage.toFixed(2)}%
                          </p>
                        </div>
                        {metrics.returnPercentage >= 0 ? (
                          <TrendingUp className="w-8 h-8 text-green-400" />
                        ) : (
                          <TrendingDown className="w-8 h-8 text-red-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total P&L</p>
                          <p
                            className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            ${metrics.totalPnL.toFixed(2)}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Win Rate</p>
                          <p className="text-2xl font-bold text-white">{metrics.winRate.toFixed(1)}%</p>
                        </div>
                        <Target className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Total Trades</p>
                          <p className="text-2xl font-bold text-white">{metrics.totalTrades}</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null
            })()}

            {/* Trade History */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trainingSession.trades.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No trades executed yet</p>
                  ) : (
                    trainingSession.trades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          {trade.type === "buy" ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <div>
                            <span className="text-white font-medium">
                              {trade.type.toUpperCase()} {trade.quantity} {trade.symbol}
                            </span>
                            <p className="text-gray-400 text-sm">{trade.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-mono">${trade.price.toFixed(2)}</p>
                          <p className="text-gray-400 text-sm">${(trade.price * trade.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiGuidance ? (
                    <Alert className="bg-blue-900/20 border-blue-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-blue-200">{aiGuidance}</AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-gray-400">AI guidance will appear here as you trade...</p>
                  )}

                  <Button
                    onClick={() => {
                      setShowHint(true)
                      generateAIGuidance(trainingSession.scenario, "hint")
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Hint
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Scenario Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainingSession.scenario.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{objective}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
