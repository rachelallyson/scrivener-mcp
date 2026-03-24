/**
 * Enhanced Connection Pool with Health Monitoring
 * Advanced connection pooling with health checks, automatic failover, and performance monitoring
 */
import Database from 'better-sqlite3';
import { getLogger } from '../logger.js';
import { AppError, ErrorCode, sleep } from '../../utils/common.js';
import { CircuitBreakerFactory } from './circuit-breaker.js';
import { RetryStrategies } from './retry-strategies.js';
import { globalMetricsRegistry } from './metrics-collector.js';
import { HealthCheck, HealthStatus, StandardHealthChecks } from './health-checks.js';
/**
 * Enhanced Connection Pool with health monitoring and automatic failover
 */
export class EnhancedConnectionPool {
    constructor(factory, config) {
        this.factory = factory;
        this.config = config;
        this.connections = [];
        this.activeConnections = new Set();
        this.acquisitionQueue = [];
        this.isShuttingDown = false;
        this.logger = getLogger('enhanced-pool');
        this.retryStrategy = RetryStrategies.createDatabase();
        // Metrics
        this.metrics = {
            totalAcquisitions: 0,
            successfulAcquisitions: 0,
            failedAcquisitions: 0,
            totalValidations: 0,
            validationFailures: 0,
            connectionErrors: 0,
            acquisitionTimes: [],
            validationTimes: [],
        };
        this.circuitBreaker = CircuitBreakerFactory.getCircuitBreaker(`pool-${config.poolName}`, {
            failureThreshold: 5,
            successThreshold: 3,
            timeWindow: 60000,
            openTimeout: 30000,
        });
        this.initializePool();
        this.setupHealthChecks();
        this.setupMetrics();
        this.logger.info(`Enhanced connection pool initialized: ${config.poolName}`, {
            minConnections: config.minConnections,
            maxConnections: config.maxConnections,
            acquireTimeout: config.acquireTimeout,
        });
    }
    /**
     * Acquire a connection from the pool
     */
    async acquire() {
        if (this.isShuttingDown) {
            throw new AppError('Connection pool is shutting down', ErrorCode.OPERATION_CANCELLED);
        }
        this.metrics.totalAcquisitions++;
        const startTime = Date.now();
        try {
            const connection = await this.circuitBreaker.execute(async () => {
                return await this.retryStrategy.execute(async () => {
                    return await this.doAcquire();
                });
            });
            this.metrics.successfulAcquisitions++;
            this.updateAcquisitionTime(Date.now() - startTime);
            this.logger.debug(`Connection acquired: ${connection.id}`, {
                poolName: this.config.poolName,
                timesUsed: connection.timesUsed,
            });
            return connection;
        }
        catch (error) {
            this.metrics.failedAcquisitions++;
            this.updateAcquisitionTime(Date.now() - startTime);
            this.logger.error('Failed to acquire connection', {
                poolName: this.config.poolName,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Release a connection back to the pool
     */
    release(pooledConnection) {
        if (this.activeConnections.has(pooledConnection)) {
            this.activeConnections.delete(pooledConnection);
            pooledConnection.lastUsed = Date.now();
            pooledConnection.timesUsed++;
            // Return to idle pool if still valid
            if (pooledConnection.isValid && !this.isShuttingDown) {
                this.connections.push(pooledConnection);
                this.processAcquisitionQueue();
            }
            else {
                // Destroy invalid connection
                this.destroyConnection(pooledConnection);
            }
            this.logger.debug(`Connection released: ${pooledConnection.id}`, {
                poolName: this.config.poolName,
                timesUsed: pooledConnection.timesUsed,
            });
        }
    }
    /**
     * Execute a function with an acquired connection
     */
    async execute(fn) {
        const pooledConnection = await this.acquire();
        try {
            return await fn(pooledConnection.connection);
        }
        finally {
            this.release(pooledConnection);
        }
    }
    /**
     * Shutdown the pool and clean up resources
     */
    async shutdown() {
        this.isShuttingDown = true;
        this.logger.info(`Shutting down connection pool: ${this.config.poolName}`);
        // Stop timers
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        if (this.validationTimer) {
            clearInterval(this.validationTimer);
        }
        // Reject pending acquisitions
        for (const pending of this.acquisitionQueue) {
            pending.reject(new AppError('Connection pool is shutting down', ErrorCode.OPERATION_CANCELLED));
        }
        this.acquisitionQueue = [];
        // Wait for active connections to be released (with timeout)
        const shutdownTimeout = 30000; // 30 seconds
        const shutdownStart = Date.now();
        while (this.activeConnections.size > 0 &&
            Date.now() - shutdownStart < shutdownTimeout) {
            await sleep(100);
        }
        // Force close remaining active connections
        for (const activeConnection of this.activeConnections) {
            await this.destroyConnection(activeConnection);
        }
        // Close all idle connections
        const closePromises = this.connections.map(conn => this.destroyConnection(conn));
        await Promise.allSettled(closePromises);
        this.connections = [];
        this.activeConnections.clear();
        this.logger.info(`Connection pool shutdown complete: ${this.config.poolName}`);
    }
    /**
     * Get current pool metrics
     */
    getMetrics() {
        const totalConnections = this.connections.length + this.activeConnections.size;
        return {
            totalConnections,
            activeConnections: this.activeConnections.size,
            idleConnections: this.connections.length,
            pendingAcquisitions: this.acquisitionQueue.length,
            totalAcquisitions: this.metrics.totalAcquisitions,
            successfulAcquisitions: this.metrics.successfulAcquisitions,
            failedAcquisitions: this.metrics.failedAcquisitions,
            totalValidations: this.metrics.totalValidations,
            validationFailures: this.metrics.validationFailures,
            averageAcquisitionTime: this.calculateAverageTime(this.metrics.acquisitionTimes),
            averageValidationTime: this.calculateAverageTime(this.metrics.validationTimes),
            connectionErrors: this.metrics.connectionErrors,
            poolUtilization: totalConnections > 0 ? this.activeConnections.size / totalConnections : 0,
            healthStatus: this.healthCheck?.getCurrentStatus() || HealthStatus.UNKNOWN,
        };
    }
    /**
     * Validate all connections in the pool
     */
    async validateConnections() {
        this.logger.debug(`Validating connections: ${this.config.poolName}`);
        // Validate idle connections
        const validationPromises = this.connections.map(async (pooledConnection) => {
            await this.validateConnection(pooledConnection);
        });
        await Promise.allSettled(validationPromises);
        // Remove invalid connections
        this.connections = this.connections.filter(conn => {
            if (!conn.isValid) {
                this.destroyConnection(conn);
                return false;
            }
            return true;
        });
        // Ensure minimum connections
        await this.ensureMinimumConnections();
    }
    async initializePool() {
        try {
            // Create minimum connections
            await this.ensureMinimumConnections();
            // Start background tasks
            this.startBackgroundTasks();
            // Pre-warm connections if enabled
            if (this.config.enablePreWarming) {
                await this.preWarmConnections();
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize connection pool', {
                poolName: this.config.poolName,
                error: error.message,
            });
            throw error;
        }
    }
    async doAcquire() {
        // Try to get an idle connection first
        const idleConnection = this.connections.pop();
        if (idleConnection) {
            // Validate connection before use
            if (await this.validateConnection(idleConnection)) {
                this.activeConnections.add(idleConnection);
                return idleConnection;
            }
            else {
                await this.destroyConnection(idleConnection);
            }
        }
        // Create new connection if under limit
        if (this.getTotalConnectionCount() < this.config.maxConnections) {
            const newConnection = await this.createConnection();
            this.activeConnections.add(newConnection);
            return newConnection;
        }
        // Wait for a connection to become available
        return await this.waitForConnection();
    }
    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                // Remove from queue
                const index = this.acquisitionQueue.findIndex(item => item.resolve === resolve);
                if (index >= 0) {
                    this.acquisitionQueue.splice(index, 1);
                }
                reject(new AppError(`Connection acquisition timed out after ${this.config.acquireTimeout}ms`, ErrorCode.TIMEOUT));
            }, this.config.acquireTimeout);
            this.acquisitionQueue.push({
                resolve: (connection) => {
                    clearTimeout(timeout);
                    resolve(connection);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                },
                timestamp: Date.now(),
            });
        });
    }
    processAcquisitionQueue() {
        while (this.acquisitionQueue.length > 0 && this.connections.length > 0) {
            const pending = this.acquisitionQueue.shift();
            const connection = this.connections.pop();
            if (pending && connection) {
                this.activeConnections.add(connection);
                pending.resolve(connection);
            }
        }
    }
    async createConnection() {
        try {
            const connection = await this.factory.create();
            const pooledConnection = {
                connection,
                id: this.generateConnectionId(),
                createdAt: Date.now(),
                lastUsed: Date.now(),
                timesUsed: 0,
                isValid: true,
            };
            this.logger.debug(`New connection created: ${pooledConnection.id}`, {
                poolName: this.config.poolName,
            });
            return pooledConnection;
        }
        catch (error) {
            this.metrics.connectionErrors++;
            this.logger.error('Failed to create connection', {
                poolName: this.config.poolName,
                error: error.message,
            });
            throw error;
        }
    }
    async destroyConnection(pooledConnection) {
        try {
            await this.factory.destroy(pooledConnection.connection);
            this.logger.debug(`Connection destroyed: ${pooledConnection.id}`, {
                poolName: this.config.poolName,
            });
        }
        catch (error) {
            this.logger.error(`Error destroying connection: ${pooledConnection.id}`, {
                poolName: this.config.poolName,
                error: error.message,
            });
        }
    }
    async validateConnection(pooledConnection) {
        const startTime = Date.now();
        this.metrics.totalValidations++;
        try {
            const isValid = await this.factory.validate(pooledConnection.connection);
            pooledConnection.isValid = isValid;
            pooledConnection.validatedAt = Date.now();
            if (!isValid) {
                this.metrics.validationFailures++;
            }
            this.updateValidationTime(Date.now() - startTime);
            return isValid;
        }
        catch (error) {
            this.metrics.validationFailures++;
            pooledConnection.isValid = false;
            this.updateValidationTime(Date.now() - startTime);
            this.logger.warn(`Connection validation failed: ${pooledConnection.id}`, {
                poolName: this.config.poolName,
                error: error.message,
            });
            return false;
        }
    }
    async ensureMinimumConnections() {
        while (this.getTotalConnectionCount() < this.config.minConnections) {
            try {
                const connection = await this.createConnection();
                this.connections.push(connection);
            }
            catch (error) {
                this.logger.error('Failed to create minimum connection', {
                    poolName: this.config.poolName,
                    error: error.message,
                });
                break; // Don't keep trying if creation fails
            }
        }
    }
    async preWarmConnections() {
        this.logger.info(`Pre-warming connections: ${this.config.poolName}`);
        for (let i = this.connections.length; i < this.config.maxConnections; i++) {
            try {
                const connection = await this.createConnection();
                this.connections.push(connection);
                if (this.config.preWarmingDelay > 0) {
                    await sleep(this.config.preWarmingDelay);
                }
            }
            catch (error) {
                this.logger.warn('Pre-warming connection failed', {
                    poolName: this.config.poolName,
                    error: error.message,
                });
                break;
            }
        }
        this.logger.info(`Pre-warming complete: ${this.config.poolName}`, {
            totalConnections: this.connections.length,
        });
    }
    startBackgroundTasks() {
        // Connection validation timer
        this.validationTimer = setInterval(() => {
            this.validateConnections().catch(error => {
                this.logger.error('Background validation failed', {
                    poolName: this.config.poolName,
                    error: error.message,
                });
            });
        }, this.config.healthCheckInterval);
        // Idle connection cleanup timer
        setInterval(() => {
            this.cleanupIdleConnections();
        }, this.config.idleTimeout);
    }
    cleanupIdleConnections() {
        const now = Date.now();
        const toRemove = [];
        for (const connection of this.connections) {
            if (now - connection.lastUsed > this.config.idleTimeout) {
                toRemove.push(connection);
            }
        }
        // Remove expired connections
        for (const connection of toRemove) {
            const index = this.connections.indexOf(connection);
            if (index >= 0) {
                this.connections.splice(index, 1);
                this.destroyConnection(connection);
            }
        }
        if (toRemove.length > 0) {
            this.logger.debug(`Cleaned up ${toRemove.length} idle connections`, {
                poolName: this.config.poolName,
            });
            // Ensure minimum connections after cleanup
            this.ensureMinimumConnections().catch(error => {
                this.logger.error('Failed to maintain minimum connections', {
                    poolName: this.config.poolName,
                    error: error.message,
                });
            });
        }
    }
    setupHealthChecks() {
        this.healthCheck = new HealthCheck(StandardHealthChecks.database(this.config.poolName, async () => {
            const metrics = this.getMetrics();
            return metrics.totalConnections > 0 &&
                metrics.healthStatus !== HealthStatus.UNHEALTHY;
        }, {
            name: `pool-${this.config.poolName}`,
            interval: this.config.healthCheckInterval,
            timeout: 10000,
            failureThreshold: 3,
            recoveryThreshold: 2,
            retryOnFailure: true,
            critical: true,
        }));
        this.healthCheck.start();
    }
    setupMetrics() {
        // Register pool metrics
        const poolGauge = globalMetricsRegistry.gauge(`pool.connections.${this.config.poolName}`, `Total connections in pool ${this.config.poolName}`, { pool: this.config.poolName });
        const activeGauge = globalMetricsRegistry.gauge(`pool.connections.active.${this.config.poolName}`, `Active connections in pool ${this.config.poolName}`, { pool: this.config.poolName });
        const acquisitionTimer = globalMetricsRegistry.timer(`pool.acquisition.time.${this.config.poolName}`, `Connection acquisition time for pool ${this.config.poolName}`, { pool: this.config.poolName });
        // Update metrics periodically
        setInterval(() => {
            const metrics = this.getMetrics();
            poolGauge.set(metrics.totalConnections);
            activeGauge.set(metrics.activeConnections);
        }, 30000); // Every 30 seconds
    }
    getTotalConnectionCount() {
        return this.connections.length + this.activeConnections.size;
    }
    generateConnectionId() {
        return `${this.config.poolName}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    updateAcquisitionTime(time) {
        this.metrics.acquisitionTimes.push(time);
        if (this.metrics.acquisitionTimes.length > 1000) {
            this.metrics.acquisitionTimes.shift();
        }
    }
    updateValidationTime(time) {
        this.metrics.validationTimes.push(time);
        if (this.metrics.validationTimes.length > 1000) {
            this.metrics.validationTimes.shift();
        }
    }
    calculateAverageTime(times) {
        if (times.length === 0)
            return 0;
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }
}
/**
 * SQLite Connection Factory
 */
export class SQLiteConnectionFactory {
    constructor(dbPath, options) {
        this.dbPath = dbPath;
        this.options = options;
    }
    async create() {
        const db = new Database(this.dbPath);
        // Apply optimizations
        if (this.options?.enableWAL !== false) {
            db.pragma('journal_mode = WAL');
        }
        db.pragma('synchronous = NORMAL');
        db.pragma(`cache_size = ${this.options?.cacheSize || -64000}`); // 64MB default
        db.pragma(`temp_store = ${this.options?.tempStore || 'MEMORY'}`);
        if (this.options?.mmapSize) {
            db.pragma(`mmap_size = ${this.options.mmapSize}`);
        }
        db.pragma('optimize');
        return db;
    }
    async destroy(connection) {
        connection.close();
    }
    async validate(connection) {
        try {
            // Simple validation query
            const result = connection.prepare('SELECT 1 as test').get();
            return result && result.test === 1;
        }
        catch {
            return false;
        }
    }
}
/**
 * Pool Manager for managing multiple connection pools
 */
export class ConnectionPoolManager {
    constructor() {
        this.pools = new Map();
        this.logger = getLogger('pool-manager');
    }
    /**
     * Create or get connection pool
     */
    getPool(name, factory, config) {
        if (this.pools.has(name)) {
            return this.pools.get(name);
        }
        const poolConfig = {
            minConnections: 2,
            maxConnections: 10,
            acquireTimeout: 10000,
            idleTimeout: 300000,
            validationTimeout: 5000,
            retryConfig: {
                maxAttempts: 3,
                initialDelay: 1000,
                maxDelay: 5000,
                factor: 2,
            },
            healthCheckInterval: 30000,
            enablePreWarming: false,
            preWarmingDelay: 100,
            poolName: name,
            ...config,
        };
        const pool = new EnhancedConnectionPool(factory, poolConfig);
        this.pools.set(name, pool);
        this.logger.info(`Connection pool created: ${name}`);
        return pool;
    }
    /**
     * Get all pool metrics
     */
    getAllMetrics() {
        const metrics = {};
        for (const [name, pool] of this.pools) {
            metrics[name] = pool.getMetrics();
        }
        return metrics;
    }
    /**
     * Shutdown all pools
     */
    async shutdownAll() {
        const shutdownPromises = Array.from(this.pools.values()).map(pool => pool.shutdown());
        await Promise.allSettled(shutdownPromises);
        this.pools.clear();
        this.logger.info('All connection pools shutdown');
    }
}
// Global pool manager
export const globalPoolManager = new ConnectionPoolManager();
//# sourceMappingURL=enhanced-connection-pool.js.map