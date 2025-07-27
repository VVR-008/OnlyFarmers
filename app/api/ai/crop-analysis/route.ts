import { type NextRequest, NextResponse } from "next/server"
import { farmingAssistant } from "@/lib/ai/farming-assistant"
import { simpleCache } from "@/lib/cache/simple-cache"

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, cropType, location } = await request.json()

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "Image data is required" }, { status: 400 })
    }

    // Create a simple hash of the image for caching
    const imageHash = btoa(imageBase64.substring(0, 100))
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 20)
    const cacheKey = `crop-analysis:${imageHash}:${cropType}:${location}`

    // Check cache first
    const cachedAnalysis = simpleCache.get(cacheKey)
    if (cachedAnalysis) {
      return NextResponse.json({
        success: true,
        data: cachedAnalysis,
        cached: true,
      })
    }

    // Perform AI analysis
    const analysis = await farmingAssistant.analyzeCropHealth(imageBase64, cropType, location)

    // Cache the result for 24 hours
    simpleCache.set(cacheKey, analysis, 86400)

    return NextResponse.json({
      success: true,
      data: analysis,
      cached: false,
    })
  } catch (error) {
    console.error("Error analyzing crop:", error)
    return NextResponse.json({ success: false, error: "Failed to analyze crop" }, { status: 500 })
  }
}
