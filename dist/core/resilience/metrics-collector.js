/**
 * Metrics Collection and Monitoring System
 * Comprehensive metrics collection for performance monitoring and observability
 */
import { getLogger } from '../logger.js';
import { formatDuration, formatBytes } from '../../utils/common.js';
export var MetricType;
(function (MetricType) {
    MetricType["COUNTER"] = "COUNTER";
    MetricType["GAUGE"] = "GAUGE";
    MetricType["HISTOGRAM"] = "HISTOGRAM";
    MetricType["TIMER"] = "TIMER"; // Time-based measurements
})(MetricType || (MetricType = {}));
/**
 * Counter Metric - Monotonically increasing value
 */
export class Counter {
    constructor(metadata) {
        this.metadata = metadata;
        this._value = 0;
    }
    increment(value = 1) {
        this._value += value;
    }
    getValue() {
        return this._value;
    }
    getMetric() {
        return {
            value: this._value,
            metadata: this.metadata,
        };
    }
    reset() {
        this._value = 0;
    }
}
/**
 * Gauge Metric - Current value that can fluctuate
 */
export class Gauge {
    constructor(metadata) {
        this.metadata = metadata;
        this._value = 0;
    }
    set(value) {
        this._value = value;
    }
    increment(value = 1) {
        this._value += value;
    }
    decrement(value = 1) {
        this._value -= value;
    }
    getValue() {
        return this._value;
    }
    getMetric() {
        return {
            value: this._value,
            metadata: this.metadata,
        };
    }
}
/**
 * Histogram Metric - Distribution of values
 */
export class Histogram {
    constructor(metadata, bucketBounds = [0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000]) {
        this.metadata = metadata;
        this.bucketBounds = bucketBounds;
        this.count = 0;
        this.sum = 0;
        this.buckets = new Map();
        // Initialize buckets with upper bounds
        for (const bound of bucketBounds.sort((a, b) => a - b)) {
            this.buckets.set(bound, 0);
        }
        // Add +Inf bucket
        this.buckets.set(Infinity, 0);
    }
    observe(value) {
        this.count++;
        this.sum += value;
        // Update buckets
        for (const [bound, currentCount] of this.buckets) {
            if (value <= bound) {
                this.buckets.set(bound, currentCount + 1);
            }
        }
    }
    getMetric() {
        const buckets = [];
        for (const [upperBound, count] of this.buckets) {
            buckets.push({ upperBound, count });
        }
        return {
            count: this.count,
            sum: this.sum,
            buckets,
            metadata: this.metadata,
        };
    }
    reset() {
        this.count = 0;
        this.sum = 0;
        for (const bound of this.buckets.keys()) {
            this.buckets.set(bound, 0);
        }
    }
}
/**
 * Timer Metric - Time-based measurements
 */
export class Timer {
    constructor(metadata, maxMeasurements = 10000) {
        this.metadata = metadata;
        this.maxMeasurements = maxMeasurements;
        this.measurements = [];
        this.count = 0;
        this.totalTime = 0;
    }
    record(value) {
        this.measurements.push(value);
        this.count++;
        this.totalTime += value;
        // Keep only recent measurements to prevent memory leaks
        if (this.measurements.length > this.maxMeasurements) {
            this.measurements.shift();
        }
    }
    time(fn) {
        const start = Date.now();
        try {
            const result = fn();
            this.record(Date.now() - start);
            return result;
        }
        catch (error) {
            this.record(Date.now() - start);
            throw error;
        }
    }
    async timeAsync(fn) {
        const start = Date.now();
        try {
            const result = await fn();
            this.record(Date.now() - start);
            return result;
        }
        catch (error) {
            this.record(Date.now() - start);
            throw error;
        }
    }
    getMetric() {
        const sorted = [...this.measurements].sort((a, b) => a - b);
        const percentiles = {};
        if (sorted.length > 0) {
            percentiles[50] = this.percentile(sorted, 0.5);
            percentiles[75] = this.percentile(sorted, 0.75);
            percentiles[90] = this.percentile(sorted, 0.9);
            percentiles[95] = this.percentile(sorted, 0.95);
            percentiles[99] = this.percentile(sorted, 0.99);
        }
        return {
            count: this.count,
            totalTime: this.totalTime,
            min: sorted.length > 0 ? sorted[0] : 0,
            max: sorted.length > 0 ? sorted[sorted.length - 1] : 0,
            mean: this.count > 0 ? this.totalTime / this.count : 0,
            percentiles,
            metadata: this.metadata,
        };
    }
    percentile(sorted, p) {
        const index = Math.ceil(sorted.length * p) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }
    reset() {
        this.measurements = [];
        this.count = 0;
        this.totalTime = 0;
    }
}
/**
 * Metrics Registry - Central metric management
 */
