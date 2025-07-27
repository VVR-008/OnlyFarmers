import { type NextRequest, NextResponse } from "next/server"
import { farmingAssistant } from "@/lib/ai/farming-assistant"
import { simpleCache } from "@/lib/cache/simple-cache"

export async function POST(request: NextRequest) {
  try {
    const { crop, location, quantity } = await request.json()

    if (!crop || !location) {
      return NextResponse.json({ success: false, error: "Crop and location are required" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `market-prediction:${crop}:${location}:${quantity || 1000}`
    const cachedPrediction = simpleCache.get(cacheKey)

    if (cachedPrediction) {
      return NextResponse.json({
        success: true,
        data: cachedPrediction,
        cached: true,
      })
    }

    // Generate market prediction
    const prediction = await farmingAssistant.predictMarketPrices(crop, location, quantity || 1000)

    // Cache the result for 30 minutes
    simpleCache.set(cacheKey, prediction, 1800)

    return NextResponse.json({
      success: true,
      data: prediction,
      cached: false,
    })
  } catch (error) {
    console.error("Error generating market prediction:", error)
    return NextResponse.json({ success: false, error: "Failed to generate market prediction" }, { status: 500 })
  }
}
