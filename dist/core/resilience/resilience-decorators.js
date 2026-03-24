/**
 * Resilience Decorators for Service Integration
 * Easy-to-use decorators that add circuit breaking, retries, caching, and monitoring to services
 */
import { getLogger } from '../logger.js';
import { CircuitBreakerFactory } from './circuit-breaker.js';
import { RetryStrategies } from './retry-strategies.js';
import { globalCacheManager } from './multi-level-cache.js';
import { globalMetricsRegistry } from './metrics-collector.js';
import { globalProfiler } from './performance-profiler.js';
import { AppError, ErrorCode, generateHash } from '../../utils/common.js';
/**
 * Master resilience decorator that combines all resilience patterns
 */
export function Resilient(config = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        const operationName = `${className}.${propertyKey}`;
        const logger = getLogger('resilience-decorator');
        // Initialize components based on configuration
        let circuitBreaker;
        let retryStrategy;
        let cache;
        // Setup circuit breaker
        if (config.circuitBreaker?.enabled) {
            const cbName = config.circuitBreaker.name || operationName;
            circuitBreaker = CircuitBreakerFactory.getCircuitBreaker(cbName, {
                failureThreshold: config.circuitBreaker.failureThreshold || 5,
                successThreshold: config.circuitBreaker.successThreshold || 2,
                timeWindow: config.circuitBreaker.timeWindow || 60000,
                openTimeout: config.circuitBreaker.openTimeout || 30000,
                name: cbName,
            });
        }
        // Setup retry strategy
        if (config.retry?.enabled) {
            const strategyType = config.retry.strategy || 'conservative';
            switch (strategyType) {
                case 'conservative':
                    retryStrategy = RetryStrategies.createConservative(circuitBreaker, operationName);
                    break;
                case 'aggressive':
                    retryStrategy = RetryStrategies.createAggressive(circuitBreaker, operationName);
                    break;
                case 'fast':
                    retryStrategy = RetryStrategies.createFast(circuitBreaker, operationName);
                    break;
                case 'network':
                    retryStrategy = RetryStrategies.createNetwork(circuitBreaker, operationName);
                    break;
                case 'database':
                    retryStrategy = RetryStrategies.createDatabase(circuitBreaker, operationName);
                    break;
            }
        }
        // Setup cache
        if (config.cache?.enabled) {
            const cacheName = config.cache.cacheName || `${className}-cache`;
            cache = globalCacheManager.getCache(cacheName, {
                enableL1: config.cache.enableL1 !== false,
                enableL2: config.cache.enableL2 || false,
                name: cacheName,
                l1Config: {
                    ttl: config.cache.ttl || 300000,
                },
            });
        }
        // Setup metrics
        let metricsEnabled = config.metrics?.enabled !== false;
        let counter, timer, errorCounter;
        if (metricsEnabled) {
            const metricName = config.metrics?.operationName || operationName;
            const tags = config.metrics?.tags || { class: className, method: propertyKey };
            counter = globalMetricsRegistry.counter(`operations.${metricName}.total`, `Total calls to ${metricName}`, tags);
            timer = globalMetricsRegistry.timer(`operations.${metricName}.duration`, `Duration of ${metricName} calls`, tags);
            errorCounter = globalMetricsRegistry.counter(`operations.${metricName}.errors`, `Errors in ${metricName}`, tags);
        }
        // Setup profiling
        let profilingEnabled = config.profiling?.enabled !== false;
        const profilingOperationName = config.profiling?.operationName || operationName;
        const profilingTags = config.profiling?.tags || { class: className, method: propertyKey };
        // Create the resilient wrapper
        descriptor.value = async function (...args) {
            // Generate cache key if caching is enabled
            let cacheKey;
            if (cache && config.cache?.enabled) {
                if (config.cache.keyGenerator) {
                    cacheKey = config.cache.keyGenerator(...args);
                }
                else {
                    cacheKey = generateCacheKey(operationName, args);
                }
                // Try cache first
                try {
                    const cachedResult = await cache.get(cacheKey);
                    if (cachedResult !== null) {
                        if (metricsEnabled) {
                            counter?.increment();
                        }
                        logger.debug(`Cache hit for ${operationName}`, { cacheKey });
                        return cachedResult;
                    }
                }
                catch (error) {
                    logger.warn(`Cache get failed for ${operationName}`, {
                        error: error.message,
                        cacheKey,
                    });
                }
            }
            // Start metrics and profiling
            if (metricsEnabled) {
                counter?.increment();
            }
            const profiler = profilingEnabled ? globalProfiler.startOperation(profilingOperationName, profilingTags) : null;
            try {
                // Execute with timeout if configured
                let executionPromise;
                if (config.timeout?.enabled && config.timeout.duration > 0) {
                    executionPromise = executeWithTimeout(async () => {
                        // Execute with retry and circuit breaker
                        if (retryStrategy) {
                            return await retryStrategy.execute(async () => {
                                return await originalMethod.apply(this, args);
                            });
                        }
                        else if (circuitBreaker) {
                            return await circuitBreaker.execute(async () => {
                                return await originalMethod.apply(this, args);
                            });
                        }
                        else {
                            return await originalMethod.apply(this, args);
                        }
                    }, config.timeout.duration);
                }
                else {
                    // Execute with retry and circuit breaker (no timeout)
                    if (retryStrategy) {
                        executionPromise = retryStrategy.execute(async () => {
                            return await originalMethod.apply(this, args);
                        });
                    }
                    else if (circuitBreaker) {
                        executionPromise = circuitBreaker.execute(async () => {
                            return await originalMethod.apply(this, args);
                        });
                    }
                    else {
                        executionPromise = originalMethod.apply(this, args);
                    }
                }
                // Measure execution time
                const result = metricsEnabled && timer ?
                    await timer.timeAsync(() => executionPromise) :
                    await executionPromise;
                // Cache the result if caching is enabled
                if (cache && cacheKey && config.cache?.enabled) {
                    try {
                        await cache.set(cacheKey, result, config.cache.ttl, config.cache.tags);
                        logger.debug(`Result cached for ${operationName}`, { cacheKey });
                    }
                    catch (error) {
                        logger.warn(`Cache set failed for ${operationName}`, {
                            error: error.message,
                            cacheKey,
                        });
                    }
                }
                // Mark profiler as successful
                profiler?.success();
                return result;
            }
            catch (error) {
                // Record error metrics
                if (metricsEnabled) {
                    errorCounter?.increment();
                }
                // Record profiler error
                profiler?.error(error);
                logger.error(`Error in ${operationName}`, {
                    error: error.message,
                    args: args.length,
                });
                throw error;
            }
            finally {
                // Finish profiling
                profiler?.finish();
            }
        };
        return descriptor;
    };
}
/**
 * Circuit Breaker decorator
 */
