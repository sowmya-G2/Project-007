"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Mail, Lock, TrendingUp, AlertCircle } from "lucide-react"

interface ValidationErrors {
  email?: string
  password?: string
}

const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return "Please enter a valid email address"
  return undefined
}

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required"
  if (password.length < 6) return "Password must be at least 6 characters"
  return undefined
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  })
  const router = useRouter()

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched.email) {
      const emailError = validateEmail(value)
      setValidationErrors((prev) => ({ ...prev, email: emailError }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (touched.password) {
      const passwordError = validatePassword(value)
      setValidationErrors((prev) => ({ ...prev, password: passwordError }))
    }
  }

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === "email") {
      const emailError = validateEmail(email)
      setValidationErrors((prev) => ({ ...prev, email: emailError }))
    } else {
      const passwordError = validatePassword(password)
      setValidationErrors((prev) => ({ ...prev, password: passwordError }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    setValidationErrors({ email: emailError, password: passwordError })
    setTouched({ email: true, password: true })

    if (emailError || passwordError) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = !validationErrors.email && !validationErrors.password && email && password

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-card to-muted">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Welcome Back</h1>
              <p className="text-muted-foreground text-pretty">Sign in to your AI Trading Assistant</p>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold text-card-foreground">Sign In</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-card-foreground font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-ring ${
                        validationErrors.email && touched.email ? "border-destructive focus:ring-destructive/20" : ""
                      }`}
                    />
                    {validationErrors.email && touched.email && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-destructive" />
                        <p className="text-xs text-destructive">{validationErrors.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-card-foreground font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={`pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-ring ${
                        validationErrors.password && touched.password
                          ? "border-destructive focus:ring-destructive/20"
                          : ""
                      }`}
                    />
                    {validationErrors.password && touched.password && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-destructive" />
                        <p className="text-xs text-destructive">{validationErrors.password}</p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="font-semibold text-accent-foreground hover:text-accent-foreground/80 transition-colors duration-200"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
