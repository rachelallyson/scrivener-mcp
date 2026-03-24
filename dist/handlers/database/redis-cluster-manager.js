/**
 * Advanced Redis/KeyDB Cluster Manager with Intelligent Caching and Memory Optimization
 */
import IORedis from 'ioredis';
import { EventEmitter } from 'events';
import { getLogger } from '../../core/logger.js';
import { AppError, ErrorCode, measureExecution } from '../../utils/common.js';
const logger = getLogger('redis-cluster');
/**
 * Intelligent cache layer patterns
 */
export var CachePattern;
(function (CachePattern) {
    CachePattern["CACHE_ASIDE"] = "cache-aside";
    CachePattern["WRITE_THROUGH"] = "write-through";
    CachePattern["WRITE_BEHIND"] = "write-behind";
    CachePattern["READ_THROUGH"] = "read-through";
})(CachePattern || (CachePattern = {}));
/**
 * Advanced Redis/KeyDB cluster manager with intelligent caching
 */
export class RedisClusterManager extends EventEmitter {
    constructor(config) {
        super();
        this.cluster = null;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            hitRate: 0,
            memoryUsage: 0,
            keyCount: 0,
            avgObjectSize: 0,
            compressionRatio: 0,
            evictions: 0,
        };
        this.isInitialized = false;
        this.config = config;
    }
    /**
     * Initialize the Redis cluster connection
     */
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            const clusterOptions = {
                enableReadyCheck: this.config.options.enableReadyCheck,
                redisOptions: this.config.options.redisOptions,
                retryDelayOnFailover: this.config.options.retryDelayOnFailover,
                enableOfflineQueue: this.config.options.enableOfflineQueue,
                slotsRefreshTimeout: this.config.options.slotsRefreshTimeout,
                slotsRefreshInterval: this.config.options.slotsRefreshInterval,
                scaleReads: this.config.options.scaleReads,
            };
            this.cluster = new IORedis.Cluster(this.config.nodes, clusterOptions);
            // Set up event listeners
            this.setupEventListeners();
            // Wait for cluster to be ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Cluster initialization timeout'));
                }, 30000);
                this.cluster.once('ready', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                this.cluster.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
            // Configure memory management
            await this.configureMemoryManagement();
            // Start monitoring
            this.startMonitoring();
            this.isInitialized = true;
            logger.info('Redis cluster initialized successfully', {
                nodes: this.config.nodes.length,
                scaleReads: this.config.options.scaleReads,
            });
        }
        catch (error) {
            logger.error('Failed to initialize Redis cluster', { error });
            throw new AppError(`Redis cluster initialization failed: ${error.message}`, ErrorCode.DATABASE_ERROR);
        }
    }
    /**
     * Get cached value with intelligent deserialization
     */
    async get(key) {
        if (!this.cluster)
            throw new AppError('Cluster not initialized', ErrorCode.INVALID_STATE);
        try {
            const result = await measureExecution(async () => {
                return await this.cluster.get(key);
            });
            if (result.result === null) {
                this.stats.misses++;
                return null;
            }
            this.stats.hits++;
            const entry = this.deserialize(result.result);
            // Update access metadata
            entry.metadata.accessCount++;
            entry.metadata.lastAccessed = new Date();
            // Background update of metadata
            this.updateMetadata(key, entry.metadata);
            logger.debug('Cache hit', {
                key,
                size: entry.metadata.size,
                accessCount: entry.metadata.accessCount,
                executionTime: result.ms,
            });
            return entry.value;
        }
        catch (error) {
            logger.error('Cache get failed', { key, error });
            return null;
        }
    }
    /**
     * Set cached value with intelligent serialization and compression
     */
    async set(key, value, options = {}) {
        if (!this.cluster)
            throw new AppError('Cluster not initialized', ErrorCode.INVALID_STATE);
        try {
            const ttl = options.ttl || this.config.caching.defaultTTL;
            const tags = options.tags || [];
            const shouldCompress = options.compression !== false && this.shouldCompress(value);
            const entry = {
                value,
                ttl,
                tags,
                metadata: {
                    createdAt: new Date(),
                    accessCount: 0,
                    lastAccessed: new Date(),
                    size: this.calculateSize(value),
                    compressed: shouldCompress,
                },
            };
            const serialized = this.serialize(entry, shouldCompress);
            const result = await measureExecution(async () => {
                if (ttl > 0) {
                    return await this.cluster.setex(key, ttl, serialized);
                }
                else {
                    return await this.cluster.set(key, serialized);
                }
            });
            this.stats.sets++;
            // Update tag indexes for cache invalidation
            if (tags.length > 0) {
                await this.updateTagIndexes(key, tags);
            }
            logger.debug('Cache set', {
                key,
                size: entry.metadata.size,
                compressed: shouldCompress,
                ttl,
                executionTime: result.ms,
            });
            return result.result === 'OK';
        }
        catch (error) {
            logger.error('Cache set failed', { key, error });
            return false;
        }
    }
    /**
     * Delete cached value
     */
    async delete(key) {
        if (!this.cluster)
            throw new AppError('Cluster not initialized', ErrorCode.INVALID_STATE);
        try {
            const result = await this.cluster.del(key);
            this.stats.deletes++;
            // Clean up tag indexes
            await this.cleanupTagIndexes(key);
            return result > 0;
        }
        catch (error) {
            logger.error('Cache delete failed', { key, error });
            return false;
        }
    }
    /**
     * Invalidate cache by tags
     */
    async invalidateByTags(tags) {
        if (!this.cluster)
            throw new AppError('Cluster not initialized', ErrorCode.INVALID_STATE);
        try {
            let totalDeleted = 0;
            for (const tag of tags) {
                const tagKey = `tag:${tag}`;
                const keys = await this.cluster.smembers(tagKey);
                if (keys.length > 0) {
                    const deleted = await this.cluster.del(...keys);
                    totalDeleted += deleted;
                    // Clean up the tag index
                    await this.cluster.del(tagKey);
                }
            }
            logger.info(`Invalidated ${totalDeleted} entries by tags`, { tags });
            return totalDeleted;
        }
        catch (error) {
            logger.error('Tag-based invalidation failed', { tags, error });
            return 0;
        }
    }
    /**
     * Get or set with cache-aside pattern
     */
    async getOrSet(key, fetchFn, options = {}) {
        // Try to get from cache first
        let cached = await this.get(key);
        if (cached !== null) {
            // Check if we need background refresh
            if (options.refreshThreshold) {
                this.backgroundRefresh(key, fetchFn, options);
            }
            return cached;
        }
        // Fetch from source and cache
        const value = await fetchFn();
        await this.set(key, value, options);
        return value;
    }
    /**
     * Multi-level caching with local and distributed layers
     */
    async getMultiLevel(key, localCache) {
        // Check local cache first (L1)
        if (localCache?.has(key)) {
            const entry = localCache.get(key);
            if (entry.expires > Date.now()) {
                return entry.value;
            }
            localCache.delete(key);
        }
        // Check distributed cache (L2)
        const value = await this.get(key);
        // Update local cache if found
        if (value !== null && localCache) {
            localCache.set(key, {
                value,
                expires: Date.now() + 60000, // 1 minute local cache
            });
        }
        return value;
    }
    /**
     * Bulk operations for improved performance
     */
    async mget(keys) {
        if (!this.cluster)
            throw new AppError('Cluster not initialized', ErrorCode.INVALID_STATE);
        try {
            const results = await this.cluster.mget(...keys);
            return results.map((result, index) => {
                if (result === null) {
                    this.stats.misses++;
                    return null;
                }
                this.stats.hits++;
                try {
                    const entry = this.deserialize(result);
                    return entry.value;
                }
                catch (error) {
                    logger.warn(`Failed to deserialize key: ${keys[index]}`, { error });
                    return null;
                }
            });
        }
        catch (error) {
            logger.error('Bulk get failed', { keyCount: keys.length, error });
            return keys.map(() => null);
        }
    }
    /**
     * Pipeline operations for better performance
     */
    async pipeline(operations) {
        if (!this.cluster)
            throw new AppError('Cluster not initialized', ErrorCode.INVALID_STATE);
        try {
            const pipeline = this.cluster.pipeline();
            for (const operation of operations) {
                switch (operation.op) {
                    case 'get':
                        pipeline.get(operation.key);
                        break;
                    case 'set':
                        if (operation.ttl) {
                            pipeline.setex(operation.key, operation.ttl, this.serialize(operation.value));
                        }
                        else {
                            pipeline.set(operation.key, this.serialize(operation.value));
                        }
                        break;
                    case 'del':
                        pipeline.del(operation.key);
                        break;
                }
            }
            const results = await pipeline.exec();
            return results?.map(result => result[1]) || [];
        }
        catch (error) {
            logger.error('Pipeline operations failed', { operationCount: operations.length, error });
            throw error;
        }
    }
    /**
     * Get cluster health information
     */
    async getHealth() {
        if (!this.cluster) {
            return {
                healthy: false,
                totalNodes: 0,
                healthyNodes: 0,
                masterNodes: 0,
                slaveNodes: 0,
                clusterState: 'disconnected',
                memoryUsage: { used: 0, available: 0, percentage: 0 },
                performance: { avgLatency: 0, throughput: 0, errorRate: 0 },
            };
        }
        try {
            const clusterInfo = await this.cluster.call('cluster', 'info');
            const clusterNodes = await this.cluster.call('cluster', 'nodes');
            const nodeLines = clusterNodes.split('\n').filter((line) => line.trim());
            const totalNodes = nodeLines.length;
            const healthyNodes = nodeLines.filter((line) => line.includes('connected')).length;
            const masterNodes = nodeLines.filter((line) => line.includes('master')).length;
            // Get memory usage from one of the master nodes
            const memoryInfo = await this.getMemoryInfo();
            return {
                healthy: healthyNodes === totalNodes,
                totalNodes,
                healthyNodes,
                masterNodes,
                slaveNodes: totalNodes - masterNodes,
                clusterState: clusterInfo.includes('cluster_state:ok') ? 'ok' : 'degraded',
                memoryUsage: memoryInfo,
                performance: this.calculatePerformanceMetrics(),
            };
        }
        catch (error) {
            logger.error('Failed to get cluster health', { error });
            return {
                healthy: false,
                totalNodes: 0,
                healthyNodes: 0,
                masterNodes: 0,
                slaveNodes: 0,
                clusterState: 'error',
                memoryUsage: { used: 0, available: 0, percentage: 0 },
                performance: { avgLatency: 0, throughput: 0, errorRate: 0 },
            };
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            ...this.stats,
            hitRate: total > 0 ? this.stats.hits / total : 0,
        };
    }
    /**
     * Optimize memory usage
     */
    async optimizeMemory() {
        if (!this.cluster)
            throw new AppError('Cluster not initialized', ErrorCode.INVALID_STATE);
        const result = {
            keysAnalyzed: 0,
            keysEvicted: 0,
            memoryFreed: 0,
            recommendations: [],
        };
        try {
            // Analyze memory usage patterns
            const memoryInfo = await this.getMemoryInfo();
            if (memoryInfo.percentage > 80) {
                // High memory usage - trigger optimization
                result.recommendations.push('Memory usage is high (>80%), consider increasing cluster capacity');
                // Find and evict least recently used keys
                const keysToEvict = await this.findEvictionCandidates();
                for (const key of keysToEvict) {
                    const size = await this.cluster.call('memory', 'usage', key);
                    await this.cluster.del(key);
                    result.keysEvicted++;
                    result.memoryFreed += size || 0;
                }
                result.keysAnalyzed = keysToEvict.length;
            }
            if (memoryInfo.percentage > 90) {
                result.recommendations.push('Critical memory usage (>90%), immediate action required');
            }
            return result;
        }
        catch (error) {
            logger.error('Memory optimization failed', { error });
            return result;
        }
    }
    /**
     * Close cluster connection
     */
    async close() {
        if (this.healthTimer) {
            clearInterval(this.healthTimer);
        }
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
        }
        if (this.cluster) {
            await this.cluster.disconnect();
            this.cluster = null;
        }
        this.isInitialized = false;
        this.emit('closed');
        logger.info('Redis cluster connection closed');
    }
    // Private helper methods
    setupEventListeners() {
        if (!this.cluster)
            return;
        this.cluster.on('ready', () => {
            logger.info('Cluster ready');
            this.emit('ready');
        });
        this.cluster.on('error', (error) => {
            logger.error('Cluster error', { error });
            this.emit('error', error);
        });
        this.cluster.on('connect', () => {
            logger.debug('Cluster connected');
            this.emit('connect');
        });
        this.cluster.on('reconnecting', () => {
            logger.warn('Cluster reconnecting');
            this.emit('reconnecting');
        });
        this.cluster.on('end', () => {
            logger.info('Cluster connection ended');
            this.emit('end');
        });
    }
    async configureMemoryManagement() {
        if (!this.cluster)
            return;
        try {
            // Set memory policy across all master nodes
            const nodes = this.cluster.nodes('master');
            const promises = nodes.map(node => node.config('SET', 'maxmemory-policy', this.config.caching.maxMemoryPolicy));
            await Promise.all(promises);
            logger.info('Memory management configured', {
                policy: this.config.caching.maxMemoryPolicy,
                nodes: nodes.length,
            });
        }
        catch (error) {
            logger.warn('Failed to configure memory management', { error });
        }
    }
    shouldCompress(value) {
        const size = this.calculateSize(value);
        return size > this.config.caching.compressionThreshold;
    }
    calculateSize(value) {
        return JSON.stringify(value).length;
    }
    serialize(value, compress = false) {
        let serialized = JSON.stringify(value);
        if (compress) {
            // In a real implementation, you'd use a compression library like zlib
            serialized = this.simpleCompress(serialized);
        }
        return serialized;
    }
    deserialize(data) {
        try {
            // Check if data is compressed (simple heuristic)
            if (data.startsWith('COMPRESSED:')) {
                data = this.simpleDecompress(data);
            }
            return JSON.parse(data);
        }
        catch (error) {
            logger.error('Deserialization failed', { error });
            throw error;
        }
    }
    simpleCompress(data) {
        // Simple compression simulation - in production use proper compression
        return `COMPRESSED:${data}`;
    }
    simpleDecompress(data) {
        return data.replace('COMPRESSED:', '');
    }
    async updateTagIndexes(key, tags) {
        if (!this.cluster)
            return;
        const pipeline = this.cluster.pipeline();
        for (const tag of tags) {
            pipeline.sadd(`tag:${tag}`, key);
        }
        await pipeline.exec();
    }
    async cleanupTagIndexes(key) {
        if (!this.cluster)
            return;
        // This would require tracking which tags a key belongs to
        // In a production system, you'd maintain a reverse index
    }
    async updateMetadata(key, metadata) {
        // Background task to update access metadata
        setImmediate(async () => {
            try {
                const metaKey = `meta:${key}`;
                await this.cluster?.hset(metaKey, {
                    accessCount: metadata.accessCount,
                    lastAccessed: metadata.lastAccessed.toISOString(),
                });
            }
            catch (error) {
                logger.debug('Failed to update metadata', { key, error });
            }
        });
    }
    backgroundRefresh(key, fetchFn, options) {
        // Implement background refresh logic
        setImmediate(async () => {
            try {
                const newValue = await fetchFn();
                await this.set(key, newValue, options);
            }
            catch (error) {
                logger.debug('Background refresh failed', { key, error });
            }
        });
    }
    async getMemoryInfo() {
        if (!this.cluster)
            return { used: 0, available: 0, percentage: 0 };
        try {
            const masterNodes = this.cluster.nodes('master');
            const memoryInfos = await Promise.all(masterNodes.map(node => node.info('memory')));
            let totalUsed = 0;
            let totalAvailable = 0;
            for (const info of memoryInfos) {
                const lines = info.split('\r\n');
                const usedMemory = lines.find(line => line.startsWith('used_memory:'));
                const maxMemory = lines.find(line => line.startsWith('maxmemory:'));
                if (usedMemory) {
                    totalUsed += parseInt(usedMemory.split(':')[1]);
                }
                if (maxMemory) {
                    totalAvailable += parseInt(maxMemory.split(':')[1]);
                }
            }
            return {
                used: totalUsed,
                available: totalAvailable,
                percentage: totalAvailable > 0 ? (totalUsed / totalAvailable) * 100 : 0,
            };
        }
        catch (error) {
            logger.error('Failed to get memory info', { error });
            return { used: 0, available: 0, percentage: 0 };
        }
    }
    calculatePerformanceMetrics() {
        // Calculate based on collected statistics
        return {
            avgLatency: 0, // Would need to track request latencies
            throughput: 0, // Requests per second
            errorRate: 0, // Error percentage
        };
    }
    async findEvictionCandidates() {
        if (!this.cluster)
            return [];
        try {
            // Find keys that haven't been accessed recently
            // This is a simplified implementation
            const keys = await this.cluster.keys('*');
            const candidates = [];
            for (const key of keys.slice(0, 100)) { // Limit to avoid performance issues
                try {
                    const ttl = await this.cluster.ttl(key);
                    if (ttl > 0 && ttl < 3600) { // Keys expiring within an hour
                        candidates.push(key);
                    }
                }
                catch (error) {
                    // Skip problematic keys
                }
            }
            return candidates;
        }
        catch (error) {
            logger.error('Failed to find eviction candidates', { error });
            return [];
        }
    }
    startMonitoring() {
        // Health check timer
        this.healthTimer = setInterval(async () => {
            try {
                const health = await this.getHealth();
                this.emit('healthCheck', health);
                if (!health.healthy) {
                    logger.warn('Cluster health degraded', health);
                }
            }
            catch (error) {
                logger.error('Health check failed', { error });
            }
        }, this.config.monitoring.healthCheckInterval);
        // Performance metrics timer
        this.metricsTimer = setInterval(() => {
            const stats = this.getStats();
            this.emit('metrics', stats);
            logger.debug('Cache metrics', stats);
        }, this.config.monitoring.performanceMetricsInterval);
    }
}
//# sourceMappingURL=redis-cluster-manager.js.map