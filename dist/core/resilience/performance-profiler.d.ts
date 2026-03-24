/**
 * Performance Profiler and Observability Tools
 * Advanced performance monitoring, profiling, and observability features
 */
export interface ProfilerConfig {
    /** Enable performance profiling */
    enabled: boolean;
    /** Sample rate (0-1) for performance measurements */
    sampleRate: number;
    /** Enable memory profiling */
    enableMemoryProfiling: boolean;
    /** Enable CPU profiling */
    enableCpuProfiling: boolean;
    /** Enable I/O profiling */
    enableIoProfiling: boolean;
    /** Memory leak detection threshold (bytes) */
    memoryLeakThreshold: number;
    /** Slow operation threshold (ms) */
    slowOperationThreshold: number;
    /** Profile data retention period (ms) */
    retentionPeriod: number;
    /** Export profile data interval (ms) */
    exportInterval: number;
}
export interface PerformanceSnapshot {
    timestamp: number;
    memory: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
        arrayBuffers: number;
    };
    cpu: {
        user: number;
        system: number;
        utilization?: number;
    };
    eventLoop: {
        delay: number;
        utilization?: number;
    };
    gc?: {
        type: string;
        duration: number;
        reclaimed: number;
    };
}
export interface OperationProfile {
    operationName: string;
    startTime: number;
    endTime: number;
    duration: number;
    memoryBefore: number;
    memoryAfter: number;
    memoryDelta: number;
    tags: Record<string, string>;
    error?: string;
    stackTrace?: string;
}
export interface ProfilerMetrics {
    totalOperations: number;
    slowOperations: number;
    avgOperationTime: number;
    maxOperationTime: number;
    minOperationTime: number;
    operationsByType: Record<string, number>;
    memoryLeaksDetected: number;
    gcEvents: number;
    avgGcDuration: number;
    totalProfiledTime: number;
}
/**
 * Performance Profiler for detailed performance analysis
 */
export declare class PerformanceProfiler {
    private config;
    private profiles;
    private snapshots;
    private performanceObserver?;
    private snapshotTimer?;
    private exportTimer?;
    private baselineMemory?;
    private lastCpuUsage?;
    private readonly logger;
    private readonly metrics;
    constructor(config: ProfilerConfig);
    /**
     * Start profiling an operation
     */
    startOperation(operationName: string, tags?: Record<string, string>): OperationProfiler;
    /**
     * Profile an async function
     */
    profileAsync<T>(operationName: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T>;
    /**
     * Profile a synchronous function
     */
    profileSync<T>(operationName: string, fn: () => T, tags?: Record<string, string>): T;
    /**
     * Take a performance snapshot
     */
    takeSnapshot(): PerformanceSnapshot;
    /**
     * Get profiler metrics
     */
    getMetrics(): ProfilerMetrics;
    /**
     * Get recent performance snapshots
     */
    getSnapshots(limit?: number): PerformanceSnapshot[];
    /**
     * Get operation profiles
     */
    getProfiles(operationName?: string, limit?: number): OperationProfile[];
    /**
     * Detect potential memory leaks
     */
    detectMemoryLeaks(): Array<{
        timestamp: number;
        memoryIncrease: number;
        suspiciousOperation?: string;
    }>;
    /**
     * Generate performance report
     */
    generateReport(): {
        summary: ProfilerMetrics;
        memoryTrend: Array<{
            timestamp: number;
            heapUsed: number;
            rss: number;
        }>;
        slowOperations: OperationProfile[];
        memoryLeaks: Array<{
            timestamp: number;
            memoryIncrease: number;
            suspiciousOperation?: string;
        }>;
        recommendations: string[];
    };
    /**
     * Start profiler
     */
    start(): void;
    /**
     * Stop profiler
     */
    stop(): void;
    private initialize;
    private setupPerformanceObserver;
    private setupMetrics;
    private recordProfile;
    private recordGcEvent;
    private recordPerformanceEntry;
    private measureEventLoopDelay;
    private cleanupOldProfiles;
    private cleanupOldSnapshots;
    private exportProfileData;
    private generateRecommendations;
}
/**
 * Operation Profiler for individual operations
 */
export declare class OperationProfiler {
    private operationName;
    private tags;
    private slowThreshold;
    private onFinish;
    private startTime;
    private memoryBefore;
    private finished;
    private operationError?;
    constructor(operationName: string, tags: Record<string, string>, slowThreshold: number, onFinish: (profile: OperationProfile) => void);
    /**
     * Mark operation as successful
     */
    success(): void;
    /**
     * Mark operation as failed
     */
    error(error: Error): void;
    /**
     * Finish profiling and record results
     */
    finish(): void;
}
/**
 * No-op profiler for when profiling is disabled
 */
export declare class NoOpOperationProfiler extends OperationProfiler {
    constructor();
    success(): void;
    error(_error: Error): void;
    finish(): void;
}
/**
 * Profiler decorators for automatic instrumentation
 */
export declare class ProfilerDecorators {
    /**
     * Profile method execution time and memory usage
     */
    static profile(profiler: PerformanceProfiler, operationName?: string, tags?: Record<string, string>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}
export declare const globalProfiler: PerformanceProfiler;
//# sourceMappingURL=performance-profiler.d.ts.map