export class MetricsRegistry {
    constructor() {
        this.counters = new Map();
        this.gauges = new Map();
        this.histograms = new Map();
        this.timers = new Map();
        this.logger = getLogger('metrics-registry');
    }
    /**
     * Create or get a counter metric
     */
    counter(name, description, tags = {}) {
        if (!this.counters.has(name)) {
            const metadata = {
                name,
                description,
                type: MetricType.COUNTER,
                tags,
            };
            this.counters.set(name, new Counter(metadata));
        }
        return this.counters.get(name);
    }
    /**
     * Create or get a gauge metric
     */
    gauge(name, description, tags = {}) {
        if (!this.gauges.has(name)) {
            const metadata = {
                name,
                description,
                type: MetricType.GAUGE,
                tags,
            };
            this.gauges.set(name, new Gauge(metadata));
        }
        return this.gauges.get(name);
    }
    /**
     * Create or get a histogram metric
     */
    histogram(name, description, tags = {}, buckets) {
        if (!this.histograms.has(name)) {
            const metadata = {
                name,
                description,
                type: MetricType.HISTOGRAM,
                tags,
            };
            this.histograms.set(name, new Histogram(metadata, buckets));
        }
        return this.histograms.get(name);
    }
    /**
     * Create or get a timer metric
     */
    timer(name, description, tags = {}) {
        if (!this.timers.has(name)) {
            const metadata = {
                name,
                description,
                type: MetricType.TIMER,
                tags,
                unit: 'milliseconds',
            };
            this.timers.set(name, new Timer(metadata));
        }
        return this.timers.get(name);
    }
    /**
     * Get current metrics snapshot
     */
    getSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            counters: {},
            gauges: {},
            histograms: {},
            timers: {},
        };
        for (const [name, counter] of this.counters) {
            snapshot.counters[name] = counter.getMetric();
        }
        for (const [name, gauge] of this.gauges) {
            snapshot.gauges[name] = gauge.getMetric();
        }
        for (const [name, histogram] of this.histograms) {
            snapshot.histograms[name] = histogram.getMetric();
        }
        for (const [name, timer] of this.timers) {
            snapshot.timers[name] = timer.getMetric();
        }
        return snapshot;
    }
    /**
     * Reset all metrics
     */
    resetAll() {
        for (const counter of this.counters.values()) {
            counter.reset();
        }
        for (const histogram of this.histograms.values()) {
            histogram.reset();
        }
        for (const timer of this.timers.values()) {
            timer.reset();
        }
        this.logger.info('All metrics reset');
    }
    /**
     * Get metric by name and type
     */
    getMetric(name, type) {
        switch (type) {
            case MetricType.COUNTER:
                return this.counters.get(name);
            case MetricType.GAUGE:
                return this.gauges.get(name);
            case MetricType.HISTOGRAM:
                return this.histograms.get(name);
            case MetricType.TIMER:
                return this.timers.get(name);
        }
    }
}
/**
 * Metrics Collector - Automated metric collection and management
 */
