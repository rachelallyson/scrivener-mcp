/**
 * Fixed Database Connection Pools with Proper Concurrency Control
 * Addresses race conditions, connection leaks, and resource management
 */
import Database from 'better-sqlite3';
import neo4j from 'neo4j-driver';
import { getLogger } from '../core/logger.js';
import { AppError, ErrorCode } from '../utils/common.js';
const logger = getLogger('database-pools');
// Mutex implementation for critical sections
class Mutex {
    constructor() {
        this.queue = [];
        this.locked = false;
    }
    async runExclusive(fn) {
        const release = await this.acquire();
        try {
            return await Promise.resolve(fn());
        }
        finally {
            release();
        }
    }
    acquire() {
        return new Promise((resolve) => {
            const tryAcquire = () => {
                if (!this.locked) {
                    this.locked = true;
                    resolve(() => {
                        this.locked = false;
                        const next = this.queue.shift();
                        if (next)
                            next();
                    });
                }
                else {
                    this.queue.push(tryAcquire);
                }
            };
            tryAcquire();
        });
    }
}
export class SQLiteConnectionPool {
    constructor(config) {
        this.connections = new Map();
        this.waitQueue = [];
        this.acquireMutex = new Mutex();
        this.shuttingDown = false;
        this.config = {
            dbPath: config.dbPath,
            minConnections: config.minConnections ?? 2,
            maxConnections: config.maxConnections ?? 10,
            idleTimeout: config.idleTimeout ?? 30000,
            acquireTimeout: config.acquireTimeout ?? 5000,
            healthCheckInterval: config.healthCheckInterval ?? 60000,
        };
        this.initialize();
    }
    initialize() {
        // Create minimum connections
        for (let i = 0; i < this.config.minConnections; i++) {
            try {
                const conn = this.createConnection();
                const info = {
                    connection: conn,
                    createdAt: Date.now(),
                    lastUsed: Date.now(),
                    inUse: false,
                    healthy: true,
                };
                this.connections.set(conn, info);
            }
            catch (error) {
                logger.error('Failed to create initial connection', { error });
            }
        }
        // Start health check timer
        this.startHealthChecks();
    }
    createConnection() {
        const conn = new Database(this.config.dbPath);
        // Validate connection works
        try {
            conn.prepare('SELECT 1').get();
        }
        catch (error) {
            conn.close();
            throw new AppError(`Failed to create valid SQLite connection: ${error}`, ErrorCode.CONNECTION_ERROR);
        }
        // Set pragmas for performance and safety
        conn.pragma('journal_mode = WAL');
        conn.pragma('synchronous = NORMAL');
        conn.pragma('cache_size = -64000'); // 64MB
        conn.pragma('foreign_keys = ON');
        conn.pragma('busy_timeout = 5000');
        return conn;
    }
    isConnectionHealthy(conn) {
        try {
            const info = this.connections.get(conn);
            if (!info)
                return false;
            // Check if connection is too old (1 hour)
            const age = Date.now() - info.createdAt;
            if (age > 3600000)
                return false;
            // Test connection
            conn.prepare('SELECT 1').get();
            return true;
        }
        catch {
            return false;
        }
    }
    startHealthChecks() {
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck().catch((err) => logger.error('Health check failed', { error: err }));
        }, this.config.healthCheckInterval);
        // Don't block shutdown
        this.healthCheckTimer.unref();
    }
    async performHealthCheck() {
        if (this.shuttingDown)
            return;
        const unhealthy = [];
        for (const [conn, info] of this.connections) {
            if (info.inUse)
                continue;
            if (!this.isConnectionHealthy(conn)) {
                unhealthy.push(conn);
                info.healthy = false;
            }
            else {
                info.healthy = true;
                // Check for idle timeout
                const idleTime = Date.now() - info.lastUsed;
                if (idleTime > this.config.idleTimeout &&
                    this.connections.size > this.config.minConnections) {
                    unhealthy.push(conn);
                }
            }
        }
        // Remove unhealthy connections
        for (const conn of unhealthy) {
            this.connections.delete(conn);
            try {
                conn.close();
            }
            catch {
                // Ignore close errors
            }
        }
        // Ensure minimum connections
        while (this.connections.size < this.config.minConnections && !this.shuttingDown) {
            try {
                const conn = this.createConnection();
                const info = {
                    connection: conn,
                    createdAt: Date.now(),
                    lastUsed: Date.now(),
                    inUse: false,
                    healthy: true,
                };
                this.connections.set(conn, info);
            }
            catch (error) {
                logger.error('Failed to create replacement connection', { error });
                break;
            }
        }
    }
    async acquire() {
        if (this.shuttingDown) {
            throw new AppError('Pool is shutting down', ErrorCode.INVALID_STATE);
        }
        return this.acquireMutex.runExclusive(async () => {
            const deadline = Date.now() + this.config.acquireTimeout;
            while (Date.now() < deadline) {
                // Find available healthy connection
                for (const [conn, info] of this.connections) {
                    if (!info.inUse && info.healthy) {
                        info.inUse = true;
                        info.lastUsed = Date.now();
                        return conn;
                    }
                }
                // Create new connection if under limit
                if (this.connections.size < this.config.maxConnections) {
                    try {
                        const conn = this.createConnection();
                        const info = {
                            connection: conn,
                            createdAt: Date.now(),
                            lastUsed: Date.now(),
                            inUse: true,
                            healthy: true,
                        };
                        this.connections.set(conn, info);
                        return conn;
                    }
                    catch (error) {
                        logger.error('Failed to create connection', { error });
                    }
                }
                // Wait for a connection to be released
                await new Promise((resolve) => {
                    const timer = setTimeout(() => {
                        const index = this.waitQueue.indexOf(resolver);
                        if (index >= 0) {
                            this.waitQueue.splice(index, 1);
                        }
                        resolve();
                    }, Math.min(1000, deadline - Date.now()));
                    const resolver = (conn) => {
                        clearTimeout(timer);
                        const info = this.connections.get(conn);
                        if (info) {
                            info.inUse = true;
                            info.lastUsed = Date.now();
                        }
                        resolve();
                    };
                    this.waitQueue.push(resolver);
                });
            }
            throw new AppError('Failed to acquire connection within timeout', ErrorCode.TIMEOUT_ERROR);
        });
    }
    release(conn) {
        const info = this.connections.get(conn);
        if (!info)
            return;
        info.inUse = false;
        info.lastUsed = Date.now();
        // Notify waiting requests
        const waiter = this.waitQueue.shift();
        if (waiter) {
            waiter(conn);
        }
    }
    async execute(fn) {
        const conn = await this.acquire();
        let completed = false;
        try {
            const result = await Promise.resolve(fn(conn));
            completed = true;
            return result;
        }
        catch (error) {
            // Log the error for debugging
            logger.error('Execute failed', { error });
            throw error;
        }
        finally {
            if (!completed) {
                // Connection might be corrupted, remove it
                const info = this.connections.get(conn);
                if (info) {
                    info.healthy = false;
                }
                this.connections.delete(conn);
                try {
                    conn.close();
                }
                catch {
                    // Ignore close errors
                }
                // Create replacement if needed
                if (this.connections.size < this.config.minConnections && !this.shuttingDown) {
                    try {
                        const newConn = this.createConnection();
                        const newInfo = {
                            connection: newConn,
                            createdAt: Date.now(),
                            lastUsed: Date.now(),
                            inUse: false,
                            healthy: true,
                        };
                        this.connections.set(newConn, newInfo);
                    }
                    catch (error) {
                        logger.error('Failed to create replacement connection', { error });
                    }
                }
            }
            else {
                this.release(conn);
            }
        }
    }
    async transaction(fn) {
        // Ensure fn is synchronous for better-sqlite3
        if (fn.constructor.name === 'AsyncFunction') {
            throw new AppError('SQLite transactions must be synchronous', ErrorCode.INVALID_INPUT);
        }
        return this.execute((db) => {
            // Use IMMEDIATE to acquire write lock immediately
            db.exec('BEGIN IMMEDIATE');
            try {
                const result = fn(db);
                db.exec('COMMIT');
                return result;
            }
            catch (error) {
                db.exec('ROLLBACK');
                throw error;
            }
        });
    }
    async shutdown() {
        this.shuttingDown = true;
        // Clear health check timer
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
        }
        // Reject all waiting requests
        while (this.waitQueue.length > 0) {
            this.waitQueue.shift();
        }
        // Close all connections
        for (const [conn] of this.connections) {
            try {
                conn.close();
            }
            catch {
                // Ignore close errors
            }
        }
        this.connections.clear();
        logger.info('SQLite pool shutdown complete');
    }
}
export class Neo4jConnectionPool {
    constructor(config) {
        this.sessions = new Map();
        this.waitQueue = [];
        this.acquireMutex = new Mutex();
        this.shuttingDown = false;
        this.config = config;
        this.driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password), {
            maxConnectionPoolSize: config.maxSessions,
            connectionAcquisitionTimeout: config.acquireTimeout,
        });
        this.startCleanup();
    }
    startCleanup() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupIdleSessions().catch((err) => logger.error('Session cleanup failed', { error: err }));
        }, 30000); // Every 30 seconds
        this.cleanupTimer.unref();
    }
    async cleanupIdleSessions() {
        if (this.shuttingDown)
            return;
        const now = Date.now();
        const toClose = [];
        for (const [session, info] of this.sessions) {
            if (!info.inUse) {
                const idleTime = now - info.lastUsed;
                if (idleTime > this.config.idleTimeout) {
                    toClose.push(session);
                }
            }
        }
        for (const session of toClose) {
            this.sessions.delete(session);
            try {
                await session.close();
            }
            catch {
                // Ignore close errors
            }
        }
    }
    async getSession() {
        if (this.shuttingDown) {
            throw new AppError('Pool is shutting down', ErrorCode.INVALID_STATE);
        }
        return this.acquireMutex.runExclusive(async () => {
            // Find available session
            for (const [session, info] of this.sessions) {
                if (!info.inUse) {
                    info.inUse = true;
                    info.lastUsed = Date.now();
                    return session;
                }
            }
            // Create new session if under limit
            if (this.sessions.size < this.config.maxSessions) {
                const session = this.driver.session();
                const info = {
                    session,
                    createdAt: Date.now(),
                    lastUsed: Date.now(),
                    inUse: true,
                };
                this.sessions.set(session, info);
                return session;
            }
            // Wait for a session to be released
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    const index = this.waitQueue.indexOf(resolver);
                    if (index >= 0) {
                        this.waitQueue.splice(index, 1);
                    }
                    reject(new AppError('Failed to acquire session within timeout', ErrorCode.TIMEOUT_ERROR));
                }, this.config.acquireTimeout);
                const resolver = (session) => {
                    clearTimeout(timer);
                    const info = this.sessions.get(session);
                    if (info) {
                        info.inUse = true;
                        info.lastUsed = Date.now();
                    }
                    resolve(session);
                };
                this.waitQueue.push(resolver);
            });
        });
    }
    async releaseSession(session) {
        const info = this.sessions.get(session);
        if (!info)
            return;
        info.inUse = false;
        info.lastUsed = Date.now();
        // Notify waiting requests
        const waiter = this.waitQueue.shift();
        if (waiter) {
            waiter(session);
        }
    }
    async execute(fn) {
        const session = await this.getSession();
        // Set timeout for force cleanup
        const timeout = setTimeout(() => {
            // Force close after timeout
            session.close().catch(() => { });
            this.sessions.delete(session);
            logger.error('Session forcefully closed due to timeout');
        }, this.config.idleTimeout);
        try {
            const result = await fn(session);
            return result;
        }
        catch (error) {
            // Remove potentially corrupted session
            this.sessions.delete(session);
            try {
                await session.close();
            }
            catch {
                // Ignore close errors
            }
            throw error;
        }
        finally {
            clearTimeout(timeout);
            // Try to release normally
            try {
                await this.releaseSession(session);
            }
            catch (error) {
                // Force cleanup on release error
                this.sessions.delete(session);
                logger.error('Failed to release session:', error);
            }
        }
    }
    async transaction(fn) {
        return this.execute(async (session) => {
            return session.executeWrite(fn);
        });
    }
    async shutdown() {
        this.shuttingDown = true;
        // Clear cleanup timer
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        // Reject all waiting requests
        while (this.waitQueue.length > 0) {
            this.waitQueue.shift();
        }
        // Close all sessions
        const closePromises = [];
        for (const [session] of this.sessions) {
            closePromises.push(session.close().catch(() => { }));
        }
        await Promise.all(closePromises);
        this.sessions.clear();
        // Close driver
        await this.driver.close();
        logger.info('Neo4j pool shutdown complete');
    }
}
/**
 * Query optimizer with SQL injection prevention
 */
