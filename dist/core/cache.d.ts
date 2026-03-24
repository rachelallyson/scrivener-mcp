/**
 * Advanced caching system with size limits and LRU eviction
 * Utilizes common utilities for better error handling and logging
 */
import type { CacheOptions } from '../types/index.js';
export declare class LRUCache<T = unknown> {
    private cache;
    private accessOrder;
    private currentSize;
    private logger;
    private readonly ttl;
    private readonly maxSize;
    private readonly maxEntries;
    private readonly onEvict?;
    constructor(options?: CacheOptions);
    /**
     * Get value from cache
     */
    get(key: string): T | undefined;
    /**
     * Set value in cache
     */
    set(key: string, value: T, ttl?: number): void;
    /**
     * Check if key exists
     */
    has(key: string): boolean;
    /**
     * Delete from cache
     */
    delete(key: string): boolean;
    /**
     * Clear all cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        entries: number;
        size: number;
        maxSize: number;
        maxEntries: number;
        utilization: number;
        formattedSize: string;
        formattedMaxSize: string;
    };
    /**
     * Get number of entries in cache
     */
    getSize(): number;
    /**
     * Get current memory usage in bytes
     */
    getMemoryUsage(): number;
    /**
     * Update LRU access order
     */
    private updateAccessOrder;
    /**
     * Estimate size of value
     */
    private estimateSize;
    /**
     * Clean expired entries
     */
    cleanExpired(): number;
}
/**
 * Global cache instances
 */
export declare const caches: {
    documents: LRUCache<string>;
    analysis: LRUCache<Record<string, unknown>>;
    queries: LRUCache<Record<string, unknown>>;
};
/**
 * Cache key builders - utilizes generateHash for consistent key generation
 */
export declare const CacheKeys: {
    document: (projectId: string, documentId: string) => string;
    analysis: (documentId: string, type: string) => string;
    query: (query: string, params: string) => string;
    structure: (projectId: string, folderId?: string) => string;
};
/**
 * Cache decorator for async functions
 */
export declare function cached<TArgs extends readonly unknown[], TReturn>(keyBuilder: (...args: TArgs) => string, cache?: LRUCache<TReturn>, ttl?: number): (_target: any, // Decorator target must be any per TypeScript spec 
_propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Periodic cache cleanup
 */
export declare function startCacheCleanup(intervalMs?: number): NodeJS.Timer;
//# sourceMappingURL=cache.d.ts.map