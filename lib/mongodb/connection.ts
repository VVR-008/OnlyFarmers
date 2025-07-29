// MongoDB connection without external dependencies
// Using native fetch for database operations

import { MongoClient } from "mongodb"

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

  public async getDatabase() {
    if (!this.config.uri) {
      throw new Error("MongoDB URI is not configured")
    }
    const client = new MongoClient(this.config.uri)
    await client.connect()
    return client.db(this.config.database)
  }


}

export const db = MongoDBConnection.getInstance()
