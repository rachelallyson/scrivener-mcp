/**
 * In-memory Redis-compatible store for BullMQ
 * Provides a zero-dependency alternative to Redis for local development
 */
import { EventEmitter } from 'events';
/**
 * Simple in-memory Redis-like store with persistence
 * Implements only the Redis commands used by BullMQ
 */
export declare class MemoryRedis extends EventEmitter {
    private data;
    private expiry;
    private persistPath;
    private persistInterval;
    private cleanupInterval;
    private connected;
    private persistPromise;
    constructor(options?: {
        persistPath?: string;
    });
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    quit(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: (string | number)[]): Promise<'OK'>;
    del(...keys: string[]): Promise<number>;
    exists(...keys: string[]): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
    lpush(key: string, ...values: string[]): Promise<number>;
    rpush(key: string, ...values: string[]): Promise<number>;
    lpop(key: string): Promise<string | null>;
    rpop(key: string): Promise<string | null>;
    lrange(key: string, start: number, stop: number): Promise<string[]>;
    llen(key: string): Promise<number>;
    lrem(key: string, count: number, value: string): Promise<number>;
    hset(key: string, field: string, value: string): Promise<number>;
    hget(key: string, field: string): Promise<string | null>;
    hgetall(key: string): Promise<Record<string, string>>;
    hdel(key: string, ...fields: string[]): Promise<number>;
    sadd(key: string, ...members: string[]): Promise<number>;
    srem(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    scard(key: string): Promise<number>;
    zadd(key: string, ...args: (number | string)[]): Promise<number>;
    zrange(key: string, start: number, stop: number, ...args: string[]): Promise<string[]>;
    zrem(key: string, ...members: string[]): Promise<number>;
    private checkExpiry;
    private cleanupExpired;
    private persist;
    private _doPersist;
    ping(): Promise<'PONG'>;
    flushdb(): Promise<'OK'>;
    keys(pattern: string): Promise<string[]>;
    on(event: string, listener: (...args: unknown[]) => void): this;
    once(event: string, listener: (...args: unknown[]) => void): this;
}
//# sourceMappingURL=memory-redis.d.ts.map