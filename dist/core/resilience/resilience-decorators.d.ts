/**
 * Resilience Decorators for Service Integration
 * Easy-to-use decorators that add circuit breaking, retries, caching, and monitoring to services
 */
export interface ResilienceConfig {
    /** Enable circuit breaker */
    circuitBreaker?: {
        enabled: boolean;
        name?: string;
        failureThreshold?: number;
        successThreshold?: number;
        timeWindow?: number;
        openTimeout?: number;
    };
    /** Enable retry mechanism */
    retry?: {
        enabled: boolean;
        strategy?: 'conservative' | 'aggressive' | 'fast' | 'network' | 'database';
        maxAttempts?: number;
        initialDelay?: number;
        maxDelay?: number;
        backoffMultiplier?: number;
        jitter?: boolean;
    };
    /** Enable caching */
    cache?: {
        enabled: boolean;
        cacheName?: string;
        keyGenerator?: (...args: any[]) => string;
        ttl?: number;
        enableL1?: boolean;
        enableL2?: boolean;
        tags?: Record<string, string>;
    };
    /** Enable metrics collection */
    metrics?: {
        enabled: boolean;
        operationName?: string;
        tags?: Record<string, string>;
    };
    /** Enable performance profiling */
    profiling?: {
        enabled: boolean;
        operationName?: string;
        sampleRate?: number;
        tags?: Record<string, string>;
    };
    /** Timeout configuration */
    timeout?: {
        enabled: boolean;
        duration: number;
    };
}
/**
 * Master resilience decorator that combines all resilience patterns
 */
export declare function Resilient(config?: ResilienceConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Circuit Breaker decorator
 */
export declare function CircuitBreaker(name?: string, config?: {
    failureThreshold?: number;
    successThreshold?: number;
    timeWindow?: number;
    openTimeout?: number;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Retry decorator
 */
export declare function Retry(strategy?: 'conservative' | 'aggressive' | 'fast' | 'network' | 'database', config?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    jitter?: boolean;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Cache decorator
 */
export declare function Cached(config?: {
    cacheName?: string;
    keyGenerator?: (...args: any[]) => string;
    ttl?: number;
    enableL1?: boolean;
    enableL2?: boolean;
    tags?: Record<string, string>;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Metrics decorator
 */
export declare function Metrics(operationName?: string, tags?: Record<string, string>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Performance profiling decorator
 */
export declare function Profile(operationName?: string, config?: {
    sampleRate?: number;
    tags?: Record<string, string>;
}): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Timeout decorator
 */
export declare function Timeout(duration: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Rate limiting decorator
 */
export declare function RateLimit(requestsPerSecond: number, burstSize?: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Bulkhead decorator for resource isolation
 */
export declare function Bulkhead(semaphoreSize: number, queueSize?: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Combine multiple resilience decorators
 */
export declare function ResilientService(config: {
    circuitBreaker?: boolean;
    retry?: 'conservative' | 'aggressive' | 'fast' | 'network' | 'database';
    cache?: boolean;
    metrics?: boolean;
    profiling?: boolean;
    timeout?: number;
    rateLimit?: number;
    bulkhead?: number;
}): <T extends {
    new (...args: any[]): {};
}>(constructor: T) => T;
//# sourceMappingURL=resilience-decorators.d.ts.map