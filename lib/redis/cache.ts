import Redis from "ioredis"

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
})

export class CacheManager {
  private static instance: CacheManager
  private redis: Redis

  private constructor() {
    this.redis = redis
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error("Cache invalidate pattern error:", error)
      return false
    }
  }

  // Specialized caching methods for agricultural data
  async cacheMarketPrices(crop: string, location: string, data: any, ttl = 1800): Promise<void> {
    const key = `market:prices:${crop}:${location}`
    await this.set(key, data, ttl)
  }

  async getCachedMarketPrices(crop: string, location: string): Promise<any> {
    const key = `market:prices:${crop}:${location}`
    return await this.get(key)
  }

  async cacheWeatherData(location: string, data: any, ttl = 3600): Promise<void> {
    const key = `weather:${location}`
    await this.set(key, data, ttl)
  }

  async getCachedWeatherData(location: string): Promise<any> {
    const key = `weather:${location}`
    return await this.get(key)
  }

  async cacheCropAnalysis(imageHash: string, analysis: any, ttl = 86400): Promise<void> {
    const key = `crop:analysis:${imageHash}`
    await this.set(key, analysis, ttl)
  }

  async getCachedCropAnalysis(imageHash: string): Promise<any> {
    const key = `crop:analysis:${imageHash}`
    return await this.get(key)
  }
}

export const cacheManager = CacheManager.getInstance()
