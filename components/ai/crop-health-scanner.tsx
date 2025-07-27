"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, Scan, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { CropHealthAnalysis } from "@/lib/ai/farming-assistant"
import { farmingAssistant } from "@/lib/ai/farming-assistant"

export default function CropHealthScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [analysis, setAnalysis] = useState<CropHealthAnalysis | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setSelectedImage(imageData)

        // Stop camera
        const stream = video.srcObject as MediaStream
        stream?.getTracks().forEach((track) => track.stop())
        setCameraActive(false)

        analyzeCropHealth(imageData)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setSelectedImage(imageData)
        analyzeCropHealth(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeCropHealth = async (imageData: string) => {
    setIsScanning(true)
    setAnalysis(null)
    setScanProgress(0)

    // Simulate progressive scanning
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const result = await farmingAssistant.analyzeCropHealth(imageData, "rice", "punjab")
      setScanProgress(100)
      setTimeout(() => {
        setAnalysis(result)
        setIsScanning(false)
      }, 500)
    } catch (error) {
      console.error("Error analyzing crop health:", error)
      setIsScanning(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-green-600" />
            AI Crop Health Scanner
          </CardTitle>
          <CardDescription>
            Upload or capture an image of your crops to get instant health analysis and treatment recommendations
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image Capture/Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={startCamera}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-2 bg-transparent"
              disabled={cameraActive}
            >
              <Camera className="h-8 w-8" />
              <span>Capture Photo</span>
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-2 bg-transparent"
            >
              <Upload className="h-8 w-8" />
              <span>Upload Image</span>
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          {/* Camera View */}
          {cameraActive && (
            <div className="relative animate-in fade-in-50 duration-300">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
              <Button
                onClick={captureImage}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                size="lg"
              >
                Capture
              </Button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="relative animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Selected crop"
                className="w-full max-h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Scanning Animation */}
          {isScanning && (
            <div className="text-center space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin">
                  <Scan className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-lg font-medium">Analyzing crop health...</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Our AI is examining your crop for diseases, pests, and nutritional deficiencies
              </p>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              {/* Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Overall Health Score</span>
                    <span className={`text-2xl font-bold ${getHealthScoreColor(analysis.healthScore)}`}>
                      {analysis.healthScore}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={analysis.healthScore} className="w-full" />
                </CardContent>
              </Card>

              {/* Diseases */}
              {analysis.diseases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Detected Diseases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.diseases.map((disease, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{disease.name}</span>
                              <Badge variant={getSeverityColor(disease.severity)}>{disease.severity} severity</Badge>
                            </div>
                            <p className="text-sm">
                              <strong>Confidence:</strong> {Math.round(disease.confidence * 100)}%
                            </p>
                            <p className="text-sm">
                              <strong>Treatment:</strong> {disease.treatment}
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Pests */}
              {analysis.pests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Detected Pests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.pests.map((pest, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{pest.name}</span>
                              <Badge variant={getSeverityColor(pest.severity)}>{pest.severity} severity</Badge>
                            </div>
                            <p className="text-sm">
                              <strong>Confidence:</strong> {Math.round(pest.confidence * 100)}%
                            </p>
                            <p className="text-sm">
                              <strong>Treatment:</strong> {pest.treatment}
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Nutritional Deficiencies */}
              {analysis.nutritionalDeficiencies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      Nutritional Deficiencies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.nutritionalDeficiencies.map((deficiency, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{deficiency.nutrient} Deficiency</span>
                              <Badge variant="outline">{Math.round(deficiency.confidence * 100)}% confidence</Badge>
                            </div>
                            <p className="text-sm">
                              <strong>Recommendation:</strong> {deficiency.recommendation}
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Overall Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.overallRecommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button className="flex-1">Save Analysis</Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Share with Expert
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnalysis(null)
                    setSelectedImage(null)
                  }}
                  className="bg-transparent"
                >
                  Scan Another
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
