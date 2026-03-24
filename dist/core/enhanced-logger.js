/**
 * Enhanced Structured Logger with Correlation IDs and Advanced Features
 */
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AsyncLocalStorage } from 'async_hooks';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
const asyncLocalStorage = new AsyncLocalStorage();
/**
 * Enhanced logger with structured logging and correlation tracking
 */
export class EnhancedLogger extends EventEmitter {
    constructor(config, serviceName = 'scrivener-mcp') {
        super();
        this.errorCounts = new Map();
        this.performanceData = [];
        this.config = config;
        this.metrics = {
            totalLogs: 0,
            logsByLevel: {},
            errorsLastHour: 0,
            averageLogsPerMinute: 0,
            topErrors: [],
            performanceStats: {
                averageExecutionTime: 0,
                slowestOperations: [],
            },
        };
        this.winston = this.createWinstonLogger(serviceName);
        this.setupMetricsCollection();
    }
    /**
     * Create context for correlation tracking
     */
    static createContext(context = {}) {
        return {
            correlationId: context.correlationId || randomUUID(),
            userId: context.userId,
            sessionId: context.sessionId,
            requestId: context.requestId,
            operation: context.operation,
            metadata: context.metadata,
        };
    }
    /**
     * Run function with logging context
     */
    static withContext(context, fn) {
        return asyncLocalStorage.run(context, fn);
    }
    /**
     * Get current logging context
     */
    static getContext() {
        return asyncLocalStorage.getStore();
    }
    /**
     * Log error with enhanced tracking
     */
    error(message, error, metadata) {
        const entry = this.createLogEntry('error', message, metadata);
        if (error) {
            entry.error = this.extractErrorInfo(error);
        }
        this.writeLog(entry);
        this.trackError(message, error);
        this.emit('error', { entry, originalError: error });
    }
    /**
     * Log warning
     */
    warn(message, metadata) {
        const entry = this.createLogEntry('warn', message, metadata);
        this.writeLog(entry);
    }
    /**
     * Log info
     */
    info(message, metadata) {
        const entry = this.createLogEntry('info', message, metadata);
        this.writeLog(entry);
    }
    /**
     * Log debug information
     */
    debug(message, metadata) {
        const entry = this.createLogEntry('debug', message, metadata);
        this.writeLog(entry);
    }
    /**
     * Log performance metrics
     */
    performance(operation, executionTime, metadata) {
        const entry = this.createLogEntry('info', `Performance: ${operation}`, metadata);
        entry.performance = {
            executionTime,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
        };
        entry.tags = ['performance'];
        this.writeLog(entry);
        this.trackPerformance(operation, executionTime);
        this.emit('performance', { operation, executionTime, metadata });
    }
    /**
     * Log structured event
     */
    event(eventType, eventData, metadata) {
        const entry = this.createLogEntry('info', `Event: ${eventType}`, {
            ...metadata,
            eventType,
            eventData,
        });
        entry.tags = ['event', eventType];
        this.writeLog(entry);
        this.emit('event', { eventType, eventData, metadata });
    }
    /**
     * Log security event
     */
    security(action, result, details) {
        const entry = this.createLogEntry(result === 'failure' ? 'warn' : 'info', `Security: ${action}`, {
            securityAction: action,
            result,
            ...details,
        });
        entry.tags = ['security', result];
        this.writeLog(entry);
        this.emit('security', { action, result, details });
    }
    /**
     * Log audit trail
     */
    audit(action, resource, userId, details) {
        const context = EnhancedLogger.getContext();
        const entry = this.createLogEntry('info', `Audit: ${action} on ${resource}`, {
            auditAction: action,
            resource,
            userId: userId || context?.userId,
            ...details,
        });
        entry.tags = ['audit'];
        this.writeLog(entry);
        this.emit('audit', { action, resource, userId, details });
    }
    /**
     * Create child logger with additional context
     */
    child(additionalContext) {
        const childLogger = new EnhancedLogger(this.config);
        // Override methods to include additional context
        const originalCreateLogEntry = childLogger.createLogEntry.bind(childLogger);
        childLogger.createLogEntry = (level, message, metadata) => {
            const entry = originalCreateLogEntry(level, message, metadata);
            // Merge additional context
            Object.assign(entry, additionalContext);
            return entry;
        };
        return childLogger;
    }
    /**
     * Get logging metrics
     */
    getMetrics() {
        // Update dynamic metrics
        this.metrics.topErrors = Array.from(this.errorCounts.entries())
            .map(([message, data]) => ({ message, count: data.count, lastOccurred: data.lastOccurred }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        this.metrics.performanceStats.slowestOperations = this.performanceData
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);
        const totalExecutionTime = this.performanceData.reduce((sum, item) => sum + item.time, 0);
        this.metrics.performanceStats.averageExecutionTime =
            this.performanceData.length > 0 ? totalExecutionTime / this.performanceData.length : 0;
        return { ...this.metrics };
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            totalLogs: 0,
            logsByLevel: {},
            errorsLastHour: 0,
            averageLogsPerMinute: 0,
            topErrors: [],
            performanceStats: {
                averageExecutionTime: 0,
                slowestOperations: [],
            },
        };
        this.errorCounts.clear();
        this.performanceData.length = 0;
        this.emit('metricsReset');
    }
    /**
     * Export logs for analysis
     */
    async exportLogs(startTime, endTime, format = 'json') {
        // This would typically query a log aggregation system
        // For now, return a placeholder implementation
        const logs = [
            {
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'Sample log export',
                correlationId: randomUUID(),
            },
        ];
        if (format === 'json') {
            return JSON.stringify(logs, null, 2);
        }
        else {
            // Convert to CSV
            const headers = Object.keys(logs[0]).join(',');
            const rows = logs.map(log => Object.values(log).join(','));
            return [headers, ...rows].join('\n');
        }
    }
    /**
     * Close logger and cleanup resources
     */
    async close() {
        if (this.winston) {
            await new Promise((resolve) => {
                if (this.winston) {
                    this.winston.close();
                    resolve();
                }
            });
        }
        this.removeAllListeners();
        this.emit('closed');
    }
    // Private methods
    createWinstonLogger(serviceName) {
        const transports = [];
        // Console transport
        if (this.config.enableConsole) {
            transports.push(new winston.transports.Console({
                level: this.config.level,
                format: this.createFormat(),
            }));
        }
        // File transport
        if (this.config.enableFile && this.config.filePath) {
            // Ensure log directory exists
            const logDir = path.dirname(this.config.filePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            transports.push(new winston.transports.File({
                level: this.config.level,
                filename: this.config.filePath,
                maxsize: this.parseSize(this.config.maxSize),
                maxFiles: this.config.maxFiles,
                format: winston.format.json(),
            }));
            // Error file transport
            transports.push(new winston.transports.File({
                level: 'error',
                filename: this.config.filePath.replace(/\.log$/, '.error.log'),
                maxsize: this.parseSize(this.config.maxSize),
                maxFiles: this.config.maxFiles,
                format: winston.format.json(),
            }));
        }
        return winston.createLogger({
            level: this.config.level,
            defaultMeta: {
                service: serviceName,
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                hostname: os.hostname(),
                pid: process.pid,
            },
            transports,
            exceptionHandlers: [
                new winston.transports.File({
                    filename: this.config.filePath?.replace(/\.log$/, '.exceptions.log') || './logs/exceptions.log',
                }),
            ],
            rejectionHandlers: [
                new winston.transports.File({
                    filename: this.config.filePath?.replace(/\.log$/, '.rejections.log') || './logs/rejections.log',
                }),
            ],
        });
    }
    createFormat() {
        const formats = [winston.format.timestamp()];
        if (this.config.enableCorrelationId) {
            formats.push(winston.format((info) => {
                const context = EnhancedLogger.getContext();
                if (context) {
                    info.correlationId = context.correlationId;
                    info.userId = context.userId;
                    info.sessionId = context.sessionId;
                    info.requestId = context.requestId;
                    info.operation = context.operation;
                }
                return info;
            })());
        }
        // Data redaction
        if (this.config.sensitiveDataPatterns) {
            formats.push(winston.format((info) => {
                return this.redactSensitiveData(info);
            })());
        }
        // Format selection
        switch (this.config.format) {
            case 'pretty':
                formats.push(winston.format.colorize(), winston.format.printf((info) => {
                    const context = info.correlationId ? ` [${String(info.correlationId).substring(0, 8)}]` : '';
                    return `${info.timestamp} ${info.level}${context}: ${info.message} ${Object.keys(info).length > 3 ? JSON.stringify(info, null, 2) : ''}`;
                }));
                break;
            case 'json':
                formats.push(winston.format.json());
                break;
            default:
                formats.push(winston.format.simple());
        }
        return winston.format.combine(...formats);
    }
    createLogEntry(level, message, metadata) {
        const context = EnhancedLogger.getContext();
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            correlationId: context?.correlationId,
            userId: context?.userId,
            sessionId: context?.sessionId,
            requestId: context?.requestId,
            operation: context?.operation,
            service: 'scrivener-mcp',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            hostname: os.hostname(),
            pid: process.pid,
            metadata: {
                ...context?.metadata,
                ...metadata,
            },
        };
    }
    writeLog(entry) {
        this.winston.log(entry.level, entry.message, entry);
        this.updateMetrics(entry);
    }
    extractErrorInfo(error) {
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: Object.getOwnPropertyNames(error).reduce((details, key) => {
                    if (!['name', 'message', 'stack', 'code'].includes(key)) {
                        details[key] = error[key];
                    }
                    return details;
                }, {}),
            };
        }
        return {
            name: 'UnknownError',
            message: String(error),
            details: { originalError: error },
        };
    }
    trackError(message, error) {
        const errorKey = error instanceof Error ? error.message : message;
        const existing = this.errorCounts.get(errorKey);
        if (existing) {
            existing.count++;
            existing.lastOccurred = new Date();
        }
        else {
            this.errorCounts.set(errorKey, {
                count: 1,
                lastOccurred: new Date(),
            });
        }
    }
    trackPerformance(operation, executionTime) {
        this.performanceData.push({
            operation,
            time: executionTime,
            timestamp: new Date(),
        });
        // Keep only last 1000 performance entries
        if (this.performanceData.length > 1000) {
            this.performanceData.splice(0, this.performanceData.length - 1000);
        }
    }
    updateMetrics(entry) {
        this.metrics.totalLogs++;
        this.metrics.logsByLevel[entry.level] = (this.metrics.logsByLevel[entry.level] || 0) + 1;
        // Count errors in last hour
        if (entry.level === 'error') {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const entryTime = new Date(entry.timestamp);
            if (entryTime >= oneHourAgo) {
                this.metrics.errorsLastHour++;
            }
        }
    }
    redactSensitiveData(info) {
        if (!this.config.sensitiveDataPatterns)
            return info;
        const redactionReplacement = this.config.redactionReplacement || '[REDACTED]';
        const infoString = JSON.stringify(info);
        let redactedString = infoString;
        for (const pattern of this.config.sensitiveDataPatterns) {
            const regex = new RegExp(pattern, 'gi');
            redactedString = redactedString.replace(regex, redactionReplacement);
        }
        try {
            return JSON.parse(redactedString);
        }
        catch {
            return info; // Return original if parsing fails
        }
    }
    parseSize(sizeStr) {
        const match = sizeStr.match(/^(\d+)(MB|KB|GB)?$/i);
        if (!match)
            return 10 * 1024 * 1024; // Default 10MB
        const size = parseInt(match[1]);
        const unit = (match[2] || 'MB').toUpperCase();
        switch (unit) {
            case 'KB':
                return size * 1024;
            case 'MB':
                return size * 1024 * 1024;
            case 'GB':
                return size * 1024 * 1024 * 1024;
            default:
                return size;
        }
    }
    setupMetricsCollection() {
        // Reset hourly error count every hour
        setInterval(() => {
            this.metrics.errorsLastHour = 0;
        }, 60 * 60 * 1000);
        // Clean up old performance data
        setInterval(() => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            this.performanceData = this.performanceData.filter(item => item.timestamp >= fiveMinutesAgo);
        }, 60 * 1000);
    }
}
/**
 * Logger middleware for correlation tracking
 */
