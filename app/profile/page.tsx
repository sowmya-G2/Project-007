"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, Bot, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  display_name: string
  selected_ai_assistant: string
  ai_assistant_configured: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
  custom_ai_name?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [customAiName, setCustomAiName] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

      if (error) throw error

      setProfile(profileData)
      setDisplayName(profileData.display_name || "")
      setCustomAiName(profileData.custom_ai_name || "")
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!profile) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from("user_profiles")
        .update({
          display_name: displayName,
          custom_ai_name: customAiName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, display_name: displayName, custom_ai_name: customAiName })
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    )
  }

  const userInitials = (profile.display_name || profile.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-blue-600 text-white text-xl">{userInitials}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-white">{profile.display_name || "User"}</CardTitle>
              <CardDescription className="text-gray-400">{profile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-400" />
                <Badge variant={profile.ai_assistant_configured ? "default" : "secondary"}>
                  {profile.ai_assistant_configured ? "AI Configured" : "AI Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="bg-gray-900 border-gray-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-800 border-gray-600 text-gray-400"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter your display name"
                />
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">AI Assistant Settings</h3>

                <div className="space-y-2">
                  <Label className="text-gray-300">Selected Assistant</Label>
                  <div className="p-3 bg-gray-800 rounded-md border border-gray-600">
                    <p className="text-white font-medium">{profile.selected_ai_assistant}</p>
                  </div>
                </div>

                {profile.selected_ai_assistant === "Active AI" && (
                  <div className="space-y-2">
                    <Label htmlFor="customAiName" className="text-gray-300">
                      Custom AI Name
                    </Label>
                    <Input
                      id="customAiName"
                      value={customAiName}
                      onChange={(e) => setCustomAiName(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Give your AI assistant a name"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={updateProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
