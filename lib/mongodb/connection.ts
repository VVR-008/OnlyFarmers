// MongoDB connection without external dependencies
// Using native fetch for database operations

import { MongoClient } from "mongodb"

interface DatabaseConfig {
  uri: string
  database: string
}

class MongoDBConnection {
  query(arg0: string, arg1: string, arg2: { type: string; search: string; location: string; page: number; limit: number }) {
    throw new Error("Method not implemented.")
  }
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
