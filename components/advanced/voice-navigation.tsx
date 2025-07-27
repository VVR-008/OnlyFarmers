"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Volume2, VolumeX, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VoiceCommand {
  command: string
  action: string
  confidence: number
  timestamp: Date
}

// Declare speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

const supportedLanguages = [
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "en-IN", name: "English (India)", flag: "🇮🇳" },
  { code: "pa-IN", name: "Punjabi", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", flag: "🇮🇳" },
]

const voiceCommands = {
  "hi-IN": {
    खोजें: "search",
    "सूची दिखाएं": "show_listings",
    डैशबोर्ड: "dashboard",
    प्रोफाइल: "profile",
    मदद: "help",
    "बंद करें": "close",
  },
  "en-IN": {
    search: "search",
    "show listings": "show_listings",
    dashboard: "dashboard",
    profile: "profile",
    help: "help",
    close: "close",
  },
}

export default function VoiceNavigation() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN")
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()

      // Configure recognition
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = selectedLanguage

      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.resultIndex]
        const transcript = result[0].transcript.toLowerCase().trim()
        const confidence = result[0].confidence || 0.8

        setTranscript(transcript)
        setConfidence(confidence)

        if (result.isFinal) {
          processVoiceCommand(transcript, confidence)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [selectedLanguage])

  const processVoiceCommand = (transcript: string, confidence: number) => {
    const commands = voiceCommands[selectedLanguage as keyof typeof voiceCommands] || voiceCommands["en-IN"]

    // Find matching command
    let matchedAction = null
    let matchedCommand = null

    for (const [command, action] of Object.entries(commands)) {
      if (transcript.includes(command)) {
        matchedAction = action
        matchedCommand = command
        break
      }
    }

    if (matchedAction && matchedCommand) {
      const voiceCommand: VoiceCommand = {
        command: matchedCommand,
        action: matchedAction,
        confidence,
        timestamp: new Date(),
      }

      setLastCommand(voiceCommand)
      executeCommand(matchedAction)
      speak(getSuccessMessage(matchedAction))
    } else {
      const errorMessage =
        selectedLanguage === "hi-IN"
          ? "कमांड समझ नहीं आया, कृपया दोबारा कोशिश करें"
          : "Command not understood, please try again"
      speak(errorMessage)
    }
  }

  const executeCommand = (action: string) => {
    switch (action) {
      case "search":
        window.location.href = "/listings"
        break
      case "dashboard":
        window.location.href = "/dashboard"
        break
      case "profile":
        window.location.href = "/profile"
        break
      case "show_listings":
        window.location.href = "/listings"
        break
      case "help":
        window.location.href = "/help"
        break
      case "close":
        window.history.back()
        break
      default:
        console.log("Unknown command:", action)
    }
  }

  const getSuccessMessage = (action: string) => {
    const messages = {
      "hi-IN": {
        search: "खोज शुरू की जा रही है",
        dashboard: "डैशबोर्ड खोला जा रहा है",
        profile: "प्रोफाइल खोला जा रहा है",
        help: "मदद अनुभाग खोला जा रहा है",
      },
      "en-IN": {
        search: "Starting search",
        dashboard: "Opening dashboard",
        profile: "Opening profile",
        help: "Opening help section",
      },
    }

    return (
      messages[selectedLanguage as keyof typeof messages]?.[action as keyof (typeof messages)["en-IN"]] ||
      `Executing ${action}`
    )
  }

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLanguage
      utterance.rate = 0.9
      utterance.pitch = 1

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = selectedLanguage
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5 text-gray-400" />
            Voice Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Voice navigation is not supported in your browser. Please use a modern browser with speech recognition
              support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-blue-600" />
          Voice Navigation
        </CardTitle>
        <CardDescription>Navigate the app using voice commands in your preferred language</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Language</label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Choose language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="relative"
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Listening
              </>
            )}
            {isListening && <div className="absolute inset-0 rounded-md bg-red-500 opacity-20 animate-pulse" />}
          </Button>

          <Button
            onClick={isSpeaking ? stopSpeaking : () => speak("Voice navigation is ready")}
            variant={isSpeaking ? "destructive" : "outline"}
            size="lg"
            className="bg-transparent"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-5 w-5 mr-2" />
                Stop Speaking
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5 mr-2" />
                Test Voice
              </>
            )}
          </Button>
        </div>

        {/* Live Transcript */}
        {(isListening || transcript) && (
          <div className="space-y-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Live Transcript</span>
                    {isListening && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        Listening...
                      </Badge>
                    )}
                  </div>
                  <p className="text-blue-900 min-h-[1.5rem]">{transcript || "Speak now..."}</p>
                  {confidence > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600">Confidence:</span>
                      <div className="flex-1 bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-blue-600">{Math.round(confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Last Command */}
        {lastCommand && (
          <div className="space-y-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Last Command</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      Executed
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600">Command:</span>
                      <p className="text-green-900 font-medium">{lastCommand.command}</p>
                    </div>
                    <div>
                      <span className="text-green-600">Action:</span>
                      <p className="text-green-900 font-medium">{lastCommand.action}</p>
                    </div>
                  </div>
                  <div className="text-xs text-green-600">Executed at {lastCommand.timestamp.toLocaleTimeString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Available Commands */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Available Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(
                voiceCommands[selectedLanguage as keyof typeof voiceCommands] || voiceCommands["en-IN"],
              ).map(([command, action]) => (
                <div key={command} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">"{command}"</span>
                  <Badge variant="outline" className="text-xs bg-transparent">
                    {action.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
