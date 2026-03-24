/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily blocking calls to failing services
 */
import { getLogger } from '../logger.js';
import { AppError, ErrorCode } from '../../utils/common.js';
export var CircuitBreakerState;
(function (CircuitBreakerState) {
    CircuitBreakerState["CLOSED"] = "CLOSED";
    CircuitBreakerState["OPEN"] = "OPEN";
    CircuitBreakerState["HALF_OPEN"] = "HALF_OPEN"; // Testing if service has recovered
})(CircuitBreakerState || (CircuitBreakerState = {}));
export class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.totalRequests = 0;
        this.totalFailures = 0;
        this.totalSuccesses = 0;
        this.logger = getLogger('circuit-breaker');
        this.logger.info(`Circuit breaker initialized: ${config.name || 'unnamed'}`, {
            failureThreshold: config.failureThreshold,
            successThreshold: config.successThreshold,
            timeWindow: config.timeWindow,
            openTimeout: config.openTimeout,
        });
    }
    /**
     * Execute function with circuit breaker protection
     */
    async execute(fn) {
        if (this.state === CircuitBreakerState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.moveToHalfOpen();
            }
            else {
                throw new AppError(`Circuit breaker is OPEN for ${this.config.name || 'service'}`, ErrorCode.SERVICE_UNAVAILABLE, { circuitBreakerMetrics: this.getMetrics() });
            }
        }
        this.totalRequests++;
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    /**
     * Get current circuit breaker metrics
     */
    getMetrics() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
            lastSuccessTime: this.lastSuccessTime,
            totalRequests: this.totalRequests,
            totalFailures: this.totalFailures,
            totalSuccesses: this.totalSuccesses,
            openTime: this.openTime,
            halfOpenTime: this.halfOpenTime,
        };
    }
    /**
     * Reset circuit breaker to closed state
     */
    reset() {
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.openTime = undefined;
        this.halfOpenTime = undefined;
        this.logger.info(`Circuit breaker reset: ${this.config.name || 'unnamed'}`);
    }
    onSuccess() {
        this.successCount++;
        this.totalSuccesses++;
        this.lastSuccessTime = Date.now();
        if (this.state === CircuitBreakerState.HALF_OPEN) {
            if (this.successCount >= this.config.successThreshold) {
                this.moveToClosed();
            }
        }
        else {
            // Reset failure count on success in closed state
            this.failureCount = 0;
        }
    }
    onFailure(error) {
        // Check if error should count as failure
        if (this.config.isError && !this.config.isError(error)) {
            return;
        }
        this.failureCount++;
        this.totalFailures++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.moveToOpen();
        }
        else if (this.state === CircuitBreakerState.CLOSED) {
            if (this.failureCount >= this.config.failureThreshold) {
                this.moveToOpen();
            }
        }
    }
    moveToOpen() {
        this.state = CircuitBreakerState.OPEN;
        this.openTime = Date.now();
        this.halfOpenTime = undefined;
        this.logger.warn(`Circuit breaker opened: ${this.config.name || 'unnamed'}`, {
            failureCount: this.failureCount,
            threshold: this.config.failureThreshold,
        });
    }
    moveToHalfOpen() {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.halfOpenTime = Date.now();
        this.successCount = 0;
        this.failureCount = 0;
        this.logger.info(`Circuit breaker half-open: ${this.config.name || 'unnamed'}`);
    }
    moveToClosed() {
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.openTime = undefined;
        this.halfOpenTime = undefined;
        this.logger.info(`Circuit breaker closed: ${this.config.name || 'unnamed'}`);
    }
    shouldAttemptReset() {
        if (!this.openTime)
            return false;
        return Date.now() - this.openTime >= this.config.openTimeout;
    }
}
/**
 * Circuit Breaker Factory with common configurations
 */
export class CircuitBreakerFactory {
    /**
     * Get or create circuit breaker for service
     */
    static getCircuitBreaker(name, config) {
        if (this.breakers.has(name)) {
            return this.breakers.get(name);
        }
        const defaultConfig = {
            failureThreshold: 5,
            successThreshold: 2,
            timeWindow: 60000, // 1 minute
            openTimeout: 30000, // 30 seconds
            name,
            ...config,
        };
        const breaker = new CircuitBreaker(defaultConfig);
        this.breakers.set(name, breaker);
        return breaker;
    }
    /**
     * Get all circuit breakers
     */
    static getAllCircuitBreakers() {
        return new Map(this.breakers);
    }
    /**
     * Get circuit breaker metrics for all breakers
     */
    static getAllMetrics() {
        const metrics = {};
        for (const [name, breaker] of this.breakers) {
            metrics[name] = breaker.getMetrics();
        }
        return metrics;
    }
    /**
     * Reset all circuit breakers
     */
    static resetAll() {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
    }
}
CircuitBreakerFactory.breakers = new Map();
/**
 * Predefined circuit breakers for common services
 */
export const CircuitBreakers = {
    // OpenAI API calls
    openai: CircuitBreakerFactory.getCircuitBreaker('openai', {
        failureThreshold: 3,
        successThreshold: 2,
        timeWindow: 60000,
        openTimeout: 60000, // Longer timeout for API recovery
        isError: (error) => {
            // Don't count rate limits as failures
            return !error.message.includes('rate_limit');
        },
    }),
    // Database connections
    database: CircuitBreakerFactory.getCircuitBreaker('database', {
        failureThreshold: 5,
        successThreshold: 3,
        timeWindow: 30000,
        openTimeout: 10000, // Quick recovery for local databases
    }),
    // Neo4j connections
    neo4j: CircuitBreakerFactory.getCircuitBreaker('neo4j', {
        failureThreshold: 3,
        successThreshold: 2,
        timeWindow: 60000,
        openTimeout: 30000,
    }),
    // Redis/KeyDB cache
    cache: CircuitBreakerFactory.getCircuitBreaker('cache', {
        failureThreshold: 5,
        successThreshold: 2,
        timeWindow: 30000,
        openTimeout: 15000, // Cache should recover quickly
    }),
    // Web content parsing
    webParser: CircuitBreakerFactory.getCircuitBreaker('web-parser', {
        failureThreshold: 5,
        successThreshold: 2,
        timeWindow: 120000, // Longer window for web requests
        openTimeout: 30000,
        isError: (error) => {
            // Don't count network timeouts as critical failures
            return !error.message.includes('timeout');
        },
    }),
    // LangChain operations
    langchain: CircuitBreakerFactory.getCircuitBreaker('langchain', {
        failureThreshold: 3,
        successThreshold: 2,
        timeWindow: 60000,
        openTimeout: 45000,
    }),
};
//# sourceMappingURL=circuit-breaker.js.map