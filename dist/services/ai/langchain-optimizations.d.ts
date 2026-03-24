/**
 * LangChain Optimization Layer
 * Provides caching, rate limiting, and performance optimizations
 */
import type { Document as LangchainDocument } from 'langchain/document';
import type { ScrivenerDocument } from '../../types/index.js';
type CacheValue = string | LangchainDocument[] | number[];
interface CacheOptions {
    maxSize?: number;
    ttl?: number;
    updateAgeOnGet?: boolean;
}
interface RateLimitOptions {
    maxRequests: number;
    windowMs: number;
    strategy?: 'sliding' | 'fixed';
}
/**
 * Caching layer for LangChain operations
 */
export declare class LangChainCache {
    private queryCache;
    private generationCache;
    private vectorStoreCache;
    private embeddingCache;
    private logger;
    private stats;
    constructor(options?: CacheOptions);
    /**
     * Generate cache key from input
     */
    private generateKey;
    /**
     * Cache semantic search results
     */
    cacheQuery(query: string, results: LangchainDocument[]): void;
    /**
     * Get cached query results
     */
    getCachedQuery(query: string): LangchainDocument[] | null;
    /**
     * Cache generation results
     */
    cacheGeneration(prompt: string, response: string, context?: string): void;
    /**
     * Get cached generation
     */
    getCachedGeneration(prompt: string, context?: string): string | null;
    /**
     * Cache embeddings
     */
    cacheEmbedding(text: string, embedding: number[]): void;
    /**
     * Get cached embedding
     */
    getCachedEmbedding(text: string): number[] | null;
    /**
     * Check if vector store needs rebuild
     */
    shouldRebuildVectorStore(documents: ScrivenerDocument[]): boolean;
    /**
     * Generic get method for compatibility
     */
    get(key: string): CacheValue | null;
    /**
     * Generic set method for compatibility
     */
    set(key: string, value: CacheValue): void;
    /**
     * Clear all caches
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStatistics(): {
        hits: number;
        misses: number;
        hitRate: number;
        evictions: number;
        totalSaved: number;
        sizes: {
            queries: number;
            generations: number;
            embeddings: number;
            vectorStores: number;
        };
    };
    /**
     * Prune old entries
     */
    prune(): void;
}
/**
 * Rate limiter for API calls
 */
export declare class LangChainRateLimiter {
    private requests;
    private blocked;
    private logger;
    private options;
    constructor(options: RateLimitOptions);
    /**
     * Check if request is allowed
     */
    checkLimit(identifier?: string): Promise<boolean>;
    /**
     * Wait until rate limit allows request
     */
    waitForLimit(identifier?: string): Promise<void>;
    /**
     * Clean up old request records
     */
    private cleanup;
    /**
     * Get current usage statistics
     */
    getStatistics(): Record<string, {
        requests: number;
        blocked: boolean;
    }>;
    /**
     * Reset rate limits
     */
    reset(identifier?: string): void;
}
/**
 * Performance monitor for LangChain operations
 */
export declare class LangChainPerformanceMonitor {
    private metrics;
    private logger;
    constructor();
    /**
     * Start timing an operation
     */
    startOperation(operation: string): () => void;
    /**
     * Record a metric
     */
    private recordMetric;
    /**
     * Record an error
     */
    recordError(operation: string): void;
    /**
     * Get performance statistics
     */
    getStatistics(): Record<string, {
        count: number;
        averageTime: number;
        minTime: number;
        maxTime: number;
        errorRate: number;
    }>;
    /**
     * Get slow operations
     */
    getSlowOperations(thresholdMs?: number): Array<{
        operation: string;
        averageTime: number;
        count: number;
    }>;
    /**
     * Reset metrics
     */
    reset(): void;
}
/**
 * Batch processor for efficient API usage
 */
export declare class LangChainBatchProcessor {
    private queue;
    private logger;
    private options;
    constructor(options: {
        maxBatchSize?: number;
        maxWaitTime?: number;
        processor: (batch: unknown[]) => Promise<unknown[]>;
    });
    /**
     * Add item to batch queue
     */
    add<T>(type: string, data: T): Promise<T>;
    /**
     * Process a batch
     */
    private processBatch;
    /**
     * Flush all pending batches
     */
    flush(): Promise<void>;
}
export declare const optimizations: {
    cache: typeof LangChainCache;
    rateLimiter: typeof LangChainRateLimiter;
    performanceMonitor: typeof LangChainPerformanceMonitor;
    batchProcessor: typeof LangChainBatchProcessor;
};
export {};
//# sourceMappingURL=langchain-optimizations.d.ts.map