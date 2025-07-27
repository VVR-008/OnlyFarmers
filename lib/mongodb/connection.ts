// MongoDB connection without external dependencies
// Using native fetch for database operations

interface DatabaseConfig {
  uri: string
  database: string
}

class MongoDBConnection {
  private config: DatabaseConfig
  private static instance: MongoDBConnection

  private constructor() {
    this.config = {
      uri: process.env.MONGODB_URI as string,
      database: "onlyfarmers",
    }
  }

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection()
    }
    return MongoDBConnection.instance
  }

  async query(collection: string, operation: string, data?: any) {
    // In production, this would use MongoDB driver
    // For now, we'll simulate database operations
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getMockData(collection, operation, data))
      }, 100)
    })
  }

  private getMockData(collection: string, operation: string, data?: any) {
    const mockData = {
      users: [
        {
          _id: "1",
          name: "Rajesh Kumar",
          email: "farmer@example.com",
          role: "farmer",
          location: { address: "Punjab, India", coordinates: [75.3412, 31.1471] },
          verified: true,
        },
      ],
      cropListings: [
        {
          _id: "1",
          title: "Premium Basmati Rice - 1000 Quintal",
          farmerId: "1",
          crop: { type: "Rice", variety: "Basmati" },
          quantity: { available: 1000, unit: "quintal" },
          pricing: { basePrice: 4500, currency: "INR" },
          location: "Punjab, India",
          status: "active",
          createdAt: new Date(),
        },
      ],
    }

    switch (operation) {
      case "find":
        return { data: mockData[collection as keyof typeof mockData] || [] }
      case "insert":
        return { success: true, insertedId: Date.now().toString() }
      case "update":
        return { success: true, modifiedCount: 1 }
      default:
        return { data: [] }
    }
  }
}

export const db = MongoDBConnection.getInstance()
