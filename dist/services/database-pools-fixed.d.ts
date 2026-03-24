/**
 * Fixed Database Connection Pools with Proper Concurrency Control
 * Addresses race conditions, connection leaks, and resource management
 */
import Database from 'better-sqlite3';
import type { Session } from 'neo4j-driver';
interface SQLitePoolConfig {
    dbPath: string;
    minConnections: number;
    maxConnections: number;
    idleTimeout: number;
    acquireTimeout: number;
    healthCheckInterval: number;
}
export declare class SQLiteConnectionPool {
    private readonly config;
    private readonly connections;
    private readonly waitQueue;
    private readonly acquireMutex;
    private healthCheckTimer?;
    private shuttingDown;
    constructor(config: Partial<SQLitePoolConfig> & {
        dbPath: string;
    });
    private initialize;
    private createConnection;
    private isConnectionHealthy;
    private startHealthChecks;
    private performHealthCheck;
    acquire(): Promise<Database.Database>;
    release(conn: Database.Database): void;
    execute<T>(fn: (db: Database.Database) => T | Promise<T>): Promise<T>;
    transaction<T>(fn: (db: Database.Database) => T): Promise<T>;
    shutdown(): Promise<void>;
}
interface Neo4jPoolConfig {
    uri: string;
    user: string;
    password: string;
    maxSessions: number;
    idleTimeout: number;
    acquireTimeout: number;
}
export declare class Neo4jConnectionPool {
    private driver;
    private readonly config;
    private readonly sessions;
    private readonly waitQueue;
    private readonly acquireMutex;
    private cleanupTimer?;
    private shuttingDown;
    constructor(config: Neo4jPoolConfig);
    private startCleanup;
    private cleanupIdleSessions;
    getSession(): Promise<Session>;
    releaseSession(session: Session): Promise<void>;
    execute<T>(fn: (session: Session) => Promise<T>): Promise<T>;
    transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
    shutdown(): Promise<void>;
}
/**
 * Query optimizer with SQL injection prevention
 */
export declare class QueryOptimizer {
    private static readonly IDENTIFIER_PATTERN;
    /**
     * Validate SQL identifier (table/column name)
     */
    private static validateIdentifier;
    /**
     * Batch insert with validation
     */
    static batchInsert(db: Database.Database, table: string, records: Record<string, unknown>[]): void;
    /**
     * Create index with validation
     */
    static createIndex(db: Database.Database, table: string, columns: string[], unique?: boolean): void;
    /**
     * Analyze query performance
     */
    static analyzeQuery(db: Database.Database, sql: string): Record<string, unknown>;
}
export {};
//# sourceMappingURL=database-pools-fixed.d.ts.map