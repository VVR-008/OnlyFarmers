import type { ObjectId } from "mongodb"

// MongoDB Schema Definitions with Advanced Agricultural Data Structures

export interface User {
  _id?: ObjectId
  name: string
  email: string
  passwordHash: string
  role: "farmer" | "buyer" 
  phone: string
  location: {
    address: string
    coordinates: [number, number] // [longitude, latitude]
    state: string
    district: string
    pincode: string
  }
  profile: {
    avatar?: string
    bio?: string
    languages: string[]
    experience?: number
    specializations?: string[]
  }
  verification: {
    status: "pending" | "verified" | "rejected"
    kycDocuments: string[]
    verifiedAt?: Date
    verifiedBy?: ObjectId
  }
  farmDetails?: {
    totalArea: number
    soilTypes: string[]
    irrigationMethods: string[]
    certifications: string[]
    equipmentOwned: string[]
  }
  preferences: {
    language: string
    currency: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    privacy: {
      showContact: boolean
      showLocation: boolean
    }
  }
  analytics: {
    totalTransactions: number
    totalRevenue: number
    averageRating: number
    responseTime: number
    lastActive: Date
  }
  createdAt: Date
  updatedAt: Date
  version: number
}

export interface Farm {
  _id?: ObjectId
  farmerId: ObjectId
  name: string
  description?: string
  location: {
    address: string
    coordinates: [number, number]
    boundaries: [number, number][] // Polygon coordinates
    elevation: number
    nearestMarket: string
  }
  details: {
    totalArea: number
    cultivableArea: number
    soilType: string
    soilHealth: {
      ph: number
      nitrogen: number
      phosphorus: number
      potassium: number
      organicMatter: number
      lastTested: Date
    }
    waterSources: {
      type: "borewell" | "river" | "canal" | "rainwater"
      capacity: number
      quality: "good" | "moderate" | "poor"
    }[]
    climate: {
      averageRainfall: number
      temperature: {
        min: number
        max: number
      }
      humidity: number
    }
  }
  infrastructure: {
    buildings: string[]
    equipment: string[]
    storage: {
      type: string
      capacity: number
    }[]
    connectivity: {
      internet: boolean
      mobile: boolean
      electricity: boolean
      roadAccess: "good" | "moderate" | "poor"
    }
  }
  certifications: {
    type: "organic" | "fair_trade" | "gmp" | "iso"
    issuedBy: string
    validUntil: Date
    documentUrl: string
  }[]
  images: string[]
  documents: string[]
  status: "active" | "inactive" | "under_development"
  createdAt: Date
  updatedAt: Date
}

export interface CropListing {
  _id?: ObjectId
  farmerId: ObjectId
  farmId: ObjectId
  title: string
  description: string
  crop: {
    type: string
    variety: string
    category: "grains" | "vegetables" | "fruits" | "spices" | "pulses"
    botanicalName?: string
  }
  quantity: {
    available: number
    reserved: number
    sold: number
    unit: "kg" | "quintal" | "ton" | "bag" | "box"
  }
  pricing: {
    basePrice: number
    currency: string
    priceType: "fixed" | "negotiable" | "auction"
    bulkDiscounts: {
      minQuantity: number
      discountPercent: number
    }[]
    marketPrice?: number
    priceHistory: {
      date: Date
      price: number
    }[]
  }
  quality: {
    grade: "A" | "B" | "C" | "premium"
    moistureContent?: number
    purity?: number
    defects?: number
    size?: string
    color?: string
    organicCertified: boolean
    pesticidesUsed: string[]
    harvestMethod: "manual" | "mechanical"
  }
  timeline: {
    plantedDate?: Date
    harvestDate: Date
    expiryDate?: Date
    availableFrom: Date
    availableUntil: Date
  }
  logistics: {
    packaging: string[]
    minOrderQuantity: number
    deliveryOptions: ("pickup" | "delivery" | "shipping")[]
    deliveryRadius: number
    estimatedDeliveryDays: number
  }
  media: {
    images: string[]
    videos: string[]
    documents: string[]
    virtualTour?: string
  }
  analytics: {
    views: number
    inquiries: number
    bookmarks: number
    shareCount: number
    conversionRate: number
  }
  aiInsights: {
    qualityScore: number
    marketDemand: "high" | "medium" | "low"
    priceRecommendation: number
    bestSellingTime: Date
    competitorAnalysis: {
      averagePrice: number
      totalCompetitors: number
    }
  }
  status: "draft" | "active" | "sold" | "expired" | "suspended"
  featured: boolean
  createdAt: Date
  updatedAt: Date
  version: number
}

