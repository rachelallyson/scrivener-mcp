/**
 * Enhanced Connection Pool with Health Monitoring
 * Advanced connection pooling with health checks, automatic failover, and performance monitoring
 */
import Database from 'better-sqlite3';
import { HealthStatus } from './health-checks.js';
export interface ConnectionPoolConfig {
    /** Minimum number of connections to maintain */
    minConnections: number;
    /** Maximum number of connections */
    maxConnections: number;
    /** Connection acquisition timeout (ms) */
    acquireTimeout: number;
    /** Connection idle timeout (ms) */
    idleTimeout: number;
    /** Connection validation timeout (ms) */
    validationTimeout: number;
    /** Validation query to test connection health */
    validationQuery?: string;
    /** Connection retry configuration */
    retryConfig: {
        maxAttempts: number;
        initialDelay: number;
        maxDelay: number;
        factor: number;
    };
    /** Health check interval (ms) */
    healthCheckInterval: number;
    /** Enable connection pre-warming */
    enablePreWarming: boolean;
    /** Pre-warming delay between connections (ms) */
    preWarmingDelay: number;
    /** Pool name for metrics */
    poolName: string;
}
export interface ConnectionMetrics {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    pendingAcquisitions: number;
    totalAcquisitions: number;
    successfulAcquisitions: number;
    failedAcquisitions: number;
    totalValidations: number;
    validationFailures: number;
    averageAcquisitionTime: number;
    averageValidationTime: number;
    connectionErrors: number;
    poolUtilization: number;
    healthStatus: HealthStatus;
}
export interface PooledConnection<T> {
    connection: T;
    id: string;
    createdAt: number;
    lastUsed: number;
    timesUsed: number;
    isValid: boolean;
    validatedAt?: number;
}
export interface ConnectionFactory<T> {
    create(): Promise<T>;
    destroy(connection: T): Promise<void>;
    validate(connection: T): Promise<boolean>;
}
/**
 * Enhanced Connection Pool with health monitoring and automatic failover
 */
export declare class EnhancedConnectionPool<T> {
    private readonly factory;
    private readonly config;
    private connections;
    private activeConnections;
    private acquisitionQueue;
    private healthCheck?;
    private healthCheckTimer?;
    private validationTimer?;
    private isShuttingDown;
    private readonly logger;
    private readonly circuitBreaker;
    private readonly retryStrategy;
    private metrics;
    constructor(factory: ConnectionFactory<T>, config: ConnectionPoolConfig);
    /**
     * Acquire a connection from the pool
     */
    acquire(): Promise<PooledConnection<T>>;
    /**
     * Release a connection back to the pool
     */
    release(pooledConnection: PooledConnection<T>): void;
    /**
     * Execute a function with an acquired connection
     */
    execute<R>(fn: (connection: T) => Promise<R>): Promise<R>;
    /**
     * Shutdown the pool and clean up resources
     */
    shutdown(): Promise<void>;
    /**
     * Get current pool metrics
     */
    getMetrics(): ConnectionMetrics;
    /**
     * Validate all connections in the pool
     */
    validateConnections(): Promise<void>;
    private initializePool;
    private doAcquire;
    private waitForConnection;
    private processAcquisitionQueue;
    private createConnection;
    private destroyConnection;
    private validateConnection;
    private ensureMinimumConnections;
    private preWarmConnections;
    private startBackgroundTasks;
    private cleanupIdleConnections;
    private setupHealthChecks;
    private setupMetrics;
    private getTotalConnectionCount;
    private generateConnectionId;
    private updateAcquisitionTime;
    private updateValidationTime;
    private calculateAverageTime;
}
/**
 * SQLite Connection Factory
 */
export declare class SQLiteConnectionFactory implements ConnectionFactory<Database.Database> {
    private dbPath;
    private options?;
    constructor(dbPath: string, options?: {
        enableWAL?: boolean;
        cacheSize?: number;
        tempStore?: "MEMORY" | "FILE";
        mmapSize?: number;
    } | undefined);
    create(): Promise<Database.Database>;
    destroy(connection: Database.Database): Promise<void>;
    validate(connection: Database.Database): Promise<boolean>;
}
/**
 * Pool Manager for managing multiple connection pools
 */
export declare class ConnectionPoolManager {
    private pools;
    private readonly logger;
    /**
     * Create or get connection pool
     */
    getPool<T>(name: string, factory: ConnectionFactory<T>, config: Partial<ConnectionPoolConfig>): EnhancedConnectionPool<T>;
    /**
     * Get all pool metrics
     */
    getAllMetrics(): Record<string, ConnectionMetrics>;
    /**
     * Shutdown all pools
     */
    shutdownAll(): Promise<void>;
}
export declare const globalPoolManager: ConnectionPoolManager;
//# sourceMappingURL=enhanced-connection-pool.d.ts.map