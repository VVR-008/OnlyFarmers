// /models/LivestockListing.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ILivestockListing extends Document {
  title: string;
  animalType: "cattle" | "buffalo" | "goat" | "sheep" | "poultry" | "pig" | "horse" | "other";
  breed: string;
  images: string[];
  age: {
    years: number;
    months: number;
  };
  weight?: number;
  price: number;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    district: string;
    state: string;
  };
  farmer: mongoose.Types.ObjectId;
  description: string;
  status: "available" | "sold" | "reserved";
  healthStatus: "excellent" | "good" | "fair" | "needs_attention";
  vaccinated: boolean;
  pregnant?: boolean;
  milkYield?: number;
  purpose: "dairy" | "meat" | "breeding" | "draft" | "multipurpose";
  quantity: number;
  certification?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LivestockListingSchema = new Schema<ILivestockListing>({
  title: { type: String, required: true, trim: true },
  animalType: { 
    type: String, 
    enum: ["cattle", "buffalo", "goat", "sheep", "poultry", "pig", "horse", "other"], 
    required: true 
  },
  breed: { type: String, required: true, trim: true },
  images: [{ type: String, required: true }],
  age: {
    years: { type: Number, required: true, min: 0 },
    months: { type: Number, required: true, min: 0, max: 11 },
  },
  weight: { type: Number, min: 0 },
  price: { type: Number, required: true, min: 0 },
  location: {
    address: { type: String, required: true },
    coordinates: { lat: Number, lng: Number },
    district: { type: String, required: true },
    state: { type: String, required: true },
  },
  farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ["available", "sold", "reserved"], default: "available" },
  healthStatus: { 
    type: String, 
    enum: ["excellent", "good", "fair", "needs_attention"], 
    required: true 
  },
  vaccinated: { type: Boolean, default: false },
  pregnant: Boolean,
  milkYield: { type: Number, min: 0 },
  purpose: { 
    type: String, 
    enum: ["dairy", "meat", "breeding", "draft", "multipurpose"], 
    required: true 
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  certification: String,
}, { timestamps: true });

export default mongoose.models.LivestockListing || mongoose.model<ILivestockListing>("LivestockListing", LivestockListingSchema);
