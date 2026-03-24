/**
 * Database connection pooling and optimization
 */
import Database from 'better-sqlite3';
import type { ManagedTransaction, Session } from 'neo4j-driver';
interface PoolConfig {
    maxConnections?: number;
    minConnections?: number;
    acquireTimeout?: number;
    idleTimeout?: number;
    connectionRetryLimit?: number;
    connectionRetryDelay?: number;
}
/**
 * SQLite connection pool
 */
export declare class SQLitePool {
    private readonly dbPath;
    private connections;
    private available;
    private readonly config;
    constructor(dbPath: string, config?: PoolConfig);
    private initialize;
    private createConnection;
    acquire(): Promise<Database.Database>;
    release(conn: Database.Database): void;
    execute<T>(fn: (db: Database.Database) => T): Promise<T>;
    transaction<T>(fn: (db: Database.Database) => T): Promise<T>;
    close(): void;
    getStats(): {
        total: number;
        available: number;
        inUse: number;
        maxConnections: number;
    };
}
/**
 * Neo4j session pool
 */
export declare class Neo4jSessionPool {
    private readonly uri;
    private readonly auth;
    private readonly database;
    private driver;
    private sessions;
    private readonly config;
    constructor(uri: string, auth: {
        user: string;
        password: string;
    }, database?: string, config?: PoolConfig);
    initialize(): Promise<void>;
    getSession(): Promise<Session>;
    releaseSession(session: Session): Promise<void>;
    execute<T>(fn: (session: Session) => Promise<T>): Promise<T>;
    readTransaction<T>(fn: (tx: ManagedTransaction) => Promise<T>): Promise<T>;
    writeTransaction<T>(fn: (tx: ManagedTransaction) => Promise<T>): Promise<T>;
    close(): Promise<void>;
    isConnected(): boolean;
    getStats(): {
        connected: boolean;
        activeSessions: number;
        maxConnections: number;
    };
}
/**
 * Query optimizer for batch operations
 */
export declare class QueryOptimizer {
    /**
     * Batch insert with prepared statements
     */
    static batchInsert(db: Database.Database, table: string, records: Record<string, unknown>[], batchSize?: number): void;
    /**
     * Optimized query with indexing hints
     */
    static optimizedSelect(db: Database.Database, query: string, params?: unknown[]): unknown[];
    /**
     * Create missing indexes
     */
    static createIndexes(db: Database.Database, indexes: Array<{
        table: string;
        columns: string[];
        unique?: boolean;
    }>): void;
}
export {};
//# sourceMappingURL=connection-pool.d.ts.map