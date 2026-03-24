/**
 * Enterprise Service Orchestrator - Unified service layer with advanced patterns
 * Orchestrates circuit breakers, observability, caching, security, and performance monitoring
 */
import { EventEmitter } from 'events';
import { type CircuitBreakerConfig, type BulkheadConfig } from './service-foundation.js';
import { type TraceContext } from './observability.js';
import { type SecurityContext, type ValidationRule, type ThreatEvent } from './security-layer.js';
export interface ServiceConfig {
    name: string;
    circuitBreaker?: CircuitBreakerConfig;
    bulkhead?: BulkheadConfig;
    cache?: {
        maxSize: number;
        maxAge?: number;
        compressionThreshold?: number;
    };
    security?: {
        validationRules?: ValidationRule[];
        rateLimitPolicies?: Array<{
            name: string;
            windowMs: number;
            maxRequests: number;
            keyGenerator: (context: SecurityContext) => string;
        }>;
        requireAuthentication?: boolean;
    };
    observability?: {
        sampling?: number;
        enableMetrics?: boolean;
        enableTracing?: boolean;
    };
}
export interface ServiceRequest<T = unknown> {
    operation: string;
    data?: T;
    context: {
        ipAddress: string;
        userAgent: string;
        sessionId?: string;
        userId?: string;
        traceContext?: TraceContext;
    };
    options?: {
        skipCache?: boolean;
        skipValidation?: boolean;
        skipRateLimit?: boolean;
        timeout?: number;
    };
}
export interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metadata: {
        executionTime: number;
        fromCache: boolean;
        threats?: ThreatEvent[];
        traceId: string;
        spanId: string;
        performanceMetrics?: {
            cacheHitRate: number;
            circuitBreakerState: string;
            activeConnections: number;
        };
    };
}
export declare class EnterpriseServiceOrchestrator extends EventEmitter {
    private services;
    private observability;
    private performanceProfiler;
    private securityValidator;
    private securityRateLimiter;
    private securityContextManager;
    private globalCache;
    constructor(options: {
        serviceName: string;
        samplingRate?: number;
        globalCacheSize?: number;
    });
    /**
     * Register a service with enterprise patterns
     */
    registerService(config: ServiceConfig): void;
    /**
     * Execute a service operation with all enterprise patterns applied
     */
    execute<TRequest, TResponse>(serviceName: string, request: ServiceRequest<TRequest>, handler: (data: TRequest, context: TraceContext) => Promise<TResponse>): Promise<ServiceResponse<TResponse>>;
    /**
     * Get comprehensive service metrics
     */
    getServiceMetrics(serviceName?: string): Record<string, unknown>;
    private generateCacheKey;
    private calculateCacheHitRate;
    private setupHealthChecks;
    private setupEventHandlers;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=enterprise-service-orchestrator.d.ts.map