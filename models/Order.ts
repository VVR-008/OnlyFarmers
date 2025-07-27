import mongoose, { type Document, Schema } from "mongoose"

export interface IOrder extends Document {
  cropListing: mongoose.Types.ObjectId
  buyer: mongoose.Types.ObjectId
  farmer: mongoose.Types.ObjectId
  quantity: number
  totalPrice: number
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    cropListing: {
      type: Schema.Types.ObjectId,
      ref: "CropListing",
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
OrderSchema.index({ buyer: 1 })
OrderSchema.index({ farmer: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
