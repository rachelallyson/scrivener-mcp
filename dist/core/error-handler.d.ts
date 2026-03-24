/**
 * Comprehensive Error Handling System
 * Provides structured error handling, recovery strategies, and monitoring
 */
import { EventEmitter } from 'events';
import { EnhancedLogger } from './enhanced-logger.js';
export interface ErrorContext {
    correlationId?: string;
    userId?: string;
    operation?: string;
    resource?: string;
    additionalData?: Record<string, unknown>;
    timestamp: Date;
}
export interface ErrorRecoveryStrategy {
    name: string;
    canRecover: (error: Error, context: ErrorContext) => boolean;
    recover: (error: Error, context: ErrorContext) => Promise<boolean>;
    maxAttempts?: number;
    backoffMs?: number;
}
export interface ErrorMetrics {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByCode: Record<string, number>;
    recoveryAttempts: number;
    successfulRecoveries: number;
    criticalErrors: number;
    recentErrors: Array<{
        error: string;
        context: ErrorContext;
        recovered: boolean;
        timestamp: Date;
    }>;
}
export interface ErrorNotification {
    severity: 'low' | 'medium' | 'high' | 'critical';
    error: Error;
    context: ErrorContext;
    suggestion?: string;
    correlationId: string;
    notificationId: string;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringWindow: number;
    halfOpenMaxCalls: number;
}
export interface RateLimitConfig {
    windowMs: number;
    maxAttempts: number;
    penaltyMs: number;
}
/**
 * Comprehensive error handler with recovery strategies
 */
export declare class ErrorHandler extends EventEmitter {
    private logger;
    private recoveryStrategies;
    private circuitBreakers;
    private metrics;
    private rateLimits;
    constructor(logger: EnhancedLogger);
    /**
     * Handle error with recovery attempts
     */
    handleError(error: Error, context: ErrorContext, options?: {
        allowRecovery?: boolean;
        notifySeverity?: ErrorNotification['severity'];
        circuitBreakerKey?: string;
        retryable?: boolean;
    }): Promise<{
        recovered: boolean;
        strategy?: string;
        attempts: number;
        finalError?: Error;
    }>;
    /**
     * Execute operation with circuit breaker protection
     */
    executeWithCircuitBreaker<T>(key: string, operation: () => Promise<T>, context?: ErrorContext, config?: Partial<CircuitBreakerConfig>): Promise<T>;
    /**
     * Add custom recovery strategy
     */
    addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void;
    /**
     * Remove recovery strategy
     */
    removeRecoveryStrategy(strategyName: string): void;
    /**
     * Get error metrics
     */
    getMetrics(): ErrorMetrics;
    /**
     * Get circuit breaker status
     */
    getCircuitBreakerStatus(): Record<string, {
        state: string;
        failures: number;
        lastFailureTime: Date | null;
    }>;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Generate error report
     */
    generateErrorReport(): string;
    private setupDefaultRecoveryStrategies;
    private setupProcessHandlers;
    private updateMetrics;
    private isRateLimited;
    private isCriticalError;
    private generateSuggestion;
    private delay;
}
/**
 * Error boundary for async operations
 */
export declare class AsyncErrorBoundary {
    private errorHandler;
    private defaultContext;
    constructor(errorHandler: ErrorHandler, defaultContext?: Partial<ErrorContext>);
    /**
     * Wrap async function with error handling
     */
    wrap<T extends any[], R>(fn: (...args: T) => Promise<R>, context?: Partial<ErrorContext>): (...args: T) => Promise<R>;
    /**
     * Execute function with error boundary
     */
    execute<T>(fn: () => Promise<T>, context?: Partial<ErrorContext>): Promise<T>;
}
//# sourceMappingURL=error-handler.d.ts.map