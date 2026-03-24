/**
 * Performance Monitoring System with Metrics Collection and Alerting
 */
import { EventEmitter } from 'events';
import { EnhancedLogger } from '../core/enhanced-logger.js';
export interface SystemMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        loadAverage: number[];
        cores: number;
    };
    memory: {
        total: number;
        used: number;
        free: number;
        percentage: number;
        heap: NodeJS.MemoryUsage;
    };
    disk: {
        total: number;
        used: number;
        free: number;
        percentage: number;
    };
    network: {
        connections: number;
        bytesIn: number;
        bytesOut: number;
    };
}
export interface ApplicationMetrics {
    timestamp: Date;
    requests: {
        total: number;
        perSecond: number;
        averageResponseTime: number;
        errors: number;
        errorRate: number;
    };
    database: {
        connections: {
            active: number;
            idle: number;
            total: number;
        };
        queries: {
            total: number;
            perSecond: number;
            averageTime: number;
            slowQueries: number;
        };
        cache: {
            hitRate: number;
            size: number;
            memoryUsage: number;
        };
    };
    ai: {
        requests: {
            total: number;
            perSecond: number;
            averageTime: number;
            errors: number;
        };
        tokens: {
            input: number;
            output: number;
            total: number;
        };
        costs: {
            totalUsd: number;
            perRequest: number;
        };
    };
}
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    duration: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
    enabled: boolean;
    channels: string[];
    cooldownMs: number;
    lastTriggered?: Date;
    conditions?: {
        environment?: string[];
        timeRange?: {
            start: string;
            end: string;
        };
        dependencies?: string[];
    };
}
export interface Alert {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: AlertRule['severity'];
    metric: string;
    currentValue: number;
    threshold: number;
    operator: string;
    message: string;
    triggeredAt: Date;
    resolvedAt?: Date;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    metadata: Record<string, unknown>;
}
export interface PerformanceProfile {
    operation: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, unknown>;
    tags?: string[];
    children: PerformanceProfile[];
}
export interface DashboardData {
    systemMetrics: SystemMetrics;
    applicationMetrics: ApplicationMetrics;
    activeAlerts: Alert[];
    recentPerformance: {
        operations: Array<{
            name: string;
            avgTime: number;
            count: number;
        }>;
        errors: Array<{
            type: string;
            count: number;
            lastOccurred: Date;
        }>;
        trends: {
            responseTime: number[];
            errorRate: number[];
            throughput: number[];
            memoryUsage: number[];
        };
    };
    healthStatus: {
        overall: 'healthy' | 'warning' | 'critical';
        services: Array<{
            name: string;
            status: string;
            lastCheck: Date;
        }>;
    };
}
/**
 * Performance monitoring and metrics collection system
 */
export declare class PerformanceMonitor extends EventEmitter {
    private logger;
    private alertRules;
    private activeAlerts;
    private metrics;
    private collectors;
    private isMonitoring;
    private collectionInterval;
    private retentionPeriod;
    private currentProfileStack;
    constructor(logger: EnhancedLogger);
    /**
     * Start performance monitoring
     */
    start(): void;
    /**
     * Stop performance monitoring
     */
    stop(): void;
    /**
     * Start performance profiling for an operation
     */
    startProfile(operation: string, metadata?: Record<string, unknown>, tags?: string[]): string;
    /**
     * End performance profiling
     */
    endProfile(profileId?: string): PerformanceProfile | null;
    /**
     * Add custom metric
     */
    recordMetric(name: string, value: number, type?: 'counter' | 'gauge' | 'histogram' | 'timer', tags?: string[], metadata?: Record<string, unknown>): void;
    /**
     * Add alert rule
     */
    addAlertRule(rule: AlertRule): void;
    /**
     * Remove alert rule
     */
    removeAlertRule(ruleId: string): void;
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string, note?: string): void;
    /**
     * Get current dashboard data
     */
    getDashboardData(): DashboardData;
    /**
     * Get performance trends over time
     */
    getPerformanceTrends(hours?: number): {
        timestamps: Date[];
        metrics: {
            responseTime: number[];
            errorRate: number[];
            throughput: number[];
            memoryUsage: number[];
            cpuUsage: number[];
        };
    };
    /**
     * Export metrics for external monitoring systems
     */
    exportMetrics(format?: 'prometheus' | 'json' | 'csv'): string;
    private collectSystemMetrics;
    private collectApplicationMetrics;
    private evaluateAlerts;
    private triggerAlert;
    private resolveAlert;
    private getMetricValue;
    private evaluateCondition;
    private generateAlertMessage;
    private setupDefaultAlertRules;
    private getCpuUsage;
    private getDiskUsage;
    private getNetworkStats;
    private getRequestMetrics;
    private getDatabaseMetrics;
    private getAiMetrics;
    private getLatestMetric;
    private cleanupOldMetrics;
    private getRecentPerformanceData;
    private getHealthStatus;
    private createEmptySystemMetrics;
    private createEmptyApplicationMetrics;
    private formatPrometheusMetrics;
    private formatCsvMetrics;
}
//# sourceMappingURL=performance-monitor.d.ts.map