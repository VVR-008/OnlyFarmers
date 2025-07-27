import mongoose, { type Document, Schema } from "mongoose"

export interface IForumPost extends Document {
  title: string
  content: string
  author: mongoose.Types.ObjectId
  category: string
  tags: string[]
  upvotes: number
  downvotes: number
  replies: {
    author: mongoose.Types.ObjectId
    content: string
    upvotes: number
    downvotes: number
    createdAt: Date
  }[]
  isPinned: boolean
  isLocked: boolean
  views: number
  createdAt: Date
  updatedAt: Date
}

const ForumPostSchema = new Schema<IForumPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["general", "crops", "equipment", "weather", "market", "pest_control", "fertilizers"],
    },
    tags: [String],
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    replies: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [2000, "Reply cannot exceed 2000 characters"],
        },
        upvotes: {
          type: Number,
          default: 0,
        },
        downvotes: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
ForumPostSchema.index({ author: 1 })
ForumPostSchema.index({ category: 1 })
ForumPostSchema.index({ createdAt: -1 })
ForumPostSchema.index({ upvotes: -1 })
ForumPostSchema.index({ isPinned: -1, createdAt: -1 })

// Text search index
ForumPostSchema.index({
  title: "text",
  content: "text",
  tags: "text",
})

export default mongoose.models.ForumPost || mongoose.model<IForumPost>("ForumPost", ForumPostSchema)
