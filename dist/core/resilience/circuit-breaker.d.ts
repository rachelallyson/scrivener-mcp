/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily blocking calls to failing services
 */
export declare enum CircuitBreakerState {
    CLOSED = "CLOSED",// Normal operation
    OPEN = "OPEN",// Circuit is open, requests fail fast
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerConfig {
    /** Failure threshold to open circuit */
    failureThreshold: number;
    /** Success threshold to close circuit when half-open */
    successThreshold: number;
    /** Time window for counting failures (ms) */
    timeWindow: number;
    /** Time to wait before attempting recovery (ms) */
    openTimeout: number;
    /** Optional custom error predicate */
    isError?: (error: Error) => boolean;
    /** Circuit breaker name for logging */
    name?: string;
}
export interface CircuitBreakerMetrics {
    state: CircuitBreakerState;
    failureCount: number;
    successCount: number;
    lastFailureTime?: number;
    lastSuccessTime?: number;
    totalRequests: number;
    totalFailures: number;
    totalSuccesses: number;
    openTime?: number;
    halfOpenTime?: number;
}
export declare class CircuitBreaker<T = unknown> {
    private readonly config;
    private state;
    private failureCount;
    private successCount;
    private lastFailureTime?;
    private lastSuccessTime?;
    private totalRequests;
    private totalFailures;
    private totalSuccesses;
    private openTime?;
    private halfOpenTime?;
    private readonly logger;
    constructor(config: CircuitBreakerConfig);
    /**
     * Execute function with circuit breaker protection
     */
    execute<R>(fn: () => Promise<R>): Promise<R>;
    /**
     * Get current circuit breaker metrics
     */
    getMetrics(): CircuitBreakerMetrics;
    /**
     * Reset circuit breaker to closed state
     */
    reset(): void;
    private onSuccess;
    private onFailure;
    private moveToOpen;
    private moveToHalfOpen;
    private moveToClosed;
    private shouldAttemptReset;
}
/**
 * Circuit Breaker Factory with common configurations
 */
export declare class CircuitBreakerFactory {
    private static breakers;
    /**
     * Get or create circuit breaker for service
     */
    static getCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
    /**
     * Get all circuit breakers
     */
    static getAllCircuitBreakers(): Map<string, CircuitBreaker>;
    /**
     * Get circuit breaker metrics for all breakers
     */
    static getAllMetrics(): Record<string, CircuitBreakerMetrics>;
    /**
     * Reset all circuit breakers
     */
    static resetAll(): void;
}
/**
 * Predefined circuit breakers for common services
 */
export declare const CircuitBreakers: {
    openai: CircuitBreaker<unknown>;
    database: CircuitBreaker<unknown>;
    neo4j: CircuitBreaker<unknown>;
    cache: CircuitBreaker<unknown>;
    webParser: CircuitBreaker<unknown>;
    langchain: CircuitBreaker<unknown>;
};
//# sourceMappingURL=circuit-breaker.d.ts.map