export class LoggerMiddleware {
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Create middleware function for request correlation
     */
    correlationMiddleware() {
        return (req, res, next) => {
            const correlationId = req.headers['x-correlation-id'] || randomUUID();
            const context = EnhancedLogger.createContext({
                correlationId,
                requestId: randomUUID(),
                userId: req.user?.id,
                sessionId: req.session?.id,
                operation: `${req.method} ${req.path}`,
            });
            // Add correlation ID to response headers
            res.setHeader('x-correlation-id', correlationId);
            EnhancedLogger.withContext(context, () => {
                this.logger.info('Request started', {
                    method: req.method,
                    path: req.path,
                    userAgent: req.headers['user-agent'],
                    ip: req.ip,
                });
                const start = Date.now();
                res.on('finish', () => {
                    const duration = Date.now() - start;
                    this.logger.performance('request', duration, {
                        method: req.method,
                        path: req.path,
                        statusCode: res.statusCode,
                        contentLength: res.get('content-length'),
                    });
                });
                next();
            });
        };
    }
    /**
     * Error handling middleware with logging
     */
    errorMiddleware() {
        return (err, req, res, next) => {
            const context = EnhancedLogger.getContext();
            this.logger.error('Request error', err, {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode || 500,
                correlationId: context?.correlationId,
            });
            // Don't expose internal errors in production
            const isDevelopment = process.env.NODE_ENV === 'development';
            const errorResponse = {
                error: 'Internal Server Error',
                correlationId: context?.correlationId,
                ...(isDevelopment && { details: err.message, stack: err.stack }),
            };
            res.status(500).json(errorResponse);
        };
    }
}
//# sourceMappingURL=enhanced-logger.js.map