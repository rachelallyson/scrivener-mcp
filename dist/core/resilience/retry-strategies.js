/**
 * Advanced Retry Strategies with Circuit Breaker Integration
 * Provides multiple retry patterns with exponential backoff, jitter, and circuit breaker support
 */
import { getLogger } from '../logger.js';
import { AppError, ErrorCode, sleep } from '../../utils/common.js';
export class RetryStrategy {
    constructor(config) {
        this.config = config;
        this.metrics = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            totalRetries: 0,
            averageRetryDelay: 0,
        };
        this.logger = getLogger('retry-strategy');
        this.logger.debug(`Retry strategy initialized: ${config.name || 'unnamed'}`, {
            maxAttempts: config.maxAttempts,
            initialDelay: config.initialDelay,
            maxDelay: config.maxDelay,
            backoffMultiplier: config.backoffMultiplier,
            jitter: config.jitter,
        });
    }
    /**
     * Execute function with retry logic
     */
    async execute(fn) {
        this.metrics.totalAttempts++;
        this.metrics.lastAttemptTime = Date.now();
        let lastError;
        const delays = [];
        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                // Use circuit breaker if configured
                if (this.config.circuitBreaker) {
                    const result = await this.config.circuitBreaker.execute(async () => {
                        return await this.executeWithTimeout(fn);
                    });
                    this.onSuccess();
                    return result;
                }
                else {
                    const result = await this.executeWithTimeout(fn);
                    this.onSuccess();
                    return result;
                }
            }
            catch (error) {
                lastError = error;
                // Check if we should retry this error
                if (this.config.shouldRetry && !this.config.shouldRetry(lastError, attempt)) {
                    this.logger.debug(`Not retrying error (custom condition): ${lastError.message}`);
                    break;
                }
                // Don't retry on last attempt
                if (attempt === this.config.maxAttempts) {
                    break;
                }
                // Check for non-retryable errors
                if (this.isNonRetryableError(lastError)) {
                    this.logger.debug(`Not retrying non-retryable error: ${lastError.message}`);
                    break;
                }
                const delay = this.calculateDelay(attempt);
                delays.push(delay);
                this.logger.warn(`Attempt ${attempt}/${this.config.maxAttempts} failed, retrying in ${delay}ms`, {
                    error: lastError.message,
                    strategyName: this.config.name,
                    attempt,
                    delay,
                });
                this.config.onRetry?.(lastError, attempt, delay);
                await sleep(delay);
            }
        }
        // Update metrics
        this.metrics.failedAttempts++;
        this.metrics.totalRetries += delays.length;
        if (delays.length > 0) {
            this.metrics.averageRetryDelay =
                (this.metrics.averageRetryDelay * (this.metrics.totalRetries - delays.length) +
                    delays.reduce((sum, delay) => sum + delay, 0)) / this.metrics.totalRetries;
        }
        throw new AppError(`Operation failed after ${this.config.maxAttempts} attempts`, ErrorCode.OPERATION_FAILED, {
            originalError: lastError.message,
            attempts: this.config.maxAttempts,
            strategyName: this.config.name,
            retryMetrics: this.getMetrics(),
        });
    }
    /**
     * Get retry metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            totalAttempts: 0,
            successfulAttempts: 0,
            failedAttempts: 0,
            totalRetries: 0,
            averageRetryDelay: 0,
        };
    }
    async executeWithTimeout(fn) {
        if (!this.config.attemptTimeout) {
            return await fn();
        }
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new AppError(`Operation timed out after ${this.config.attemptTimeout}ms`, ErrorCode.TIMEOUT));
            }, this.config.attemptTimeout);
        });
        return await Promise.race([fn(), timeoutPromise]);
    }
    calculateDelay(attempt) {
        // Calculate exponential backoff
        let delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
        // Apply maximum delay limit
        delay = Math.min(delay, this.config.maxDelay);
        // Add jitter if enabled
        if (this.config.jitter) {
            const jitterRange = delay * this.config.jitterFactor;
            const jitterOffset = Math.random() * jitterRange;
            delay = delay + jitterOffset - (jitterRange / 2);
        }
        return Math.max(0, Math.floor(delay));
    }
    isNonRetryableError(error) {
        // Check for specific error types that shouldn't be retried
        if (error instanceof AppError) {
            switch (error.code) {
                case ErrorCode.VALIDATION_ERROR:
                case ErrorCode.VALIDATION_FAILED:
                case ErrorCode.INVALID_INPUT:
                case ErrorCode.INVALID_REQUEST:
                case ErrorCode.UNAUTHORIZED:
                case ErrorCode.FORBIDDEN:
                case ErrorCode.NOT_FOUND:
                case ErrorCode.FILE_NOT_FOUND:
                case ErrorCode.PROJECT_NOT_FOUND:
                case ErrorCode.DOCUMENT_NOT_FOUND:
                    return true;
                default:
                    return false;
            }
        }
        // Check for specific error messages
        const message = error.message.toLowerCase();
        if (message.includes('authentication failed') ||
            message.includes('invalid credentials') ||
            message.includes('not found') ||
            message.includes('bad request')) {
            return true;
        }
        return false;
    }
    onSuccess() {
        this.metrics.successfulAttempts++;
        this.metrics.lastSuccessTime = Date.now();
    }
}
/**
 * Predefined retry strategies for common scenarios
 */
