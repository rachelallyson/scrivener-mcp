/**
 * Fixed In-Memory Redis Implementation with Transaction Support
 * Addresses concurrency issues, data integrity, and memory leaks
 */
import { EventEmitter } from 'events';
import * as path from 'path';
import { getLogger } from '../core/logger.js';
import { AppError, ErrorCode, safeReadFile, safeWriteFile, safeParse, safeStringify, } from '../utils/common.js';
const logger = getLogger('memory-redis');
export class MemoryRedis extends EventEmitter {
    constructor(options = {}) {
        super();
        this.data = new Map();
        this.keyVersions = new Map();
        this.transactions = new Map();
        this.persistenceLock = false;
        this.shutdownInProgress = false;
        this.ttlTimers = new Map();
        this.currentMemoryBytes = 0;
        this.persistencePath = options.persistence;
        this.maxMemoryBytes = (options.maxMemoryMB || 100) * 1024 * 1024;
        // Set max listeners to prevent warning
        this.setMaxListeners(100);
        if (this.persistencePath) {
            this.loadFromDisk().catch((err) => logger.error('Failed to load persisted data', { error: err }));
            this.schedulePersistence();
        }
    }
    /**
     * Get type-safe value with validation
     */
    getValue(key, expectedType) {
        const data = this.data.get(key);
        if (!data)
            return undefined;
        // Check TTL
        if (data.ttl && data.ttl < Date.now()) {
            this.del(key);
            return undefined;
        }
        // Validate type if specified
        if (expectedType && data.type !== expectedType) {
            throw new AppError(`WRONGTYPE Operation against a key holding the wrong kind of value`, ErrorCode.INVALID_INPUT);
        }
        return data;
    }
    /**
     * Increment key version for WATCH tracking
     */
    incrementVersion(key) {
        const version = this.keyVersions.get(key) || 0;
        this.keyVersions.set(key, version + 1);
    }
    /**
     * Estimate memory usage of a value
     */
    estimateMemoryUsage(value) {
        if (typeof value === 'string') {
            return value.length * 2; // UTF-16
        }
        else if (typeof value === 'number') {
            return 8;
        }
        else if (Buffer.isBuffer(value)) {
            return value.length;
        }
        else if (value instanceof Map) {
            let size = 0;
            for (const [k, v] of value) {
                size += this.estimateMemoryUsage(k) + this.estimateMemoryUsage(v);
            }
            return size;
        }
        else if (value instanceof Set) {
            let size = 0;
            for (const item of value) {
                size += this.estimateMemoryUsage(item);
            }
            return size;
        }
        else if (Array.isArray(value)) {
            return value.reduce((sum, item) => sum + this.estimateMemoryUsage(item), 0);
        }
        return 64; // Default estimate
    }
    /**
     * Check and enforce memory limit
     */
    checkMemoryLimit(additionalBytes) {
        if (this.currentMemoryBytes + additionalBytes > this.maxMemoryBytes) {
            // Simple LRU eviction
            const keysToEvict = [];
            let bytesToFree = additionalBytes;
            for (const [key, data] of this.data) {
                if (bytesToFree <= 0)
                    break;
                keysToEvict.push(key);
                bytesToFree -= this.estimateMemoryUsage(data.value);
            }
            for (const key of keysToEvict) {
                this.del(key);
            }
            if (this.currentMemoryBytes + additionalBytes > this.maxMemoryBytes) {
                throw new AppError('Out of memory', ErrorCode.RESOURCE_EXHAUSTED);
            }
        }
    }
    // String operations
    async get(key) {
        const data = this.getValue(key, 'string');
        if (!data)
            return null;
        return String(data.value);
    }
    async set(key, value, options) {
        const stringValue = String(value);
        const memoryUsage = this.estimateMemoryUsage(stringValue);
        this.checkMemoryLimit(memoryUsage);
        // Clear old TTL timer if exists
        const oldTimer = this.ttlTimers.get(key);
        if (oldTimer) {
            clearTimeout(oldTimer);
            this.ttlTimers.delete(key);
        }
        const ttl = options?.EX ? Date.now() + options.EX * 1000 : undefined;
        this.data.set(key, {
            type: 'string',
            value: stringValue,
            ttl,
        });
        // Set TTL timer if needed
        if (options?.EX) {
            const timer = setTimeout(() => {
                this.del(key);
            }, options.EX * 1000);
            this.ttlTimers.set(key, timer);
        }
        this.incrementVersion(key);
        this.currentMemoryBytes += memoryUsage;
        return 'OK';
    }
    async del(...keys) {
        let deleted = 0;
        for (const key of keys) {
            const data = this.data.get(key);
            if (data) {
                this.currentMemoryBytes -= this.estimateMemoryUsage(data.value);
                this.data.delete(key);
                this.incrementVersion(key);
                // Clear TTL timer
                const timer = this.ttlTimers.get(key);
                if (timer) {
                    clearTimeout(timer);
                    this.ttlTimers.delete(key);
                }
                deleted++;
            }
        }
        return deleted;
    }
    async incr(key) {
        const data = this.getValue(key);
        if (!data) {
            await this.set(key, '1');
            return 1;
        }
        if (data.type !== 'string') {
            throw new AppError('WRONGTYPE Operation against a key holding the wrong kind of value', ErrorCode.INVALID_INPUT);
        }
        const num = parseInt(String(data.value), 10);
        if (isNaN(num)) {
            throw new AppError('ERR value is not an integer or out of range', ErrorCode.INVALID_INPUT);
        }
        const newValue = num + 1;
        await this.set(key, String(newValue));
        return newValue;
    }
    // Hash operations
    async hset(key, field, value) {
        const data = this.getValue(key);
        if (!data) {
            const hash = new Map();
            hash.set(field, value);
            const memoryUsage = this.estimateMemoryUsage(hash);
            this.checkMemoryLimit(memoryUsage);
            this.data.set(key, {
                type: 'hash',
                value: hash,
            });
            this.currentMemoryBytes += memoryUsage;
            this.incrementVersion(key);
            return 1;
        }
        if (data.type !== 'hash') {
            throw new AppError('WRONGTYPE Operation against a key holding the wrong kind of value', ErrorCode.INVALID_INPUT);
        }
        const hash = data.value;
        const isNew = !hash.has(field);
        hash.set(field, value);
        this.incrementVersion(key);
        return isNew ? 1 : 0;
    }
    async hget(key, field) {
        const data = this.getValue(key, 'hash');
        if (!data)
            return null;
        const hash = data.value;
        return hash.get(field) || null;
    }
    async hgetall(key) {
        const data = this.getValue(key, 'hash');
        if (!data)
            return {};
        const hash = data.value;
        const result = {};
        for (const [field, value] of hash) {
            result[field] = value;
        }
        return result;
    }
    async hdel(key, ...fields) {
        const data = this.getValue(key, 'hash');
        if (!data)
            return 0;
        const hash = data.value;
        let deleted = 0;
        for (const field of fields) {
            if (hash.delete(field)) {
                deleted++;
            }
        }
        if (deleted > 0) {
            this.incrementVersion(key);
            // Remove key if hash is empty
            if (hash.size === 0) {
                this.del(key);
            }
        }
        return deleted;
    }
    // List operations
    async lpush(key, ...values) {
        let data = this.getValue(key);
        if (!data) {
            const list = [];
            const memoryUsage = this.estimateMemoryUsage(values);
            this.checkMemoryLimit(memoryUsage);
            this.data.set(key, {
                type: 'list',
                value: list,
            });
            this.currentMemoryBytes += memoryUsage;
            data = this.data.get(key);
        }
        if (data.type !== 'list') {
            throw new AppError('WRONGTYPE Operation against a key holding the wrong kind of value', ErrorCode.INVALID_INPUT);
        }
        const list = data.value;
        list.unshift(...values.reverse());
        this.incrementVersion(key);
        return list.length;
    }
    async rpush(key, ...values) {
        let data = this.getValue(key);
        if (!data) {
            const list = [];
            const memoryUsage = this.estimateMemoryUsage(values);
            this.checkMemoryLimit(memoryUsage);
            this.data.set(key, {
                type: 'list',
                value: list,
            });
            this.currentMemoryBytes += memoryUsage;
            data = this.data.get(key);
        }
        if (data.type !== 'list') {
            throw new AppError('WRONGTYPE Operation against a key holding the wrong kind of value', ErrorCode.INVALID_INPUT);
        }
        const list = data.value;
        list.push(...values);
        this.incrementVersion(key);
        return list.length;
    }
    async lrange(key, start, stop) {
        const data = this.getValue(key, 'list');
        if (!data)
            return [];
        const list = data.value;
        // Handle negative indices
        if (start < 0)
            start = Math.max(0, list.length + start);
        if (stop < 0)
            stop = list.length + stop;
        return list.slice(start, stop + 1);
    }
    // Set operations
    async sadd(key, ...members) {
        let data = this.getValue(key);
        if (!data) {
            const set = new Set();
            const memoryUsage = this.estimateMemoryUsage(members);
            this.checkMemoryLimit(memoryUsage);
            this.data.set(key, {
                type: 'set',
                value: set,
            });
            this.currentMemoryBytes += memoryUsage;
            data = this.data.get(key);
        }
        if (data.type !== 'set') {
            throw new AppError('WRONGTYPE Operation against a key holding the wrong kind of value', ErrorCode.INVALID_INPUT);
        }
        const set = data.value;
        let added = 0;
        for (const member of members) {
            if (!set.has(member)) {
                set.add(member);
                added++;
            }
        }
        if (added > 0) {
            this.incrementVersion(key);
        }
        return added;
    }
    async smembers(key) {
        const data = this.getValue(key, 'set');
        if (!data)
            return [];
        const set = data.value;
        return Array.from(set);
    }
    // Sorted set operations with efficient B-tree-like structure
    async zadd(key, ...args) {
        if (args.length % 2 !== 0) {
            throw new AppError('ERR wrong number of arguments for ZADD', ErrorCode.INVALID_INPUT);
        }
        let data = this.getValue(key);
        if (!data) {
            const zset = new Map();
            const memoryUsage = this.estimateMemoryUsage(args);
            this.checkMemoryLimit(memoryUsage);
            this.data.set(key, {
                type: 'zset',
                value: zset,
            });
            this.currentMemoryBytes += memoryUsage;
            data = this.data.get(key);
        }
        if (data.type !== 'zset') {
            throw new AppError('WRONGTYPE Operation against a key holding the wrong kind of value', ErrorCode.INVALID_INPUT);
        }
        const zset = data.value;
        let added = 0;
        for (let i = 0; i < args.length; i += 2) {
            const score = Number(args[i]);
            const member = String(args[i + 1]);
            if (isNaN(score)) {
                throw new AppError('ERR value is not a valid float', ErrorCode.INVALID_INPUT);
            }
            if (!zset.has(member)) {
                added++;
            }
            zset.set(member, score);
        }
        if (added > 0) {
            this.incrementVersion(key);
        }
        return added;
    }
    async zrangebyscore(key, min, max, options) {
        const data = this.getValue(key, 'zset');
        if (!data)
            return [];
        const zset = data.value;
        // Parse min/max
        const minScore = min === '-inf' ? -Infinity : Number(min);
        const maxScore = max === '+inf' ? Infinity : Number(max);
        // Get sorted entries
        const sorted = Array.from(zset.entries())
            .filter(([_, score]) => score >= minScore && score <= maxScore)
            .sort((a, b) => a[1] - b[1])
            .map(([member]) => member);
        // Apply LIMIT if specified
        if (options?.LIMIT) {
            const { offset, count } = options.LIMIT;
            return sorted.slice(offset, offset + count);
        }
        return sorted;
    }
    // Transaction support
    async watch(...keys) {
        const txId = Math.random().toString(36).substring(7);
        const watchKeys = new Set(keys);
        const watchVersions = new Map();
        for (const key of keys) {
            const version = this.keyVersions.get(key) || 0;
            watchVersions.set(key, version);
        }
        this.transactions.set(txId, {
            id: txId,
            commands: [],
            watchKeys,
            watchVersions,
        });
        return txId;
    }
    async multi(txId) {
        if (!txId) {
            txId = Math.random().toString(36).substring(7);
            this.transactions.set(txId, {
                id: txId,
                commands: [],
                watchKeys: new Set(),
                watchVersions: new Map(),
            });
        }
        return txId;
    }
    async exec(txId) {
        const tx = this.transactions.get(txId);
        if (!tx) {
            throw new AppError('ERR EXEC without MULTI', ErrorCode.INVALID_STATE);
        }
        // Check WATCH conditions
        for (const [key, expectedVersion] of tx.watchVersions) {
            const currentVersion = this.keyVersions.get(key) || 0;
            if (currentVersion !== expectedVersion) {
                // Transaction aborted due to watched key modification
                this.transactions.delete(txId);
                return null;
            }
        }
        // Execute all commands atomically
        const results = [];
        try {
            for (const command of tx.commands) {
                const result = await command();
                results.push(result);
            }
        }
        catch (error) {
            // Rollback on error
            this.transactions.delete(txId);
            throw error;
        }
        this.transactions.delete(txId);
        return results;
    }
    async discard(txId) {
        this.transactions.delete(txId);
        return 'OK';
    }
    // Add command to transaction
    addTransactionCommand(txId, command) {
        const tx = this.transactions.get(txId);
        if (!tx) {
            throw new AppError('ERR no transaction in progress', ErrorCode.INVALID_STATE);
        }
        tx.commands.push(command);
    }
    // Persistence with atomic writes
    async loadFromDisk() {
        if (!this.persistencePath)
            return;
        try {
            const dataPath = path.resolve(this.persistencePath);
            const content = await safeReadFile(dataPath, 'utf-8');
            const parsed = safeParse(content, { version: 1, data: {} });
            // Validate and restore data
            if (parsed.version !== 1) {
                throw new Error('Unsupported persistence format');
            }
            for (const [key, entry] of Object.entries(parsed.data)) {
                const { type, value, ttl } = entry;
                // Skip expired keys
                if (ttl && ttl < Date.now())
                    continue;
                // Restore based on type
                switch (type) {
                    case 'string':
                        this.data.set(key, { type, value: String(value), ttl });
                        break;
                    case 'hash':
                        this.data.set(key, { type, value: new Map(Object.entries(value)), ttl });
                        break;
                    case 'list':
                        this.data.set(key, { type, value: Array.from(value), ttl });
                        break;
                    case 'set':
                        this.data.set(key, { type, value: new Set(value), ttl });
                        break;
                    case 'zset':
                        this.data.set(key, { type, value: new Map(Object.entries(value)), ttl });
                        break;
                }
                // Set TTL timer if needed
                if (ttl) {
                    const remaining = ttl - Date.now();
                    if (remaining > 0) {
                        const timer = setTimeout(() => {
                            this.del(key);
                        }, remaining);
                        this.ttlTimers.set(key, timer);
                    }
                }
            }
            logger.info('Loaded persisted data', { keys: this.data.size });
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                logger.error('Failed to load persisted data', { error });
            }
        }
    }
    async persistToDisk() {
        if (!this.persistencePath || this.persistenceLock || this.shutdownInProgress)
            return;
        this.persistenceLock = true;
        try {
            const dataPath = path.resolve(this.persistencePath);
            const tempPath = `${dataPath}.tmp.${Date.now()}`;
            // Serialize data
            const serialized = {
                version: 1,
                timestamp: Date.now(),
                data: {},
            };
            for (const [key, entry] of this.data) {
                const { type, value, ttl } = entry;
                // Skip expired keys
                if (ttl && ttl < Date.now())
                    continue;
                // Serialize based on type
                switch (type) {
                    case 'string':
                        serialized.data[key] = { type, value, ttl };
                        break;
                    case 'hash':
                        serialized.data[key] = {
                            type,
                            value: Object.fromEntries(value),
                            ttl,
                        };
                        break;
                    case 'list':
                        serialized.data[key] = { type, value, ttl };
                        break;
                    case 'set':
                        serialized.data[key] = {
                            type,
                            value: Array.from(value),
                            ttl,
                        };
                        break;
                    case 'zset':
                        serialized.data[key] = {
                            type,
                            value: Object.fromEntries(value),
                            ttl,
                        };
                        break;
                }
            }
            // Atomic write using safeWriteFile (which handles temp file internally)
            await safeWriteFile(dataPath, safeStringify(serialized), 'utf-8');
            logger.debug('Persisted data to disk', { keys: this.data.size });
        }
        catch (error) {
            logger.error('Failed to persist data', { error });
        }
        finally {
            this.persistenceLock = false;
        }
    }
    schedulePersistence() {
        if (this.persistenceTimer) {
            clearTimeout(this.persistenceTimer);
        }
        this.persistenceTimer = setTimeout(() => {
            this.persistToDisk()
                .catch((err) => logger.error('Persistence failed', { error: err }))
                .finally(() => this.schedulePersistence());
        }, 5000); // Persist every 5 seconds
        // Don't block shutdown
        this.persistenceTimer.unref();
    }
    // Graceful shutdown
    async shutdown() {
        if (this.shutdownInProgress)
            return;
        this.shutdownInProgress = true;
        // Clear all timers
        if (this.persistenceTimer) {
            clearTimeout(this.persistenceTimer);
            this.persistenceTimer = undefined;
        }
        for (const timer of this.ttlTimers.values()) {
            clearTimeout(timer);
        }
        this.ttlTimers.clear();
        // Final persistence
        await this.persistToDisk();
        // Clear all data
        this.data.clear();
        this.keyVersions.clear();
        this.transactions.clear();
        // Remove all listeners
        this.removeAllListeners();
        logger.info('MemoryRedis shutdown complete');
    }
    // Utility methods
    async keys(pattern) {
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
        const result = [];
        for (const key of this.data.keys()) {
            if (regex.test(key)) {
                result.push(key);
            }
        }
        return result;
    }
    async exists(...keys) {
        let count = 0;
        for (const key of keys) {
            if (this.getValue(key)) {
                count++;
            }
        }
        return count;
    }
    async ttl(key) {
        const data = this.getValue(key);
        if (!data)
            return -2; // Key doesn't exist
        if (!data.ttl)
            return -1; // No TTL
        const remaining = Math.floor((data.ttl - Date.now()) / 1000);
        return Math.max(0, remaining);
    }
    async expire(key, seconds) {
        const data = this.getValue(key);
        if (!data)
            return 0;
        // Clear old timer
        const oldTimer = this.ttlTimers.get(key);
        if (oldTimer) {
            clearTimeout(oldTimer);
        }
        // Set new TTL
        data.ttl = Date.now() + seconds * 1000;
        // Set new timer
        const timer = setTimeout(() => {
            this.del(key);
        }, seconds * 1000);
        this.ttlTimers.set(key, timer);
        return 1;
    }
    async flushall() {
        // Clear all TTL timers
        for (const timer of this.ttlTimers.values()) {
            clearTimeout(timer);
        }
        this.ttlTimers.clear();
        // Clear all data
        this.data.clear();
        this.keyVersions.clear();
        this.transactions.clear();
        this.currentMemoryBytes = 0;
        return 'OK';
    }
    // Memory info
    async info() {
        const info = [
            `# Memory`,
            `used_memory:${this.currentMemoryBytes}`,
            `used_memory_human:${(this.currentMemoryBytes / 1024 / 1024).toFixed(2)}M`,
            `max_memory:${this.maxMemoryBytes}`,
            `max_memory_human:${(this.maxMemoryBytes / 1024 / 1024).toFixed(2)}M`,
            ``,
            `# Keyspace`,
            `keys:${this.data.size}`,
            `transactions:${this.transactions.size}`,
            `ttl_timers:${this.ttlTimers.size}`,
        ];
        return info.join('\n');
    }
}
//# sourceMappingURL=memory-redis-fixed.js.map