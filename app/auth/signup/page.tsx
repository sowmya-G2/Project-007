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
import { Mail, Lock, User, TrendingUp, AlertCircle, Check } from "lucide-react"

interface ValidationErrors {
  displayName?: string
  email?: string
  password?: string
  repeatPassword?: string
}

const validateDisplayName = (name: string): string | undefined => {
  if (!name) return "Display name is required"
  if (name.length < 2) return "Display name must be at least 2 characters"
  if (name.length > 50) return "Display name must be less than 50 characters"
  return undefined
}

const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return "Please enter a valid email address"
  return undefined
}

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter"
  if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter"
  if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number"
  return undefined
}

const validateRepeatPassword = (password: string, repeatPassword: string): string | undefined => {
  if (!repeatPassword) return "Please confirm your password"
  if (password !== repeatPassword) return "Passwords do not match"
  return undefined
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{
    displayName: boolean
    email: boolean
    password: boolean
    repeatPassword: boolean
  }>({
    displayName: false,
    email: false,
    password: false,
    repeatPassword: false,
  })
  const router = useRouter()

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value)
    if (touched.displayName) {
      const error = validateDisplayName(value)
      setValidationErrors((prev) => ({ ...prev, displayName: error }))
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched.email) {
      const error = validateEmail(value)
      setValidationErrors((prev) => ({ ...prev, email: error }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (touched.password) {
      const error = validatePassword(value)
      setValidationErrors((prev) => ({ ...prev, password: error }))
    }
    if (touched.repeatPassword && repeatPassword) {
      const repeatError = validateRepeatPassword(value, repeatPassword)
      setValidationErrors((prev) => ({ ...prev, repeatPassword: repeatError }))
    }
  }

  const handleRepeatPasswordChange = (value: string) => {
    setRepeatPassword(value)
    if (touched.repeatPassword) {
      const error = validateRepeatPassword(password, value)
      setValidationErrors((prev) => ({ ...prev, repeatPassword: error }))
    }
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))

    switch (field) {
      case "displayName":
        setValidationErrors((prev) => ({ ...prev, displayName: validateDisplayName(displayName) }))
        break
      case "email":
        setValidationErrors((prev) => ({ ...prev, email: validateEmail(email) }))
        break
      case "password":
        setValidationErrors((prev) => ({ ...prev, password: validatePassword(password) }))
        break
      case "repeatPassword":
        setValidationErrors((prev) => ({ ...prev, repeatPassword: validateRepeatPassword(password, repeatPassword) }))
        break
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const displayNameError = validateDisplayName(displayName)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const repeatPasswordError = validateRepeatPassword(password, repeatPassword)

    setValidationErrors({
      displayName: displayNameError,
      email: emailError,
      password: passwordError,
      repeatPassword: repeatPasswordError,
    })
    setTouched({ displayName: true, email: true, password: true, repeatPassword: true })

    if (displayNameError || emailError || passwordError || repeatPasswordError) {
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    !Object.values(validationErrors).some((error) => error) && displayName && email && password && repeatPassword

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)

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
              <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Get Started</h1>
              <p className="text-muted-foreground text-pretty">Create your AI Trading Assistant account</p>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold text-card-foreground">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Join thousands of traders using AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-card-foreground font-medium">
                    Display Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your trading name"
                      value={displayName}
                      onChange={(e) => handleDisplayNameChange(e.target.value)}
                      onBlur={() => handleBlur("displayName")}
                      className={`pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-ring ${
                        validationErrors.displayName && touched.displayName
                          ? "border-destructive focus:ring-destructive/20"
                          : ""
                      }`}
                    />
                    {validationErrors.displayName && touched.displayName && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-destructive" />
                        <p className="text-xs text-destructive">{validationErrors.displayName}</p>
                      </div>
                    )}
                  </div>
                </div>

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
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={`pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-ring ${
                        validationErrors.password && touched.password
                          ? "border-destructive focus:ring-destructive/20"
                          : ""
                      }`}
                    />
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full ${
                                passwordStrength >= level
                                  ? passwordStrength <= 2
                                    ? "bg-destructive"
                                    : passwordStrength === 3
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Password strength:{" "}
                          {passwordStrength <= 2 ? "Weak" : passwordStrength === 3 ? "Medium" : "Strong"}
                        </p>
                      </div>
                    )}
                    {validationErrors.password && touched.password && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-destructive" />
                        <p className="text-xs text-destructive">{validationErrors.password}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repeat-password" className="text-card-foreground font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    {password && repeatPassword && !validationErrors.repeatPassword && (
                      <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                    <Input
                      id="repeat-password"
                      type="password"
                      placeholder="Repeat your password"
                      value={repeatPassword}
                      onChange={(e) => handleRepeatPasswordChange(e.target.value)}
                      onBlur={() => handleBlur("repeatPassword")}
                      className={`pl-10 ${password && repeatPassword && !validationErrors.repeatPassword ? "pr-10" : ""} h-12 bg-input border-border focus:ring-2 focus:ring-ring ${
                        validationErrors.repeatPassword && touched.repeatPassword
                          ? "border-destructive focus:ring-destructive/20"
                          : ""
                      }`}
                    />
                    {validationErrors.repeatPassword && touched.repeatPassword && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-destructive" />
                        <p className="text-xs text-destructive">{validationErrors.repeatPassword}</p>
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
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-accent-foreground hover:text-accent-foreground/80 transition-colors duration-200"
                    >
                      Sign in
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