export class RetryStrategies {
    /**
     * Conservative strategy for critical operations
     */
    static createConservative(circuitBreaker, name) {
        return new RetryStrategy({
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2,
            jitter: true,
            jitterFactor: 0.1,
            attemptTimeout: 30000,
            circuitBreaker,
            name: name || 'conservative',
        });
    }
    /**
     * Aggressive strategy for transient failures
     */
    static createAggressive(circuitBreaker, name) {
        return new RetryStrategy({
            maxAttempts: 5,
            initialDelay: 500,
            maxDelay: 30000,
            backoffMultiplier: 2.5,
            jitter: true,
            jitterFactor: 0.2,
            attemptTimeout: 60000,
            circuitBreaker,
            name: name || 'aggressive',
        });
    }
    /**
     * Fast strategy for quick operations
     */
    static createFast(circuitBreaker, name) {
        return new RetryStrategy({
            maxAttempts: 3,
            initialDelay: 100,
            maxDelay: 2000,
            backoffMultiplier: 1.5,
            jitter: true,
            jitterFactor: 0.1,
            attemptTimeout: 5000,
            circuitBreaker,
            name: name || 'fast',
        });
    }
    /**
     * Network strategy for API calls
     */
    static createNetwork(circuitBreaker, name) {
        return new RetryStrategy({
            maxAttempts: 4,
            initialDelay: 1000,
            maxDelay: 60000,
            backoffMultiplier: 2,
            jitter: true,
            jitterFactor: 0.25, // More jitter for network calls
            attemptTimeout: 30000,
            circuitBreaker,
            shouldRetry: (error) => {
                // Retry network errors but not client errors (4xx)
                const message = error.message.toLowerCase();
                return !message.includes('4') ||
                    message.includes('timeout') ||
                    message.includes('connection');
            },
            name: name || 'network',
        });
    }
    /**
     * Database strategy for database operations
     */
    static createDatabase(circuitBreaker, name) {
        return new RetryStrategy({
            maxAttempts: 3,
            initialDelay: 500,
            maxDelay: 5000,
            backoffMultiplier: 2,
            jitter: true,
            jitterFactor: 0.1,
            attemptTimeout: 15000,
            circuitBreaker,
            shouldRetry: (error) => {
                // Retry transient database errors
                const message = error.message.toLowerCase();
                return message.includes('busy') ||
                    message.includes('locked') ||
                    message.includes('timeout') ||
                    message.includes('connection');
            },
            name: name || 'database',
        });
    }
}
/**
 * Retry Manager for coordinating multiple retry strategies
 */
export class RetryManager {
    constructor() {
        this.strategies = new Map();
    }
    /**
     * Register a retry strategy
     */
    registerStrategy(name, strategy) {
        this.strategies.set(name, strategy);
    }
    /**
     * Get retry strategy by name
     */
    getStrategy(name) {
        return this.strategies.get(name);
    }
    /**
     * Execute with named strategy
     */
    async executeWithStrategy(strategyName, fn) {
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
            throw new AppError(`Retry strategy not found: ${strategyName}`, ErrorCode.CONFIGURATION_ERROR);
        }
        return await strategy.execute(fn);
    }
    /**
     * Get all strategy metrics
     */
    getAllMetrics() {
        const metrics = {};
        for (const [name, strategy] of this.strategies) {
            metrics[name] = strategy.getMetrics();
        }
        return metrics;
    }
    /**
     * Reset all strategy metrics
     */
    resetAllMetrics() {
        for (const strategy of this.strategies.values()) {
            strategy.resetMetrics();
        }
    }
}
// Global retry manager instance
export const globalRetryManager = new RetryManager();
// Register common strategies
globalRetryManager.registerStrategy('conservative', RetryStrategies.createConservative());
globalRetryManager.registerStrategy('aggressive', RetryStrategies.createAggressive());
globalRetryManager.registerStrategy('fast', RetryStrategies.createFast());
globalRetryManager.registerStrategy('network', RetryStrategies.createNetwork());
globalRetryManager.registerStrategy('database', RetryStrategies.createDatabase());
//# sourceMappingURL=retry-strategies.js.map