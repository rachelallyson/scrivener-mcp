/**
 * Enterprise Performance Optimizer - Advanced caching, memory management, and optimization
 * Multi-layer caching with intelligent eviction, compression, and performance monitoring
 */
import { EventEmitter } from 'events';
import type { TraceContext } from './observability.js';
export interface CacheEntry<T> {
    value: T;
    compressed: boolean;
    size: number;
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
    tags: string[];
    ttl?: number;
}
export interface CacheMetrics {
    hits: number;
    misses: number;
    hitRate: number;
    totalSize: number;
    entryCount: number;
    avgEntrySize: number;
    evictions: number;
    compressionRatio: number;
}
export interface PerformanceProfile {
    operationName: string;
    totalCalls: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    lastCall: number;
}
export declare class IntelligentCache<T = any> extends EventEmitter {
    private l1Cache;
    private l2Cache;
    private accessPattern;
    private compressionThreshold;
    private metrics;
    private cleanupInterval?;
    constructor(options: {
        maxSize: number;
        maxAge?: number;
        compressionThreshold?: number;
        cleanupInterval?: number;
    });
    get(key: string, context?: TraceContext): Promise<T | undefined>;
    set(key: string, value: T, options?: {
        ttl?: number;
        tags?: string[];
        forceCompress?: boolean;
    }, context?: TraceContext): Promise<void>;
    setCompressed(key: string, entry: CacheEntry<T>, _context?: TraceContext): Promise<void>;
    delete(key: string): boolean;
    clear(): void;
    invalidateByTag(tag: string): number;
    mget(keys: string[], context?: TraceContext): Promise<Map<string, T>>;
    mset(entries: Array<{
        key: string;
        value: T;
        options?: Record<string, unknown>;
    }>, context?: TraceContext): Promise<void>;
    getPrefetchCandidates(limit?: number): string[];
    private analyzeAccessPattern;
    private recordAccess;
    private compress;
    private decompress;
    private onEviction;
    private updateMetrics;
    private calculateTotalSize;
    private resetMetrics;
    private startCleanupProcess;
    private runCleanup;
    private createSpan;
    private finishSpan;
    getMetrics(): CacheMetrics;
    destroy(): void;
}
export declare class PerformanceProfiler {
    private profiles;
    private responseTimes;
    profile<T>(operationName: string, operation: () => Promise<T>, _context?: TraceContext): Promise<T>;
    private recordSuccess;
    private recordError;
    private updateProfile;
    getProfile(operationName: string): PerformanceProfile | undefined;
    getAllProfiles(): PerformanceProfile[];
    getTopSlowestOperations(limit?: number): PerformanceProfile[];
    getHighErrorRateOperations(threshold?: number): PerformanceProfile[];
    reset(): void;
}
//# sourceMappingURL=performance-optimizer.d.ts.map