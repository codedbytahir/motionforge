// Frame Cache System - LRU cache for rendered frames

/**
 * Frame Cache Entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  size: number;
}

/**
 * Cache Statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
  hitRate: number;
}

/**
 * LRU Cache with TTL support for frame caching
 */
export class FrameCache<T = ImageData> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private maxAge: number;
  private stats = { hits: 0, misses: 0 };

  constructor(options: { maxSize?: number; maxAge?: number } = {}) {
    this.maxSize = options.maxSize ?? 100 * 1024 * 1024; // 100MB default
    this.maxAge = options.maxAge ?? 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Generate cache key for a frame
   */
  static createKey(
    compositionId: string,
    frame: number,
    width: number,
    height: number
  ): string {
    return `${compositionId}:${frame}:${width}x${height}`;
  }

  /**
   * Get a cached frame
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access count and move to end (LRU)
    entry.accessCount++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Set a cached frame
   */
  set(key: string, data: T, size?: number): void {
    // Estimate size if not provided
    const entrySize = size ?? this.estimateSize(data);

    // Evict entries if we would exceed max size
    this.evictIfNeeded(entrySize);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      size: entrySize,
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a cached frame
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached frames
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }

    const totalRequests = this.stats.hits + this.stats.misses;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: totalSize,
      entries: this.cache.size,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
    };
  }

  /**
   * Get current cache size in bytes
   */
  getSize(): number {
    let size = 0;
    for (const entry of this.cache.values()) {
      size += entry.size;
    }
    return size;
  }

  /**
   * Evict entries until we have enough space
   */
  private evictIfNeeded(neededSize: number): void {
    while (this.getSize() + neededSize > this.maxSize && this.cache.size > 0) {
      // Remove oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      } else {
        break;
      }
    }
  }

  /**
   * Estimate size of data
   */
  private estimateSize(data: T): number {
    if (data instanceof ImageData) {
      return data.data.length;
    }
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    // Default estimate
    return 1024;
  }
}

/**
 * Singleton frame cache instance
 */
export const frameCache = new FrameCache<ImageData>({
  maxSize: 200 * 1024 * 1024, // 200MB
  maxAge: 10 * 60 * 1000, // 10 minutes
});

/**
 * Memoization cache for computed values
 */
export class MemoCache {
  private static instance: MemoCache;
  private cache: Map<string, { value: unknown; deps: unknown[] }> = new Map();

  static getInstance(): MemoCache {
    if (!MemoCache.instance) {
      MemoCache.instance = new MemoCache();
    }
    return MemoCache.instance;
  }

  /**
   * Get or compute a memoized value
   */
  getOrCompute<T>(key: string, compute: () => T, deps: unknown[] = []): T {
    const cached = this.cache.get(key);

    if (cached && this.depsEqual(cached.deps, deps)) {
      return cached.value as T;
    }

    const value = compute();
    this.cache.set(key, { value, deps });
    return value;
  }

  /**
   * Check if dependencies are equal
   */
  private depsEqual(a: unknown[], b: unknown[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, i) => Object.is(val, b[i]));
  }

  /**
   * Clear all memoized values
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Debounced function cache
 */
export function createDebouncedCache<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: unknown[] = [];

  return ((...args: unknown[]) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...lastArgs);
      timeoutId = null;
    }, delay);
  }) as T;
}

/**
 * Throttled function cache
 */
export function createThrottledCache<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): T {
  let inThrottle = false;

  return ((...args: unknown[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T;
}

export default FrameCache;
