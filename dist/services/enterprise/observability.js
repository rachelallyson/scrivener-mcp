/**
 * Enterprise Observability Layer - Distributed tracing, metrics, and monitoring
 * Production-ready observability with OpenTelemetry-compatible tracing
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../core/logger.js';
import { generateHash, getEnv } from '../../utils/common.js';
const logger = getLogger('observability');
// Distributed Tracer Implementation
export class DistributedTracer extends EventEmitter {
    constructor(options) {
        super();
        this.activeSpans = new Map();
        this.completedSpans = [];
        this.samplingRate = options.samplingRate || 0.1;
        this.maxSpansInMemory = options.maxSpansInMemory || 10000;
    }
    createSpan(operationName, parentContext, tags = {}) {
        // Sampling decision
        if (Math.random() > this.samplingRate && !parentContext) {
            // Return a no-op span for unsampled traces
            return this.createNoOpSpan(operationName);
        }
        const span = {
            traceId: parentContext?.traceId || this.generateTraceId(),
            spanId: this.generateSpanId(),
            parentSpanId: parentContext?.spanId,
            operationName,
            startTime: Date.now(),
            tags: {
                'service.name': 'scrivener-mcp',
                'service.version': getEnv('SERVICE_VERSION', '1.0.0'),
                ...tags,
            },
            logs: [],
            baggage: { ...parentContext?.baggage },
            status: 'ok',
        };
        this.activeSpans.set(span.spanId, span);
        this.emit('span-started', span);
        return span;
    }
    finishSpan(span, tags = {}) {
        if (!span.endTime) {
            span.endTime = Date.now();
            span.duration = span.endTime - span.startTime;
        }
        // Add final tags
        Object.assign(span.tags, tags);
        this.activeSpans.delete(span.spanId);
        this.completedSpans.push(span);
        // Limit memory usage
        if (this.completedSpans.length > this.maxSpansInMemory) {
            this.completedSpans = this.completedSpans.slice(-this.maxSpansInMemory / 2);
        }
        this.emit('span-finished', span);
    }
    addSpanLog(span, fields) {
        span.logs.push({
            timestamp: Date.now(),
            fields,
        });
    }
    setSpanTag(span, key, value) {
        // Only assign if value is string, number, boolean, or undefined
        if (typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            typeof value === 'undefined') {
            span.tags[key] = value;
        }
        else {
            span.tags[key] = String(value);
        }
    }
    setSpanStatus(span, status, error) {
        span.status = status;
        if (error) {
            span.tags['error'] = true;
            span.tags['error.message'] = error.message;
            span.tags['error.stack'] = error.stack;
        }
    }
    createNoOpSpan(operationName) {
        return {
            traceId: '',
            spanId: '',
            operationName,
            startTime: Date.now(),
            tags: {},
            logs: [],
            baggage: {},
            status: 'ok',
        };
    }
    generateTraceId() {
        return generateHash(`trace-${Date.now()}-${Math.random()}-${process.pid}`);
    }
    generateSpanId() {
        return generateHash(`span-${Date.now()}-${Math.random()}`);
    }
    getActiveSpans() {
        return Array.from(this.activeSpans.values());
    }
    getTraceById(traceId) {
        return this.completedSpans.filter((span) => span.traceId === traceId);
    }
    exportSpans() {
        const spans = [...this.completedSpans];
        this.completedSpans = [];
        return spans;
    }
}
// Advanced Metrics Collector
export class MetricsCollector extends EventEmitter {
    constructor() {
        super(...arguments);
        this.metrics = new Map();
        this.counters = new Map();
        this.gauges = new Map();
        this.histograms = new Map();
        this.maxMetricsPerName = 10000;
    }
    increment(name, value = 1, labels = {}) {
        const key = this.createMetricKey(name, labels);
        const current = this.counters.get(key) || 0;
        this.counters.set(key, current + value);
        this.recordMetric({
            name,
            value: current + value,
            timestamp: Date.now(),
            labels,
            type: 'counter',
        });
    }
    gauge(name, value, labels = {}) {
        const key = this.createMetricKey(name, labels);
        this.gauges.set(key, value);
        this.recordMetric({
            name,
            value,
            timestamp: Date.now(),
            labels,
            type: 'gauge',
        });
    }
    histogram(name, value, labels = {}) {
        const key = this.createMetricKey(name, labels);
        const values = this.histograms.get(key) || [];
        values.push(value);
        // Keep only recent values to prevent memory issues
        if (values.length > 1000) {
            values.splice(0, 500);
        }
        this.histograms.set(key, values);
        this.recordMetric({
            name,
            value,
            timestamp: Date.now(),
            labels,
            type: 'histogram',
        });
    }
    summary(name, values, labels = {}) {
        const sortedValues = values.slice().sort((a, b) => a - b);
        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;
        const p50 = sortedValues[Math.floor(count * 0.5)];
        const p90 = sortedValues[Math.floor(count * 0.9)];
        const p95 = sortedValues[Math.floor(count * 0.95)];
        const p99 = sortedValues[Math.floor(count * 0.99)];
        const summaryMetrics = [
            { suffix: '_count', value: count },
            { suffix: '_sum', value: sum },
            { suffix: '_avg', value: avg },
            { suffix: '_p50', value: p50 },
            { suffix: '_p90', value: p90 },
            { suffix: '_p95', value: p95 },
            { suffix: '_p99', value: p99 },
        ];
        summaryMetrics.forEach((metric) => {
            this.recordMetric({
                name: name + metric.suffix,
                value: metric.value,
                timestamp: Date.now(),
                labels,
                type: 'summary',
            });
        });
    }
    recordMetric(metric) {
        const metrics = this.metrics.get(metric.name) || [];
        metrics.push(metric);
        // Limit memory usage
        if (metrics.length > this.maxMetricsPerName) {
            metrics.splice(0, metrics.length - this.maxMetricsPerName / 2);
        }
        this.metrics.set(metric.name, metrics);
        this.emit('metric-recorded', metric);
    }
    createMetricKey(name, labels) {
        const labelString = Object.entries(labels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join(',');
        return `${name}{${labelString}}`;
    }
    getMetrics(name) {
        if (name) {
            return this.metrics.get(name) || [];
        }
        return Array.from(this.metrics.values()).flat();
    }
    exportMetrics() {
        const exported = new Map(this.metrics);
        this.metrics.clear();
        this.counters.clear();
        this.gauges.clear();
        this.histograms.clear();
        return exported;
    }
}
// Alert Manager
export class AlertManager extends EventEmitter {
    constructor() {
        super(...arguments);
        this.alerts = new Map();
        this.rules = [];
    }
    addRule(rule) {
        this.rules.push({
            ...rule,
            cooldown: rule.cooldown || 60000, // 1 minute default
            lastTriggered: 0,
        });
    }
    evaluateMetrics(metrics) {
        const triggeredAlerts = [];
        const now = Date.now();
        for (const rule of this.rules) {
            if (now - rule.lastTriggered < rule.cooldown) {
                continue; // Still in cooldown
            }
            if (rule.condition(metrics)) {
                const alert = {
                    id: generateHash(`alert-${rule.id}-${now}`),
                    severity: rule.severity,
                    title: rule.title,
                    description: rule.description,
                    timestamp: now,
                    tags: { ruleId: rule.id },
                    resolved: false,
                };
                this.alerts.set(alert.id, alert);
                rule.lastTriggered = now;
                triggeredAlerts.push(alert);
                this.emit('alert-triggered', alert);
            }
        }
        return triggeredAlerts;
    }
    resolveAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.resolved = true;
            this.emit('alert-resolved', alert);
        }
    }
    getActiveAlerts() {
        return Array.from(this.alerts.values()).filter((alert) => !alert.resolved);
    }
    getAllAlerts() {
        return Array.from(this.alerts.values());
    }
}
// Unified Observability Manager
export class ObservabilityManager {
    constructor(options) {
        this.healthChecks = new Map();
        this.tracer = new DistributedTracer(options);
        this.metrics = new MetricsCollector();
        this.alerts = new AlertManager();
        this.setupDefaultAlerts();
        this.startMetricsEvaluation();
    }
    // Tracing methods
    startSpan(operationName, parentContext, tags) {
        return this.tracer.createSpan(operationName, parentContext, tags);
    }
    finishSpan(span, tags) {
        this.tracer.finishSpan(span, tags);
    }
    // Metrics methods
    incrementCounter(name, value, labels) {
        this.metrics.increment(name, value, labels);
    }
    setGauge(name, value, labels) {
        this.metrics.gauge(name, value, labels);
    }
    recordHistogram(name, value, labels) {
        this.metrics.histogram(name, value, labels);
    }
    // Health checks
    addHealthCheck(name, check) {
        this.healthChecks.set(name, check);
    }
    async runHealthChecks() {
        const results = {};
        for (const [name, check] of this.healthChecks) {
            try {
                results[name] = await check();
            }
            catch (error) {
                results[name] = false;
                logger.error('Health check failed', { name, error: error.message });
            }
        }
        return results;
    }
    setupDefaultAlerts() {
        // High error rate alert
        this.alerts.addRule({
            id: 'high-error-rate',
            condition: (metrics) => {
                const errorMetrics = metrics.filter((m) => m.name === 'errors_total');
                const recentErrors = errorMetrics.filter((m) => Date.now() - m.timestamp < 60000);
                return recentErrors.reduce((sum, m) => sum + m.value, 0) > 10;
            },
            severity: 'high',
            title: 'High Error Rate',
            description: 'Error rate exceeded threshold in the last minute',
            cooldown: 300000, // 5 minutes
        });
        // High response time alert
        this.alerts.addRule({
            id: 'high-response-time',
            condition: (metrics) => {
                const responseTimeMetrics = metrics.filter((m) => m.name === 'response_time_p95');
                const recent = responseTimeMetrics.filter((m) => Date.now() - m.timestamp < 60000);
                const avgP95 = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
                return avgP95 > 5000; // 5 seconds
            },
            severity: 'medium',
            title: 'High Response Time',
            description: 'P95 response time exceeded 5 seconds',
            cooldown: 180000, // 3 minutes
        });
    }
    startMetricsEvaluation() {
        setInterval(() => {
            const metrics = this.metrics.getMetrics();
            this.alerts.evaluateMetrics(metrics);
        }, 30000); // Every 30 seconds
    }
    getObservabilityData() {
        return {
            activeSpans: this.tracer.getActiveSpans().length,
            completedTraces: this.tracer.exportSpans().length,
            activeAlerts: this.alerts.getActiveAlerts().length,
            healthStatus: {}, // Will be populated by runHealthChecks
        };
    }
}
//# sourceMappingURL=observability.js.map