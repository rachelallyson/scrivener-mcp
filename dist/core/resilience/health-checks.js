/**
 * Health Check System
 * Comprehensive health monitoring for services, databases, and external dependencies
 */
import { getLogger } from '../logger.js';
import { AppError, ErrorCode } from '../../utils/common.js';
import { RetryStrategies } from './retry-strategies.js';
export var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "HEALTHY";
    HealthStatus["DEGRADED"] = "DEGRADED";
    HealthStatus["UNHEALTHY"] = "UNHEALTHY";
    HealthStatus["UNKNOWN"] = "UNKNOWN";
})(HealthStatus || (HealthStatus = {}));
export class HealthCheck {
    constructor(config) {
        this.config = config;
        this.currentStatus = HealthStatus.UNKNOWN;
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = 0;
        this.logger = getLogger('health-check');
        this.retryStrategy = RetryStrategies.createFast();
        this.logger.debug(`Health check initialized: ${config.name}`, {
            interval: config.interval,
            timeout: config.timeout,
            failureThreshold: config.failureThreshold,
            critical: config.critical,
        });
    }
    /**
     * Start periodic health checking
     */
    start() {
        if (this.checkInterval) {
            this.stop();
        }
        if (!this.config.enabled) {
            this.logger.debug(`Health check disabled: ${this.config.name}`);
            return;
        }
        this.checkInterval = setInterval(() => {
            this.performCheck().catch(error => {
                this.logger.error(`Health check error: ${this.config.name}`, {
                    error: error.message,
                });
            });
        }, this.config.interval);
        // Perform initial check
        this.performCheck().catch(error => {
            this.logger.error(`Initial health check error: ${this.config.name}`, {
                error: error.message,
            });
        });
        this.logger.info(`Health check started: ${this.config.name}`);
    }
    /**
     * Stop periodic health checking
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = undefined;
        }
        this.logger.info(`Health check stopped: ${this.config.name}`);
    }
    /**
     * Perform a single health check
     */
    async performCheck() {
        const startTime = Date.now();
        try {
            // Execute health check with timeout and optional retries
            const result = await this.executeWithTimeout(async () => {
                if (this.config.retryOnFailure) {
                    return await this.retryStrategy.execute(() => this.config.check());
                }
                else {
                    return await this.config.check();
                }
            }, this.config.timeout);
            result.timestamp = Date.now();
            result.responseTime = Date.now() - startTime;
            this.onCheckComplete(result);
            return result;
        }
        catch (error) {
            const result = {
                status: HealthStatus.UNHEALTHY,
                message: `Health check failed: ${error.message}`,
                details: { error: error.message },
                timestamp: Date.now(),
                responseTime: Date.now() - startTime,
            };
            this.onCheckComplete(result);
            return result;
        }
    }
    /**
     * Get current health status
     */
    getCurrentStatus() {
        return this.currentStatus;
    }
    /**
     * Get last check result
     */
    getLastResult() {
        return this.lastCheck;
    }
    /**
     * Get health check configuration
     */
    getConfig() {
        return { ...this.config };
    }
    onCheckComplete(result) {
        this.lastCheck = result;
        if (result.status === HealthStatus.HEALTHY) {
            this.consecutiveSuccesses++;
            this.consecutiveFailures = 0;
            // Check if we should transition to healthy
            if (this.currentStatus !== HealthStatus.HEALTHY &&
                this.consecutiveSuccesses >= this.config.recoveryThreshold) {
                this.transitionToStatus(HealthStatus.HEALTHY, result.message);
            }
        }
        else if (result.status === HealthStatus.UNHEALTHY) {
            this.consecutiveFailures++;
            this.consecutiveSuccesses = 0;
            // Check if we should transition to unhealthy
            if (this.currentStatus !== HealthStatus.UNHEALTHY &&
                this.consecutiveFailures >= this.config.failureThreshold) {
                this.transitionToStatus(HealthStatus.UNHEALTHY, result.message);
            }
        }
        else if (result.status === HealthStatus.DEGRADED) {
            this.consecutiveSuccesses = 0;
            this.consecutiveFailures = 0;
            if (this.currentStatus !== HealthStatus.DEGRADED) {
                this.transitionToStatus(HealthStatus.DEGRADED, result.message);
            }
        }
    }
    transitionToStatus(newStatus, message) {
        const oldStatus = this.currentStatus;
        this.currentStatus = newStatus;
        this.logger.info(`Health check status transition: ${this.config.name}`, {
            from: oldStatus,
            to: newStatus,
            message,
            consecutiveFailures: this.consecutiveFailures,
            consecutiveSuccesses: this.consecutiveSuccesses,
        });
    }
    async executeWithTimeout(fn, timeout) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new AppError(`Health check timed out after ${timeout}ms`, ErrorCode.TIMEOUT));
            }, timeout);
        });
        return await Promise.race([fn(), timeoutPromise]);
    }
}
/**
 * Health Check Manager
 */
