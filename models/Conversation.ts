import mongoose, { type Document, Schema } from "mongoose"

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]
  listingId?: mongoose.Types.ObjectId
  listingType?: 'crop' | 'livestock' | 'land'
  lastMessage?: {
    content: string
    sender: mongoose.Types.ObjectId
    createdAt: Date
  }
  unreadCount: { [userId: string]: number }
  createdAt: Date
  updatedAt: Date
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  listingId: {
    type: Schema.Types.ObjectId,
    refPath: 'listingType',
  },
  listingType: {
    type: String,
    enum: ['crop', 'livestock', 'land'],
  },
  lastMessage: {
    content: String,
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
})

// Indexes
ConversationSchema.index({ participants: 1 })
ConversationSchema.index({ listingId: 1 })
ConversationSchema.index({ updatedAt: -1 })

// Ensure participants array has exactly 2 users
ConversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('Conversation must have exactly 2 participants'));
  } else {
    next();
  }
})

export default mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema) 