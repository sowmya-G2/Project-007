"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, UserPlus, CheckCircle } from "lucide-react"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("soumyagodavarthi@gmail.com")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminExists()
  }, [])

  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase.from("admin_users").select("id").limit(1)

      if (error) {
        console.error("Error checking admin users:", error)
        setAdminExists(false)
        return
      }

      setAdminExists(data && data.length > 0)
    } catch (error) {
      console.error("Error checking admin users:", error)
      setAdminExists(false)
    }
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      // Create the admin user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin/dashboard`,
        },
      })

      if (error) throw error

      if (data.user) {
        // Call the function to add admin privileges
        const { error: adminError } = await supabase.rpc("add_admin_user", {
          user_email: email,
        })

        if (adminError) {
          console.error("Error adding admin privileges:", adminError)
          // Still show success as the user was created
        }

        setSuccess("Admin account created successfully! You can now login to the admin portal.")

        // Redirect to admin login after 2 seconds
        setTimeout(() => {
          router.push("/admin/login")
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (adminExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Shield className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p>Checking admin setup...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Already Exists</CardTitle>
            <CardDescription>The admin system has already been set up</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/admin/login")} className="w-full">
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
          <CardDescription>Create the first admin account for your system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Admin Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