export class HealthCheckManager {
    constructor() {
        this.healthChecks = new Map();
        this.logger = getLogger('health-manager');
    }
    /**
     * Register a health check
     */
    register(config) {
        if (this.healthChecks.has(config.name)) {
            throw new AppError(`Health check already registered: ${config.name}`, ErrorCode.CONFIGURATION_ERROR);
        }
        const healthCheck = new HealthCheck(config);
        this.healthChecks.set(config.name, healthCheck);
        this.logger.info(`Health check registered: ${config.name}`, {
            interval: config.interval,
            critical: config.critical,
            enabled: config.enabled,
        });
        return healthCheck;
    }
    /**
     * Unregister a health check
     */
    unregister(name) {
        const healthCheck = this.healthChecks.get(name);
        if (healthCheck) {
            healthCheck.stop();
            this.healthChecks.delete(name);
            this.logger.info(`Health check unregistered: ${name}`);
            return true;
        }
        return false;
    }
    /**
     * Start all health checks
     */
    startAll() {
        for (const healthCheck of this.healthChecks.values()) {
            healthCheck.start();
        }
        this.logger.info(`Started ${this.healthChecks.size} health checks`);
    }
    /**
     * Stop all health checks
     */
    stopAll() {
        for (const healthCheck of this.healthChecks.values()) {
            healthCheck.stop();
        }
        this.logger.info(`Stopped ${this.healthChecks.size} health checks`);
    }
    /**
     * Get health check by name
     */
    getHealthCheck(name) {
        return this.healthChecks.get(name);
    }
    /**
     * Get system health status
     */
    getSystemHealth() {
        const checks = {};
        let healthyCount = 0;
        let degradedCount = 0;
        let unhealthyCount = 0;
        let unknownCount = 0;
        let criticalTotal = 0;
        let criticalHealthy = 0;
        let criticalUnhealthy = 0;
        for (const [name, healthCheck] of this.healthChecks) {
            const result = healthCheck.getLastResult();
            const config = healthCheck.getConfig();
            if (result) {
                checks[name] = result;
                switch (result.status) {
                    case HealthStatus.HEALTHY:
                        healthyCount++;
                        if (config.critical) {
                            criticalTotal++;
                            criticalHealthy++;
                        }
                        break;
                    case HealthStatus.DEGRADED:
                        degradedCount++;
                        break;
                    case HealthStatus.UNHEALTHY:
                        unhealthyCount++;
                        if (config.critical) {
                            criticalTotal++;
                            criticalUnhealthy++;
                        }
                        break;
                    default:
                        unknownCount++;
                        break;
                }
            }
            else {
                // No check result yet
                unknownCount++;
                if (config.critical) {
                    criticalTotal++;
                }
            }
        }
        // Determine overall system health
        let systemStatus = HealthStatus.HEALTHY;
        if (criticalUnhealthy > 0) {
            systemStatus = HealthStatus.UNHEALTHY;
        }
        else if (unhealthyCount > 0 || degradedCount > 0) {
            systemStatus = HealthStatus.DEGRADED;
        }
        else if (unknownCount > 0 || criticalTotal === 0) {
            systemStatus = HealthStatus.UNKNOWN;
        }
        return {
            status: systemStatus,
            timestamp: Date.now(),
            checks,
            summary: {
                total: this.healthChecks.size,
                healthy: healthyCount,
                degraded: degradedCount,
                unhealthy: unhealthyCount,
                unknown: unknownCount,
                critical: {
                    total: criticalTotal,
                    healthy: criticalHealthy,
                    unhealthy: criticalUnhealthy,
                },
            },
        };
    }
    /**
     * Get health checks by tag
     */
    getHealthChecksByTag(tag) {
        const result = [];
        for (const healthCheck of this.healthChecks.values()) {
            const config = healthCheck.getConfig();
            if (config.tags && config.tags.includes(tag)) {
                result.push(healthCheck);
            }
        }
        return result;
    }
}
/**
 * Predefined Health Checks
 */
