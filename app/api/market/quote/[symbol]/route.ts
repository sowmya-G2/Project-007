import { type NextRequest, NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-data-service"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()
    const data = await marketDataService.getMarketData(symbol)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Market quote API error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
