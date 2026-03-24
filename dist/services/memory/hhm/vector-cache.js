/**
 * Vector caching and memory pooling for HHM
 * Reduces allocation overhead and improves performance
 */
import { getLogger } from '../../../core/logger.js';
const logger = getLogger('hhm-vector-cache');
export class VectorCache {
    constructor(maxSize = 1000, maxAgeMs = 60000) {
        this.cache = new Map();
        this.lruQueue = [];
        this.hits = 0;
        this.misses = 0;
        this.maxSize = maxSize;
        this.maxAge = maxAgeMs;
        // Start cleanup timer
        setInterval(() => this.cleanup(), maxAgeMs / 2);
    }
    /**
     * Get vector from cache
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        // Update access info
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        // Move to end of LRU queue
        this.updateLRU(key);
        this.hits++;
        return entry.vector;
    }
    /**
     * Store vector in cache
     */
    set(key, vector, pinned = false) {
        // Check if we need to evict
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }
        const entry = {
            vector,
            key,
            lastAccessed: Date.now(),
            accessCount: 1,
            pinned,
        };
        this.cache.set(key, entry);
        this.updateLRU(key);
    }
    /**
     * Pin a vector in cache (won't be evicted)
     */
    pin(key) {
        const entry = this.cache.get(key);
        if (entry) {
            entry.pinned = true;
            return true;
        }
        return false;
    }
    /**
     * Unpin a vector
     */
    unpin(key) {
        const entry = this.cache.get(key);
        if (entry) {
            entry.pinned = false;
            return true;
        }
        return false;
    }
    /**
     * Update LRU queue
     */
    updateLRU(key) {
        const index = this.lruQueue.indexOf(key);
        if (index > -1) {
            this.lruQueue.splice(index, 1);
        }
        this.lruQueue.push(key);
    }
    /**
     * Evict least recently used unpinned entry
     */
    evictLRU() {
        for (let i = 0; i < this.lruQueue.length; i++) {
            const key = this.lruQueue[i];
            const entry = this.cache.get(key);
            if (entry && !entry.pinned) {
                this.cache.delete(key);
                this.lruQueue.splice(i, 1);
                logger.debug('Evicted vector from cache', { key });
                return;
            }
        }
    }
    /**
     * Clean up old entries
     */
    cleanup() {
        const now = Date.now();
        const toDelete = [];
        for (const [key, entry] of this.cache) {
            if (!entry.pinned && now - entry.lastAccessed > this.maxAge) {
                toDelete.push(key);
            }
        }
        for (const key of toDelete) {
            this.cache.delete(key);
            const index = this.lruQueue.indexOf(key);
            if (index > -1) {
                this.lruQueue.splice(index, 1);
            }
        }
        if (toDelete.length > 0) {
            logger.debug('Cleaned up old cache entries', { count: toDelete.length });
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const totalAccesses = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: totalAccesses > 0 ? this.hits / totalAccesses : 0,
            pinnedCount: Array.from(this.cache.values()).filter((e) => e.pinned).length,
        };
    }
    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        this.lruQueue = [];
        this.hits = 0;
        this.misses = 0;
    }
}
/**
 * Memory pool for array allocations
 */
