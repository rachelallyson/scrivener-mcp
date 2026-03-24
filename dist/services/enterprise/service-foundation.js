/**
 * Enterprise Service Foundation - Advanced architectural patterns for production systems
 * Implements circuit breaker, bulkhead isolation, distributed tracing, and observability
 */
import { EventEmitter } from 'events';
import { ErrorCode, createError, handleError, measureExecution, generateHash, } from '../../utils/common.js';
import { getLogger } from '../../core/logger.js';
const logger = getLogger('service-foundation');
// Circuit Breaker Implementation with Advanced Features
export class EnterpriseCircuitBreaker extends EventEmitter {
    constructor(name, config) {
        super();
        this.name = name;
        this.config = config;
        this.state = 'closed';
        this.failures = 0;
        this.lastFailureTime = 0;
        this.successCount = 0;
        this.requestCount = 0;
        this.responseTime = [];
        this.startHealthCheck();
    }
    async execute(operation, context) {
        const span = this.createSpan('circuit-breaker-execute', context);
        try {
            if (this.state === 'open') {
                if (Date.now() - this.lastFailureTime < this.config.resetTimeout) {
                    throw createError(ErrorCode.SERVICE_UNAVAILABLE, { circuitBreaker: this.name, state: this.state }, 'Circuit breaker is open');
                }
                this.state = 'half-open';
                this.emit('state-change', { from: 'open', to: 'half-open', breaker: this.name });
            }
            const result = await measureExecution(async () => {
                const operationResult = await operation();
                this.onSuccess();
                return operationResult;
            });
            this.recordResponseTime(result.ms);
            this.finishSpan(span, { success: true, responseTime: result.ms });
            return result.result;
        }
        catch (error) {
            this.onFailure();
            this.finishSpan(span, { success: false, error: error.message });
            throw handleError(error, `circuit-breaker-${this.name}`);
        }
    }
    onSuccess() {
        this.successCount++;
        this.requestCount++;
        if (this.state === 'half-open') {
            this.state = 'closed';
            this.failures = 0;
            this.emit('state-change', { from: 'half-open', to: 'closed', breaker: this.name });
        }
    }
    onFailure() {
        this.failures++;
        this.requestCount++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.config.failureThreshold) {
            this.state = 'open';
            this.emit('state-change', { from: 'closed', to: 'open', breaker: this.name });
            this.emit('circuit-open', { breaker: this.name, failures: this.failures });
        }
    }
    recordResponseTime(time) {
        this.responseTime.push(time);
        // Keep only recent measurements for sliding window
        if (this.responseTime.length > 1000) {
            this.responseTime = this.responseTime.slice(-500);
        }
    }
    startHealthCheck() {
        this.healthCheckTimer = setInterval(() => {
            this.emit('health-check', this.getMetrics());
        }, this.config.healthCheckInterval);
    }
    createSpan(operation, parentContext) {
        return {
            traceId: parentContext?.traceId || generateHash(`trace-${Date.now()}-${Math.random()}`),
            spanId: generateHash(`span-${Date.now()}-${Math.random()}`),
            parentSpanId: parentContext?.spanId,
            baggage: { ...parentContext?.baggage, circuitBreaker: this.name },
            startTime: Date.now(),
        };
    }
    finishSpan(span, data) {
        const duration = Date.now() - span.startTime;
        this.emit('span-finished', {
            ...span,
            duration,
            operation: 'circuit-breaker-execute',
            ...data,
        });
    }
    getMetrics() {
        const sortedTimes = this.responseTime.slice().sort((a, b) => a - b);
        const p95Index = Math.floor(sortedTimes.length * 0.95);
        const p99Index = Math.floor(sortedTimes.length * 0.99);
        return {
            requestCount: this.requestCount,
            successCount: this.successCount,
            failureCount: this.failures,
            avgResponseTime: this.responseTime.reduce((a, b) => a + b, 0) / this.responseTime.length || 0,
            p95ResponseTime: sortedTimes[p95Index] || 0,
            p99ResponseTime: sortedTimes[p99Index] || 0,
            circuitBreakerState: this.state,
            activeConcurrency: 0, // Will be tracked by bulkhead
            queuedRequests: 0,
        };
    }
    destroy() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        this.removeAllListeners();
    }
}
// Bulkhead Isolation Pattern for Resource Protection
export class BulkheadIsolation {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.activeTasks = new Set();
        this.queuedTasks = [];
    }
    async execute(operation, context) {
        const span = this.createSpan('bulkhead-execute', context);
        // Check if we can execute immediately
        if (this.activeTasks.size < this.config.maxConcurrency) {
            return this.executeImmediately(operation, span);
        }
        // Handle different rejection strategies
        switch (this.config.rejectionStrategy) {
            case 'fail-fast':
                throw createError(ErrorCode.RESOURCE_EXHAUSTED, { bulkhead: this.name, activeTasks: this.activeTasks.size }, 'Bulkhead capacity exceeded');
            case 'queue':
                return this.queueOperation(operation, span);
            case 'degrade':
                // Implement graceful degradation
                return this.executeWithDegradation(operation, span);
            default:
                throw createError(ErrorCode.INVALID_INPUT, { strategy: this.config.rejectionStrategy }, 'Invalid rejection strategy');
        }
    }
    async executeImmediately(operation, span) {
        const task = this.wrapOperation(operation, span);
        this.activeTasks.add(task);
        try {
            const result = await task;
            this.finishSpan(span, { success: true });
            return result;
        }
        catch (error) {
            this.finishSpan(span, { success: false, error: error.message });
            throw error;
        }
        finally {
            this.activeTasks.delete(task);
            this.processQueue();
        }
    }
    async queueOperation(operation, span) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const index = this.queuedTasks.findIndex((task) => task.resolve === resolve);
                if (index >= 0) {
                    this.queuedTasks.splice(index, 1);
                }
                reject(createError(ErrorCode.TIMEOUT, { bulkhead: this.name, queueTimeout: this.config.queueTimeout }, 'Queue timeout exceeded'));
            }, this.config.queueTimeout);
            this.queuedTasks.push({
                operation,
                resolve: resolve,
                reject,
                timeout,
                context: span,
            });
        });
    }
    async executeWithDegradation(operation, span) {
        // Implement degraded execution with reduced functionality
        logger.warn('Executing with degradation', { bulkhead: this.name });
        try {
            // Execute with shorter timeout and simplified processing
            return await Promise.race([
                operation(),
                new Promise((_, reject) => setTimeout(() => reject(createError(ErrorCode.TIMEOUT, {}, 'Degraded execution timeout')), 5000)),
            ]);
        }
        catch (error) {
            this.finishSpan(span, {
                success: false,
                degraded: true,
                error: error.message,
            });
            throw handleError(error, `bulkhead-degraded-${this.name}`);
        }
    }
    async wrapOperation(operation, span) {
        const result = await measureExecution(operation);
        this.finishSpan(span, { success: true, responseTime: result.ms });
        return result.result;
    }
    processQueue() {
        if (this.queuedTasks.length > 0 && this.activeTasks.size < this.config.maxConcurrency) {
            const task = this.queuedTasks.shift();
            clearTimeout(task.timeout);
            this.executeImmediately(task.operation, task.context)
                .then(task.resolve)
                .catch(task.reject);
        }
    }
    createSpan(operation, parentContext) {
        return {
            traceId: parentContext?.traceId || generateHash(`trace-${Date.now()}-${Math.random()}`),
            spanId: generateHash(`span-${Date.now()}-${Math.random()}`),
            parentSpanId: parentContext?.spanId,
            baggage: { ...parentContext?.baggage, bulkhead: this.name },
            startTime: Date.now(),
        };
    }
    finishSpan(span, data) {
        const duration = Date.now() - span.startTime;
        logger.debug('Bulkhead span finished', {
            ...span,
            duration,
            operation: 'bulkhead-execute',
            ...data,
        });
    }
    getMetrics() {
        return {
            activeTasks: this.activeTasks.size,
            queuedTasks: this.queuedTasks.length,
        };
    }
}
// Advanced Rate Limiter with Multiple Algorithms
export class EnterpriseRateLimiter {
    constructor(config) {
        this.config = config;
        this.windows = new Map();
        this.slidingLog = new Map();
    }
    async checkLimit(context) {
        const key = this.config.keyGenerator(context);
        const now = Date.now();
        // Clean up old windows
        this.cleanup(now);
        // Token bucket algorithm for burst handling
        const window = this.windows.get(key) || {
            count: 0,
            resetTime: now + this.config.windowMs,
            requests: [],
        };
        if (now > window.resetTime) {
            // Reset window
            window.count = 0;
            window.resetTime = now + this.config.windowMs;
            window.requests = [];
        }
        if (window.count >= this.config.maxRequests) {
            return {
                allowed: false,
                resetTime: window.resetTime,
                remaining: 0,
            };
        }
        // Record request
        window.count++;
        window.requests.push(now);
        this.windows.set(key, window);
        return {
            allowed: true,
            remaining: this.config.maxRequests - window.count,
        };
    }
    cleanup(now) {
        for (const [key, window] of this.windows) {
            if (now > window.resetTime + this.config.windowMs) {
                this.windows.delete(key);
            }
        }
    }
}
//# sourceMappingURL=service-foundation.js.map