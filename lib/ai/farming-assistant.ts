// AI Farming Assistant without external dependencies
// Using native browser APIs and built-in functions

export interface CropHealthAnalysis {
  healthScore: number
  diseases: Array<{
    name: string
    confidence: number
    treatment: string
    severity: "low" | "medium" | "high"
  }>
  pests: Array<{
    name: string
    confidence: number
    treatment: string
    severity: "low" | "medium" | "high"
  }>
  nutritionalDeficiencies: Array<{
    nutrient: string
    confidence: number
    recommendation: string
  }>
  overallRecommendations: string[]
}

export interface MarketPrediction {
  crop: string
  currentPrice: number
  predictedPrice: {
    in7Days: number
    in30Days: number
    in90Days: number
  }
  confidence: number
  factors: string[]
  recommendation: "sell_now" | "wait" | "hold"
}

export class FarmingAssistant {
  private analysisDatabase = {
    diseases: [
      { name: "Early Blight", symptoms: ["dark spots", "yellowing"], treatment: "Copper-based fungicide" },
      { name: "Powdery Mildew", symptoms: ["white powder", "leaf curl"], treatment: "Neem oil spray" },
      { name: "Bacterial Wilt", symptoms: ["wilting", "brown stems"], treatment: "Remove affected plants" },
    ],
    pests: [
      { name: "Aphids", symptoms: ["sticky leaves", "curled leaves"], treatment: "Insecticidal soap" },
      { name: "Spider Mites", symptoms: ["tiny webs", "stippled leaves"], treatment: "Predatory mites" },
    ],
    nutrients: [
      { name: "Nitrogen", deficiency: ["yellowing leaves", "stunted growth"], solution: "Urea fertilizer" },
      { name: "Phosphorus", deficiency: ["purple leaves", "poor flowering"], solution: "Bone meal" },
    ],
  }

  async analyzeCropHealth(imageBase64: string, cropType: string, location: string): Promise<CropHealthAnalysis> {
    // Simulate AI analysis with realistic processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simple image analysis simulation based on image characteristics
    const imageData = this.extractImageFeatures(imageBase64)

    return {
      healthScore: this.calculateHealthScore(imageData),
      diseases: this.detectDiseases(imageData, cropType),
      pests: this.detectPests(imageData),
      nutritionalDeficiencies: this.detectNutrientDeficiencies(imageData),
      overallRecommendations: this.generateRecommendations(cropType, location),
    }
  }

  private extractImageFeatures(imageBase64: string) {
    // Simulate image feature extraction
    const hash = this.simpleHash(imageBase64)
    return {
      brightness: (hash % 100) / 100,
      greenness: ((hash * 7) % 100) / 100,
      spotCount: (hash * 13) % 10,
      leafHealth: ((hash * 17) % 100) / 100,
    }
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < Math.min(str.length, 100); i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private calculateHealthScore(features: any): number {
    const baseScore = 70
    const greenBonus = features.greenness * 20
    const spotPenalty = features.spotCount * 2
    const healthBonus = features.leafHealth * 10

    return Math.max(40, Math.min(100, Math.round(baseScore + greenBonus - spotPenalty + healthBonus)))
  }

  private detectDiseases(features: any, cropType: string) {
    const diseases = []

    if (features.spotCount > 5) {
      diseases.push({
        name: "Early Blight",
        confidence: 0.8,
        treatment: "Apply copper-based fungicide every 7-10 days",
        severity: "medium" as const,
      })
    }

    if (features.brightness < 0.3) {
      diseases.push({
        name: "Powdery Mildew",
        confidence: 0.65,
        treatment: "Use neem oil spray twice weekly",
        severity: "low" as const,
      })
    }

    return diseases
  }

  private detectPests(features: any) {
    const pests = []

    if (features.leafHealth < 0.5) {
      pests.push({
        name: "Aphids",
        confidence: 0.7,
        treatment: "Use insecticidal soap or introduce ladybugs",
        severity: "low" as const,
      })
    }

    return pests
  }

  private detectNutrientDeficiencies(features: any) {
    const deficiencies = []

    if (features.greenness < 0.4) {
      deficiencies.push({
        nutrient: "Nitrogen",
        confidence: 0.75,
        recommendation: "Apply urea fertilizer at 50kg per acre",
      })
    }

    return deficiencies
  }

  private generateRecommendations(cropType: string, location: string): string[] {
    return [
      "Monitor crop health weekly with regular inspections",
      "Ensure proper drainage to prevent fungal diseases",
      "Maintain optimal soil moisture levels",
      "Consider organic pest control methods first",
      "Keep detailed records of treatments and results",
    ]
  }

  async predictMarketPrices(crop: string, location: string, quantity: number): Promise<MarketPrediction> {
    // Simulate market analysis
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const basePrice = this.getBasePriceForCrop(crop)
    const locationMultiplier = this.getLocationMultiplier(location)
    const seasonalFactor = this.getSeasonalFactor(crop)

    const currentPrice = Math.round(basePrice * locationMultiplier * seasonalFactor)

    return {
      crop,
      currentPrice,
      predictedPrice: {
        in7Days: Math.round(currentPrice * (1 + (Math.random() * 0.1 - 0.05))),
        in30Days: Math.round(currentPrice * (1 + (Math.random() * 0.2 - 0.1))),
        in90Days: Math.round(currentPrice * (1 + (Math.random() * 0.3 - 0.15))),
      },
      confidence: 0.75 + Math.random() * 0.2,
      factors: [
        "Seasonal demand patterns",
        "Weather forecast impact",
        "Storage and transportation costs",
        "Government policy changes",
        "Export market conditions",
      ],
      recommendation: this.getRecommendation(currentPrice, basePrice),
    }
  }

  private getBasePriceForCrop(crop: string): number {
    const prices: Record<string, number> = {
      "basmati-rice": 4500,
      wheat: 2000,
      tomato: 3000,
      onion: 2500,
      potato: 1500,
    }
    return prices[crop] || 3000
  }

  private getLocationMultiplier(location: string): number {
    const multipliers: Record<string, number> = {
      punjab: 1.1,
      haryana: 1.05,
      "uttar-pradesh": 1.0,
      maharashtra: 1.08,
      karnataka: 1.03,
    }
    return multipliers[location] || 1.0
  }

  private getSeasonalFactor(crop: string): number {
    const month = new Date().getMonth()
    // Simplified seasonal pricing
    if (month >= 3 && month <= 5) return 1.1 // Summer premium
    if (month >= 10 && month <= 12) return 1.05 // Post-harvest
    return 1.0
  }

  private getRecommendation(currentPrice: number, basePrice: number): "sell_now" | "wait" | "hold" {
    const ratio = currentPrice / basePrice
    if (ratio > 1.1) return "sell_now"
    if (ratio < 0.95) return "wait"
    return "hold"
  }
}

export const farmingAssistant = new FarmingAssistant()
