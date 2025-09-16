"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Calendar, Check, Star } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const [currentPlan] = useState("Free")
  const router = useRouter()

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["Basic market data", "1 AI assistant", "Limited historical data", "Community support"],
      current: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      features: [
        "Real-time market data",
        "Multiple AI assistants",
        "Full historical data",
        "Advanced analytics",
        "Priority support",
        "Custom indicators",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      features: [
        "Everything in Pro",
        "API access",
        "White-label options",
        "Dedicated support",
        "Custom integrations",
        "Advanced security",
      ],
    },
  ]

  const billingHistory = [
    {
      date: "2024-01-15",
      description: "Free Plan",
      amount: "$0.00",
      status: "Active",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        </div>

        {/* Current Plan */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription className="text-gray-400">You are currently on the {currentPlan} plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{currentPlan} Plan</h3>
                <p className="text-gray-400">$0/month • No credit card required</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`bg-gray-900 border-gray-700 relative ${plan.popular ? "border-blue-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-400">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.current
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription className="text-gray-400">Your payment history and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-white font-medium">{item.description}</p>
                    <p className="text-sm text-gray-400">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{item.amount}</span>
                    <Badge variant="secondary">{item.status}</Badge>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