export function CircuitBreaker(name, config) {
    return Resilient({
        circuitBreaker: {
            enabled: true,
            name,
            ...config,
        },
    });
}
/**
 * Retry decorator
 */
export function Retry(strategy = 'conservative', config) {
    return Resilient({
        retry: {
            enabled: true,
            strategy,
            ...config,
        },
    });
}
/**
 * Cache decorator
 */
export function Cached(config) {
    return Resilient({
        cache: {
            enabled: true,
            ...config,
        },
    });
}
/**
 * Metrics decorator
 */
export function Metrics(operationName, tags) {
    return Resilient({
        metrics: {
            enabled: true,
            operationName,
            tags,
        },
    });
}
/**
 * Performance profiling decorator
 */
export function Profile(operationName, config) {
    return Resilient({
        profiling: {
            enabled: true,
            operationName,
            sampleRate: config?.sampleRate,
            tags: config?.tags,
        },
    });
}
/**
 * Timeout decorator
 */
export function Timeout(duration) {
    return Resilient({
        timeout: {
            enabled: true,
            duration,
        },
    });
}
/**
 * Rate limiting decorator
 */
export function RateLimit(requestsPerSecond, burstSize) {
    const rateLimiter = new TokenBucket(requestsPerSecond, burstSize || requestsPerSecond);
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const operationName = `${target.constructor.name}.${propertyKey}`;
        const logger = getLogger('rate-limit-decorator');
        descriptor.value = async function (...args) {
            if (!rateLimiter.tryConsume()) {
                const error = new AppError(`Rate limit exceeded for ${operationName}`, ErrorCode.RATE_LIMITED, { requestsPerSecond, operationName });
                logger.warn('Rate limit exceeded', {
                    operationName,
                    requestsPerSecond,
                });
                throw error;
            }
            return await originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
/**
 * Bulkhead decorator for resource isolation
 */
export function Bulkhead(semaphoreSize, queueSize) {
    const semaphore = new Semaphore(semaphoreSize, queueSize || 100);
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const operationName = `${target.constructor.name}.${propertyKey}`;
        const logger = getLogger('bulkhead-decorator');
        descriptor.value = async function (...args) {
            try {
                await semaphore.acquire();
                return await originalMethod.apply(this, args);
            }
            catch (error) {
                logger.error(`Bulkhead execution failed for ${operationName}`, {
                    error: error.message,
                });
                throw error;
            }
            finally {
                semaphore.release();
            }
        };
        return descriptor;
    };
}
// Helper functions and classes
function generateCacheKey(operationName, args) {
    const argsHash = generateHash(JSON.stringify(args));
    return `${operationName}:${argsHash}`;
}
async function executeWithTimeout(fn, timeout) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new AppError(`Operation timed out after ${timeout}ms`, ErrorCode.TIMEOUT));
        }, timeout);
    });
    return await Promise.race([fn(), timeoutPromise]);
}
/**
 * Token Bucket for rate limiting
 */
