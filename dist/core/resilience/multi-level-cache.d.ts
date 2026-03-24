/**
 * Multi-Level Caching System
 * Implements L1 (memory) and L2 (Redis) caching with intelligent cache warming and invalidation
 */
export interface CacheConfig {
    /** Enable L1 (memory) cache */
    enableL1: boolean;
    /** Enable L2 (Redis) cache */
    enableL2: boolean;
    /** L1 cache configuration */
    l1Config?: {
        ttl?: number;
        maxSize?: number;
        maxEntries?: number;
    };
    /** L2 cache configuration */
    l2Config?: {
        ttl?: number;
        host?: string;
        port?: number;
        password?: string;
        db?: number;
        keyPrefix?: string;
        compression?: boolean;
        maxRetries?: number;
    };
    /** Cache warming configuration */
    warmingConfig?: {
        enabled: boolean;
        batchSize: number;
        concurrency: number;
        warmupDelay: number;
    };
    /** Cache name for metrics */
    name?: string;
}
export interface CacheMetrics {
    l1Hits: number;
    l1Misses: number;
    l1Sets: number;
    l1Deletes: number;
    l1Size: number;
    l2Hits: number;
    l2Misses: number;
    l2Sets: number;
    l2Deletes: number;
    l2Errors: number;
    totalRequests: number;
    hitRatio: number;
    l1HitRatio: number;
    l2HitRatio: number;
    averageGetTime: number;
    averageSetTime: number;
}
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    compressed?: boolean;
    metadata?: Record<string, unknown>;
}
export declare class MultiLevelCache<T = unknown> {
    private readonly config;
    private l1Cache?;
    private l2Client?;
    private metrics;
    private readonly logger;
    private readonly circuitBreaker;
    private readonly retryStrategy;
    private getTimes;
    private setTimes;
    constructor(config: CacheConfig);
    /**
     * Get value from cache (L1 -> L2 -> miss)
     */
    get(key: string): Promise<T | null>;
    /**
     * Set value in cache (both L1 and L2)
     */
    set(key: string, value: T, ttl?: number, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Delete from both cache levels
     */
    delete(key: string): Promise<boolean>;
    /**
     * Clear all cache levels
     */
    clear(): Promise<void>;
    /**
     * Warm cache with data
     */
    warmCache(entries: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>): Promise<void>;
    /**
     * Get cache metrics
     */
    getMetrics(): CacheMetrics;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    private initializeCaches;
    private getFromL2;
    private setInL2;
    private deleteFromL2;
    private clearL2;
    private isEntryValid;
    private normalizeKey;
    private shouldCompress;
    private updateGetTime;
    private updateSetTime;
    private chunkArray;
}
/**
 * Cache Manager for coordinating multiple cache instances
 */
export declare class CacheManager {
    private caches;
    /**
     * Create or get cache instance
     */
    getCache<T = unknown>(name: string, config?: CacheConfig): MultiLevelCache<T>;
    /**
     * Get all cache metrics
     */
    getAllMetrics(): Record<string, CacheMetrics>;
    /**
     * Clear all caches
     */
    clearAll(): Promise<void>;
    /**
     * Reset all metrics
     */
    resetAllMetrics(): void;
}
export declare const globalCacheManager: CacheManager;
//# sourceMappingURL=multi-level-cache.d.ts.map