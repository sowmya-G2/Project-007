"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Palette, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [marketAlerts, setMarketAlerts] = useState(true)
  const [aiInsights, setAiInsights] = useState(true)
  const [theme, setTheme] = useState("dark")
  const [dataRetention, setDataRetention] = useState("1year")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const saveSettings = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="grid gap-6">
          {/* Notifications */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications about important updates</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Market Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about significant market movements</p>
                </div>
                <Switch checked={marketAlerts} onCheckedChange={setMarketAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">AI Insights</Label>
                  <p className="text-sm text-gray-500">Receive AI-generated trading insights</p>
                </div>
                <Switch checked={aiInsights} onCheckedChange={setAiInsights} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription className="text-gray-400">Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-gray-400">Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Data Retention</Label>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">How long to keep your trading data and history</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
