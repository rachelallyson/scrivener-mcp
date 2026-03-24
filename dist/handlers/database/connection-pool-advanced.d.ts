/**
 * Advanced Connection Pool for SQLite with monitoring and optimization
 */
import Database from 'better-sqlite3';
import { EventEmitter } from 'events';
export interface PoolConfig {
    min: number;
    max: number;
    acquireTimeoutMs: number;
    idleTimeoutMs: number;
    reapIntervalMs: number;
    createRetryIntervalMs: number;
    createTimeoutMs: number;
    validateOnBorrow: boolean;
    validateOnReturn: boolean;
    maxUses: number;
}
export interface PoolStats {
    size: number;
    available: number;
    borrowed: number;
    pending: number;
    min: number;
    max: number;
    created: number;
    destroyed: number;
    createErrors: number;
    acquireCount: number;
    acquireSuccessCount: number;
    acquireFailureCount: number;
    releaseCount: number;
    destroyedCount: number;
    acquireTime: {
        min: number;
        max: number;
        mean: number;
        p50: number;
        p95: number;
        p99: number;
    };
}
interface PooledConnection {
    id: string;
    database: Database.Database;
    createdAt: Date;
    lastUsedAt: Date;
    useCount: number;
    isValid: boolean;
}
/**
 * Advanced SQLite connection pool with comprehensive monitoring
 */
export declare class SQLiteConnectionPool extends EventEmitter {
    private config;
    private dbPath;
    private connections;
    private availableConnections;
    private borrowedConnections;
    private pendingRequests;
    private reaper?;
    private stats;
    private isDestroyed;
    constructor(dbPath: string, config?: Partial<PoolConfig>);
    /**
     * Initialize the connection pool
     */
    initialize(): Promise<void>;
    /**
     * Acquire a connection from the pool
     */
    acquire(): Promise<PooledConnection>;
    /**
     * Release a connection back to the pool
     */
    release(connection: PooledConnection): Promise<void>;
    /**
     * Execute query with automatic connection management
     */
    query<T = unknown[]>(sql: string, params?: unknown[]): Promise<T>;
    /**
     * Execute single row query
     */
    queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T>;
    /**
     * Execute write operation
     */
    execute(sql: string, params?: unknown[]): Promise<Database.RunResult>;
    /**
     * Execute transaction
     */
    transaction<T>(fn: (db: Database.Database) => T): Promise<T>;
    /**
     * Get pool statistics
     */
    getStats(): PoolStats;
    /**
     * Health check for the pool
     */
    healthCheck(): Promise<{
        healthy: boolean;
        details: Record<string, unknown>;
    }>;
    /**
     * Destroy the connection pool
     */
    destroy(): Promise<void>;
    private createConnection;
    private destroyConnection;
    private getAvailableConnection;
    private borrowConnection;
    private validateConnection;
    private waitForConnection;
    private processPendingRequests;
    private ensureMinConnections;
    private setupReaper;
    private reapIdleConnections;
    private recordAcquireTime;
    private calculateAcquireTimeStats;
}
export {};
//# sourceMappingURL=connection-pool-advanced.d.ts.map