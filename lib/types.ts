export interface User {
  id: string
  name: string
  email: string
  role: "farmer" | "buyer" | "admin"
  phone?: string
  location?: string
  avatar?: string
  verified: boolean
  kycStatus?: "pending" | "verified" | "rejected"
  createdAt: string
  updatedAt: string
}

export interface LandListing {
  id: string
  farmerId: string
  title: string
  description?: string
  areaAcres: number
  pricePerAcre: number
  totalPrice: number
  location: string
  latitude?: number
  longitude?: number
  soilType?: string
  waterSource?: string
  irrigationType?: string
  landType: "agricultural" | "residential" | "commercial" | "industrial"
  ownershipType: "freehold" | "leasehold"
  images: string[]
  documents: string[]
  status: "active" | "sold" | "inactive"
  featured: boolean
  createdAt: string
  updatedAt: string
  farmer?: User
}

export interface CropListing {
  id: string
  farmerId: string
  title: string
  description?: string
  cropType: string
  variety?: string
  quantityAvailable: number
  unit: "quintal" | "kg" | "ton" | "bag"
  pricePerUnit: number
  harvestDate?: string
  expiryDate?: string
  qualityGrade?: "A" | "B" | "C" | "premium"
  organicCertified: boolean
  location: string
  latitude?: number
  longitude?: number
  images: string[]
  certifications: string[]
  status: "available" | "sold" | "reserved" | "expired"
  featured: boolean
  createdAt: string
  updatedAt: string
  farmer?: User
}

export interface Transaction {
  id: string
  buyerId: string
  farmerId: string
  listingId: string
  listingType: "land" | "crop"
  quantity?: number
  unitPrice: number
  totalAmount: number
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  deliveryStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod?: string
  paymentId?: string
  escrowStatus: "pending" | "held" | "released" | "disputed"
  deliveryAddress?: string
  deliveryDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  buyer?: User
  farmer?: User
  listing?: LandListing | CropListing
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "order" | "payment" | "listing" | "system" | "promotion"
  read: boolean
  actionUrl?: string
  createdAt: string
}

export interface FarmDiaryEntry {
  id: string
  farmerId: string
  title: string
  content?: string
  entryDate: string
  activityType: "planting" | "watering" | "fertilizing" | "harvesting" | "pest_control" | "other"
  cropType?: string
  weatherConditions?: string
  images: string[]
  expenses?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  reviewerId: string
  revieweeId: string
  transactionId: string
  rating: number
  comment?: string
  createdAt: string
  reviewer?: User
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  subject?: string
  content: string
  read: boolean
  threadId?: string
  createdAt: string
  sender?: User
  receiver?: User
}

export interface SearchFilters {
  query?: string
  location?: string
  cropType?: string
  landType?: string
  priceMin?: number
  priceMax?: number
  areaMin?: number
  areaMax?: number
  organicOnly?: boolean
  verifiedOnly?: boolean
  sortBy?: "price" | "date" | "rating" | "distance"
  sortOrder?: "asc" | "desc"
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