export class QueryOptimizer {
    /**
     * Validate SQL identifier (table/column name)
     */
    static validateIdentifier(name) {
        if (!this.IDENTIFIER_PATTERN.test(name)) {
            throw new AppError(`Invalid SQL identifier: ${name}`, ErrorCode.INVALID_INPUT);
        }
        return name;
    }
    /**
     * Batch insert with validation
     */
    static batchInsert(db, table, records) {
        if (records.length === 0)
            return;
        // Validate table name
        const safeTable = this.validateIdentifier(table);
        // Get and validate column names
        const columns = Object.keys(records[0]);
        const safeColumns = columns.map((c) => this.validateIdentifier(c));
        // Prepare statement with parameterized values
        const placeholders = safeColumns.map(() => '?').join(', ');
        const columnList = safeColumns.join(', ');
        const stmt = db.prepare(`INSERT OR REPLACE INTO ${safeTable} (${columnList}) VALUES (${placeholders})`);
        // Use transaction for batch insert
        const insertMany = db.transaction((items) => {
            for (const item of items) {
                const values = safeColumns.map((col) => item[col]);
                stmt.run(...values);
            }
        });
        insertMany(records);
    }
    /**
     * Create index with validation
     */
    static createIndex(db, table, columns, unique = false) {
        const safeTable = this.validateIdentifier(table);
        const safeColumns = columns.map((c) => this.validateIdentifier(c));
        const indexName = `idx_${safeTable}_${safeColumns.join('_')}`;
        const uniqueClause = unique ? 'UNIQUE' : '';
        db.exec(`CREATE ${uniqueClause} INDEX IF NOT EXISTS ${indexName} 
			ON ${safeTable} (${safeColumns.join(', ')})`);
    }
    /**
     * Analyze query performance
     */
    static analyzeQuery(db, sql) {
        const stmt = db.prepare(`EXPLAIN QUERY PLAN ${sql}`);
        const result = stmt.all();
        // Convert array result to a record format
        return { queryPlan: result };
    }
}
QueryOptimizer.IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
//# sourceMappingURL=database-pools-fixed.js.map