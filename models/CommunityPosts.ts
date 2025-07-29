import mongoose, { type Document, Schema } from "mongoose"

export interface ICommunityPost extends Document {
  title: string
  content: string
  author: mongoose.Types.ObjectId
  category: "crops" | "land" | "general" | "weather" | "market"
  tags: string[]
  upvotes: number
  downvotes: number
  comments: {
    author: mongoose.Types.ObjectId
    content: string
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const CommunityPostSchema = new Schema<ICommunityPost>(
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
      enum: ["crops", "land", "general", "weather", "market"],
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
    comments: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Indexes
CommunityPostSchema.index({ author: 1 })
CommunityPostSchema.index({ category: 1 })
CommunityPostSchema.index({ createdAt: -1 })
CommunityPostSchema.index({ upvotes: -1 })

export default mongoose.models.CommunityPost || mongoose.model<ICommunityPost>("CommunityPost", CommunityPostSchema)
