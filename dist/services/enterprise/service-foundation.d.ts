/**
 * Enterprise Service Foundation - Advanced architectural patterns for production systems
 * Implements circuit breaker, bulkhead isolation, distributed tracing, and observability
 */
import { EventEmitter } from 'events';
export interface CircuitBreakerConfig {
    failureThreshold: number;
    timeout: number;
    resetTimeout: number;
    monitoringWindow: number;
    healthCheckInterval: number;
}
export interface BulkheadConfig {
    maxConcurrency: number;
    queueTimeout: number;
    rejectionStrategy: 'fail-fast' | 'queue' | 'degrade';
}
export interface TracingContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    baggage: Record<string, string>;
    startTime: number;
}
export interface ServiceMetrics {
    requestCount: number;
    successCount: number;
    failureCount: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    circuitBreakerState: 'closed' | 'open' | 'half-open';
    activeConcurrency: number;
    queuedRequests: number;
}
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
    keyGenerator: (context: Record<string, unknown>) => string;
}
export declare class EnterpriseCircuitBreaker extends EventEmitter {
    private name;
    private config;
    private state;
    private failures;
    private lastFailureTime;
    private successCount;
    private requestCount;
    private responseTime;
    private healthCheckTimer?;
    constructor(name: string, config: CircuitBreakerConfig);
    execute<T>(operation: () => Promise<T>, context?: TracingContext): Promise<T>;
    private onSuccess;
    private onFailure;
    private recordResponseTime;
    private startHealthCheck;
    private createSpan;
    private finishSpan;
    getMetrics(): ServiceMetrics;
    destroy(): void;
}
export declare class BulkheadIsolation {
    private name;
    private config;
    private activeTasks;
    private queuedTasks;
    constructor(name: string, config: BulkheadConfig);
    execute<T>(operation: () => Promise<T>, context?: TracingContext): Promise<T>;
    private executeImmediately;
    private queueOperation;
    private executeWithDegradation;
    private wrapOperation;
    private processQueue;
    private createSpan;
    private finishSpan;
    getMetrics(): {
        activeTasks: number;
        queuedTasks: number;
    };
}
export declare class EnterpriseRateLimiter {
    private config;
    private windows;
    private slidingLog;
    constructor(config: RateLimitConfig);
    checkLimit(context: Record<string, unknown>): Promise<{
        allowed: boolean;
        resetTime?: number;
        remaining?: number;
    }>;
    private cleanup;
}
//# sourceMappingURL=service-foundation.d.ts.map