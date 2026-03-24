/**
 * Advanced Cache Strategies and Patterns
 * Implements sophisticated caching patterns for optimal performance
 */
import { EventEmitter } from 'events';
import type { RedisClusterManager } from './redis-cluster-manager.js';
export interface CacheStrategy {
    name: string;
    description: string;
    execute<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
}
export interface CacheOptions {
    ttl?: number;
    tags?: string[];
    refreshThreshold?: number;
    lockTimeout?: number;
    fallbackValue?: unknown;
    metrics?: boolean;
}
export interface CacheMetrics {
    strategy: string;
    hits: number;
    misses: number;
    refreshes: number;
    lockWaits: number;
    averageLatency: number;
    errorRate: number;
}
export interface RefreshAheadConfig {
    refreshThreshold: number;
    refreshProbability: number;
    maxRefreshConcurrency: number;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
}
/**
 * Cache-Aside Strategy (Lazy Loading)
 */
export declare class CacheAsideStrategy implements CacheStrategy {
    private cacheManager;
    name: string;
    description: string;
    constructor(cacheManager: RedisClusterManager);
    execute<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
}
/**
 * Write-Through Strategy
 */
export declare class WriteThroughStrategy implements CacheStrategy {
    private cacheManager;
    private writeFn;
    name: string;
    description: string;
    constructor(cacheManager: RedisClusterManager, writeFn: <T>(key: string, value: T) => Promise<void>);
    execute<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
}
/**
 * Refresh-Ahead Strategy
 */
export declare class RefreshAheadStrategy implements CacheStrategy {
    private cacheManager;
    name: string;
    description: string;
    private refreshInProgress;
    private config;
    constructor(cacheManager: RedisClusterManager, config?: Partial<RefreshAheadConfig>);
    execute<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    private shouldRefresh;
    private scheduleRefresh;
}
/**
 * Read-Through Strategy with Circuit Breaker
 */
export declare class ReadThroughStrategy implements CacheStrategy {
    private cacheManager;
    private config;
    name: string;
    description: string;
    private circuitBreaker;
    constructor(cacheManager: RedisClusterManager, config?: CircuitBreakerConfig);
    execute<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    private shouldAttemptRecovery;
    private recordFailure;
}
/**
 * Multi-Level Cache Strategy
 */
export declare class MultiLevelStrategy implements CacheStrategy {
    private cacheManager;
    name: string;
    description: string;
    private l1Cache;
    private l1MaxSize;
    private l1TTL;
    constructor(cacheManager: RedisClusterManager);
    execute<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    private setL1;
    clearL1(): void;
}
/**
 * Write-Behind (Write-Back) Strategy
 */
export declare class WriteBehindStrategy implements CacheStrategy {
    private cacheManager;
    private persistFn;
    name: string;
    description: string;
    private writeQueue;
    private flushInterval;
    private flushTimer?;
    constructor(cacheManager: RedisClusterManager, persistFn: <T>(entries: Array<{
        key: string;
        value: T;
    }>) => Promise<void>);
    execute<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    private startFlushTimer;
    private flushWrites;
    close(): Promise<void>;
}
/**
 * Intelligent Cache Manager with Strategy Selection
 */
export declare class IntelligentCacheManager extends EventEmitter {
    private cacheManager;
    private strategies;
    private metrics;
    private defaultStrategy;
    constructor(cacheManager: RedisClusterManager);
    private initializeStrategies;
    addStrategy(strategy: CacheStrategy): void;
    get<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions & {
        strategy?: string;
    }): Promise<T>;
    /**
     * Automatically select the best strategy based on access patterns
     */
    intelligentGet<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    getMetrics(strategy?: string): CacheMetrics | Map<string, CacheMetrics>;
    generatePerformanceReport(): string;
    private updateMetrics;
    private analyzeAccessPattern;
    private selectStrategyForPattern;
    private createEmptyMetrics;
}
//# sourceMappingURL=advanced-cache-strategies.d.ts.map