class TokenBucket {
    constructor(refillRate, capacity) {
        this.refillRate = refillRate;
        this.capacity = capacity;
        this.tokens = capacity;
        this.lastRefill = Date.now();
    }
    tryConsume(tokens = 1) {
        this.refill();
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }
    refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000;
        const tokensToAdd = Math.floor(elapsed * this.refillRate);
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
            this.lastRefill = now;
        }
    }
}
/**
 * Semaphore for bulkhead pattern
 */
class Semaphore {
    constructor(maxConcurrency, maxQueueSize = 100) {
        this.maxConcurrency = maxConcurrency;
        this.maxQueueSize = maxQueueSize;
        this.waitQueue = [];
        this.available = maxConcurrency;
    }
    async acquire() {
        if (this.available > 0) {
            this.available--;
            return Promise.resolve();
        }
        if (this.waitQueue.length >= this.maxQueueSize) {
            throw new AppError('Bulkhead queue is full', ErrorCode.RESOURCE_EXHAUSTED, { maxQueueSize: this.maxQueueSize });
        }
        return new Promise((resolve, reject) => {
            this.waitQueue.push({
                resolve,
                reject,
                timestamp: Date.now(),
            });
        });
    }
    release() {
        const next = this.waitQueue.shift();
        if (next) {
            next.resolve();
        }
        else {
            this.available++;
        }
    }
    getStats() {
        return {
            available: this.available,
            queued: this.waitQueue.length,
            maxConcurrency: this.maxConcurrency,
        };
    }
}
/**
 * Combine multiple resilience decorators
 */
export function ResilientService(config) {
    return function (constructor) {
        // Apply decorators to all methods
        const prototype = constructor.prototype;
        const methods = Object.getOwnPropertyNames(prototype);
        for (const method of methods) {
            if (method !== 'constructor' && typeof prototype[method] === 'function') {
                const resilienceConfig = {};
                if (config.circuitBreaker) {
                    resilienceConfig.circuitBreaker = { enabled: true };
                }
                if (config.retry) {
                    resilienceConfig.retry = { enabled: true, strategy: config.retry };
                }
                if (config.cache) {
                    resilienceConfig.cache = { enabled: true };
                }
                if (config.metrics !== false) {
                    resilienceConfig.metrics = { enabled: true };
                }
                if (config.profiling !== false) {
                    resilienceConfig.profiling = { enabled: true };
                }
                if (config.timeout) {
                    resilienceConfig.timeout = { enabled: true, duration: config.timeout };
                }
                // Apply resilience decorator
                const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
                if (descriptor) {
                    Resilient(resilienceConfig)(prototype, method, descriptor);
                    Object.defineProperty(prototype, method, descriptor);
                }
            }
        }
        return constructor;
    };
}
//# sourceMappingURL=resilience-decorators.js.map