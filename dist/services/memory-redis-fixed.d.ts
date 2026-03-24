/**
 * Fixed In-Memory Redis Implementation with Transaction Support
 * Addresses concurrency issues, data integrity, and memory leaks
 */
import { EventEmitter } from 'events';
export declare class MemoryRedis extends EventEmitter {
    private data;
    private keyVersions;
    private transactions;
    private persistencePath?;
    private persistenceTimer?;
    private persistenceLock;
    private shutdownInProgress;
    private ttlTimers;
    private readonly maxMemoryBytes;
    private currentMemoryBytes;
    constructor(options?: {
        persistence?: string;
        maxMemoryMB?: number;
    });
    /**
     * Get type-safe value with validation
     */
    private getValue;
    /**
     * Increment key version for WATCH tracking
     */
    private incrementVersion;
    /**
     * Estimate memory usage of a value
     */
    private estimateMemoryUsage;
    /**
     * Check and enforce memory limit
     */
    private checkMemoryLimit;
    get(key: string): Promise<string | null>;
    set(key: string, value: string | number, options?: {
        EX?: number;
    }): Promise<string>;
    del(...keys: string[]): Promise<number>;
    incr(key: string): Promise<number>;
    hset(key: string, field: string, value: string): Promise<number>;
    hget(key: string, field: string): Promise<string | null>;
    hgetall(key: string): Promise<Record<string, string>>;
    hdel(key: string, ...fields: string[]): Promise<number>;
    lpush(key: string, ...values: string[]): Promise<number>;
    rpush(key: string, ...values: string[]): Promise<number>;
    lrange(key: string, start: number, stop: number): Promise<string[]>;
    sadd(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    zadd(key: string, ...args: Array<number | string>): Promise<number>;
    zrangebyscore(key: string, min: number | string, max: number | string, options?: {
        LIMIT?: {
            offset: number;
            count: number;
        };
    }): Promise<string[]>;
    watch(...keys: string[]): Promise<string>;
    multi(txId?: string): Promise<string>;
    exec(txId: string): Promise<any[] | null>;
    discard(txId: string): Promise<string>;
    addTransactionCommand(txId: string, command: () => Promise<any>): void;
    private loadFromDisk;
    private persistToDisk;
    private schedulePersistence;
    shutdown(): Promise<void>;
    keys(pattern: string): Promise<string[]>;
    exists(...keys: string[]): Promise<number>;
    ttl(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    flushall(): Promise<string>;
    info(): Promise<string>;
}
//# sourceMappingURL=memory-redis-fixed.d.ts.map