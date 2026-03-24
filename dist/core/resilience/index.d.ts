/**
 * Resilience System - Main Export Module
 * Comprehensive error recovery and performance optimization system
 */
export * from './circuit-breaker.js';
export * from './retry-strategies.js';
export * from './multi-level-cache.js';
export * from './health-checks.js';
export * from './metrics-collector.js';
export * from './performance-profiler.js';
export * from './enhanced-connection-pool.js';
export * from './resilience-decorators.js';
export { CircuitBreakers, CircuitBreakerFactory, } from './circuit-breaker.js';
export { RetryStrategies, globalRetryManager, } from './retry-strategies.js';
export { globalCacheManager, } from './multi-level-cache.js';
export { globalHealthManager, StandardHealthChecks, } from './health-checks.js';
export { globalMetricsRegistry, globalMetricsCollector, MetricsDecorators, } from './metrics-collector.js';
export { globalProfiler, ProfilerDecorators, } from './performance-profiler.js';
export { globalPoolManager, SQLiteConnectionFactory, } from './enhanced-connection-pool.js';
export { Resilient, CircuitBreaker, Retry, Cached, Metrics, Profile, Timeout, RateLimit, Bulkhead, ResilientService, } from './resilience-decorators.js';
/**
 * Initialize the complete resilience system
 */
export declare function initializeResilienceSystem(): void;
/**
 * Shutdown the resilience system gracefully
 */
export declare function shutdownResilienceSystem(): Promise<void>;
/**
 * Get system health and performance summary
 */
export declare function getSystemStatus(): {
    health: any;
    metrics: any;
    profiling: any;
    circuitBreakers: any;
    caches: any;
};
//# sourceMappingURL=index.d.ts.map