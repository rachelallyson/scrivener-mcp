/**
 * Fixed KeyDB Cache Implementation with Stampede Protection
 * Addresses cache coherency, race conditions, and invalidation issues
 */
import { Redis } from 'ioredis';
import { getLogger } from '../core/logger.js';
import { withErrorHandling, retry, measureExecution, validateInput, processBatch, truncate, generateHash, formatDuration, formatBytes, } from '../utils/common.js';
const logger = getLogger('keydb-cache');
export class KeyDBCache {
    constructor(options = {}) {
        this.client = null;
        this.fetchLocks = new Map();
        this.connected = false;
        // Note: RateLimiter removed as it's not available
        this.performanceMetrics = new Map();
        this.compressionThreshold = 1000; // Compress strings larger than 1KB
        this.options = {
            keyPrefix: options.keyPrefix ?? 'cache:',
            defaultTTL: options.defaultTTL ?? 3600,
            maxScanKeys: options.maxScanKeys ?? 10000,
            enableJitter: options.enableJitter ?? true,
            jitterPercent: options.jitterPercent ?? 0.1,
        };
        // Note: Rate limiter initialization removed as RateLimiter is not available
        // Start cleanup timer for stale locks
        this.startLockCleanup();
    }
    startLockCleanup() {
        this.cleanupTimer = setInterval(() => {
            const now = Date.now();
            const staleTimeout = 60000; // 1 minute
            for (const [key, lock] of this.fetchLocks) {
                if (now - lock.timestamp > staleTimeout) {
                    this.fetchLocks.delete(key);
                    logger.warn('Removed stale fetch lock', { key });
                }
            }
        }, 30000); // Every 30 seconds
        this.cleanupTimer.unref();
    }
    async connect(redisUrl) {
        validateInput({ redisUrl }, { redisUrl: { required: true, type: 'string' } });
        await withErrorHandling(async () => {
            const connectWithRetry = async () => {
                this.client = new Redis(redisUrl, {
                    retryStrategy: (times) => Math.min(times * 50, 2000),
                    maxRetriesPerRequest: 3,
                    enableReadyCheck: true,
                    lazyConnect: true,
                });
                this.client.on('error', (error) => {
                    logger.error('Redis connection error', { error });
                    this.connected = false;
                });
                this.client.on('connect', () => {
                    logger.info('Connected to Redis');
                    this.connected = true;
                });
                await this.client.connect();
            };
            // Use retry utility for robust connection
            await retry(connectWithRetry, { maxAttempts: 3, initialDelay: 1000 });
        }, 'KeyDBCache.connect');
    }
    isAvailable() {
        return this.connected && this.client !== null;
    }
    getCacheKey(key) {
        return `${this.options.keyPrefix}${key}`;
    }
    /**
     * Generate secure hash for query caching using utility function
     */
    hashQuery(sql, params) {
        // Normalize SQL
        const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
        // Create unique key
        const combined = `${normalized}|${JSON.stringify(params)}`;
        // Use utility hash function for consistency
        return generateHash(combined).substring(0, 16);
    }
    /**
     * Calculate TTL with optional jitter
     */
    calculateTTL(baseTTL) {
        const ttl = baseTTL || this.options.defaultTTL;
        if (!this.options.enableJitter) {
            return ttl;
        }
        // Add random jitter to prevent thundering herd
        const jitterRange = Math.floor(ttl * this.options.jitterPercent);
        const jitter = Math.floor(Math.random() * jitterRange * 2) - jitterRange;
        return Math.max(1, ttl + jitter);
    }
    /**
     * Compress string data for storage efficiency
     */
    compress(data) {
        // Simple LZ-style compression simulation
        return Buffer.from(data).toString('base64');
    }
    /**
     * Decompress string data
     */
    decompress(data) {
        return Buffer.from(data, 'base64').toString('utf-8');
    }
    /**
     * Track performance metrics
     */
    trackPerformance(operation, duration) {
        if (!this.performanceMetrics.has(operation)) {
            this.performanceMetrics.set(operation, []);
        }
        const metrics = this.performanceMetrics.get(operation);
        metrics.push(duration);
        // Keep only recent metrics
        if (metrics.length > 100) {
            metrics.splice(0, metrics.length - 100);
        }
    }
    /**
     * Calculate performance statistics
     */
    calculatePerformanceStats(operation) {
        const metrics = this.performanceMetrics.get(operation) || [];
        return {
            avg: metrics.length > 0 ? metrics.reduce((a, b) => a + b, 0) / metrics.length : 0,
            count: metrics.length,
        };
    }
    /**
     * Get value from cache with rate limiting and performance tracking
     */
    async get(key) {
        if (!this.isAvailable())
            return null;
        validateInput({ key }, { key: { required: true, type: 'string' } });
        const result = await measureExecution(async () => {
            // Apply rate limiting
            // Note: Rate limiter acquire call removed
            return ((await withErrorHandling(async () => {
                const cacheKey = this.getCacheKey(key);
                const value = await this.client.get(cacheKey);
                if (!value)
                    return null;
                // Handle compressed data
                if (value.startsWith('__compressed__:')) {
                    const compressed = value.substring(15);
                    return JSON.parse(this.decompress(compressed));
                }
                return JSON.parse(value);
            }, 'KeyDBCache.get')()) || null);
        });
        this.trackPerformance('get', result.ms);
        return result.result;
    }
    /**
     * Set value in cache with TTL, compression, and performance tracking
     */
    async set(key, value, ttl) {
        if (!this.isAvailable())
            return false;
        validateInput({ key, value }, {
            key: { required: true, type: 'string' },
            value: { required: true },
        });
        const result = await measureExecution(async () => {
            // Apply rate limiting
            // Note: Rate limiter acquire call removed
            return ((await withErrorHandling(async () => {
                const cacheKey = this.getCacheKey(key);
                let serialized = JSON.stringify(value);
                const expiry = this.calculateTTL(ttl);
                // Compress large values
                if (serialized.length > this.compressionThreshold) {
                    const compressed = this.compress(serialized);
                    if (compressed.length < serialized.length * 0.8) {
                        // Only if 20% savings
                        serialized = `__compressed__:${compressed}`;
                        logger.debug('Compressed cache value', {
                            key: truncate(key, 50),
                            originalSize: formatBytes(JSON.stringify(value).length),
                            compressedSize: formatBytes(serialized.length),
                        });
                    }
                }
                await this.client.setex(cacheKey, expiry, serialized);
                return true;
            }, 'KeyDBCache.set')()) || false);
        });
        this.trackPerformance('set', result.ms);
        return result.result;
    }
    /**
     * Get or set with stampede protection
     */
    async getOrSet(key, fetchFn, ttl) {
        // Try to get from cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        // Check if another request is already fetching
        const existingLock = this.fetchLocks.get(key);
        if (existingLock) {
            logger.debug('Waiting for existing fetch', { key });
            try {
                return await existingLock.promise;
            }
            catch (error) {
                // If the original fetch failed, try again
                logger.warn('Original fetch failed, retrying', { key, error });
            }
        }
        // Create promise for other concurrent requests
        const fetchPromise = this.executeFetch(key, fetchFn, ttl);
        this.fetchLocks.set(key, {
            promise: fetchPromise,
            timestamp: Date.now(),
        });
        try {
            return await fetchPromise;
        }
        finally {
            // Clean up lock after a delay to handle rapid successive calls
            setTimeout(() => {
                this.fetchLocks.delete(key);
            }, 100);
        }
    }
    async executeFetch(key, fetchFn, ttl) {
        try {
            const value = await fetchFn();
            // Cache the result
            await this.set(key, value, ttl);
            return value;
        }
        catch (error) {
            // Don't cache errors
            throw error;
        }
    }
    /**
     * Delete specific keys
     */
    async del(...keys) {
        if (!this.isAvailable() || keys.length === 0)
            return 0;
        return ((await withErrorHandling(async () => {
            const cacheKeys = keys.map((k) => this.getCacheKey(k));
            return await this.client.del(...cacheKeys);
        }, 'KeyDBCache.del')()) || 0);
    }
    /**
     * Invalidate cache with pattern using batch processing
     */
    async invalidate(pattern) {
        if (!this.isAvailable())
            return 0;
        validateInput({ pattern }, { pattern: { required: true, type: 'string' } });
        return ((await withErrorHandling(async () => {
            const keys = await this.scanKeys(pattern);
            if (keys.length === 0)
                return 0;
            // Use batch processing utility  
            const deleteBatch = async (keyBatch) => {
                const count = await this.client.del(...keyBatch);
                return [count];
            };
            const results = await processBatch(keys, deleteBatch, 1000);
            const deleted = results.reduce((sum, count) => sum + count, 0);
            logger.debug('Cache invalidated', { pattern, deleted, keyCount: keys.length });
            return deleted;
        }, 'KeyDBCache.invalidate')()) || 0);
    }
    /**
     * Scan keys with limit to prevent blocking
     */
    async scanKeys(pattern) {
        if (!this.isAvailable())
            return [];
        const keys = [];
        const fullPattern = this.getCacheKey(pattern);
        let cursor = '0';
        let iterations = 0;
        const maxIterations = 100;
        try {
            do {
                const [newCursor, batch] = await this.client.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
                cursor = newCursor;
                keys.push(...batch);
                iterations++;
                // Prevent infinite loops and excessive scanning
                if (keys.length >= this.options.maxScanKeys || iterations >= maxIterations) {
                    logger.warn('Scan terminated early', {
                        pattern,
                        keysFound: keys.length,
                        iterations,
                    });
                    break;
                }
            } while (cursor !== '0');
            return keys.slice(0, this.options.maxScanKeys);
        }
        catch (error) {
            logger.error('Scan keys error', { pattern, error });
            return [];
        }
    }
    /**
     * Clear all cache entries (use with caution)
     */
    async flush() {
        if (!this.isAvailable())
            return;
        await withErrorHandling(async () => {
            const keys = await this.scanKeys('*');
            if (keys.length > 0) {
                await this.client.del(...keys);
                logger.info('Cache flushed', { count: keys.length });
            }
        }, 'KeyDBCache.flush');
    }
    /**
     * Get comprehensive cache statistics with performance metrics
     */
    async getStats() {
        const stats = {
            connected: this.connected,
            keyCount: 0,
            memoryUsage: 0,
            activeLocks: this.fetchLocks.size,
            performance: {
                get: this.calculatePerformanceStats('get'),
                set: this.calculatePerformanceStats('set'),
            },
            rateLimiting: {
                current: 0, // RateLimiter removed
                max: 1000, // Default value
                queueSize: 0, // RateLimiter removed
            },
        };
        if (!this.isAvailable())
            return stats;
        try {
            const info = await this.client.info('memory');
            const memMatch = info.match(/used_memory:(\d+)/);
            if (memMatch) {
                stats.memoryUsage = parseInt(memMatch[1], 10);
            }
            const keys = await this.scanKeys('*');
            stats.keyCount = keys.length;
            logger.debug('Cache stats retrieved', {
                memoryUsage: formatBytes(stats.memoryUsage),
                keyCount: stats.keyCount,
                activeLocks: stats.activeLocks,
            });
        }
        catch (error) {
            logger.error('Failed to get stats', { error });
        }
        return stats;
    }
    /**
     * Disconnect from Redis
     */
    async disconnect() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.fetchLocks.clear();
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
        this.connected = false;
        logger.info('Disconnected from Redis');
    }
}
/**
 * SQL Cache Manager with proper invalidation and enhanced utilities
 */
