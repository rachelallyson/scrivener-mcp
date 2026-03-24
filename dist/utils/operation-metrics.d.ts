/**
 * Operation Metrics Utilities
 * Consolidates duplicate metric tracking code across services
 */
export interface OperationMetrics {
    totalTime: number;
    callCount: number;
    successCount?: number;
}
export interface MetricsResult {
    averageTime: number;
    callCount: number;
    successRate?: number;
}
/**
 * Centralized operation metrics tracking class
 * Eliminates duplicate metric tracking code across services
 */
export declare class OperationMetricsTracker {
    private metrics;
    private logger?;
    constructor(logger?: (message: string, meta?: Record<string, unknown>) => void);
    /**
     * Update metrics for an operation
     */
    updateMetrics(operationName: string, executionTime: number, success?: boolean, logPrefix?: string): void;
    /**
     * Get all metrics
     */
    getMetrics(): Record<string, MetricsResult>;
    /**
     * Get metrics for a specific operation
     */
    getOperationMetrics(operationName: string): MetricsResult | undefined;
    /**
     * Clear all metrics
     */
    clearMetrics(): void;
    /**
     * Reset specific operation metrics
     */
    resetOperation(operationName: string): void;
}
/**
 * Utility function to measure and track operation execution
 * Eliminates the repetitive performance.now() pattern
 */
export declare function measureAndTrackOperation<T>(operationName: string, operation: () => Promise<T>, metricsTracker: OperationMetricsTracker, logPrefix?: string): Promise<T>;
/**
 * Utility function for synchronous operation measurement
 */
export declare function measureAndTrackOperationSync<T>(operationName: string, operation: () => T, metricsTracker: OperationMetricsTracker, logPrefix?: string): T;
/**
 * Decorator for automatic method metrics tracking
 */
export declare function trackMetrics(operationName?: string, logPrefix?: string): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=operation-metrics.d.ts.map