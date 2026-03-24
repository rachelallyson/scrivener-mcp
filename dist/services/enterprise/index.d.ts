/**
 * Enterprise Service Layer - Production-ready architectural patterns
 *
 * This module demonstrates enterprise-grade software architecture with:
 * - Circuit Breaker & Bulkhead Isolation patterns for resilience
 * - Distributed tracing and comprehensive observability
 * - Multi-layer intelligent caching with compression
 * - Advanced security with threat detection and rate limiting
 * - Performance profiling and optimization
 *
 * Usage Example:
 *
 * ```typescript
 * import { EnterpriseServiceOrchestrator } from './enterprise-service-orchestrator.js';
 *
 * const orchestrator = new EnterpriseServiceOrchestrator({
 *   serviceName: 'scrivener-mcp',
 *   samplingRate: 0.1,
 *   globalCacheSize: 1000
 * });
 *
 * // Register a service with enterprise patterns
 * orchestrator.registerService({
 *   name: 'document-service',
 *   circuitBreaker: {
 *     failureThreshold: 5,
 *     timeout: 60000,
 *     resetTimeout: 300000,
 *     monitoringWindow: 60000,
 *     healthCheckInterval: 10000
 *   },
 *   bulkhead: {
 *     maxConcurrency: 10,
 *     queueTimeout: 30000,
 *     rejectionStrategy: 'queue'
 *   },
 *   cache: {
 *     maxSize: 500,
 *     maxAge: 30 * 60 * 1000,
 *     compressionThreshold: 1024
 *   },
 *   security: {
 *     validationRules: [
 *       {
 *         field: 'documentId',
 *         type: 'uuid',
 *         required: true,
 *         sanitize: true
 *       }
 *     ],
 *     rateLimitPolicies: [
 *       {
 *         name: 'standard',
 *         windowMs: 60000,
 *         maxRequests: 100,
 *         keyGenerator: (context) => context.ipAddress
 *       }
 *     ],
 *     requireAuthentication: true
 *   },
 *   observability: {
 *     sampling: 0.1,
 *     enableMetrics: true,
 *     enableTracing: true
 *   }
 * });
 *
 * // Execute operations with enterprise patterns applied
 * const result = await orchestrator.execute(
 *   'document-service',
 *   {
 *     operation: 'getDocument',
 *     data: { documentId: 'uuid-here' },
 *     context: {
 *       ipAddress: '192.168.1.1',
 *       userAgent: 'MyApp/1.0',
 *       sessionId: 'session-123',
 *       userId: 'user-456'
 *     }
 *   },
 *   async (data, context) => {
 *     // Your business logic here
 *     return await getDocumentFromDatabase(data.documentId);
 *   }
 * );
 * ```
 */
import { EnterpriseServiceOrchestrator } from './enterprise-service-orchestrator.js';
export { EnterpriseServiceOrchestrator };
export { EnterpriseCircuitBreaker, BulkheadIsolation, EnterpriseRateLimiter, } from './service-foundation.js';
export { ObservabilityManager, DistributedTracer, MetricsCollector, AlertManager, } from './observability.js';
export { IntelligentCache, PerformanceProfiler } from './performance-optimizer.js';
export { SecurityValidator, SecurityRateLimiter, SecurityContextManager, } from './security-layer.js';
export type { CircuitBreakerConfig, BulkheadConfig, RateLimitConfig, ServiceMetrics, } from './service-foundation.js';
export type { Span, TraceContext, MetricPoint, Alert } from './observability.js';
export type { CacheEntry, CacheMetrics, PerformanceProfile } from './performance-optimizer.js';
export type { SecurityContext, ThreatEvent, ValidationRule, SecurityPolicy, } from './security-layer.js';
export type { ServiceConfig, ServiceRequest, ServiceResponse, } from './enterprise-service-orchestrator.js';
/**
 * Factory function to create a pre-configured enterprise orchestrator
 */
export declare function createEnterpriseOrchestrator(options: {
    serviceName: string;
    environment?: 'development' | 'staging' | 'production';
    samplingRate?: number;
    cacheSize?: number;
}): EnterpriseServiceOrchestrator;
/**
 * Pre-configured service configurations for common patterns
 */
export declare const ServiceConfigurations: {
    /**
     * High-throughput service configuration
     */
    readonly highThroughput: {
        readonly circuitBreaker: {
            readonly failureThreshold: 10;
            readonly timeout: 60000;
            readonly resetTimeout: 180000;
            readonly monitoringWindow: 30000;
            readonly healthCheckInterval: 5000;
        };
        readonly bulkhead: {
            readonly maxConcurrency: 50;
            readonly queueTimeout: 10000;
            readonly rejectionStrategy: "fail-fast";
        };
        readonly cache: {
            readonly maxSize: 2000;
            readonly maxAge: number;
            readonly compressionThreshold: 2048;
        };
    };
    /**
     * Security-focused service configuration
     */
    readonly securityFocused: {
        readonly circuitBreaker: {
            readonly failureThreshold: 3;
            readonly timeout: 120000;
            readonly resetTimeout: 600000;
            readonly monitoringWindow: 60000;
            readonly healthCheckInterval: 15000;
        };
        readonly security: {
            readonly rateLimitPolicies: readonly [{
                readonly name: "strict";
                readonly windowMs: 60000;
                readonly maxRequests: 20;
                readonly keyGenerator: (context: {
                    ipAddress: string;
                }) => string;
            }, {
                readonly name: "user";
                readonly windowMs: 60000;
                readonly maxRequests: 100;
                readonly keyGenerator: (context: {
                    userId?: string;
                    ipAddress: string;
                }) => string;
            }];
            readonly requireAuthentication: true;
        };
    };
    /**
     * Resource-constrained service configuration
     */
    readonly resourceConstrained: {
        readonly circuitBreaker: {
            readonly failureThreshold: 5;
            readonly timeout: 30000;
            readonly resetTimeout: 120000;
            readonly monitoringWindow: 60000;
            readonly healthCheckInterval: 10000;
        };
        readonly bulkhead: {
            readonly maxConcurrency: 5;
            readonly queueTimeout: 30000;
            readonly rejectionStrategy: "queue";
        };
        readonly cache: {
            readonly maxSize: 100;
            readonly maxAge: number;
            readonly compressionThreshold: 512;
        };
    };
};
//# sourceMappingURL=index.d.ts.map