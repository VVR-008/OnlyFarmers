import mongoose, { type Document, Schema } from "mongoose"

export interface IChat extends Document {
  user: mongoose.Types.ObjectId
  message: string
  response?: string
  isAI: boolean
  context?: string
  metadata?: {
    model?: string
    tokens?: number
    responseTime?: number
  }
  createdAt: Date
}

const ChatSchema = new Schema<IChat>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    response: {
      type: String,
      maxlength: [5000, "Response cannot exceed 5000 characters"],
    },
    isAI: {
      type: Boolean,
      default: true,
    },
    context: String,
    metadata: {
      model: String,
      tokens: Number,
      responseTime: Number,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
ChatSchema.index({ user: 1, createdAt: -1 })
ChatSchema.index({ isAI: 1 })

export default mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema)
