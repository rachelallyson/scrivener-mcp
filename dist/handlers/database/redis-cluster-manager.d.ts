/**
 * Advanced Redis/KeyDB Cluster Manager with Intelligent Caching and Memory Optimization
 */
import type { RedisOptions } from 'ioredis';
import { EventEmitter } from 'events';
export interface CacheClusterConfig {
    nodes: Array<{
        host: string;
        port: number;
    }>;
    options: {
        password?: string;
        enableReadyCheck: boolean;
        redisOptions: RedisOptions;
        maxRetriesPerRequest: number;
        retryDelayOnFailover: number;
        enableOfflineQueue: boolean;
        slotsRefreshTimeout: number;
        slotsRefreshInterval: number;
        scaleReads: 'master' | 'slave' | 'all';
    };
    caching: {
        defaultTTL: number;
        maxMemoryPolicy: string;
        evictionStrategy: 'lru' | 'lfu' | 'random' | 'ttl';
        compressionThreshold: number;
        serialization: 'json' | 'msgpack' | 'bson';
    };
    monitoring: {
        healthCheckInterval: number;
        performanceMetricsInterval: number;
        slowLogThreshold: number;
    };
}
export interface CacheEntry<T = unknown> {
    value: T;
    ttl: number;
    tags: string[];
    metadata: {
        createdAt: Date;
        accessCount: number;
        lastAccessed: Date;
        size: number;
        compressed: boolean;
    };
}
export interface ClusterHealth {
    [key: string]: unknown;
    healthy: boolean;
    totalNodes: number;
    healthyNodes: number;
    masterNodes: number;
    slaveNodes: number;
    clusterState: string;
    memoryUsage: {
        used: number;
        available: number;
        percentage: number;
    };
    performance: {
        avgLatency: number;
        throughput: number;
        errorRate: number;
    };
}
export interface CacheStats {
    [key: string]: unknown;
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    hitRate: number;
    memoryUsage: number;
    keyCount: number;
    avgObjectSize: number;
    compressionRatio: number;
    evictions: number;
}
/**
 * Intelligent cache layer patterns
 */
export declare enum CachePattern {
    CACHE_ASIDE = "cache-aside",
    WRITE_THROUGH = "write-through",
    WRITE_BEHIND = "write-behind",
    READ_THROUGH = "read-through"
}
/**
 * Advanced Redis/KeyDB cluster manager with intelligent caching
 */
export declare class RedisClusterManager extends EventEmitter {
    private cluster;
    private readonly config;
    private stats;
    private healthTimer?;
    private metricsTimer?;
    private isInitialized;
    constructor(config: CacheClusterConfig);
    /**
     * Initialize the Redis cluster connection
     */
    initialize(): Promise<void>;
    /**
     * Get cached value with intelligent deserialization
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set cached value with intelligent serialization and compression
     */
    set<T>(key: string, value: T, options?: {
        ttl?: number;
        tags?: string[];
        pattern?: CachePattern;
        compression?: boolean;
    }): Promise<boolean>;
    /**
     * Delete cached value
     */
    delete(key: string): Promise<boolean>;
    /**
     * Invalidate cache by tags
     */
    invalidateByTags(tags: string[]): Promise<number>;
    /**
     * Get or set with cache-aside pattern
     */
    getOrSet<T>(key: string, fetchFn: () => Promise<T>, options?: {
        ttl?: number;
        tags?: string[];
        refreshThreshold?: number;
    }): Promise<T>;
    /**
     * Multi-level caching with local and distributed layers
     */
    getMultiLevel<T>(key: string, localCache?: Map<string, {
        value: T;
        expires: number;
    }>): Promise<T | null>;
    /**
     * Bulk operations for improved performance
     */
    mget<T>(keys: string[]): Promise<Array<T | null>>;
    /**
     * Pipeline operations for better performance
     */
    pipeline(operations: Array<{
        op: string;
        key: string;
        value?: unknown;
        ttl?: number;
    }>): Promise<unknown[]>;
    /**
     * Get cluster health information
     */
    getHealth(): Promise<ClusterHealth>;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Optimize memory usage
     */
    optimizeMemory(): Promise<{
        keysAnalyzed: number;
        keysEvicted: number;
        memoryFreed: number;
        recommendations: string[];
    }>;
    /**
     * Close cluster connection
     */
    close(): Promise<void>;
    private setupEventListeners;
    private configureMemoryManagement;
    private shouldCompress;
    private calculateSize;
    private serialize;
    private deserialize;
    private simpleCompress;
    private simpleDecompress;
    private updateTagIndexes;
    private cleanupTagIndexes;
    private updateMetadata;
    private backgroundRefresh;
    private getMemoryInfo;
    private calculatePerformanceMetrics;
    private findEvictionCandidates;
    private startMonitoring;
}
//# sourceMappingURL=redis-cluster-manager.d.ts.map