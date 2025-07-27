// /app/dashboard/ai-assistant/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CropHealthScanner from "@/components/ai/crop-health-scanner"
import MarketPredictor from "@/components/advanced/market-predictor"
import VoiceNavigation from "@/components/advanced/voice-navigation"
import { Brain, Scan, TrendingUp, Mic, Lightbulb, BarChart3 } from "lucide-react"

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("health-scanner")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          AI Farming Assistant
        </h1>
        <p className="text-gray-600 text-lg">
          Leverage artificial intelligence to optimize your farming operations with advanced crop analysis, market
          predictions, and intelligent recommendations.
        </p>
      </div>

      {/* AI Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("health-scanner")}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <Scan className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Crop Health Scanner</h3>
              <p className="text-sm text-muted-foreground">AI-powered disease detection</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("market-predictor")}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Market Predictor</h3>
              <p className="text-sm text-muted-foreground">Price forecasting & timing</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("voice-navigation")}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Voice Navigation</h3>
              <p className="text-sm text-muted-foreground">Hands-free control</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("recommendations")}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Lightbulb className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Smart Recommendations</h3>
              <p className="text-sm text-muted-foreground">Personalized farming advice</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health-scanner" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            <span className="hidden sm:inline">Health Scanner</span>
          </TabsTrigger>
          <TabsTrigger value="market-predictor" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Market Predictor</span>
          </TabsTrigger>
          <TabsTrigger value="voice-navigation" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice Control</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Recommendations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health-scanner">
          <CropHealthScanner />
        </TabsContent>

        <TabsContent value="market-predictor">
          <MarketPredictor />
        </TabsContent>

        <TabsContent value="voice-navigation">
          <VoiceNavigation />
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                Smart Farming Recommendations
              </CardTitle>
              <CardDescription>
                Get personalized recommendations based on your farm data, weather conditions, and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">AI Recommendations Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced farming recommendations based on your specific conditions and goals
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