export class StandardHealthChecks {
    /**
     * Database connectivity health check
     */
    static database(name, checkFn, config) {
        return {
            name: `database-${name}`,
            check: async () => {
                const startTime = Date.now();
                try {
                    const isConnected = await checkFn();
                    const responseTime = Date.now() - startTime;
                    if (isConnected) {
                        return {
                            status: HealthStatus.HEALTHY,
                            message: 'Database connection successful',
                            responseTime,
                            timestamp: Date.now(),
                            details: { connectionTime: responseTime },
                        };
                    }
                    else {
                        return {
                            status: HealthStatus.UNHEALTHY,
                            message: 'Database connection failed',
                            responseTime,
                            timestamp: Date.now(),
                        };
                    }
                }
                catch (error) {
                    return {
                        status: HealthStatus.UNHEALTHY,
                        message: `Database error: ${error.message}`,
                        responseTime: Date.now() - startTime,
                        timestamp: Date.now(),
                        details: { error: error.message },
                    };
                }
            },
            interval: 30000, // 30 seconds
            timeout: 10000, // 10 seconds
            failureThreshold: 3,
            recoveryThreshold: 2,
            retryOnFailure: true,
            tags: ['database', 'critical'],
            critical: true,
            enabled: true,
            ...config,
        };
    }
    /**
     * External API health check
     */
    static externalApi(name, url, config) {
        return {
            name: `api-${name}`,
            check: async () => {
                const startTime = Date.now();
                try {
                    // Simple HTTP health check (would use actual HTTP client)
                    const responseTime = Date.now() - startTime;
                    // Simulate API check
                    const isHealthy = Math.random() > 0.1; // 90% success rate for demo
                    if (isHealthy) {
                        return {
                            status: HealthStatus.HEALTHY,
                            message: `API ${name} is responsive`,
                            responseTime,
                            timestamp: Date.now(),
                            details: { url, responseTime },
                        };
                    }
                    else {
                        return {
                            status: HealthStatus.UNHEALTHY,
                            message: `API ${name} is not responding`,
                            responseTime,
                            timestamp: Date.now(),
                            details: { url },
                        };
                    }
                }
                catch (error) {
                    return {
                        status: HealthStatus.UNHEALTHY,
                        message: `API error: ${error.message}`,
                        responseTime: Date.now() - startTime,
                        timestamp: Date.now(),
                        details: { url, error: error.message },
                    };
                }
            },
            interval: 60000, // 1 minute
            timeout: 15000, // 15 seconds
            failureThreshold: 2,
            recoveryThreshold: 1,
            retryOnFailure: true,
            tags: ['api', 'external'],
            critical: false,
            enabled: true,
            ...config,
        };
    }
    /**
     * Memory usage health check
     */
    static memoryUsage(thresholdPercent = 80, config) {
        return {
            name: 'memory-usage',
            check: async () => {
                const memoryUsage = process.memoryUsage();
                const totalMemory = require('os').totalmem();
                const freeMemory = require('os').freemem();
                const usedMemory = totalMemory - freeMemory;
                const usagePercent = (usedMemory / totalMemory) * 100;
                const details = {
                    heapUsed: memoryUsage.heapUsed,
                    heapTotal: memoryUsage.heapTotal,
                    external: memoryUsage.external,
                    rss: memoryUsage.rss,
                    systemUsagePercent: usagePercent,
                    threshold: thresholdPercent,
                };
                let status = HealthStatus.HEALTHY;
                let message = `Memory usage: ${usagePercent.toFixed(1)}%`;
                if (usagePercent > thresholdPercent) {
                    status = HealthStatus.UNHEALTHY;
                    message = `Memory usage critical: ${usagePercent.toFixed(1)}%`;
                }
                else if (usagePercent > thresholdPercent * 0.8) {
                    status = HealthStatus.DEGRADED;
                    message = `Memory usage elevated: ${usagePercent.toFixed(1)}%`;
                }
                return {
                    status,
                    message,
                    timestamp: Date.now(),
                    responseTime: 1,
                    details,
                };
            },
            interval: 30000, // 30 seconds
            timeout: 5000, // 5 seconds
            failureThreshold: 3,
            recoveryThreshold: 2,
            retryOnFailure: false,
            tags: ['system', 'memory'],
            critical: true,
            enabled: true,
            ...config,
        };
    }
}
// Global health check manager
export const globalHealthManager = new HealthCheckManager();
//# sourceMappingURL=health-checks.js.map