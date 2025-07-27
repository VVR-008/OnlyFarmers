// Simple in-memory cache without external dependencies
class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>()
  private static instance: SimpleCache

  private constructor() {}

  public static getInstance(): SimpleCache {
    if (!SimpleCache.instance) {
      SimpleCache.instance = new SimpleCache()
    }
    return SimpleCache.instance
  }

  set(key: string, value: any, ttlSeconds = 3600): void {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { data: value, expiry })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }

  // Specialized methods for agricultural data
  cacheMarketPrices(crop: string, location: string, data: any, ttl = 1800): void {
    const key = `market:prices:${crop}:${location}`
    this.set(key, data, ttl)
  }

  getCachedMarketPrices(crop: string, location: string): any {
    const key = `market:prices:${crop}:${location}`
    return this.get(key)
  }

  cacheWeatherData(location: string, data: any, ttl = 3600): void {
    const key = `weather:${location}`
    this.set(key, data, ttl)
  }

  getCachedWeatherData(location: string): any {
    const key = `weather:${location}`
    return this.get(key)
  }
}

export const simpleCache = SimpleCache.getInstance()

// Auto cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      simpleCache.cleanup()
    },
    5 * 60 * 1000,
  )
}
