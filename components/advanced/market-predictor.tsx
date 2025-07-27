"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, AlertCircle, Target } from "lucide-react"
import { farmingAssistant } from "@/lib/ai/farming-assistant"
import type { MarketPrediction } from "@/lib/ai/farming-assistant"

// Simple chart component without external dependencies
function SimpleChart({ data }: { data: Array<{ date: string; price: number; prediction?: number }> }) {
  const maxPrice = Math.max(...data.map((d) => Math.max(d.price, d.prediction || 0)))
  const minPrice = Math.min(...data.map((d) => Math.min(d.price, d.prediction || 0)))
  const priceRange = maxPrice - minPrice

  return (
    <div className="h-64 w-full relative bg-gray-50 rounded-lg p-4">
      <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
        ))}

        {/* Price line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          points={data
            .map((d, i) => {
              const x = (i / (data.length - 1)) * 400
              const y = 200 - ((d.price - minPrice) / priceRange) * 200
              return `${x},${y}`
            })
            .join(" ")}
        />

        {/* Prediction line */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="5,5"
          points={data
            .filter((d) => d.prediction)
            .map((d, i) => {
              const actualIndex = data.findIndex((item) => item === d)
              const x = (actualIndex / (data.length - 1)) * 400
              const y = 200 - ((d.prediction! - minPrice) / priceRange) * 200
              return `${x},${y}`
            })
            .join(" ")}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 400}
            cy={200 - ((d.price - minPrice) / priceRange) * 200}
            r="3"
            fill="#10b981"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span>Actual Price</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-yellow-500 border-dashed"></div>
          <span>Predicted Price</span>
        </div>
      </div>
    </div>
  )
}

const mockPriceData = [
  { date: "2024-01-01", price: 4200 },
  { date: "2024-01-02", price: 4250 },
  { date: "2024-01-03", price: 4180 },
  { date: "2024-01-04", price: 4300 },
  { date: "2024-01-05", price: 4350 },
  { date: "2024-01-06", price: 4400 },
  { date: "2024-01-07", price: 4450, prediction: 4500 },
  { date: "2024-01-08", price: 4500, prediction: 4550 },
  { date: "2024-01-09", price: 4520, prediction: 4600 },
  { date: "2024-01-10", price: 4580, prediction: 4650 },
]

export default function MarketPredictor() {
  const [selectedCrop, setSelectedCrop] = useState("basmati-rice")
  const [selectedLocation, setSelectedLocation] = useState("punjab")
  const [prediction, setPrediction] = useState<MarketPrediction | null>(null)
  const [loading, setLoading] = useState(false)

  const generatePrediction = async () => {
    setLoading(true)
    try {
      const result = await farmingAssistant.predictMarketPrices(selectedCrop, selectedLocation, 1000)
      setPrediction(result)
    } catch (error) {
      console.error("Error generating prediction:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generatePrediction()
  }, [selectedCrop, selectedLocation])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "falling":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "sell_now":
        return "bg-green-100 text-green-800 border-green-200"
      case "wait":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case "sell_now":
        return "Sell Now - Prices may decline"
      case "wait":
        return "Wait - Better prices expected"
      case "hold":
        return "Hold - Market uncertain"
      default:
        return "Monitor - Insufficient data"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            AI Market Price Predictor
          </CardTitle>
          <CardDescription>
            Get AI-powered price predictions and optimal selling recommendations for your crops
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Crop</label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose crop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basmati-rice">Basmati Rice</SelectItem>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="tomato">Tomato</SelectItem>
                  <SelectItem value="onion">Onion</SelectItem>
                  <SelectItem value="potato">Potato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="punjab">Punjab</SelectItem>
                  <SelectItem value="haryana">Haryana</SelectItem>
                  <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price Trend & Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart data={mockPriceData} />
            </CardContent>
          </Card>

          {/* Prediction Results */}
          {loading ? (
            <div className="text-center py-8 animate-in fade-in-50 duration-300">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing market data and generating predictions...</p>
            </div>
          ) : (
            prediction && (
              <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                {/* Current Price & Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-3xl font-bold text-green-600">₹{prediction.currentPrice.toLocaleString()}</p>
                        <div className="flex items-center justify-center gap-2">
                          {getTrendIcon("rising")}
                          <span className="text-sm capitalize">Rising</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">AI Recommendation</p>
                        <Badge
                          className={`text-sm px-3 py-1 ${getRecommendationColor(prediction.recommendation)}`}
                          variant="outline"
                        >
                          {getRecommendationText(prediction.recommendation)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {Math.round(prediction.confidence * 100)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Price Predictions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Price Predictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">7 Days</p>
                        <p className="text-xl font-semibold">₹{prediction.predictedPrice.in7Days.toLocaleString()}</p>
                        <p className="text-xs text-green-600">
                          +
                          {(
                            ((prediction.predictedPrice.in7Days - prediction.currentPrice) / prediction.currentPrice) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">30 Days</p>
                        <p className="text-xl font-semibold">₹{prediction.predictedPrice.in30Days.toLocaleString()}</p>
                        <p className="text-xs text-green-600">
                          +
                          {(
                            ((prediction.predictedPrice.in30Days - prediction.currentPrice) / prediction.currentPrice) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">90 Days</p>
                        <p className="text-xl font-semibold">₹{prediction.predictedPrice.in90Days.toLocaleString()}</p>
                        <p className="text-xs text-green-600">
                          +
                          {(
                            ((prediction.predictedPrice.in90Days - prediction.currentPrice) / prediction.currentPrice) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Market Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prediction.factors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button className="flex-1">Set Price Alert</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Share Analysis
                  </Button>
                  <Button variant="outline" onClick={generatePrediction} className="bg-transparent">
                    Refresh Prediction
                  </Button>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
