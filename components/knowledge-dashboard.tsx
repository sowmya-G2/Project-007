"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Brain,
  TrendingUp,
  User,
  MessageSquare,
  Lightbulb,
  Target,
  Search,
  BarChart3,
  Shield,
  Clock,
  Star,
} from "lucide-react"
import {
  knowledgeBase,
  type UserProfile,
  type TradingPattern,
  type LearningInsight,
  type MarketInsight,
  type ConversationMemory,
} from "@/lib/knowledge-base"
import { createClient } from "@/lib/supabase/client"

interface KnowledgeDashboardProps {
  userId?: string
}

export default function KnowledgeDashboard({ userId: propUserId }: KnowledgeDashboardProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [tradingPatterns, setTradingPatterns] = useState<TradingPattern[]>([])
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([])
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([])
  const [conversationMemory, setConversationMemory] = useState<ConversationMemory[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const initializeUser = async () => {
      if (propUserId) {
        setUserId(propUserId)
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          // Initialize user data in knowledge base if not exists
          if (!knowledgeBase.getUserProfile(user.id)) {
            knowledgeBase.updateUserProfile(user.id, {
              name: user.email?.split("@")[0] || "User",
              email: user.email || "",
              tradingExperience: "intermediate",
              riskTolerance: "moderate",
              preferredAssets: ["AAPL", "GOOGL", "TSLA"],
              tradingGoals: ["Long-term growth", "Risk management"],
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })
          }
        } else {
          // Fallback to demo user for development
          setUserId("demo-user")
        }
      }
      setIsLoading(false)
    }

    initializeUser()
  }, [propUserId, supabase.auth])

  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId])

  const loadUserData = () => {
    if (!userId) return

    setUserProfile(knowledgeBase.getUserProfile(userId) || null)
    setTradingPatterns(knowledgeBase.getTradingPatterns(userId))
    setLearningInsights(knowledgeBase.getLearningInsights(userId))
    setMarketInsights(knowledgeBase.getMarketInsights())
    setConversationMemory(knowledgeBase.getConversationMemory(userId))
    setAnalytics(knowledgeBase.getUserAnalytics(userId))
    setRecommendations(knowledgeBase.getPersonalizedRecommendations(userId))
  }

  const handleSearch = () => {
    if (searchQuery.trim() && userId) {
      const results = knowledgeBase.searchMemory(userId, searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults(null)
    }
  }

  const getUnderstandingColor = (understanding: string) => {
    switch (understanding) {
      case "excellent":
        return "text-green-400"
      case "good":
        return "text-blue-400"
      case "basic":
        return "text-yellow-400"
      case "poor":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getUnderstandingScore = (understanding: string) => {
    switch (understanding) {
      case "excellent":
        return 100
      case "good":
        return 75
      case "basic":
        return 50
      case "poor":
        return 25
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-white">Loading knowledge base...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-white mb-4">Unable to load user data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Conversations</p>
                  <p className="text-2xl font-bold">{analytics.totalConversations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Learning Progress</p>
                  <p className="text-2xl font-bold">{analytics.learningProgress}%</p>
                </div>
                <Brain className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Trading Patterns</p>
                  <p className="text-2xl font-bold">{analytics.tradingPatternCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Risk Score</p>
                  <p className="text-2xl font-bold">{analytics.riskScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Engagement</p>
                  <p className="text-2xl font-bold">{analytics.engagementScore}%</p>
                </div>
                <Star className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-400" />
            Knowledge Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, patterns, insights..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </div>

          {searchResults && (
            <div className="mt-4 space-y-4">
              {searchResults.conversations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Conversations ({searchResults.conversations.length})</h4>
                  <div className="space-y-2">
                    {searchResults.conversations.slice(0, 3).map((conv: ConversationMemory) => (
                      <div key={conv.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="font-medium text-sm">{conv.topic}</p>
                        <p className="text-xs text-white/60">{conv.timestamp.toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.patterns.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Trading Patterns ({searchResults.patterns.length})</h4>
                  <div className="space-y-2">
                    {searchResults.patterns.slice(0, 3).map((pattern: TradingPattern) => (
                      <div key={pattern.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="font-medium text-sm">{pattern.description}</p>
                        <p className="text-xs text-white/60">Success Rate: {pattern.successRate}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.insights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Market Insights ({searchResults.insights.length})</h4>
                  <div className="space-y-2">
                    {searchResults.insights.slice(0, 3).map((insight: MarketInsight) => (
                      <div key={insight.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs text-white/60">
                          {insight.symbol} - {insight.confidence}% confidence
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/60">Name</p>
                      <p className="font-medium">{userProfile.name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Experience Level</p>
                      <Badge variant="outline" className="text-white border-white/20">
                        {userProfile.tradingExperience}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Risk Tolerance</p>
                      <Badge
                        variant={
                          userProfile.riskTolerance === "aggressive"
                            ? "destructive"
                            : userProfile.riskTolerance === "moderate"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {userProfile.riskTolerance}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Timezone</p>
                      <p className="font-medium">{userProfile.timezone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-white/60 mb-2">Preferred Assets</p>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.preferredAssets.map((asset) => (
                        <Badge key={asset} variant="outline" className="text-white border-white/20">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-white/60 mb-2">Trading Goals</p>
                    <div className="space-y-1">
                      {userProfile.tradingGoals.map((goal, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-400" />
                          <span className="text-sm">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/60">No profile data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Trading Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {tradingPatterns.map((pattern) => (
                    <div key={pattern.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-white border-white/20">
                          {pattern.patternType.replace("_", " ")}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{pattern.successRate}% Success</p>
                          <p className="text-xs text-white/60">{pattern.frequency} occurrences</p>
                        </div>
                      </div>
                      <p className="text-sm mb-3">{pattern.description}</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-white/60 mb-1">Conditions:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(pattern.conditions).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {pattern.examples.length > 0 && (
                          <div>
                            <p className="text-xs text-white/60 mb-1">Examples:</p>
                            <p className="text-xs text-white/80">{pattern.examples[0]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-green-400" />
                Learning Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningInsights.map((insight) => (
                  <div key={insight.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{insight.concept}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getUnderstandingColor(insight.understanding)}`}>
                          {insight.understanding}
                        </span>
                        <Progress value={getUnderstandingScore(insight.understanding)} className="w-20" />
                      </div>
                    </div>

                    {insight.strengths.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-white/60 mb-1">Strengths:</p>
                        <div className="flex flex-wrap gap-1">
                          {insight.strengths.map((strength, index) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.strugglingAreas.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-white/60 mb-1">Areas for Improvement:</p>
                        <div className="flex flex-wrap gap-1">
                          {insight.strugglingAreas.map((area, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.recommendedActions.length > 0 && (
                      <div>
                        <p className="text-xs text-white/60 mb-1">Recommended Actions:</p>
                        <ul className="text-xs text-white/80 space-y-1">
                          {insight.recommendedActions.map((action, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Lightbulb className="h-3 w-3 text-yellow-400" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {marketInsights.slice(0, 10).map((insight) => (
                    <div key={insight.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-white border-white/20">
                            {insight.symbol}
                          </Badge>
                          <Badge
                            variant={
                              insight.insightType === "technical"
                                ? "default"
                                : insight.insightType === "fundamental"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {insight.insightType}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{insight.confidence}%</p>
                          <Badge
                            variant={
                              insight.impact === "high"
                                ? "destructive"
                                : insight.impact === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">{insight.title}</h4>
                      <p className="text-sm text-white/80 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {insight.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <Clock className="h-3 w-3" />
                          {insight.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                Conversation Memory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {conversationMemory.map((memory) => (
                    <div key={memory.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{memory.topic}</h4>
                        <Badge
                          variant={
                            memory.sentiment === "positive"
                              ? "default"
                              : memory.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {memory.sentiment}
                        </Badge>
                      </div>
                      {memory.keyPoints.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-white/60 mb-1">Key Points:</p>
                          <ul className="text-xs text-white/80 space-y-1">
                            {memory.keyPoints.slice(0, 2).map((point, index) => (
                              <li key={index}>• {point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-white/60">{memory.timestamp.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-6">
            {recommendations && (
              <>
                {/* Learning Recommendations */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-green-400" />
                      Learning Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recommendations.learningTopics.map((topic: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded bg-white/5">
                          <Lightbulb className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trading Opportunities */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      Trading Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recommendations.tradingOpportunities.map((opportunity: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded bg-white/5">
                          <Target className="h-4 w-4 text-blue-400" />
                          <span className="text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Alerts */}
                {recommendations.riskAlerts.length > 0 && (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-400" />
                        Risk Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recommendations.riskAlerts.map((alert: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20"
                          >
                            <Shield className="h-4 w-4 text-red-400" />
                            <span className="text-sm">{alert}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
