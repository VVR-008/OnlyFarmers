import mongoose, { type Document, Schema } from "mongoose"

export interface ILandListing extends Document {
  title: string
  images: string[]
  area: {
    value: number
    unit: "acres" | "bigha" | "hectare"
  }
  location: {
    address: string
    district: string
    village: string
    state: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  soilType?: "black" | "alluvial" | "red" | "laterite" | "sandy"
  irrigation?: "canal" | "well" | "borewell" | "river" | "rain_fed"
  price: {
    total: number
    perUnit?: number
  }
  status: "available" | "sold" | "pending" | "under_offer"
  description: string
  seller: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const LandListingSchema = new Schema<ILandListing>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    area: {
      value: {
        type: Number,
        required: [true, "Area value is required"],
        min: [0, "Area cannot be negative"],
      },
      unit: {
        type: String,
        enum: ["acres", "bigha", "hectare"],
        required: true,
      },
    },
    location: {
      address: { type: String, required: true },
      district: { type: String, required: true },
      village: { type: String, required: true },
      state: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    soilType: {
      type: String,
      enum: ["black", "alluvial", "red", "laterite", "sandy"],
    },
    irrigation: {
      type: String,
      enum: ["canal", "well", "borewell", "river", "rain_fed"],
    },
    price: {
      total: {
        type: Number,
        required: [true, "Total price is required"],
        min: [0, "Price cannot be negative"],
      },
      perUnit: Number,
    },
    status: {
      type: String,
      enum: ["available", "sold", "pending", "under_offer"],
      default: "available",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
LandListingSchema.index({ seller: 1 })
LandListingSchema.index({ "location.state": 1, "location.district": 1 })
LandListingSchema.index({ status: 1 })
LandListingSchema.index({ createdAt: -1 })

export default mongoose.models.LandListing || mongoose.model<ILandListing>("LandListing", LandListingSchema)
