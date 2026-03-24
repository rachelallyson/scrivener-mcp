/**
 * Advanced caching system with size limits and LRU eviction
 * Utilizes common utilities for better error handling and logging
 */
import { formatBytes, generateHash } from '../utils/common.js';
import { getLogger } from './logger.js';
export class LRUCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.accessOrder = [];
        this.currentSize = 0;
        this.logger = getLogger('cache');
        this.ttl = options.ttl || 300000; // 5 minutes default
        this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
        this.maxEntries = options.maxEntries || 1000;
        this.onEvict = options.onEvict;
        this.logger.debug('Cache initialized', {
            ttl: this.ttl,
            maxSize: formatBytes(this.maxSize),
            maxEntries: this.maxEntries,
        });
    }
    /**
     * Get value from cache
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return undefined;
        }
        // Check TTL
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return undefined;
        }
        // Update access order (LRU)
        this.updateAccessOrder(key);
        return entry.data;
    }
    /**
     * Set value in cache
     */
    set(key, value, ttl) {
        const size = this.estimateSize(value);
        // Check if single item exceeds max size
        if (size > this.maxSize) {
            return; // Don't cache items that are too large
        }
        // Evict items if necessary
        while ((this.cache.size >= this.maxEntries || this.currentSize + size > this.maxSize) &&
            this.accessOrder.length > 0) {
            const lru = this.accessOrder[0];
            this.delete(lru);
        }
        // Remove existing entry if present
        if (this.cache.has(key)) {
            this.delete(key);
        }
        // Add new entry
        const entry = {
            data: value,
            timestamp: Date.now(),
            ttl: ttl || this.ttl,
            size,
        };
        this.cache.set(key, entry);
        this.accessOrder.push(key);
        this.currentSize += size;
    }
    /**
     * Check if key exists
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        // Check TTL
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Delete from cache
     */
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        this.cache.delete(key);
        this.accessOrder = this.accessOrder.filter((k) => k !== key);
        this.currentSize -= entry.size || 0;
        if (this.onEvict) {
            this.onEvict(key, entry.data);
        }
        return true;
    }
    /**
     * Clear all cache
     */
    clear() {
        if (this.onEvict) {
            for (const [key, entry] of this.cache.entries()) {
                this.onEvict(key, entry.data);
            }
        }
        this.cache.clear();
        this.accessOrder = [];
        this.currentSize = 0;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const stats = {
            entries: this.cache.size,
            size: this.currentSize,
            maxSize: this.maxSize,
            maxEntries: this.maxEntries,
            utilization: this.currentSize / this.maxSize,
            formattedSize: formatBytes(this.currentSize),
            formattedMaxSize: formatBytes(this.maxSize),
        };
        this.logger.debug('Cache stats requested', stats);
        return stats;
    }
    /**
     * Get number of entries in cache
     */
    getSize() {
        return this.cache.size;
    }
    /**
     * Get current memory usage in bytes
     */
    getMemoryUsage() {
        return this.currentSize;
    }
    /**
     * Update LRU access order
     */
    updateAccessOrder(key) {
        this.accessOrder = this.accessOrder.filter((k) => k !== key);
        this.accessOrder.push(key);
    }
    /**
     * Estimate size of value
     */
    estimateSize(value) {
        if (value === null || value === undefined)
            return 0;
        // String size
        if (typeof value === 'string') {
            return value.length * 2; // 2 bytes per char (UTF-16)
        }
        // Number/boolean size
        if (typeof value === 'number')
            return 8;
        if (typeof value === 'boolean')
            return 4;
        // Object/array size (rough estimate)
        if (typeof value === 'object') {
            try {
                const json = JSON.stringify(value);
                return json.length * 2;
            }
            catch {
                return 1024; // Default 1KB for non-serializable objects
            }
        }
        return 0;
    }
    /**
     * Clean expired entries
     */
    cleanExpired() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.delete(key);
                cleaned++;
            }
        }
        return cleaned;
    }
}
/**
 * Global cache instances
 */
export const caches = {
    documents: new LRUCache({
        ttl: 600000, // 10 minutes
        maxSize: 50 * 1024 * 1024, // 50MB
        maxEntries: 500,
    }),
    analysis: new LRUCache({
        ttl: 300000, // 5 minutes
        maxSize: 20 * 1024 * 1024, // 20MB
        maxEntries: 100,
    }),
    queries: new LRUCache({
        ttl: 60000, // 1 minute
        maxSize: 10 * 1024 * 1024, // 10MB
        maxEntries: 200,
    }),
};
/**
 * Cache key builders - utilizes generateHash for consistent key generation
 */
export const CacheKeys = {
    document: (projectId, documentId) => `doc:${generateHash(`${projectId}:${documentId}`)}`,
    analysis: (documentId, type) => `analysis:${generateHash(`${documentId}:${type}`)}`,
    query: (query, params) => `query:${generateHash(`${query}:${params}`)}`,
    structure: (projectId, folderId) => folderId
        ? `structure:${generateHash(`${projectId}:${folderId}`)}`
        : `structure:${generateHash(projectId)}`,
};
/**
 * Cache decorator for async functions
 */
export function cached(keyBuilder, cache = caches.queries, ttl) {
    return function (
    // Note: Using 'any' for decorator target - required for TypeScript decorator compatibility
    _target, // Decorator target must be any per TypeScript spec 
    _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const key = keyBuilder(...args);
            // Check cache
            const cached = cache.get(key);
            if (cached !== undefined) {
                return cached;
            }
            // Execute and cache
            const result = await originalMethod.apply(this, args);
            cache.set(key, result, ttl);
            return result;
        };
        return descriptor;
    };
}
/**
 * Periodic cache cleanup
 */
export function startCacheCleanup(intervalMs = 60000) {
    return setInterval(() => {
        for (const cache of Object.values(caches)) {
            cache.cleanExpired();
        }
    }, intervalMs);
}
//# sourceMappingURL=cache.js.map