import { type NextRequest, NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-data-service"

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  try {
    const symbol = params.symbol.toUpperCase()
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get("period") as "1d" | "5d" | "1m" | "3m" | "1y") || "1m"

    const data = await marketDataService.getHistoricalData(symbol, period)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Historical data API error:", error)
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 })
  }
}
