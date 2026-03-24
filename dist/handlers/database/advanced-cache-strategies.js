/**
 * Advanced Cache Strategies and Patterns
 * Implements sophisticated caching patterns for optimal performance
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../core/logger.js';
const logger = getLogger('cache-strategies');
/**
 * Cache-Aside Strategy (Lazy Loading)
 */
export class CacheAsideStrategy {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.name = 'cache-aside';
        this.description = 'Lazy loading with cache-aside pattern';
    }
    async execute(key, fetchFn, options = {}) {
        // Try to get from cache first
        const cached = await this.cacheManager.get(key);
        if (cached !== null) {
            return cached;
        }
        // Cache miss - fetch from source
        const value = await fetchFn();
        // Store in cache for future requests
        await this.cacheManager.set(key, value, {
            ttl: options.ttl,
            tags: options.tags,
        });
        return value;
    }
}
/**
 * Write-Through Strategy
 */
export class WriteThroughStrategy {
    constructor(cacheManager, writeFn) {
        this.cacheManager = cacheManager;
        this.writeFn = writeFn;
        this.name = 'write-through';
        this.description = 'Write to cache and data source simultaneously';
    }
    async execute(key, fetchFn, options = {}) {
        const cached = await this.cacheManager.get(key);
        if (cached !== null) {
            return cached;
        }
        const value = await fetchFn();
        // Write to both cache and data source
        await Promise.all([
            this.cacheManager.set(key, value, options),
            this.writeFn(key, value),
        ]);
        return value;
    }
}
/**
 * Refresh-Ahead Strategy
 */
export class RefreshAheadStrategy {
    constructor(cacheManager, config = {}) {
        this.cacheManager = cacheManager;
        this.name = 'refresh-ahead';
        this.description = 'Proactively refresh cache before expiration';
        this.refreshInProgress = new Set();
        this.config = {
            refreshThreshold: 0.8, // Refresh when 80% of TTL has passed
            refreshProbability: 0.1, // 10% chance of triggering refresh
            maxRefreshConcurrency: 5,
            ...config,
        };
    }
    async execute(key, fetchFn, options = {}) {
        const cached = await this.cacheManager.get(key);
        if (cached !== null) {
            // Check if we should refresh proactively
            if (this.shouldRefresh(key, options.refreshThreshold)) {
                this.scheduleRefresh(key, fetchFn, options);
            }
            return cached;
        }
        // Cache miss - fetch immediately
        const value = await fetchFn();
        await this.cacheManager.set(key, value, options);
        return value;
    }
    shouldRefresh(key, customThreshold) {
        const threshold = customThreshold || this.config.refreshThreshold;
        // Simple probability-based decision
        // In production, you'd check actual TTL remaining
        return (Math.random() < this.config.refreshProbability &&
            this.refreshInProgress.size < this.config.maxRefreshConcurrency &&
            !this.refreshInProgress.has(key));
    }
    scheduleRefresh(key, fetchFn, options) {
        if (this.refreshInProgress.has(key))
            return;
        this.refreshInProgress.add(key);
        // Background refresh
        setImmediate(async () => {
            try {
                const value = await fetchFn();
                await this.cacheManager.set(key, value, options);
                logger.debug('Proactive cache refresh completed', { key });
            }
            catch (error) {
                logger.warn('Proactive cache refresh failed', { key, error });
            }
            finally {
                this.refreshInProgress.delete(key);
            }
        });
    }
}
/**
 * Read-Through Strategy with Circuit Breaker
 */
