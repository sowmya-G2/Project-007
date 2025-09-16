import { type NextRequest, NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-data-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")

    if (!symbolsParam) {
      return NextResponse.json({ error: "Symbols parameter is required" }, { status: 400 })
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase())
    const data = await marketDataService.getMultipleQuotes(symbols)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Market quotes API error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