export interface Transaction {
  _id?: ObjectId
  transactionId: string
  buyer: {
    id: ObjectId
    name: string
    contact: string
  }
  seller: {
    id: ObjectId
    name: string
    contact: string
  }
  listing: {
    id: ObjectId
    type: "crop" | "land" | "equipment"
    title: string
  }
  order: {
    quantity: number
    unit: string
    unitPrice: number
    totalAmount: number
    taxes: number
    fees: number
    finalAmount: number
  }
  payment: {
    method: "upi" | "bank_transfer" | "card" | "wallet" | "cod"
    status: "pending" | "processing" | "completed" | "failed" | "refunded"
    gatewayTransactionId?: string
    paidAt?: Date
    escrow: {
      enabled: boolean
      releaseConditions: string[]
      releasedAt?: Date
    }
  }
  delivery: {
    method: "pickup" | "delivery" | "shipping"
    address?: string
    coordinates?: [number, number]
    estimatedDate: Date
    actualDate?: Date
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
    trackingId?: string
    deliveryPartner?: string
  }
  contract: {
    terms: string[]
    qualityParameters: Record<string, any>
    penaltyClauses: string[]
    signedAt: Date
    digitalSignatures: {
      buyer: string
      seller: string
    }
  }
  communication: {
    messages: {
      sender: ObjectId
      message: string
      timestamp: Date
      type: "text" | "image" | "document"
    }[]
    lastMessageAt?: Date
  }
  reviews: {
    buyerReview?: {
      rating: number
      comment: string
      createdAt: Date
    }
    sellerReview?: {
      rating: number
      comment: string
      createdAt: Date
    }
  }
  dispute?: {
    raisedBy: ObjectId
    reason: string
    status: "open" | "investigating" | "resolved" | "closed"
    resolution?: string
    resolvedAt?: Date
  }
  createdAt: Date
  updatedAt: Date
  version: number
}

export interface MarketInsights {
  _id?: ObjectId
  region: {
    state: string
    district?: string
    market?: string
  }
  crop: {
    type: string
    variety?: string
  }
  priceData: {
    current: number
    previous: number
    change: number
    changePercent: number
    trend: "rising" | "falling" | "stable"
  }
  supply: {
    available: number
    incoming: number
    seasonal: boolean
  }
  demand: {
    current: number
    projected: number
    factors: string[]
  }
  weather: {
    current: {
      temperature: number
      humidity: number
      rainfall: number
    }
    forecast: {
      date: Date
      temperature: number
      rainfall: number
      advisory: string
    }[]
  }
  predictions: {
    priceIn7Days: number
    priceIn30Days: number
    bestSellingTime: Date
    confidence: number
  }
  lastUpdated: Date
}

export interface FarmDiary {
  _id?: ObjectId
  farmerId: ObjectId
  farmId: ObjectId
  entries: {
    date: Date
    activity: {
      type: "planting" | "watering" | "fertilizing" | "pest_control" | "harvesting" | "maintenance"
      description: string
      cropAffected?: string
      areaAffected?: number
    }
    inputs: {
      type: "seed" | "fertilizer" | "pesticide" | "water" | "labor"
      name: string
      quantity: number
      unit: string
      cost: number
      supplier?: string
    }[]
    observations: {
      weather: string
      soilCondition: string
      cropHealth: string
      pests?: string[]
      diseases?: string[]
    }
    media: {
      images: string[]
      videos: string[]
      notes: string
    }
    expenses: {
      category: string
      amount: number
      description: string
    }[]
    aiAnalysis?: {
      healthScore: number
      recommendations: string[]
      alerts: string[]
    }
  }[]
  analytics: {
    totalExpenses: number
    profitability: number
    yieldPrediction: number
    riskFactors: string[]
  }
  createdAt: Date
  updatedAt: Date
}