export class ReadThroughStrategy {
    constructor(cacheManager, config = {
        failureThreshold: 5,
        recoveryTimeout: 60000,
        monitoringPeriod: 300000,
    }) {
        this.cacheManager = cacheManager;
        this.config = config;
        this.name = 'read-through';
        this.description = 'Read-through with circuit breaker protection';
        this.circuitBreaker = {
            state: 'closed',
            failures: 0,
            lastFailureTime: null,
            nextAttemptTime: null,
        };
    }
    async execute(key, fetchFn, options = {}) {
        const cached = await this.cacheManager.get(key);
        if (cached !== null) {
            return cached;
        }
        // Check circuit breaker state
        if (this.circuitBreaker.state === 'open') {
            if (this.shouldAttemptRecovery()) {
                this.circuitBreaker.state = 'half-open';
            }
            else {
                if (options.fallbackValue !== undefined) {
                    return options.fallbackValue;
                }
                throw new Error('Circuit breaker is open and no fallback value provided');
            }
        }
        try {
            const value = await fetchFn();
            await this.cacheManager.set(key, value, options);
            // Reset circuit breaker on success
            if (this.circuitBreaker.state === 'half-open') {
                this.circuitBreaker.state = 'closed';
                this.circuitBreaker.failures = 0;
            }
            return value;
        }
        catch (error) {
            this.recordFailure();
            if (options.fallbackValue !== undefined) {
                logger.warn('Using fallback value due to fetch error', { key, error });
                return options.fallbackValue;
            }
            throw error;
        }
    }
    shouldAttemptRecovery() {
        const now = new Date();
        return this.circuitBreaker.nextAttemptTime !== null &&
            now >= this.circuitBreaker.nextAttemptTime;
    }
    recordFailure() {
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailureTime = new Date();
        if (this.circuitBreaker.failures >= this.config.failureThreshold) {
            this.circuitBreaker.state = 'open';
            this.circuitBreaker.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout);
            logger.warn('Circuit breaker opened', {
                failures: this.circuitBreaker.failures,
                nextAttemptTime: this.circuitBreaker.nextAttemptTime,
            });
        }
    }
}
/**
 * Multi-Level Cache Strategy
 */
export class MultiLevelStrategy {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.name = 'multi-level';
        this.description = 'Multi-level caching with L1 (memory) and L2 (Redis)';
        this.l1Cache = new Map();
        this.l1MaxSize = 1000;
        this.l1TTL = 60000; // 1 minute
    }
    async execute(key, fetchFn, options = {}) {
        // Check L1 cache first (fastest)
        const l1Entry = this.l1Cache.get(key);
        if (l1Entry && l1Entry.expires > Date.now()) {
            return l1Entry.value;
        }
        // Check L2 cache (Redis)
        const l2Value = await this.cacheManager.get(key);
        if (l2Value !== null) {
            // Store in L1 for faster future access
            this.setL1(key, l2Value);
            return l2Value;
        }
        // Cache miss - fetch from source
        const value = await fetchFn();
        // Store in both levels
        await Promise.all([
            this.setL1(key, value),
            this.cacheManager.set(key, value, options),
        ]);
        return value;
    }
    setL1(key, value) {
        // Implement LRU eviction if cache is full
        if (this.l1Cache.size >= this.l1MaxSize) {
            const oldestKey = this.l1Cache.keys().next().value;
            if (oldestKey !== undefined) {
                this.l1Cache.delete(oldestKey);
            }
        }
        this.l1Cache.set(key, {
            value,
            expires: Date.now() + this.l1TTL,
        });
    }
    clearL1() {
        this.l1Cache.clear();
    }
}
/**
 * Write-Behind (Write-Back) Strategy
 */
export class WriteBehindStrategy {
    constructor(cacheManager, persistFn) {
        this.cacheManager = cacheManager;
        this.persistFn = persistFn;
        this.name = 'write-behind';
        this.description = 'Asynchronous write-back to data source';
        this.writeQueue = new Map();
        this.flushInterval = 30000; // 30 seconds
        this.startFlushTimer();
    }
    async execute(key, fetchFn, options = {}) {
        const cached = await this.cacheManager.get(key);
        if (cached !== null) {
            return cached;
        }
        const value = await fetchFn();
        // Write to cache immediately
        await this.cacheManager.set(key, value, options);
        // Queue for background persistence
        this.writeQueue.set(key, { value, timestamp: Date.now() });
        return value;
    }
    startFlushTimer() {
        this.flushTimer = setInterval(async () => {
            await this.flushWrites();
        }, this.flushInterval);
    }
    async flushWrites() {
        if (this.writeQueue.size === 0)
            return;
        const entries = Array.from(this.writeQueue.entries()).map(([key, data]) => ({
            key,
            value: data.value,
        }));
        this.writeQueue.clear();
        try {
            await this.persistFn(entries);
            logger.debug('Flushed writes to data source', { count: entries.length });
        }
        catch (error) {
            logger.error('Failed to flush writes', { count: entries.length, error });
            // Re-queue failed writes
            for (const entry of entries) {
                this.writeQueue.set(entry.key, {
                    value: entry.value,
                    timestamp: Date.now()
                });
            }
        }
    }
    async close() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        // Final flush
        await this.flushWrites();
    }
}
/**
 * Intelligent Cache Manager with Strategy Selection
 */
