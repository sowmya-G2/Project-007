"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, MessageSquare, Clock, Activity, Bot } from "lucide-react"

interface AnalyticsData {
  userGrowth: any[]
  aiUsage: any[]
  activityByHour: any[]
  assistantPopularity: any[]
  userEngagement: {
    totalSessions: number
    avgSessionDuration: number
    activeUsers: number
    messagesSent: number
  }
}

export function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    aiUsage: [],
    activityByHour: [],
    assistantPopularity: [],
    userEngagement: {
      totalSessions: 0,
      avgSessionDuration: 0,
      activeUsers: 0,
      messagesSent: 0,
    },
  })
  const [timeRange, setTimeRange] = useState("7d")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      startDate.setDate(endDate.getDate() - days)

      // Load user growth data
      const { data: userGrowthData } = await supabase
        .from("user_profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      // Process user growth data
      const userGrowth = processUserGrowthData(userGrowthData || [], days)

      // Load AI usage data
      const { data: aiUsageData } = await supabase
        .from("client_activity_logs")
        .select("created_at, activity_type, activity_data")
        .gte("created_at", startDate.toISOString())
        .eq("activity_type", "ai_message")

      // Process AI usage data
      const aiUsage = processAiUsageData(aiUsageData || [], days)

      // Load activity by hour data
      const { data: activityData } = await supabase
        .from("client_activity_logs")
        .select("created_at")
        .gte("created_at", startDate.toISOString())

      const activityByHour = processActivityByHour(activityData || [])

      // Load assistant popularity data
      const { data: assistantData } = await supabase
        .from("user_profiles")
        .select("selected_ai_assistant")
        .not("selected_ai_assistant", "is", null)

      const assistantPopularity = processAssistantPopularity(assistantData || [])

      // Load engagement metrics
      const { data: sessionData } = await supabase
        .from("client_activity_logs")
        .select("user_id, created_at")
        .gte("created_at", startDate.toISOString())

      const userEngagement = processUserEngagement(sessionData || [])

      setAnalyticsData({
        userGrowth,
        aiUsage,
        activityByHour,
        assistantPopularity,
        userEngagement,
      })
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processUserGrowthData = (data: any[], days: number) => {
    const result = []
    const endDate = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const count = data.filter((user) => user.created_at.split("T")[0] === dateStr).length

      result.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: count,
        cumulative: data.filter((user) => new Date(user.created_at) <= date).length,
      })
    }

    return result
  }

  const processAiUsageData = (data: any[], days: number) => {
    const result = []
    const endDate = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const count = data.filter((activity) => activity.created_at.split("T")[0] === dateStr).length

      result.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        messages: count,
      })
    }

    return result
  }

  const processActivityByHour = (data: any[]) => {
    const hourCounts = new Array(24).fill(0)

    data.forEach((activity) => {
      const hour = new Date(activity.created_at).getHours()
      hourCounts[hour]++
    })

    return hourCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      activity: count,
    }))
  }

  const processAssistantPopularity = (data: any[]) => {
    const counts: Record<string, number> = {}

    data.forEach((user) => {
      const assistant = user.selected_ai_assistant
      counts[assistant] = (counts[assistant] || 0) + 1
    })

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }

  const processUserEngagement = (data: any[]) => {
    const uniqueUsers = new Set(data.map((d) => d.user_id)).size
    const totalSessions = data.length

    return {
      totalSessions,
      avgSessionDuration: 12.5, // Mock data - would calculate from actual session data
      activeUsers: uniqueUsers,
      messagesSent: data.length,
    }
  }

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"]

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userEngagement.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userEngagement.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userEngagement.messagesSent}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userEngagement.avgSessionDuration}m</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="usage">AI Usage</TabsTrigger>
          <TabsTrigger value="activity">Activity Patterns</TabsTrigger>
          <TabsTrigger value="assistants">Assistant Popularity</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Over Time</CardTitle>
              <CardDescription>New user registrations and cumulative growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" name="New Users" />
                  <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" name="Total Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Usage Trends</CardTitle>
              <CardDescription>Daily AI message volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.aiUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity by Hour</CardTitle>
              <CardDescription>User activity patterns throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.activityByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activity" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistants" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assistant Popularity</CardTitle>
                <CardDescription>Distribution of AI assistant usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.assistantPopularity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.assistantPopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assistant Performance</CardTitle>
                <CardDescription>Usage metrics by AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.assistantPopularity.map((assistant, index) => (
                  <div key={assistant.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" style={{ color: COLORS[index % COLORS.length] }} />
                        <span className="font-medium">{assistant.name}</span>
                      </div>
                      <Badge variant="secondary">{assistant.value} users</Badge>
                    </div>
                    <Progress
                      value={
                        (assistant.value / Math.max(...analyticsData.assistantPopularity.map((a) => a.value))) * 100
                      }
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