export class MetricsCollector {
    constructor(registry, config) {
        this.registry = registry;
        this.config = config;
        this.snapshots = [];
        this.logger = getLogger('metrics-collector');
    }
    /**
     * Start metrics collection
     */
    start() {
        // Start collection timer
        this.collectionTimer = setInterval(() => {
            this.collectMetrics();
        }, this.config.collectionInterval);
        // Start export timer if enabled
        if (this.config.exportEnabled) {
            this.exportTimer = setInterval(() => {
                this.exportMetrics();
            }, this.config.exportInterval);
        }
        this.logger.info('Metrics collection started', {
            collectionInterval: this.config.collectionInterval,
            exportEnabled: this.config.exportEnabled,
        });
        // Initial collection
        this.collectMetrics();
    }
    /**
     * Stop metrics collection
     */
    stop() {
        if (this.collectionTimer) {
            clearInterval(this.collectionTimer);
            this.collectionTimer = undefined;
        }
        if (this.exportTimer) {
            clearInterval(this.exportTimer);
            this.exportTimer = undefined;
        }
        this.logger.info('Metrics collection stopped');
    }
    /**
     * Get recent snapshots
     */
    getSnapshots(limit) {
        const snapshots = [...this.snapshots];
        return limit ? snapshots.slice(-limit) : snapshots;
    }
    /**
     * Get latest snapshot
     */
    getLatestSnapshot() {
        return this.snapshots[this.snapshots.length - 1];
    }
    /**
     * Clear old snapshots
     */
    clearOldSnapshots() {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        this.snapshots = this.snapshots.filter(snapshot => snapshot.timestamp > cutoffTime);
        // Also enforce max snapshots limit
        if (this.snapshots.length > this.config.maxSnapshots) {
            this.snapshots = this.snapshots.slice(-this.config.maxSnapshots);
        }
    }
    collectMetrics() {
        try {
            // Collect system metrics
            this.collectSystemMetrics();
            // Get snapshot from registry
            const snapshot = this.registry.getSnapshot();
            this.snapshots.push(snapshot);
            // Clean old snapshots
            this.clearOldSnapshots();
            this.logger.debug('Metrics collected', {
                snapshotCount: this.snapshots.length,
                timestamp: snapshot.timestamp,
            });
        }
        catch (error) {
            this.logger.error('Error collecting metrics', {
                error: error.message,
            });
        }
    }
    collectSystemMetrics() {
        // Memory usage
        const memUsage = process.memoryUsage();
        this.registry.gauge('system.memory.heap_used', 'Heap memory used').set(memUsage.heapUsed);
        this.registry.gauge('system.memory.heap_total', 'Total heap memory').set(memUsage.heapTotal);
        this.registry.gauge('system.memory.external', 'External memory').set(memUsage.external);
        this.registry.gauge('system.memory.rss', 'Resident set size').set(memUsage.rss);
        // CPU usage (would need additional libraries for accurate CPU metrics)
        const cpuUsage = process.cpuUsage();
        this.registry.gauge('system.cpu.user', 'User CPU time').set(cpuUsage.user);
        this.registry.gauge('system.cpu.system', 'System CPU time').set(cpuUsage.system);
        // Event loop metrics
        const eventLoopUtilization = process.eventLoopUtilization?.();
        if (eventLoopUtilization) {
            this.registry.gauge('system.event_loop.utilization', 'Event loop utilization')
                .set(eventLoopUtilization.utilization);
        }
        // Process uptime
        this.registry.gauge('system.uptime', 'Process uptime').set(process.uptime());
    }
    exportMetrics() {
        try {
            const latestSnapshot = this.getLatestSnapshot();
            if (!latestSnapshot)
                return;
            // Here you would export metrics to external systems
            // For now, we'll just log a summary
            const summary = this.generateMetricsSummary(latestSnapshot);
            this.logger.info('Metrics export', summary);
        }
        catch (error) {
            this.logger.error('Error exporting metrics', {
                error: error.message,
            });
        }
    }
    generateMetricsSummary(snapshot) {
        const summary = {
            timestamp: snapshot.timestamp,
            counters: Object.keys(snapshot.counters).length,
            gauges: Object.keys(snapshot.gauges).length,
            histograms: Object.keys(snapshot.histograms).length,
            timers: Object.keys(snapshot.timers).length,
        };
        // Add key system metrics
        if (snapshot.gauges['system.memory.heap_used']) {
            summary.memoryUsed = formatBytes(snapshot.gauges['system.memory.heap_used'].value);
        }
        if (snapshot.gauges['system.uptime']) {
            summary.uptime = formatDuration(snapshot.gauges['system.uptime'].value * 1000);
        }
        return summary;
    }
}
/**
 * Metrics Decorators for automatic instrumentation
 */
export class MetricsDecorators {
    /**
     * Count method calls
     */
    static countCalls(registry, metricName, tags = {}) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            const counter = registry.counter(metricName, `Count of ${propertyKey} calls`, tags);
            descriptor.value = function (...args) {
                counter.increment();
                return originalMethod.apply(this, args);
            };
            return descriptor;
        };
    }
    /**
     * Time method execution
     */
    static timeExecution(registry, metricName, tags = {}) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            const timer = registry.timer(metricName, `Execution time of ${propertyKey}`, tags);
            descriptor.value = async function (...args) {
                if (originalMethod.constructor.name === 'AsyncFunction') {
                    return await timer.timeAsync(() => originalMethod.apply(this, args));
                }
                else {
                    return timer.time(() => originalMethod.apply(this, args));
                }
            };
            return descriptor;
        };
    }
}
// Global metrics registry and collector
export const globalMetricsRegistry = new MetricsRegistry();
export const globalMetricsCollector = new MetricsCollector(globalMetricsRegistry, {
    collectionInterval: 30000, // 30 seconds
    retentionPeriod: 3600000, // 1 hour
    maxSnapshots: 120, // 120 snapshots max
    exportEnabled: true,
    exportInterval: 60000, // 1 minute
});
// Start collection automatically in development/production
if (process.env.NODE_ENV !== 'test') {
    globalMetricsCollector.start();
}
//# sourceMappingURL=metrics-collector.js.map