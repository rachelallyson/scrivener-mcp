/**
 * KeyDB caching layer for SQLite queries
 * Provides intelligent caching for frequently accessed database operations
 */
import { getLogger } from '../../core/logger.js';
import { createBullMQConnection, detectConnection } from '../../services/queue/keydb-detector.js';
import { retry, withErrorHandling, safeParse, safeStringify } from '../../utils/common.js';
const logger = getLogger('keydb-cache');
/**
 * KeyDB-based cache for SQLite query results
 */
export class KeyDBCache {
    constructor(options = {}) {
        this.client = null;
        this.isConnected = false;
        this.stats = { hits: 0, misses: 0 };
        this.logger = getLogger('keydb-cache');
        this.prefix = options.prefix || 'sqlite:';
        this.defaultTTL = options.ttl || 300; // 5 minutes default
    }
    /**
     * Initialize cache connection
     */
    async initialize() {
        return withErrorHandling(async () => {
            // Detect connection with retry
            const connectionInfo = await retry(() => detectConnection(), {
                maxAttempts: 3,
                initialDelay: 500,
            });
            if (!connectionInfo.isAvailable || !connectionInfo.url) {
                this.logger.info('KeyDB/Redis not available, caching disabled');
                return false;
            }
            this.client = createBullMQConnection(connectionInfo.url);
            // Test connection with retry
            await retry(() => this.client.ping(), { maxAttempts: 3, initialDelay: 100 });
            this.isConnected = true;
            this.logger.info(`Cache initialized with ${connectionInfo.type}`, {
                version: connectionInfo.version,
                prefix: this.prefix,
                defaultTTL: this.defaultTTL,
            });
            return true;
        }, 'Cache initialization')();
    }
    /**
     * Get cached value
     */
    async get(key) {
        if (!this.isConnected || !this.client) {
            return null;
        }
        return withErrorHandling(async () => {
            const cacheKey = this.prefix + key;
            const cached = await this.client.get(cacheKey);
            if (cached) {
                this.stats.hits++;
                this.logger.debug(`Cache hit for key: ${key}`);
                return safeParse(cached, null);
            }
            this.stats.misses++;
            this.logger.debug(`Cache miss for key: ${key}`);
            return null;
        }, 'Cache get')();
    }
    /**
     * Set cached value
     */
    async set(key, value, ttl) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        return withErrorHandling(async () => {
            const cacheKey = this.prefix + key;
            const serialized = safeStringify(value);
            const expiry = ttl || this.defaultTTL;
            // Use retry for cache set operation
            await retry(() => this.client.setex(cacheKey, expiry, serialized), {
                maxAttempts: 2,
                initialDelay: 100,
            });
            this.logger.debug(`Cached value for key: ${key} (TTL: ${expiry}s)`);
            return true;
        }, 'Cache set')();
    }
    /**
     * Delete cached value
     */
    async del(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            const cacheKey = this.prefix + key;
            const deleted = await this.client.del(cacheKey);
            if (deleted > 0) {
                this.logger.debug(`Deleted cached key: ${key}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Cache delete failed', { key, error: error.message });
            return false;
        }
    }
    /**
     * Invalidate cache by pattern
     */
    async invalidate(pattern) {
        if (!this.isConnected || !this.client) {
            return 0;
        }
        return withErrorHandling(async () => {
            const searchPattern = this.prefix + pattern;
            // Use SCAN instead of KEYS for production
            const keys = await this.scanKeys(searchPattern);
            if (keys.length > 0) {
                // Delete in batches for better performance
                const batchSize = 100;
                let totalDeleted = 0;
                for (let i = 0; i < keys.length; i += batchSize) {
                    const batch = keys.slice(i, i + batchSize);
                    const deleted = await retry(() => this.client.del(...batch), {
                        maxAttempts: 2,
                        initialDelay: 50,
                    });
                    totalDeleted += deleted;
                }
                this.logger.info(`Invalidated ${totalDeleted} cached entries`, { pattern });
                return totalDeleted;
            }
            return 0;
        }, 'Cache invalidation')();
    }
    /**
     * Scan keys using SCAN command (production-safe)
     */
    async scanKeys(pattern) {
        if (!this.client)
            return [];
        const keys = [];
        let cursor = '0';
        do {
            const [newCursor, batch] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = newCursor;
            keys.push(...batch);
        } while (cursor !== '0');
        return keys;
    }
    /**
     * Get or set cached value (cache-aside pattern)
     */
    async getOrSet(key, fetchFn, ttl) {
        // Try to get from cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        // Fetch from source
        const value = await fetchFn();
        // Cache the result
        await this.set(key, value, ttl);
        return value;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            size: total,
            hitRate: total > 0 ? this.stats.hits / total : 0,
        };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = { hits: 0, misses: 0 };
    }
    /**
     * Check if cache is available
     */
    isAvailable() {
        return this.isConnected;
    }
    /**
     * Close cache connection
     */
    async close() {
        if (this.client && this.isConnected) {
            await withErrorHandling(async () => {
                await this.client.quit();
                this.isConnected = false;
                this.logger.info('Cache connection closed');
            }, 'Cache close')();
        }
    }
}
/**
 * Cached SQLite query executor
 * Wraps common query patterns with intelligent caching
 */
export class CachedSQLiteManager {
    constructor(sqliteManager, cacheOptions) {
        this.sqliteManager = sqliteManager;
        this.cache = new KeyDBCache(cacheOptions);
    }
    /**
     * Initialize cache
     */
    async initialize() {
        await this.cache.initialize();
    }
    /**
     * Cached query execution
     */
    async query(sql, params = [], ttl) {
        if (!this.cache.isAvailable()) {
            return this.sqliteManager.query(sql, params);
        }
        // Create cache key from SQL and params
        const cacheKey = `query:${this.hashQuery(sql, params)}`;
        return this.cache.getOrSet(cacheKey, async () => this.sqliteManager.query(sql, params), ttl);
    }
    /**
     * Cached single row query
     */
    async queryOne(sql, params = [], ttl) {
        if (!this.cache.isAvailable()) {
            return this.sqliteManager.queryOne(sql, params);
        }
        const cacheKey = `queryOne:${this.hashQuery(sql, params)}`;
        return this.cache.getOrSet(cacheKey, async () => this.sqliteManager.queryOne(sql, params), ttl);
    }
    /**
     * Execute write operation and invalidate related cache
     */
    async execute(sql, params = []) {
        const result = this.sqliteManager.execute(sql, params);
        // Invalidate cache based on table being modified
        if (this.cache.isAvailable()) {
            const table = this.extractTableName(sql);
            if (table) {
                await this.cache.invalidate(`*:${table}:*`);
                await this.cache.invalidate(`query:*${table}*`);
            }
        }
        return result;
    }
    /**
     * Transaction with cache invalidation
     */
    transaction(fn, retries) {
        const result = this.sqliteManager.transaction(fn, retries);
        // Invalidate all cache after transaction
        if (this.cache.isAvailable()) {
            this.cache.invalidate('*').catch((error) => {
                logger.warn('Failed to invalidate cache after transaction', { error });
            });
        }
        return result;
    }
    /**
     * Hash query and parameters for cache key
     */
    hashQuery(sql, params) {
        const combined = sql + safeStringify(params);
        // Simple hash function for demo - in production, use a proper hash
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
    /**
     * Extract table name from SQL for cache invalidation
     */
    extractTableName(sql) {
        const match = sql.match(/(?:FROM|INTO|UPDATE|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        return match ? match[1].toLowerCase() : null;
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return this.cache.getStats();
    }
    /**
     * Close cache connection
     */
    async close() {
        await this.cache.close();
    }
}
//# sourceMappingURL=keydb-cache.js.map