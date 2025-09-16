import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface Message {
  role: "user" | "assistant"
  content: string
  type?: "learning" | "trading" | "general"
}

interface ChatRequest {
  message: string
  mode: "chat" | "learning" | "trading"
  history: Message[]
}

// AI Assistant personality and knowledge base
const SYSTEM_PROMPTS = {
  chat: `You are an intelligent AI trading assistant with deep knowledge of financial markets, trading strategies, and investment principles. You are helpful, professional, and educational. Always provide accurate information and remind users that trading involves risks.`,

  learning: `You are an expert trading educator. Your role is to teach trading concepts from basics to advanced levels. Break down complex topics into digestible lessons, provide examples, and adapt your teaching style to the user's level. Track learning progress and suggest next steps. Always encourage questions and provide practical examples.`,

  trading: `You are a professional trading analyst. Provide market analysis, trading strategies, and risk management advice. Be specific about entry/exit points when discussing trades, but always emphasize risk management. Stay current with market trends and provide actionable insights while reminding users to do their own research.`,
}

export async function POST(request: NextRequest) {
  try {
    const { message, mode, history }: ChatRequest = await request.json()

    // Build context from conversation history
    const contextMessages = history
      .slice(-5)
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chat

    // Enhanced prompt based on mode
    let enhancedPrompt = message
    if (mode === "learning") {
      enhancedPrompt = `Learning Mode - ${message}\n\nContext: This is a learning session. Please provide educational content, break down concepts clearly, and suggest follow-up topics. If this seems like a new topic, start with fundamentals.`
    } else if (mode === "trading") {
      enhancedPrompt = `Trading Mode - ${message}\n\nContext: This is a trading consultation. Provide actionable insights, market analysis, and specific strategies while emphasizing risk management.`
    }

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: `Previous conversation:\n${contextMessages}\n\nCurrent message: ${enhancedPrompt}`,
      maxTokens: 1000,
    })

    // Generate learning data if in learning mode
    let learningData = null
    if (mode === "learning") {
      learningData = {
        id: Date.now().toString(),
        topic: extractTopic(message),
        progress: Math.min(100, (history.filter((m) => m.type === "learning").length + 1) * 10),
        concepts: extractConcepts(text),
        timestamp: new Date(),
      }
    }

    return NextResponse.json({
      response: text,
      learningData,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}

function extractTopic(message: string): string {
  // Simple topic extraction - could be enhanced with NLP
  const topics = [
    "Technical Analysis",
    "Risk Management",
    "Options Trading",
    "Market Psychology",
    "Fundamental Analysis",
    "Day Trading",
    "Swing Trading",
    "Cryptocurrency",
    "Forex Trading",
  ]

  const lowerMessage = message.toLowerCase()
  const foundTopic = topics.find((topic) => lowerMessage.includes(topic.toLowerCase()))

  return foundTopic || "General Trading"
}

function extractConcepts(text: string): string[] {
  // Extract key concepts from AI response
  const concepts: string[] = []
  const commonConcepts = [
    "support and resistance",
    "moving averages",
    "candlestick patterns",
    "volume analysis",
    "trend lines",
    "risk-reward ratio",
    "stop loss",
    "position sizing",
    "market sentiment",
    "volatility",
  ]

  const lowerText = text.toLowerCase()
  commonConcepts.forEach((concept) => {
    if (lowerText.includes(concept)) {
      concepts.push(concept)
    }
  })

  return concepts.slice(0, 5) // Limit to 5 concepts
}
