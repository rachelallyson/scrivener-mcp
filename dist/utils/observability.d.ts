/**
 * Enterprise-grade Observability Infrastructure
 * Comprehensive telemetry, metrics, tracing, and alerting
 */
import { EventEmitter } from 'events';
export interface MetricValue {
    value: number;
    timestamp: number;
    tags?: Record<string, string>;
    unit?: string;
}
export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    tags: Record<string, unknown>;
    status: 'ok' | 'error' | 'timeout';
    error?: Error;
    logs: LogEntry[];
}
export interface LogEntry {
    timestamp: number;
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    message: string;
    metadata?: Record<string, unknown>;
    correlationId?: string;
    spanId?: string;
    source: string;
}
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    query: string;
    threshold: number;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    cooldownPeriod: number;
    lastTriggered?: number;
    actions: AlertAction[];
}
export interface AlertAction {
    type: 'log' | 'email' | 'webhook' | 'auto-remediate';
    config: Record<string, unknown>;
}
export interface Alert {
    id: string;
    ruleId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    triggeredAt: number;
    resolvedAt?: number;
    status: 'active' | 'resolved' | 'acknowledged';
    metadata: Record<string, unknown>;
}
export interface DashboardWidget {
    id: string;
    type: 'metric' | 'chart' | 'table' | 'gauge' | 'heatmap';
    title: string;
    query: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    config: Record<string, unknown>;
}
export interface Dashboard {
    id: string;
    name: string;
    description: string;
    widgets: DashboardWidget[];
    tags: string[];
    isPublic: boolean;
    createdAt: number;
    updatedAt: number;
}
export interface ObservabilityConfig {
    metrics: {
        enabled: boolean;
        retentionDays: number;
        aggregationIntervals: number[];
        exportEnabled: boolean;
        exportFormat: 'prometheus' | 'json' | 'csv';
    };
    tracing: {
        enabled: boolean;
        samplingRate: number;
        maxSpansPerTrace: number;
        retentionDays: number;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        structured: boolean;
        async: boolean;
        bufferSize: number;
        flushInterval: number;
    };
    alerting: {
        enabled: boolean;
        evaluationInterval: number;
        maxConcurrentAlerts: number;
    };
    storage: {
        type: 'memory' | 'file' | 'database';
        path?: string;
        maxSizeGB: number;
        compressionEnabled: boolean;
    };
}
interface MetricSeries {
    name: string;
    points: MetricValue[];
    aggregated?: {
        interval: number;
        values: Array<{
            timestamp: number;
            min: number;
            max: number;
            avg: number;
            count: number;
            sum: number;
        }>;
    };
}
interface TraceData {
    traceId: string;
    spans: Map<string, TraceSpan>;
    rootSpan?: TraceSpan;
    duration?: number;
    status: 'ok' | 'error' | 'timeout';
    tags: Record<string, unknown>;
}
export declare class ObservabilityInfrastructure extends EventEmitter {
    private config;
    private metrics;
    private traces;
    private activeSpans;
    private logs;
    private alertRules;
    private activeAlerts;
    private dashboards;
    private metricsBuffer;
    private logsBuffer;
    private isShuttingDown;
    private flushTimer?;
    private cleanupTimer?;
    private alertEvaluationTimer?;
    constructor(config?: Partial<ObservabilityConfig>);
    recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void;
    private processMetric;
    private aggregateMetrics;
    startTrace(operationName: string, tags?: Record<string, unknown>): string;
    finishSpan(spanId: string, status?: 'ok' | 'error' | 'timeout', error?: Error): void;
    addSpanLog(spanId: string, level: LogEntry['level'], message: string, metadata?: Record<string, unknown>): void;
    log(level: LogEntry['level'], message: string, metadata?: Record<string, unknown>, correlationId?: string): void;
    private processLog;
    private getLevelPriority;
    addAlertRule(rule: Omit<AlertRule, 'id'>): string;
    removeAlertRule(id: string): boolean;
    private evaluateAlerts;
    private evaluateCondition;
    private triggerAlert;
    private executeAlertAction;
    private executeQuery;
    createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): string;
    updateDashboard(id: string, updates: Partial<Dashboard>): boolean;
    exportMetrics(format?: 'json' | 'csv' | 'prometheus'): Promise<string>;
    private convertToCsv;
    private convertToPrometheus;
    private setupPeriodicTasks;
    private flushBuffers;
    private performCleanup;
    private enforceLogRetention;
    private enforceRetention;
    private setupGracefulShutdown;
    shutdown(): Promise<void>;
    private generateId;
    getMetrics(name?: string): MetricSeries[];
    getTraces(limit?: number): TraceData[];
    getLogs(limit?: number, level?: LogEntry['level']): LogEntry[];
    getActiveAlerts(): Alert[];
    getDashboards(): Dashboard[];
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        checks: Record<string, {
            status: 'ok' | 'warn' | 'error';
            message: string;
        }>;
    };
}
export {};
//# sourceMappingURL=observability.d.ts.map