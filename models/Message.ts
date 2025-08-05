import mongoose, { type Document, Schema } from "mongoose"

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  content: string
  messageType: 'text' | 'image' | 'file'
  read: boolean
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Message content is required"],
    maxlength: [2000, "Message cannot exceed 2000 characters"],
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Indexes
MessageSchema.index({ conversationId: 1, createdAt: 1 })
MessageSchema.index({ sender: 1 })
MessageSchema.index({ read: 1 })

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema) 