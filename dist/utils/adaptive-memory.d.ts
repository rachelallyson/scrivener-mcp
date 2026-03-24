/**
 * Adaptive Memory Management with Garbage Collection Optimization
 * Enterprise-grade memory management for high-performance text processing
 */
interface MemoryMetrics {
    allocated: number;
    used: number;
    fragmentation: number;
    gcCount: number;
    gcTime: number;
    pressure: number;
}
/**
 * Advanced Memory Manager with Predictive Allocation and Adaptive GC
 * Provides enterprise-grade memory optimization for text processing workloads
 */
export declare class AdaptiveMemoryManager {
    private static instance;
    private memoryPools;
    private allocationHistory;
    private gcMetrics;
    private memoryPressureCallbacks;
    private isEnabled;
    private predictiveAllocation;
    private adaptiveGC;
    private compressionEnabled;
    private readonly maxHeapSize;
    private readonly pressureThreshold;
    private readonly gcTriggerThreshold;
    private readonly poolMaxAge;
    private weakRefs;
    private compressionRegistry;
    private allocationPatterns;
    private constructor();
    static getInstance(): AdaptiveMemoryManager;
    /**
     * Initialize advanced memory monitoring with predictive analysis
     */
    private initializeMemoryMonitoring;
    /**
     * Setup garbage collection optimization with adaptive tuning
     */
    private setupGCOptimization;
    /**
     * Create or get optimized memory pool for specific object types
     */
    createPool<T>(name: string, factory: () => T, cleanup?: (obj: T) => void, validator?: (obj: T) => boolean, maxSize?: number): void;
    /**
     * Acquire object from pool with intelligent allocation tracking
     */
    acquire<T>(poolName: string): T | null;
    /**
     * Return object to pool with intelligent lifecycle management
     */
    release<T>(poolName: string, obj: T): void;
    /**
     * Intelligent string compression for large text objects
     */
    compressString(key: string, text: string): string;
    /**
     * Decompress string from compression registry
     */
    decompressString(keyOrText: string): string;
    /**
     * Analyze allocation patterns for predictive optimization
     */
    private analyzeAllocationPatterns;
    /**
     * Predictive pre-allocation based on patterns
     */
    private predictivePreallocation;
    /**
     * Handle memory pressure with intelligent optimization
     */
    private handleMemoryPressure;
    /**
     * Setup adaptive GC with machine learning optimization
     */
    private setupAdaptiveGC;
    /**
     * Clean up stale objects and optimize memory usage
     */
    private cleanupStaleObjects;
    /**
     * Force compression optimization during pressure
     */
    private forceCompressionOptimization;
    /**
     * Temporarily reduce pool sizes during pressure
     */
    private reducePools;
    /**
     * Register callback for memory pressure events
     */
    onMemoryPressure(callback: () => void): void;
    /**
     * Get comprehensive memory metrics
     */
    getMemoryMetrics(): MemoryMetrics;
    /**
     * Get detailed performance analytics
     */
    getAnalytics(): {
        pools: {
            [key: string]: {
                size: number;
                allocated: number;
                efficiency: number;
            };
        };
        compression: {
            totalSaved: number;
            ratio: number;
            count: number;
        };
        gc: {
            avgDuration: number;
            efficiency: number;
            frequency: number;
        };
        patterns: {
            [key: string]: {
                frequency: number;
                avgSize: number;
            };
        };
    };
    private estimateHeapUsage;
    private estimateObjectSize;
    private calculateFragmentation;
    private trackAllocation;
    private generateObjectId;
    private simpleCompress;
    private simpleDecompress;
}
export declare const memoryManager: AdaptiveMemoryManager;
export {};
//# sourceMappingURL=adaptive-memory.d.ts.map