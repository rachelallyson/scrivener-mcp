/**
 * Metrics Collection and Monitoring System
 * Comprehensive metrics collection for performance monitoring and observability
 */
export declare enum MetricType {
    COUNTER = "COUNTER",// Monotonically increasing value
    GAUGE = "GAUGE",// Current value that can go up or down
    HISTOGRAM = "HISTOGRAM",// Distribution of values with buckets
    TIMER = "TIMER"
}
export interface MetricMetadata {
    name: string;
    description: string;
    type: MetricType;
    tags: Record<string, string>;
    unit?: string;
}
export interface CounterMetric {
    value: number;
    metadata: MetricMetadata;
}
export interface GaugeMetric {
    value: number;
    metadata: MetricMetadata;
}
export interface HistogramBucket {
    upperBound: number;
    count: number;
}
export interface HistogramMetric {
    count: number;
    sum: number;
    buckets: HistogramBucket[];
    metadata: MetricMetadata;
}
export interface TimerMetric {
    count: number;
    totalTime: number;
    min: number;
    max: number;
    mean: number;
    percentiles: {
        [percentile: number]: number;
    };
    metadata: MetricMetadata;
}
export type Metric = CounterMetric | GaugeMetric | HistogramMetric | TimerMetric;
export interface MetricsSnapshot {
    timestamp: number;
    counters: Record<string, CounterMetric>;
    gauges: Record<string, GaugeMetric>;
    histograms: Record<string, HistogramMetric>;
    timers: Record<string, TimerMetric>;
}
export interface MetricsConfig {
    /** Collection interval in milliseconds */
    collectionInterval: number;
    /** Retention period for metrics in milliseconds */
    retentionPeriod: number;
    /** Maximum number of metric snapshots to keep */
    maxSnapshots: number;
    /** Export metrics to external systems */
    exportEnabled: boolean;
    /** Export interval in milliseconds */
    exportInterval: number;
}
/**
 * Counter Metric - Monotonically increasing value
 */
export declare class Counter {
    private metadata;
    private _value;
    constructor(metadata: MetricMetadata);
    increment(value?: number): void;
    getValue(): number;
    getMetric(): CounterMetric;
    reset(): void;
}
/**
 * Gauge Metric - Current value that can fluctuate
 */
export declare class Gauge {
    private metadata;
    private _value;
    constructor(metadata: MetricMetadata);
    set(value: number): void;
    increment(value?: number): void;
    decrement(value?: number): void;
    getValue(): number;
    getMetric(): GaugeMetric;
}
/**
 * Histogram Metric - Distribution of values
 */
export declare class Histogram {
    private metadata;
    private bucketBounds;
    private count;
    private sum;
    private buckets;
    constructor(metadata: MetricMetadata, bucketBounds?: number[]);
    observe(value: number): void;
    getMetric(): HistogramMetric;
    reset(): void;
}
/**
 * Timer Metric - Time-based measurements
 */
export declare class Timer {
    private metadata;
    private maxMeasurements;
    private measurements;
    private count;
    private totalTime;
    constructor(metadata: MetricMetadata, maxMeasurements?: number);
    record(value: number): void;
    time<T>(fn: () => T): T;
    timeAsync<T>(fn: () => Promise<T>): Promise<T>;
    getMetric(): TimerMetric;
    private percentile;
    reset(): void;
}
/**
 * Metrics Registry - Central metric management
 */
export declare class MetricsRegistry {
    private counters;
    private gauges;
    private histograms;
    private timers;
    private readonly logger;
    /**
     * Create or get a counter metric
     */
    counter(name: string, description: string, tags?: Record<string, string>): Counter;
    /**
     * Create or get a gauge metric
     */
    gauge(name: string, description: string, tags?: Record<string, string>): Gauge;
    /**
     * Create or get a histogram metric
     */
    histogram(name: string, description: string, tags?: Record<string, string>, buckets?: number[]): Histogram;
    /**
     * Create or get a timer metric
     */
    timer(name: string, description: string, tags?: Record<string, string>): Timer;
    /**
     * Get current metrics snapshot
     */
    getSnapshot(): MetricsSnapshot;
    /**
     * Reset all metrics
     */
    resetAll(): void;
    /**
     * Get metric by name and type
     */
    getMetric(name: string, type: MetricType): Counter | Gauge | Histogram | Timer | undefined;
}
/**
 * Metrics Collector - Automated metric collection and management
 */
export declare class MetricsCollector {
    private registry;
    private config;
    private snapshots;
    private collectionTimer?;
    private exportTimer?;
    private readonly logger;
    constructor(registry: MetricsRegistry, config: MetricsConfig);
    /**
     * Start metrics collection
     */
    start(): void;
    /**
     * Stop metrics collection
     */
    stop(): void;
    /**
     * Get recent snapshots
     */
    getSnapshots(limit?: number): MetricsSnapshot[];
    /**
     * Get latest snapshot
     */
    getLatestSnapshot(): MetricsSnapshot | undefined;
    /**
     * Clear old snapshots
     */
    clearOldSnapshots(): void;
    private collectMetrics;
    private collectSystemMetrics;
    private exportMetrics;
    private generateMetricsSummary;
}
/**
 * Metrics Decorators for automatic instrumentation
 */
export declare class MetricsDecorators {
    /**
     * Count method calls
     */
    static countCalls(registry: MetricsRegistry, metricName: string, tags?: Record<string, string>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    /**
     * Time method execution
     */
    static timeExecution(registry: MetricsRegistry, metricName: string, tags?: Record<string, string>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}
export declare const globalMetricsRegistry: MetricsRegistry;
export declare const globalMetricsCollector: MetricsCollector;
//# sourceMappingURL=metrics-collector.d.ts.map