export class IntelligentCacheManager extends EventEmitter {
    constructor(cacheManager) {
        super();
        this.cacheManager = cacheManager;
        this.strategies = new Map();
        this.metrics = new Map();
        this.defaultStrategy = 'cache-aside';
        this.initializeStrategies();
    }
    initializeStrategies() {
        // Register available strategies
        this.addStrategy(new CacheAsideStrategy(this.cacheManager));
        this.addStrategy(new RefreshAheadStrategy(this.cacheManager));
        this.addStrategy(new ReadThroughStrategy(this.cacheManager));
        this.addStrategy(new MultiLevelStrategy(this.cacheManager));
    }
    addStrategy(strategy) {
        this.strategies.set(strategy.name, strategy);
        this.metrics.set(strategy.name, {
            strategy: strategy.name,
            hits: 0,
            misses: 0,
            refreshes: 0,
            lockWaits: 0,
            averageLatency: 0,
            errorRate: 0,
        });
    }
    async get(key, fetchFn, options = {}) {
        const strategyName = options.strategy || this.defaultStrategy;
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
            throw new Error(`Unknown cache strategy: ${strategyName}`);
        }
        const startTime = Date.now();
        try {
            const result = await strategy.execute(key, fetchFn, options);
            // Update metrics
            const latency = Date.now() - startTime;
            this.updateMetrics(strategyName, true, latency);
            return result;
        }
        catch (error) {
            const latency = Date.now() - startTime;
            this.updateMetrics(strategyName, false, latency);
            throw error;
        }
    }
    /**
     * Automatically select the best strategy based on access patterns
     */
    async intelligentGet(key, fetchFn, options = {}) {
        const pattern = await this.analyzeAccessPattern(key);
        const strategy = this.selectStrategyForPattern(pattern);
        return this.get(key, fetchFn, { ...options, strategy });
    }
    getMetrics(strategy) {
        if (strategy) {
            return this.metrics.get(strategy) || this.createEmptyMetrics(strategy);
        }
        return new Map(this.metrics);
    }
    generatePerformanceReport() {
        let report = '# Cache Performance Report\n\n';
        for (const [strategyName, metrics] of this.metrics) {
            const hitRate = (metrics.hits + metrics.misses) > 0
                ? (metrics.hits / (metrics.hits + metrics.misses) * 100).toFixed(2)
                : '0.00';
            report += `## ${strategyName} Strategy\n`;
            report += `- **Hit Rate**: ${hitRate}%\n`;
            report += `- **Average Latency**: ${metrics.averageLatency.toFixed(2)}ms\n`;
            report += `- **Error Rate**: ${(metrics.errorRate * 100).toFixed(2)}%\n`;
            report += `- **Total Requests**: ${metrics.hits + metrics.misses}\n\n`;
        }
        return report;
    }
    // Private helper methods
    updateMetrics(strategyName, success, latency) {
        const metrics = this.metrics.get(strategyName);
        if (!metrics)
            return;
        if (success) {
            metrics.hits++;
        }
        else {
            metrics.misses++;
        }
        // Update average latency (exponential moving average)
        metrics.averageLatency = metrics.averageLatency * 0.9 + latency * 0.1;
        // Update error rate (last 1000 requests)
        const totalRequests = metrics.hits + metrics.misses;
        if (totalRequests > 0) {
            metrics.errorRate = metrics.misses / totalRequests;
        }
    }
    async analyzeAccessPattern(key) {
        // Simplified pattern analysis - in production, you'd track actual metrics
        return {
            frequency: 'medium',
            predictability: 'random',
            dataSize: 'small',
            volatility: 'stable',
        };
    }
    selectStrategyForPattern(pattern) {
        // Intelligent strategy selection based on access patterns
        if (pattern.frequency === 'high' && pattern.predictability === 'predictable') {
            return 'refresh-ahead';
        }
        if (pattern.dataSize === 'small' && pattern.frequency === 'high') {
            return 'multi-level';
        }
        if (pattern.volatility === 'volatile') {
            return 'read-through';
        }
        return 'cache-aside'; // Default fallback
    }
    createEmptyMetrics(strategy) {
        return {
            strategy,
            hits: 0,
            misses: 0,
            refreshes: 0,
            lockWaits: 0,
            averageLatency: 0,
            errorRate: 0,
        };
    }
}
//# sourceMappingURL=advanced-cache-strategies.js.map