/**
 * Operation Metrics Utilities
 * Consolidates duplicate metric tracking code across services
 */
import { formatDuration } from './common.js';
/**
 * Centralized operation metrics tracking class
 * Eliminates duplicate metric tracking code across services
 */
export class OperationMetricsTracker {
    constructor(logger) {
        this.metrics = new Map();
        this.logger = logger;
    }
    /**
     * Update metrics for an operation
     */
    updateMetrics(operationName, executionTime, success = true, logPrefix = 'Operation') {
        const existing = this.metrics.get(operationName) || {
            totalTime: 0,
            callCount: 0,
            successCount: 0,
        };
        existing.totalTime += executionTime;
        existing.callCount += 1;
        if (success)
            existing.successCount = (existing.successCount || 0) + 1;
        this.metrics.set(operationName, existing);
        if (this.logger) {
            const averageTime = existing.totalTime / existing.callCount;
            const successRate = existing.successCount
                ? (existing.successCount / existing.callCount) * 100
                : undefined;
            this.logger(`${logPrefix} ${operationName} ${success ? 'succeeded' : 'failed'} in ${formatDuration(executionTime)}`, {
                averageTime: formatDuration(averageTime),
                callCount: existing.callCount,
                ...(successRate !== undefined && { successRate: `${successRate.toFixed(1)}%` }),
                success,
            });
        }
    }
    /**
     * Get all metrics
     */
    getMetrics() {
        const result = {};
        for (const [operation, metrics] of this.metrics.entries()) {
            result[operation] = {
                averageTime: metrics.totalTime / metrics.callCount,
                callCount: metrics.callCount,
                ...(metrics.successCount !== undefined && {
                    successRate: (metrics.successCount / metrics.callCount) * 100,
                }),
            };
        }
        return result;
    }
    /**
     * Get metrics for a specific operation
     */
    getOperationMetrics(operationName) {
        const metrics = this.metrics.get(operationName);
        if (!metrics)
            return undefined;
        return {
            averageTime: metrics.totalTime / metrics.callCount,
            callCount: metrics.callCount,
            ...(metrics.successCount !== undefined && {
                successRate: (metrics.successCount / metrics.callCount) * 100,
            }),
        };
    }
    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics.clear();
    }
    /**
     * Reset specific operation metrics
     */
    resetOperation(operationName) {
        this.metrics.delete(operationName);
    }
}
/**
 * Utility function to measure and track operation execution
 * Eliminates the repetitive performance.now() pattern
 */
export async function measureAndTrackOperation(operationName, operation, metricsTracker, logPrefix) {
    const startTime = performance.now();
    try {
        const result = await operation();
        metricsTracker.updateMetrics(operationName, performance.now() - startTime, true, logPrefix);
        return result;
    }
    catch (error) {
        metricsTracker.updateMetrics(operationName, performance.now() - startTime, false, logPrefix);
        throw error;
    }
}
/**
 * Utility function for synchronous operation measurement
 */
export function measureAndTrackOperationSync(operationName, operation, metricsTracker, logPrefix) {
    const startTime = performance.now();
    try {
        const result = operation();
        metricsTracker.updateMetrics(operationName, performance.now() - startTime, true, logPrefix);
        return result;
    }
    catch (error) {
        metricsTracker.updateMetrics(operationName, performance.now() - startTime, false, logPrefix);
        throw error;
    }
}
/**
 * Decorator for automatic method metrics tracking
 */
export function trackMetrics(operationName, logPrefix) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const finalOperationName = operationName || propertyKey;
        descriptor.value = async function (...args) {
            if (!this.metricsTracker) {
                throw new Error('Class must have a metricsTracker property to use @trackMetrics decorator');
            }
            return await measureAndTrackOperation(finalOperationName, () => originalMethod.apply(this, args), this.metricsTracker, logPrefix);
        };
        return descriptor;
    };
}
//# sourceMappingURL=operation-metrics.js.map