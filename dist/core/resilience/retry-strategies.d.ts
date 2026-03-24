/**
 * Advanced Retry Strategies with Circuit Breaker Integration
 * Provides multiple retry patterns with exponential backoff, jitter, and circuit breaker support
 */
import { CircuitBreaker } from './circuit-breaker.js';
export interface RetryConfig {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Initial delay between retries (ms) */
    initialDelay: number;
    /** Maximum delay between retries (ms) */
    maxDelay: number;
    /** Exponential backoff multiplier */
    backoffMultiplier: number;
    /** Add jitter to prevent thundering herd */
    jitter: boolean;
    /** Jitter factor (0-1) */
    jitterFactor: number;
    /** Timeout per attempt (ms) */
    attemptTimeout?: number;
    /** Circuit breaker to use */
    circuitBreaker?: CircuitBreaker;
    /** Custom retry condition */
    shouldRetry?: (error: Error, attempt: number) => boolean;
    /** Called on each retry attempt */
    onRetry?: (error: Error, attempt: number, delay: number) => void;
    /** Strategy name for logging */
    name?: string;
}
export interface RetryMetrics {
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    totalRetries: number;
    averageRetryDelay: number;
    lastAttemptTime?: number;
    lastSuccessTime?: number;
}
export declare class RetryStrategy {
    private readonly config;
    private metrics;
    private readonly logger;
    constructor(config: RetryConfig);
    /**
     * Execute function with retry logic
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Get retry metrics
     */
    getMetrics(): RetryMetrics;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    private executeWithTimeout;
    private calculateDelay;
    private isNonRetryableError;
    private onSuccess;
}
/**
 * Predefined retry strategies for common scenarios
 */
export declare class RetryStrategies {
    /**
     * Conservative strategy for critical operations
     */
    static createConservative(circuitBreaker?: CircuitBreaker, name?: string): RetryStrategy;
    /**
     * Aggressive strategy for transient failures
     */
    static createAggressive(circuitBreaker?: CircuitBreaker, name?: string): RetryStrategy;
    /**
     * Fast strategy for quick operations
     */
    static createFast(circuitBreaker?: CircuitBreaker, name?: string): RetryStrategy;
    /**
     * Network strategy for API calls
     */
    static createNetwork(circuitBreaker?: CircuitBreaker, name?: string): RetryStrategy;
    /**
     * Database strategy for database operations
     */
    static createDatabase(circuitBreaker?: CircuitBreaker, name?: string): RetryStrategy;
}
/**
 * Retry Manager for coordinating multiple retry strategies
 */
export declare class RetryManager {
    private strategies;
    /**
     * Register a retry strategy
     */
    registerStrategy(name: string, strategy: RetryStrategy): void;
    /**
     * Get retry strategy by name
     */
    getStrategy(name: string): RetryStrategy | undefined;
    /**
     * Execute with named strategy
     */
    executeWithStrategy<T>(strategyName: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Get all strategy metrics
     */
    getAllMetrics(): Record<string, RetryMetrics>;
    /**
     * Reset all strategy metrics
     */
    resetAllMetrics(): void;
}
export declare const globalRetryManager: RetryManager;
//# sourceMappingURL=retry-strategies.d.ts.map