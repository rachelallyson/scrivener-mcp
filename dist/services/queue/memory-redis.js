/**
 * In-memory Redis-compatible store for BullMQ
 * Provides a zero-dependency alternative to Redis for local development
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../core/logger.js';
import { readJSON, writeJSON } from '../../utils/common.js';
const logger = getLogger('memory-redis');
/**
 * Simple in-memory Redis-like store with persistence
 * Implements only the Redis commands used by BullMQ
 */
export class MemoryRedis extends EventEmitter {
    constructor(options = {}) {
        super();
        this.data = new Map();
        this.expiry = new Map();
        this.persistPath = null;
        this.persistInterval = null;
        this.cleanupInterval = null;
        this.connected = false;
        this.persistPromise = null;
        this.persistPath = options.persistPath || './data/memory-redis.json';
    }
    async connect() {
        if (this.connected)
            return;
        // Load persisted data
        if (this.persistPath) {
            const parsed = (await readJSON(this.persistPath, { data: [], expiry: [] }));
            // Restore data with proper types
            this.data = new Map();
            for (const [key, value] of parsed.data) {
                if (value && typeof value === 'object') {
                    const typedValue = value;
                    if ('_type' in typedValue) {
                        const type = typedValue._type;
                        if (type === 'set' &&
                            'items' in typedValue &&
                            Array.isArray(typedValue.items)) {
                            this.data.set(key, new Set(typedValue.items));
                        }
                        else if (type === 'list' &&
                            'items' in typedValue &&
                            Array.isArray(typedValue.items)) {
                            this.data.set(key, typedValue.items);
                        }
                        else if (type === 'hash' &&
                            'data' in typedValue &&
                            typeof typedValue.data === 'object') {
                            this.data.set(key, typedValue.data);
                        }
                        else {
                            this.data.set(key, value);
                        }
                    }
                    else if ('_isSet' in typedValue &&
                        'items' in typedValue &&
                        Array.isArray(typedValue.items)) {
                        // Legacy format compatibility
                        this.data.set(key, new Set(typedValue.items));
                    }
                    else {
                        this.data.set(key, value);
                    }
                }
                else {
                    this.data.set(key, value);
                }
            }
            this.expiry = new Map(parsed.expiry);
            if (this.data.size > 0) {
                logger.info('Loaded persisted data', { entries: this.data.size });
            }
            else {
                logger.debug('No persisted data found');
            }
        }
        // Start persistence timer and cleanup timer
        if (this.persistPath) {
            this.persistInterval = setInterval(() => this.persist(), 60000); // Every minute
        }
        // Start cleanup timer for expired keys
        this.cleanupInterval = setInterval(() => this.cleanupExpired(), 30000); // Every 30 seconds
        this.connected = true;
        this.emit('connect');
        logger.info('Memory Redis connected');
    }
    async disconnect() {
        if (!this.connected)
            return;
        // Stop timers first
        if (this.persistInterval) {
            clearInterval(this.persistInterval);
            this.persistInterval = null;
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        // Wait for any ongoing persist operation and do final persist
        if (this.persistPromise) {
            await this.persistPromise;
        }
        // Set shutting down flag AFTER final persist
        await this.persist();
        this.connected = false;
        this.emit('close');
        logger.info('Memory Redis disconnected');
    }
    async quit() {
        return this.disconnect();
    }
    // Redis String Commands
    async get(key) {
        this.checkExpiry(key);
        const value = this.data.get(key);
        return typeof value === 'string' ? value : null;
    }
    async set(key, value, ...args) {
        this.data.set(key, value);
        // Handle expiry
        if (args[0] === 'EX' && typeof args[1] === 'number') {
            this.expiry.set(key, Date.now() + args[1] * 1000);
        }
        else if (args[0] === 'PX' && typeof args[1] === 'number') {
            this.expiry.set(key, Date.now() + args[1]);
        }
        return 'OK';
    }
    async del(...keys) {
        let deleted = 0;
        for (const key of keys) {
            if (this.data.delete(key)) {
                deleted++;
                this.expiry.delete(key);
            }
        }
        return deleted;
    }
    async exists(...keys) {
        let count = 0;
        for (const key of keys) {
            this.checkExpiry(key);
            if (this.data.has(key))
                count++;
        }
        return count;
    }
    async expire(key, seconds) {
        if (!this.data.has(key))
            return 0;
        this.expiry.set(key, Date.now() + seconds * 1000);
        return 1;
    }
    async ttl(key) {
        if (!this.data.has(key))
            return -2;
        const expiry = this.expiry.get(key);
        if (!expiry)
            return -1;
        return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
    }
    // Redis List Commands (for BullMQ)
    async lpush(key, ...values) {
        let list = this.data.get(key) || [];
        if (!Array.isArray(list))
            list = [];
        list.unshift(...values.reverse());
        this.data.set(key, list);
        return list.length;
    }
    async rpush(key, ...values) {
        let list = this.data.get(key) || [];
        if (!Array.isArray(list))
            list = [];
        list.push(...values);
        this.data.set(key, list);
        return list.length;
    }
    async lpop(key) {
        const list = this.data.get(key);
        if (!Array.isArray(list) || list.length === 0)
            return null;
        const value = list.shift();
        if (list.length === 0) {
            this.data.delete(key);
        }
        return typeof value === 'string' ? value : null;
    }
    async rpop(key) {
        const list = this.data.get(key);
        if (!Array.isArray(list) || list.length === 0)
            return null;
        const value = list.pop();
        if (list.length === 0) {
            this.data.delete(key);
        }
        return typeof value === 'string' ? value : null;
    }
    async lrange(key, start, stop) {
        const list = this.data.get(key);
        if (!Array.isArray(list))
            return [];
        // Handle negative indices
        if (start < 0)
            start = list.length + start;
        if (stop < 0)
            stop = list.length + stop;
        return list
            .slice(start, stop + 1)
            .filter((item) => typeof item === 'string');
    }
    async llen(key) {
        const list = this.data.get(key);
        if (!Array.isArray(list))
            return 0;
        return list.length;
    }
    async lrem(key, count, value) {
        const list = this.data.get(key);
        if (!Array.isArray(list))
            return 0;
        let removed = 0;
        const newList = [];
        if (count > 0) {
            // Remove from head
            for (const item of list) {
                if (item === value && removed < count) {
                    removed++;
                }
                else {
                    newList.push(item);
                }
            }
        }
        else if (count < 0) {
            // Remove from tail
            for (let i = list.length - 1; i >= 0; i--) {
                if (list[i] === value && removed < Math.abs(count)) {
                    removed++;
                }
                else {
                    newList.unshift(list[i]);
                }
            }
        }
        else {
            // Remove all
            for (const item of list) {
                if (item === value) {
                    removed++;
                }
                else {
                    newList.push(item);
                }
            }
        }
        if (newList.length === 0) {
            this.data.delete(key);
        }
        else {
            this.data.set(key, newList);
        }
        return removed;
    }
    // Redis Hash Commands (for BullMQ job data)
    async hset(key, field, value) {
        let hash = this.data.get(key);
        if (!hash ||
            typeof hash !== 'object' ||
            Array.isArray(hash) ||
            hash instanceof Set ||
            hash instanceof Map) {
            hash = {};
        }
        const isNew = !(field in hash);
        hash[field] = value;
        this.data.set(key, hash);
        return isNew ? 1 : 0;
    }
    async hget(key, field) {
        const hash = this.data.get(key);
        if (!hash ||
            typeof hash !== 'object' ||
            Array.isArray(hash) ||
            hash instanceof Set ||
            hash instanceof Map) {
            return null;
        }
        return hash[field] || null;
    }
    async hgetall(key) {
        const hash = this.data.get(key);
        if (!hash ||
            typeof hash !== 'object' ||
            Array.isArray(hash) ||
            hash instanceof Set ||
            hash instanceof Map) {
            return {};
        }
        return { ...hash };
    }
    async hdel(key, ...fields) {
        const hash = this.data.get(key);
        if (!hash ||
            typeof hash !== 'object' ||
            Array.isArray(hash) ||
            hash instanceof Set ||
            hash instanceof Map) {
            return 0;
        }
        let deleted = 0;
        for (const field of fields) {
            if (field in hash) {
                delete hash[field];
                deleted++;
            }
        }
        if (Object.keys(hash).length === 0) {
            this.data.delete(key);
        }
        return deleted;
    }
    // Redis Set Commands (for BullMQ)
    async sadd(key, ...members) {
        let set = this.data.get(key);
        if (!set || !(set instanceof Set)) {
            set = new Set();
        }
        const sizeBefore = set.size;
        for (const member of members) {
            set.add(member);
        }
        this.data.set(key, set);
        return set.size - sizeBefore;
    }
    async srem(key, ...members) {
        const set = this.data.get(key);
        if (!set || !(set instanceof Set))
            return 0;
        let removed = 0;
        for (const member of members) {
            if (set.delete(member))
                removed++;
        }
        if (set.size === 0) {
            this.data.delete(key);
        }
        return removed;
    }
    async smembers(key) {
        const set = this.data.get(key);
        if (!set || !(set instanceof Set))
            return [];
        return Array.from(set).filter((item) => typeof item === 'string');
    }
    async scard(key) {
        const set = this.data.get(key);
        if (!set || !(set instanceof Set))
            return 0;
        return set.size;
    }
    // Redis Sorted Set Commands (for BullMQ delayed jobs)
    async zadd(key, ...args) {
        let zset = this.data.get(key);
        if (!zset || typeof zset !== 'object' || !('_scores' in zset) || !('_members' in zset)) {
            zset = { _scores: new Map(), _members: new Map() };
        }
        let added = 0;
        for (let i = 0; i < args.length; i += 2) {
            if (i + 1 >= args.length)
                break; // Ensure we have both score and member
            const score = parseFloat(String(args[i]));
            const member = args[i + 1];
            // Validate score and member
            if (isNaN(score) || !isFinite(score)) {
                continue; // Skip invalid scores
            }
            if (member === null || member === undefined) {
                continue; // Skip invalid members
            }
            const typedZset = zset;
            if (!typedZset._scores.has(String(member))) {
                added++;
            }
            typedZset._scores.set(String(member), score);
            typedZset._members.set(score, String(member));
        }
        this.data.set(key, zset);
        return added;
    }
    async zrange(key, start, stop, ...args) {
        const zset = this.data.get(key);
        if (!zset || typeof zset !== 'object' || !('_scores' in zset)) {
            return [];
        }
        const typedZset = zset;
        const scores = typedZset._scores;
        if (!(scores instanceof Map)) {
            return [];
        }
        const entries = Array.from(scores.entries());
        const sorted = entries.sort((a, b) => a[1] - b[1]).map(([member]) => member);
        // Handle negative indices
        if (start < 0)
            start = sorted.length + start;
        if (stop < 0)
            stop = sorted.length + stop;
        const result = sorted.slice(start, stop + 1);
        // Handle WITHSCORES
        if (args.includes('WITHSCORES')) {
            const withScores = [];
            for (const member of result) {
                withScores.push(member, String(scores.get(member)));
            }
            return withScores;
        }
        return result;
    }
    async zrem(key, ...members) {
        const zset = this.data.get(key);
        if (!zset || typeof zset !== 'object' || !('_scores' in zset)) {
            return 0;
        }
        const typedZset = zset;
        const scores = typedZset._scores;
        if (!(scores instanceof Map)) {
            return 0;
        }
        let removed = 0;
        for (const member of members) {
            if (scores.delete(member)) {
                removed++;
            }
        }
        if (scores.size === 0) {
            this.data.delete(key);
        }
        return removed;
    }
    // Utility methods
    checkExpiry(key) {
        const expiry = this.expiry.get(key);
        if (expiry && expiry < Date.now()) {
            this.data.delete(key);
            this.expiry.delete(key);
        }
    }
    // Clean up all expired keys in batch
    cleanupExpired() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, expiry] of this.expiry.entries()) {
            if (expiry < now) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.data.delete(key);
            this.expiry.delete(key);
        }
    }
    async persist() {
        if (!this.persistPath)
            return;
        // Prevent concurrent persist operations
        if (this.persistPromise) {
            return this.persistPromise;
        }
        this.persistPromise = this._doPersist();
        try {
            await this.persistPromise;
        }
        finally {
            this.persistPromise = null;
        }
    }
    async _doPersist() {
        try {
            // Create snapshot of current data to avoid race conditions
            const dataSnapshot = new Map(this.data);
            const expirySnapshot = new Map(this.expiry);
            // Convert data to serializable format
            const serializableData = [];
            for (const [key, value] of dataSnapshot.entries()) {
                if (value instanceof Set) {
                    serializableData.push([key, { _type: 'set', items: Array.from(value) }]);
                }
                else if (Array.isArray(value)) {
                    serializableData.push([key, { _type: 'list', items: value }]);
                }
                else if (value && typeof value === 'object' && !(value instanceof Map)) {
                    serializableData.push([key, { _type: 'hash', data: value }]);
                }
                else {
                    serializableData.push([key, value]);
                }
            }
            const data = {
                data: serializableData,
                expiry: Array.from(expirySnapshot.entries()),
            };
            await writeJSON(this.persistPath, data);
            logger.debug('Persisted data', { entries: dataSnapshot.size });
        }
        catch (error) {
            logger.error('Failed to persist data', { error });
        }
    }
    // BullMQ specific compatibility
    async ping() {
        return 'PONG';
    }
    async flushdb() {
        this.data.clear();
        this.expiry.clear();
        return 'OK';
    }
    async keys(pattern) {
        if (pattern === '*') {
            return Array.from(this.data.keys());
        }
        // Simple pattern matching (only supports * wildcard)
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
        return Array.from(this.data.keys()).filter((key) => regex.test(key));
    }
    // Make it compatible with IORedis
    on(event, listener) {
        super.on(event, listener);
        return this;
    }
    once(event, listener) {
        super.once(event, listener);
        return this;
    }
}
//# sourceMappingURL=memory-redis.js.map