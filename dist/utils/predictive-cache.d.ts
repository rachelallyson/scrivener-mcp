/**
 * Predictive Caching with ML-Based Prefetching
 * Uses machine learning to predict access patterns and proactively cache content
 */
interface PrefetchCandidate {
    key: string;
    priority: number;
    confidence: number;
    estimatedSize: number;
    contextMatch: number;
}
/**
 * Advanced predictive cache with ML-based prefetching
 * Learns from access patterns to predict future cache needs
 */
export declare class PredictiveCache<T> {
    private readonly dataLoader?;
    private cache;
    private accessHistory;
    private prefetchQueue;
    private readonly maxCacheSize;
    private readonly maxHistorySize;
    private readonly prefetchThreshold;
    private readonly modelUpdateInterval;
    private currentCacheSize;
    private totalAccesses;
    private cacheHits;
    private prefetchHits;
    private model;
    private readonly featureExtractors;
    constructor(maxCacheSize?: number, // 100MB default
    dataLoader?: ((key: string) => Promise<T>) | undefined);
    /**
     * Get value from cache with access pattern learning
     */
    get(key: string, context?: string[], userSession?: string): Promise<T | undefined>;
    /**
     * Set value in cache with intelligent placement
     */
    set(key: string, value: T, context?: string[], userSession?: string): Promise<void>;
    /**
     * Delete item from cache
     */
    delete(key: string): boolean;
    /**
     * Clear entire cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        hitRate: number;
        prefetchHitRate: number;
        size: number;
        maxSize: number;
        entryCount: number;
        modelAccuracy: number;
        predictions: number;
        totalAccesses: number;
    };
    /**
     * Force model retraining
     */
    retrainModel(): Promise<void>;
    /**
     * Get prefetch recommendations
     */
    getPrefetchRecommendations(limit?: number): PrefetchCandidate[];
    private initializeModel;
    private recordAccessPattern;
    private predictNextAccess;
    private updateModel;
    private queuePrefetchCandidates;
    private ensureSpace;
    private startPrefetchingLoop;
    private startModelUpdateLoop;
    private startCacheMaintenanceLoop;
    private estimateSize;
    private formatBytes;
    private truncateKey;
}
/**
 * Factory for creating optimized predictive caches
 */
export declare class PredictiveCacheFactory {
    /**
     * Create content analysis cache with optimized settings
     */
    static createAnalysisCache<T>(dataLoader?: (key: string) => Promise<T>): PredictiveCache<T>;
    /**
     * Create document cache with large capacity
     */
    static createDocumentCache<T>(dataLoader?: (key: string) => Promise<T>): PredictiveCache<T>;
    /**
     * Create small metadata cache
     */
    static createMetadataCache<T>(dataLoader?: (key: string) => Promise<T>): PredictiveCache<T>;
}
export declare const analysisCache: PredictiveCache<unknown>;
export declare const documentCache: PredictiveCache<unknown>;
export declare const metadataCache: PredictiveCache<unknown>;
export {};
//# sourceMappingURL=predictive-cache.d.ts.map