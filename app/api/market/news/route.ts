import { type NextRequest, NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-data-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")
    const limitParam = searchParams.get("limit")

    const symbols = symbolsParam ? symbolsParam.split(",").map((s) => s.trim().toUpperCase()) : undefined
    const limit = limitParam ? Number.parseInt(limitParam) : 10

    const data = await marketDataService.getMarketNews(symbols, limit)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Market news API error:", error)
    return NextResponse.json({ error: "Failed to fetch market news" }, { status: 500 })
  }
}
