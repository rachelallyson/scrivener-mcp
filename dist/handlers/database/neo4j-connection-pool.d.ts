/**
 * Neo4j Connection Pool with Health Monitoring and Circuit Breaker
 */
import type { SessionMode, ManagedTransaction, QueryResult } from 'neo4j-driver';
import { EventEmitter } from 'events';
import type { QueryParameters } from '../../types/database.js';
export interface Neo4jPoolConfig {
    maxConnectionPoolSize: number;
    connectionAcquisitionTimeout: number;
    connectionTimeout: number;
    maxTransactionRetryTime: number;
    healthCheckInterval: number;
    circuitBreakerThreshold: number;
    circuitBreakerTimeout: number;
    retryDelayMs: number;
    maxRetries: number;
}
export interface PoolHealth {
    isHealthy: boolean;
    connectionCount: number;
    availableConnections: number;
    busyConnections: number;
    circuitBreakerState: 'closed' | 'open' | 'half-open';
    lastHealthCheck: Date;
    errorRate: number;
    averageResponseTime: number;
}
export interface ConnectionStats {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    lastActivity: Date;
    errors: Array<{
        error: string;
        timestamp: Date;
    }>;
}
/**
 * Enhanced Neo4j connection pool with monitoring and resilience
 */
export declare class Neo4jConnectionPool extends EventEmitter {
    private driver;
    private config;
    private uri;
    private auth;
    private database;
    private healthTimer?;
    private circuitBreaker;
    private stats;
    private isInitialized;
    constructor(uri: string, username: string, password: string, database?: string, config?: Partial<Neo4jPoolConfig>);
    /**
     * Initialize the connection pool
     */
    initialize(): Promise<void>;
    /**
     * Execute a query with automatic retry and circuit breaker protection
     */
    query(cypher: string, parameters?: QueryParameters, mode?: SessionMode): Promise<QueryResult>;
    /**
     * Execute a read transaction with retry logic
     */
    readTransaction<T>(work: (tx: ManagedTransaction) => Promise<T>, retryOptions?: {
        maxRetries?: number;
        retryDelayMs?: number;
    }): Promise<T>;
    /**
     * Execute a write transaction with retry logic
     */
    writeTransaction<T>(work: (tx: ManagedTransaction) => Promise<T>, retryOptions?: {
        maxRetries?: number;
        retryDelayMs?: number;
    }): Promise<T>;
    /**
     * Get pool health status
     */
    getHealth(): Promise<PoolHealth>;
    /**
     * Get connection statistics
     */
    getStats(): ConnectionStats;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Check if the pool is ready for queries
     */
    isReady(): boolean;
    /**
     * Close the connection pool
     */
    close(): Promise<void>;
    private createSession;
    private executeTransaction;
    private updateStats;
    private recordFailure;
    private openCircuitBreaker;
    private resetCircuitBreaker;
    private checkCircuitBreaker;
    private isRetryableError;
    private calculateErrorRate;
    private getConnectionCount;
    private getAvailableConnections;
    private getBusyConnections;
    private performHealthCheck;
    private startHealthChecks;
    private delay;
}
//# sourceMappingURL=neo4j-connection-pool.d.ts.map