import { type NextRequest, NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-data-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    const data = await marketDataService.searchSymbols(query)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Symbol search API error:", error)
    return NextResponse.json({ error: "Failed to search symbols" }, { status: 500 })
  }
}
