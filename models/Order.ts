import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  _id: string;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  listingType: "crop" | "livestock" | "land";
  
  // Order details
  quantity?: number; // For crops/livestock
  totalPrice: number;
  message: string;
  
  // Status tracking
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  
  // Communication
  buyerContact: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
}

const orderSchema = new Schema<IOrder>({
  buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: Schema.Types.ObjectId, required: true, refPath: 'listingModel' },
  listingType: { 
    type: String, 
    enum: ["crop", "livestock", "land"], 
    required: true 
  },
  
  quantity: { type: Number, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  message: { type: String, required: true, maxlength: 1000 },
  
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending" 
  },
  
  buyerContact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  
  respondedAt: Date,
  completedAt: Date,
}, {
  timestamps: true,
});

// Virtual for listing model
orderSchema.virtual('listingModel').get(function() {
  if (this.listingType === 'crop') return 'CropListing';
  if (this.listingType === 'livestock') return 'LivestockListing';
  if (this.listingType === 'land') return 'LandListing';
});

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
