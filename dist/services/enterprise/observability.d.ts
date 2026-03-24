/**
 * Enterprise Observability Layer - Distributed tracing, metrics, and monitoring
 * Production-ready observability with OpenTelemetry-compatible tracing
 */
import { EventEmitter } from 'events';
export interface Span {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    tags: Record<string, string | number | boolean | undefined>;
    logs: Array<{
        timestamp: number;
        fields: Record<string, unknown>;
    }>;
    baggage: Record<string, string>;
    status: 'ok' | 'error' | 'timeout';
}
export interface TraceContext {
    traceId: string;
    spanId: string;
    baggage: Record<string, string>;
}
export interface MetricPoint {
    name: string;
    value: number;
    timestamp: number;
    labels: Record<string, string>;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
}
export interface Alert {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    timestamp: number;
    tags: Record<string, string>;
    resolved: boolean;
}
export declare class DistributedTracer extends EventEmitter {
    private activeSpans;
    private completedSpans;
    private samplingRate;
    private maxSpansInMemory;
    constructor(options: {
        serviceName: string;
        samplingRate?: number;
        maxSpansInMemory?: number;
    });
    createSpan(operationName: string, parentContext?: TraceContext, tags?: Record<string, unknown>): Span;
    finishSpan(span: Span, tags?: Record<string, unknown>): void;
    addSpanLog(span: Span, fields: Record<string, unknown>): void;
    setSpanTag(span: Span, key: string, value: unknown): void;
    setSpanStatus(span: Span, status: 'ok' | 'error' | 'timeout', error?: Error): void;
    private createNoOpSpan;
    generateTraceId(): string;
    generateSpanId(): string;
    getActiveSpans(): Span[];
    getTraceById(traceId: string): Span[];
    exportSpans(): Span[];
}
export declare class MetricsCollector extends EventEmitter {
    private metrics;
    private counters;
    private gauges;
    private histograms;
    private readonly maxMetricsPerName;
    increment(name: string, value?: number, labels?: Record<string, string>): void;
    gauge(name: string, value: number, labels?: Record<string, string>): void;
    histogram(name: string, value: number, labels?: Record<string, string>): void;
    summary(name: string, values: number[], labels?: Record<string, string>): void;
    private recordMetric;
    private createMetricKey;
    getMetrics(name?: string): MetricPoint[];
    exportMetrics(): Map<string, MetricPoint[]>;
}
export declare class AlertManager extends EventEmitter {
    private alerts;
    private rules;
    addRule(rule: {
        id: string;
        condition: (metrics: MetricPoint[]) => boolean;
        severity: Alert['severity'];
        title: string;
        description: string;
        cooldown?: number;
    }): void;
    evaluateMetrics(metrics: MetricPoint[]): Alert[];
    resolveAlert(alertId: string): void;
    getActiveAlerts(): Alert[];
    getAllAlerts(): Alert[];
}
export declare class ObservabilityManager {
    private tracer;
    private metrics;
    private alerts;
    private healthChecks;
    constructor(options: {
        serviceName: string;
        samplingRate?: number;
    });
    startSpan(operationName: string, parentContext?: TraceContext, tags?: Record<string, unknown>): Span;
    finishSpan(span: Span, tags?: Record<string, unknown>): void;
    incrementCounter(name: string, value?: number, labels?: Record<string, string>): void;
    setGauge(name: string, value: number, labels?: Record<string, string>): void;
    recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
    addHealthCheck(name: string, check: () => Promise<boolean>): void;
    runHealthChecks(): Promise<Record<string, boolean>>;
    private setupDefaultAlerts;
    private startMetricsEvaluation;
    getObservabilityData(): {
        activeSpans: number;
        completedTraces: number;
        activeAlerts: number;
        healthStatus: Record<string, boolean>;
    };
}
//# sourceMappingURL=observability.d.ts.map