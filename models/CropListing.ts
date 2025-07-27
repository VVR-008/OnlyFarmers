import mongoose, { type Document, Schema } from "mongoose"

export interface ICropListing extends Document {
  cropName: string
  images: string[]
  quantity: {
    value: number
    unit: "kg" | "quintal" | "ton" | "bag"
  }
  price: number
  location: {
    address: string
    coordinates?: {
      lat: number
      lng: number
    }
    district: string
    state: string
  }
  grade: "A" | "B" | "C" | "Premium"
  farmer: mongoose.Types.ObjectId
  description: string
  status: "available" | "sold" | "reserved"
  createdAt: Date
  updatedAt: Date
}

const CropListingSchema = new Schema<ICropListing>(
  {
    cropName: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    quantity: {
      value: {
        type: Number,
        required: [true, "Quantity value is required"],
        min: [0, "Quantity cannot be negative"],
      },
      unit: {
        type: String,
        enum: ["kg", "quintal", "ton", "bag"],
        required: true,
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
      district: { type: String, required: true },
      state: { type: String, required: true },
    },
    grade: {
      type: String,
      enum: ["A", "B", "C", "Premium"],
      required: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
CropListingSchema.index({ farmer: 1 })
CropListingSchema.index({ cropName: 1 })
CropListingSchema.index({ "location.state": 1, "location.district": 1 })
CropListingSchema.index({ status: 1 })
CropListingSchema.index({ createdAt: -1 })

export default mongoose.models.CropListing || mongoose.model<ICropListing>("CropListing", CropListingSchema)