export class MemoryPool {
    constructor(maxPoolSize = 100) {
        this.int8Pools = new Map();
        this.float32Pools = new Map();
        this.allocations = 0;
        this.reuses = 0;
        this.maxPoolSize = maxPoolSize;
    }
    /**
     * Get or create Int8Array
     */
    getInt8Array(size) {
        let pool = this.int8Pools.get(size);
        if (!pool) {
            pool = [];
            this.int8Pools.set(size, pool);
        }
        // Find available array in pool
        for (const pooled of pool) {
            if (!pooled.inUse) {
                pooled.inUse = true;
                this.reuses++;
                // Clear the array before returning
                pooled.array.fill(0);
                return pooled.array;
            }
        }
        // Create new array if pool not full
        if (pool.length < this.maxPoolSize) {
            const array = new Int8Array(size);
            pool.push({
                array,
                inUse: true,
                size,
            });
            this.allocations++;
            return array;
        }
        // Pool is full, create temporary array
        this.allocations++;
        return new Int8Array(size);
    }
    /**
     * Get or create Float32Array
     */
    getFloat32Array(size) {
        let pool = this.float32Pools.get(size);
        if (!pool) {
            pool = [];
            this.float32Pools.set(size, pool);
        }
        // Find available array in pool
        for (const pooled of pool) {
            if (!pooled.inUse) {
                pooled.inUse = true;
                this.reuses++;
                // Clear the array before returning
                pooled.array.fill(0);
                return pooled.array;
            }
        }
        // Create new array if pool not full
        if (pool.length < this.maxPoolSize) {
            const array = new Float32Array(size);
            pool.push({
                array,
                inUse: true,
                size,
            });
            this.allocations++;
            return array;
        }
        // Pool is full, create temporary array
        this.allocations++;
        return new Float32Array(size);
    }
    /**
     * Return array to pool
     */
    release(array) {
        const size = array.length;
        const pools = array instanceof Int8Array ? this.int8Pools : this.float32Pools;
        const pool = pools.get(size);
        if (pool) {
            for (const pooled of pool) {
                if (pooled.array === array) {
                    pooled.inUse = false;
                    return;
                }
            }
        }
    }
    /**
     * Get pool statistics
     */
    getStats() {
        let totalPooled = 0;
        let totalInUse = 0;
        for (const pool of this.int8Pools.values()) {
            totalPooled += pool.length;
            totalInUse += pool.filter((p) => p.inUse).length;
        }
        for (const pool of this.float32Pools.values()) {
            totalPooled += pool.length;
            totalInUse += pool.filter((p) => p.inUse).length;
        }
        return {
            totalPooled,
            totalInUse,
            allocations: this.allocations,
            reuses: this.reuses,
            reuseRate: this.allocations > 0 ? this.reuses / (this.allocations + this.reuses) : 0,
            int8PoolSizes: Array.from(this.int8Pools.keys()),
            float32PoolSizes: Array.from(this.float32Pools.keys()),
        };
    }
    /**
     * Clear all pools
     */
    clear() {
        this.int8Pools.clear();
        this.float32Pools.clear();
        this.allocations = 0;
        this.reuses = 0;
    }
}
/**
 * Combined cache and pool manager
 */
export class CacheManager {
    constructor() {
        this.semanticCache = new Map();
        this.vectorCache = new VectorCache(1000, 60000);
        this.memoryPool = new MemoryPool(100);
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }
    /**
     * Get or compute vector with caching
     */
    async getOrCompute(key, compute) {
        // Check cache first
        const cached = this.vectorCache.get(key);
        if (cached) {
            return cached;
        }
        // Compute and cache
        const vector = await compute();
        this.vectorCache.set(key, vector);
        return vector;
    }
    /**
     * Cache semantic vector
     */
    cacheSemanticVector(name, vector) {
        this.semanticCache.set(name, vector);
        this.vectorCache.set(`semantic:${name}`, vector, true); // Pin semantic vectors
    }
    /**
     * Get semantic vector
     */
    getSemanticVector(name) {
        return this.semanticCache.get(name) || null;
    }
    /**
     * Get memory pool
     */
    getMemoryPool() {
        return this.memoryPool;
    }
    /**
     * Get vector cache
     */
    getVectorCache() {
        return this.vectorCache;
    }
    /**
     * Get combined statistics
     */
    getStats() {
        return {
            vectorCache: this.vectorCache.getStats(),
            memoryPool: this.memoryPool.getStats(),
            semanticCacheSize: this.semanticCache.size,
        };
    }
    /**
     * Clear all caches
     */
    clear() {
        this.vectorCache.clear();
        this.memoryPool.clear();
        this.semanticCache.clear();
        logger.info('All caches cleared');
    }
}
CacheManager.instance = null;
//# sourceMappingURL=vector-cache.js.map