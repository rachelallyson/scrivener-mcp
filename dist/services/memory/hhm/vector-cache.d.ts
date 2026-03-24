/**
 * Vector caching and memory pooling for HHM
 * Reduces allocation overhead and improves performance
 */
import type { HyperVector } from './hypervector.js';
export declare class VectorCache {
    private cache;
    private lruQueue;
    private readonly maxSize;
    private readonly maxAge;
    private hits;
    private misses;
    constructor(maxSize?: number, maxAgeMs?: number);
    /**
     * Get vector from cache
     */
    get(key: string): HyperVector | null;
    /**
     * Store vector in cache
     */
    set(key: string, vector: HyperVector, pinned?: boolean): void;
    /**
     * Pin a vector in cache (won't be evicted)
     */
    pin(key: string): boolean;
    /**
     * Unpin a vector
     */
    unpin(key: string): boolean;
    /**
     * Update LRU queue
     */
    private updateLRU;
    /**
     * Evict least recently used unpinned entry
     */
    private evictLRU;
    /**
     * Clean up old entries
     */
    private cleanup;
    /**
     * Get cache statistics
     */
    getStats(): Record<string, unknown>;
    /**
     * Clear cache
     */
    clear(): void;
}
/**
 * Memory pool for array allocations
 */
export declare class MemoryPool {
    private int8Pools;
    private float32Pools;
    private readonly maxPoolSize;
    private allocations;
    private reuses;
    constructor(maxPoolSize?: number);
    /**
     * Get or create Int8Array
     */
    getInt8Array(size: number): Int8Array;
    /**
     * Get or create Float32Array
     */
    getFloat32Array(size: number): Float32Array;
    /**
     * Return array to pool
     */
    release(array: Int8Array | Float32Array): void;
    /**
     * Get pool statistics
     */
    getStats(): Record<string, unknown>;
    /**
     * Clear all pools
     */
    clear(): void;
}
/**
 * Combined cache and pool manager
 */
export declare class CacheManager {
    private static instance;
    private vectorCache;
    private memoryPool;
    private semanticCache;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): CacheManager;
    /**
     * Get or compute vector with caching
     */
    getOrCompute(key: string, compute: () => Promise<HyperVector> | HyperVector): Promise<HyperVector>;
    /**
     * Cache semantic vector
     */
    cacheSemanticVector(name: string, vector: HyperVector): void;
    /**
     * Get semantic vector
     */
    getSemanticVector(name: string): HyperVector | null;
    /**
     * Get memory pool
     */
    getMemoryPool(): MemoryPool;
    /**
     * Get vector cache
     */
    getVectorCache(): VectorCache;
    /**
     * Get combined statistics
     */
    getStats(): Record<string, unknown>;
    /**
     * Clear all caches
     */
    clear(): void;
}
//# sourceMappingURL=vector-cache.d.ts.map