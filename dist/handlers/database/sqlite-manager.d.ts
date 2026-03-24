import type { RunResult } from 'better-sqlite3';
import Database from 'better-sqlite3';
import { CachedSQLiteManager } from './keydb-cache.js';
export declare class SQLiteManager {
    private db;
    private dbPath;
    private transactionDepth;
    private isInTransaction;
    private pendingOperations;
    private cachedManager;
    constructor(dbPath: string);
    /**
     * Initialize the SQLite database with comprehensive error handling and performance monitoring
     */
    initialize(): Promise<void>;
    /**
     * Create all necessary tables
     */
    private createTables;
    /**
     * Get the database instance
     */
    getDatabase(): Database.Database;
    /**
     * Get cached database manager (if available)
     */
    getCachedManager(): CachedSQLiteManager | null;
    /**
     * Check if caching is available
     */
    isCachingAvailable(): boolean;
    /**
     * Execute a query
     */
    query(sql: string, params?: unknown[]): unknown[];
    /**
     * Execute a single row query
     */
    queryOne(sql: string, params?: unknown[]): unknown;
    /**
     * Execute an insert/update/delete statement
     */
    execute(sql: string, params?: unknown[]): RunResult;
    /**
     * Execute multiple statements in a transaction with retry logic
     */
    transaction<T>(fn: () => T, retries?: number): T;
    /**
     * Process pending operations after transaction completes
     */
    private processPendingOperations;
    /**
     * Begin an explicit transaction
     */
    beginTransaction(): void;
    /**
     * Commit the current transaction
     */
    commit(): void;
    /**
     * Rollback the current transaction
     */
    rollback(): void;
    /**
     * Check if database is healthy
     */
    checkHealth(): Promise<{
        healthy: boolean;
        details: Record<string, unknown>;
    }>;
    /**
     * Close the database connection
     */
    close(): Promise<void>;
    /**
     * Get database file size
     */
    getDatabaseStats(): {
        size: number;
        pageCount: number;
        pageSize: number;
    };
    /**
     * Vacuum the database to reclaim space
     */
    vacuum(): void;
    /**
     * Backup database to a file
     */
    backup(backupPath: string): void;
}
//# sourceMappingURL=sqlite-manager.d.ts.map