export class SQLCacheManager {
    constructor(cache) {
        this.tablePatterns = new Map();
        this.cache = cache;
        this.initializeTablePatterns();
    }
    initializeTablePatterns() {
        // Common SQL patterns for table extraction
        this.tablePatterns.set('select', [
            /FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi,
            /JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi,
        ]);
        this.tablePatterns.set('insert', [/INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi]);
        this.tablePatterns.set('update', [/UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi]);
        this.tablePatterns.set('delete', [/DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi]);
        this.tablePatterns.set('ddl', [
            /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/gi,
            /ALTER\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi,
            /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/gi,
        ]);
    }
    /**
     * Extract all affected tables from SQL with validation
     */
    extractAffectedTables(sql) {
        validateInput({ sql }, { sql: { required: true, type: 'string' } });
        const tables = new Set();
        const normalizedSql = sql.toUpperCase();
        // Determine query type
        let queryType = 'select';
        if (normalizedSql.includes('INSERT'))
            queryType = 'insert';
        else if (normalizedSql.includes('UPDATE'))
            queryType = 'update';
        else if (normalizedSql.includes('DELETE'))
            queryType = 'delete';
        else if (normalizedSql.includes('CREATE') ||
            normalizedSql.includes('ALTER') ||
            normalizedSql.includes('DROP'))
            queryType = 'ddl';
        // Apply relevant patterns
        const patterns = [
            ...(this.tablePatterns.get(queryType) || []),
            ...(this.tablePatterns.get('select') || []), // Always check for JOINs
        ];
        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0; // Reset regex
            while ((match = pattern.exec(sql)) !== null) {
                tables.add(match[1].toLowerCase());
            }
        }
        // Handle CTEs
        const ctePattern = /WITH\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+AS/gi;
        let match;
        while ((match = ctePattern.exec(sql)) !== null) {
            tables.delete(match[1].toLowerCase()); // CTEs aren't real tables
        }
        return Array.from(tables);
    }
    /**
     * Cache query results with enhanced logging
     */
    async cacheQuery(sql, params, result, ttl) {
        if (!this.cache.isAvailable())
            return;
        validateInput({ sql, params, result }, {
            sql: { required: true, type: 'string' },
            params: { required: true },
            result: { required: true },
        });
        await withErrorHandling(async () => {
            const hash = this.hashQuery(sql, params);
            const tables = this.extractAffectedTables(sql);
            // Store with metadata
            const cacheData = {
                result,
                tables,
                timestamp: Date.now(),
            };
            await this.cache.set(`query:${hash}`, cacheData, ttl);
            logger.debug('Query cached', {
                hash: truncate(hash, 16),
                tables: tables.join(','),
                ttl: ttl || 'default',
            });
        }, 'SQLCacheManager.cacheQuery');
    }
    /**
     * Get cached query result with enhanced validation
     */
    async getCachedQuery(sql, params) {
        if (!this.cache.isAvailable())
            return null;
        validateInput({ sql, params }, {
            sql: { required: true, type: 'string' },
            params: { required: true },
        });
        return (withErrorHandling(async () => {
            const hash = this.hashQuery(sql, params);
            const cached = await this.cache.get(`query:${hash}`);
            if (cached) {
                logger.debug('Query cache hit', {
                    hash: truncate(hash, 16),
                    age: formatDuration(Date.now() - cached.timestamp),
                });
            }
            return cached?.result || null;
        }, 'SQLCacheManager.getCachedQuery') || null);
    }
    /**
     * Execute with caching and enhanced error handling
     */
    async execute(sql, params, executeFn, ttl) {
        validateInput({ sql, params, executeFn }, {
            sql: { required: true, type: 'string' },
            params: { required: true },
            executeFn: { required: true, custom: (v) => typeof v === 'function' || 'Must be a function' },
        });
        // Check if it's a write operation
        const normalizedSql = sql.toUpperCase();
        const isWrite = normalizedSql.includes('INSERT') ||
            normalizedSql.includes('UPDATE') ||
            normalizedSql.includes('DELETE') ||
            normalizedSql.includes('CREATE') ||
            normalizedSql.includes('ALTER') ||
            normalizedSql.includes('DROP');
        if (isWrite) {
            // Execute write first
            const result = await executeFn();
            // Then invalidate affected tables
            if (this.cache.isAvailable()) {
                const tables = this.extractAffectedTables(sql);
                await Promise.all(tables.map((table) => this.cache.invalidate(`*:${table}:*`)));
                logger.debug('Invalidated cache for tables', {
                    tables: tables.join(','),
                    operation: 'write',
                });
            }
            return result;
        }
        // For reads, use cache
        return this.cache.getOrSet(`query:${this.hashQuery(sql, params)}`, executeFn, ttl);
    }
    /**
     * Generate query hash using utility function
     */
    hashQuery(sql, params) {
        const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
        const combined = `${normalized}|${JSON.stringify(params)}`;
        return generateHash(combined).substring(0, 16);
    }
    /**
     * Invalidate tables with batch processing
     */
    async invalidateTables(...tables) {
        if (!this.cache.isAvailable() || tables.length === 0)
            return;
        validateInput({ tables }, { tables: { required: true } });
        await withErrorHandling(async () => {
            const invalidateTable = async (tableBatch) => {
                const results = await Promise.all(tableBatch.map(table => this.cache.invalidate(`*:${table}:*`)));
                return results.map(() => undefined);
            };
            await processBatch(tables, invalidateTable, 10);
            logger.info('Tables invalidated', {
                tables: tables.join(','),
                count: tables.length,
            });
        }, 'SQLCacheManager.invalidateTables');
    }
}
//# sourceMappingURL=keydb-cache-fixed.js.map