/**
 * KeyDB caching layer for SQLite queries
 * Provides intelligent caching for frequently accessed database operations
 */
import type { SQLiteManager } from './sqlite-manager.js';
export interface CacheOptions {
    ttl?: number;
    prefix?: string;
    serialize?: (data: unknown) => string;
    deserialize?: (data: string) => unknown;
}
export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
}
/**
 * KeyDB-based cache for SQLite query results
 */
export declare class KeyDBCache {
    private client;
    private isConnected;
    private prefix;
    private defaultTTL;
    private stats;
    private logger;
    constructor(options?: CacheOptions);
    /**
     * Initialize cache connection
     */
    initialize(): Promise<boolean>;
    /**
     * Get cached value
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set cached value
     */
    set(key: string, value: unknown, ttl?: number): Promise<boolean>;
    /**
     * Delete cached value
     */
    del(key: string): Promise<boolean>;
    /**
     * Invalidate cache by pattern
     */
    invalidate(pattern: string): Promise<number>;
    /**
     * Scan keys using SCAN command (production-safe)
     */
    private scanKeys;
    /**
     * Get or set cached value (cache-aside pattern)
     */
    getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T>;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Check if cache is available
     */
    isAvailable(): boolean;
    /**
     * Close cache connection
     */
    close(): Promise<void>;
}
/**
 * Cached SQLite query executor
 * Wraps common query patterns with intelligent caching
 */
export declare class CachedSQLiteManager {
    private cache;
    private sqliteManager;
    constructor(sqliteManager: SQLiteManager, cacheOptions?: CacheOptions);
    /**
     * Initialize cache
     */
    initialize(): Promise<void>;
    /**
     * Cached query execution
     */
    query(sql: string, params?: unknown[], ttl?: number): Promise<unknown[]>;
    /**
     * Cached single row query
     */
    queryOne(sql: string, params?: unknown[], ttl?: number): Promise<unknown>;
    /**
     * Execute write operation and invalidate related cache
     */
    execute(sql: string, params?: unknown[]): Promise<unknown>;
    /**
     * Transaction with cache invalidation
     */
    transaction<T>(fn: () => T, retries?: number): T;
    /**
     * Hash query and parameters for cache key
     */
    private hashQuery;
    /**
     * Extract table name from SQL for cache invalidation
     */
    private extractTableName;
    /**
     * Get cache statistics
     */
    getCacheStats(): CacheStats;
    /**
     * Close cache connection
     */
    close(): Promise<void>;
}
//# sourceMappingURL=keydb-cache.d.ts.map