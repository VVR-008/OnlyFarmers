import mongoose, { type Document, Schema } from "mongoose"

export interface IDiary extends Document {
  farmer: mongoose.Types.ObjectId
  date: Date
  title: string
  content: string
  category: "planting" | "watering" | "fertilizing" | "harvesting" | "pest_control" | "weather" | "general"
  cropType?: string
  images?: string[]
  weather?: {
    temperature: number
    humidity: number
    rainfall: number
    conditions: string
  }
  expenses?: {
    category: string
    amount: number
    description: string
  }[]
  tasks?: {
    task: string
    completed: boolean
    dueDate?: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const DiarySchema = new Schema<IDiary>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [2000, "Content cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: ["planting", "watering", "fertilizing", "harvesting", "pest_control", "weather", "general"],
      required: true,
    },
    cropType: String,
    images: [String],
    weather: {
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      conditions: String,
    },
    expenses: [
      {
        category: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        description: String,
      },
    ],
    tasks: [
      {
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
        dueDate: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Indexes
DiarySchema.index({ farmer: 1, date: -1 })
DiarySchema.index({ category: 1 })
DiarySchema.index({ cropType: 1 })

export default mongoose.models.Diary || mongoose.model<IDiary>("Diary", DiarySchema)
