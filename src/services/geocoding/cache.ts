interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class GeocodingCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxAge: number;
  private maxSize: number;

  constructor(maxAge: number, maxSize: number) {
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}