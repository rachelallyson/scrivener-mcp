/**
 * Fixed KeyDB Cache Implementation with Stampede Protection
 * Addresses cache coherency, race conditions, and invalidation issues
 */
interface CacheOptions {
    keyPrefix?: string;
    defaultTTL?: number;
    maxScanKeys?: number;
    enableJitter?: boolean;
    jitterPercent?: number;
}
export declare class KeyDBCache {
    private client;
    private readonly options;
    private readonly fetchLocks;
    private cleanupTimer?;
    private connected;
    private performanceMetrics;
    private compressionThreshold;
    constructor(options?: CacheOptions);
    private startLockCleanup;
    connect(redisUrl: string): Promise<void>;
    isAvailable(): boolean;
    private getCacheKey;
    /**
     * Generate secure hash for query caching using utility function
     */
    private hashQuery;
    /**
     * Calculate TTL with optional jitter
     */
    private calculateTTL;
    /**
     * Compress string data for storage efficiency
     */
    private compress;
    /**
     * Decompress string data
     */
    private decompress;
    /**
     * Track performance metrics
     */
    private trackPerformance;
    /**
     * Calculate performance statistics
     */
    private calculatePerformanceStats;
    /**
     * Get value from cache with rate limiting and performance tracking
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache with TTL, compression, and performance tracking
     */
    set(key: string, value: unknown, ttl?: number): Promise<boolean>;
    /**
     * Get or set with stampede protection
     */
    getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T>;
    private executeFetch;
    /**
     * Delete specific keys
     */
    del(...keys: string[]): Promise<number>;
    /**
     * Invalidate cache with pattern using batch processing
     */
    invalidate(pattern: string): Promise<number>;
    /**
     * Scan keys with limit to prevent blocking
     */
    private scanKeys;
    /**
     * Clear all cache entries (use with caution)
     */
    flush(): Promise<void>;
    /**
     * Get comprehensive cache statistics with performance metrics
     */
    getStats(): Promise<{
        connected: boolean;
        keyCount: number;
        memoryUsage: number;
        activeLocks: number;
        performance: {
            get: {
                avg: number;
                count: number;
            };
            set: {
                avg: number;
                count: number;
            };
        };
        rateLimiting: {
            current: number;
            max: number;
            queueSize: number;
        };
    }>;
    /**
     * Disconnect from Redis
     */
    disconnect(): Promise<void>;
}
/**
 * SQL Cache Manager with proper invalidation and enhanced utilities
 */
export declare class SQLCacheManager {
    private cache;
    private readonly tablePatterns;
    constructor(cache: KeyDBCache);
    private initializeTablePatterns;
    /**
     * Extract all affected tables from SQL with validation
     */
    extractAffectedTables(sql: string): string[];
    /**
     * Cache query results with enhanced logging
     */
    cacheQuery(sql: string, params: unknown[], result: unknown, ttl?: number): Promise<void>;
    /**
     * Get cached query result with enhanced validation
     */
    getCachedQuery(sql: string, params: unknown[]): Promise<unknown | null>;
    /**
     * Execute with caching and enhanced error handling
     */
    execute(sql: string, params: unknown[], executeFn: () => Promise<unknown>, ttl?: number): Promise<unknown>;
    /**
     * Generate query hash using utility function
     */
    private hashQuery;
    /**
     * Invalidate tables with batch processing
     */
    invalidateTables(...tables: string[]): Promise<void>;
}
export {};
//# sourceMappingURL=keydb-cache-fixed.d.ts.map