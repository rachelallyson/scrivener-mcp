/**
 * Enhanced Structured Logger with Correlation IDs and Advanced Features
 */
import { EventEmitter } from 'events';
export interface LogContext {
    correlationId: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    operation?: string;
    metadata?: Record<string, unknown>;
}
export interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    correlationId?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    operation?: string;
    service: string;
    version: string;
    environment: string;
    hostname: string;
    pid: number;
    metadata?: Record<string, unknown>;
    error?: {
        name: string;
        message: string;
        stack?: string;
        code?: string | number;
        details?: Record<string, unknown>;
    };
    performance?: {
        executionTime?: number;
        memoryUsage?: NodeJS.MemoryUsage;
        cpuUsage?: NodeJS.CpuUsage;
    };
    tags?: string[];
}
export interface LoggerConfig {
    level: string;
    format: 'json' | 'pretty' | 'combined';
    enableConsole: boolean;
    enableFile: boolean;
    filePath?: string;
    maxFiles: number;
    maxSize: string;
    enableCorrelationId: boolean;
    enablePerformanceTracking: boolean;
    enableErrorTracking: boolean;
    enableMetrics: boolean;
    sensitiveDataPatterns?: string[];
    redactionReplacement?: string;
}
export interface LogMetrics {
    totalLogs: number;
    logsByLevel: Record<string, number>;
    errorsLastHour: number;
    averageLogsPerMinute: number;
    topErrors: Array<{
        message: string;
        count: number;
        lastOccurred: Date;
    }>;
    performanceStats: {
        averageExecutionTime: number;
        slowestOperations: Array<{
            operation: string;
            time: number;
            timestamp: Date;
        }>;
    };
}
/**
 * Enhanced logger with structured logging and correlation tracking
 */
export declare class EnhancedLogger extends EventEmitter {
    private winston;
    private config;
    private metrics;
    private errorCounts;
    private performanceData;
    constructor(config: LoggerConfig, serviceName?: string);
    /**
     * Create context for correlation tracking
     */
    static createContext(context?: Partial<LogContext>): LogContext;
    /**
     * Run function with logging context
     */
    static withContext<T>(context: LogContext, fn: () => T): T;
    /**
     * Get current logging context
     */
    static getContext(): LogContext | undefined;
    /**
     * Log error with enhanced tracking
     */
    error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
    /**
     * Log warning
     */
    warn(message: string, metadata?: Record<string, unknown>): void;
    /**
     * Log info
     */
    info(message: string, metadata?: Record<string, unknown>): void;
    /**
     * Log debug information
     */
    debug(message: string, metadata?: Record<string, unknown>): void;
    /**
     * Log performance metrics
     */
    performance(operation: string, executionTime: number, metadata?: Record<string, unknown>): void;
    /**
     * Log structured event
     */
    event(eventType: string, eventData: Record<string, unknown>, metadata?: Record<string, unknown>): void;
    /**
     * Log security event
     */
    security(action: string, result: 'success' | 'failure', details?: Record<string, unknown>): void;
    /**
     * Log audit trail
     */
    audit(action: string, resource: string, userId?: string, details?: Record<string, unknown>): void;
    /**
     * Create child logger with additional context
     */
    child(additionalContext: Partial<LogContext>): EnhancedLogger;
    /**
     * Get logging metrics
     */
    getMetrics(): LogMetrics;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Export logs for analysis
     */
    exportLogs(startTime: Date, endTime: Date, format?: 'json' | 'csv'): Promise<string>;
    /**
     * Close logger and cleanup resources
     */
    close(): Promise<void>;
    private createWinstonLogger;
    private createFormat;
    private createLogEntry;
    private writeLog;
    private extractErrorInfo;
    private trackError;
    private trackPerformance;
    private updateMetrics;
    private redactSensitiveData;
    private parseSize;
    private setupMetricsCollection;
}
/**
 * Logger middleware for correlation tracking
 */
export declare class LoggerMiddleware {
    private logger;
    constructor(logger: EnhancedLogger);
    /**
     * Create middleware function for request correlation
     */
    correlationMiddleware(): (req: any, res: any, next: any) => void;
    /**
     * Error handling middleware with logging
     */
    errorMiddleware(): (err: Error, req: any, res: any, next: any) => void;
}
//# sourceMappingURL=enhanced-logger.d.ts.map