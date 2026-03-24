/**
 * Performance Profiler and Observability Tools
 * Advanced performance monitoring, profiling, and observability features
 */
import { performance, PerformanceObserver } from 'perf_hooks';
import { getLogger } from '../logger.js';
import { globalMetricsRegistry } from './metrics-collector.js';
/**
 * Performance Profiler for detailed performance analysis
 */
export class PerformanceProfiler {
    constructor(config) {
        this.config = config;
        this.profiles = [];
        this.snapshots = [];
        this.logger = getLogger('performance-profiler');
        this.metrics = {
            totalOperations: 0,
            slowOperations: 0,
            operationTimes: [],
            operationTypes: new Map(),
            memoryLeaksDetected: 0,
            gcEvents: 0,
            gcDurations: [],
            totalProfiledTime: 0,
        };
        if (config.enabled) {
            this.initialize();
        }
    }
    /**
     * Start profiling an operation
     */
    startOperation(operationName, tags = {}) {
        if (!this.config.enabled || Math.random() > this.config.sampleRate) {
            return new NoOpOperationProfiler();
        }
        return new OperationProfiler(operationName, tags, this.config.slowOperationThreshold, (profile) => this.recordProfile(profile));
    }
    /**
     * Profile an async function
     */
    async profileAsync(operationName, fn, tags = {}) {
        const profiler = this.startOperation(operationName, tags);
        try {
            const result = await fn();
            profiler.success();
            return result;
        }
        catch (error) {
            profiler.error(error);
            throw error;
        }
        finally {
            profiler.finish();
        }
    }
    /**
     * Profile a synchronous function
     */
    profileSync(operationName, fn, tags = {}) {
        const profiler = this.startOperation(operationName, tags);
        try {
            const result = fn();
            profiler.success();
            return result;
        }
        catch (error) {
            profiler.error(error);
            throw error;
        }
        finally {
            profiler.finish();
        }
    }
    /**
     * Take a performance snapshot
     */
    takeSnapshot() {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage(this.lastCpuUsage);
        this.lastCpuUsage = process.cpuUsage();
        // Measure event loop delay
        const eventLoopDelay = this.measureEventLoopDelay();
        const snapshot = {
            timestamp: Date.now(),
            memory: {
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
                external: memoryUsage.external,
                rss: memoryUsage.rss,
                arrayBuffers: memoryUsage.arrayBuffers || 0,
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
            },
            eventLoop: {
                delay: eventLoopDelay,
            },
        };
        // Add event loop utilization if available
        const eventLoopUtilization = process.eventLoopUtilization?.();
        if (eventLoopUtilization) {
            snapshot.eventLoop.utilization = eventLoopUtilization.utilization;
        }
        this.snapshots.push(snapshot);
        this.cleanupOldSnapshots();
        return snapshot;
    }
    /**
     * Get profiler metrics
     */
    getMetrics() {
        const operationTimes = this.metrics.operationTimes;
        const operationsByType = {};
        for (const [type, count] of this.metrics.operationTypes) {
            operationsByType[type] = count;
        }
        return {
            totalOperations: this.metrics.totalOperations,
            slowOperations: this.metrics.slowOperations,
            avgOperationTime: operationTimes.length > 0 ?
                operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length : 0,
            maxOperationTime: operationTimes.length > 0 ? Math.max(...operationTimes) : 0,
            minOperationTime: operationTimes.length > 0 ? Math.min(...operationTimes) : 0,
            operationsByType,
            memoryLeaksDetected: this.metrics.memoryLeaksDetected,
            gcEvents: this.metrics.gcEvents,
            avgGcDuration: this.metrics.gcDurations.length > 0 ?
                this.metrics.gcDurations.reduce((sum, dur) => sum + dur, 0) / this.metrics.gcDurations.length : 0,
            totalProfiledTime: this.metrics.totalProfiledTime,
        };
    }
    /**
     * Get recent performance snapshots
     */
    getSnapshots(limit) {
        const snapshots = [...this.snapshots];
        return limit ? snapshots.slice(-limit) : snapshots;
    }
    /**
     * Get operation profiles
     */
    getProfiles(operationName, limit) {
        let profiles = this.profiles;
        if (operationName) {
            profiles = profiles.filter(p => p.operationName === operationName);
        }
        profiles = [...profiles].sort((a, b) => b.startTime - a.startTime);
        return limit ? profiles.slice(0, limit) : profiles;
    }
    /**
     * Detect potential memory leaks
     */
    detectMemoryLeaks() {
        const leaks = [];
        if (this.snapshots.length < 2)
            return leaks;
        for (let i = 1; i < this.snapshots.length; i++) {
            const current = this.snapshots[i];
            const previous = this.snapshots[i - 1];
            const memoryIncrease = current.memory.heapUsed - previous.memory.heapUsed;
            if (memoryIncrease > this.config.memoryLeakThreshold) {
                // Find operations that happened during this period
                const timeRange = { start: previous.timestamp, end: current.timestamp };
                const suspiciousOps = this.profiles.filter(p => p.startTime >= timeRange.start &&
                    p.endTime <= timeRange.end &&
                    p.memoryDelta > 0).sort((a, b) => b.memoryDelta - a.memoryDelta);
                leaks.push({
                    timestamp: current.timestamp,
                    memoryIncrease,
                    suspiciousOperation: suspiciousOps[0]?.operationName,
                });
                this.metrics.memoryLeaksDetected++;
            }
        }
        return leaks;
    }
    /**
     * Generate performance report
     */
    generateReport() {
        const summary = this.getMetrics();
        const memoryTrend = this.snapshots.map(s => ({
            timestamp: s.timestamp,
            heapUsed: s.memory.heapUsed,
            rss: s.memory.rss,
        }));
        const slowOperations = this.profiles
            .filter(p => p.duration > this.config.slowOperationThreshold)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);
        const memoryLeaks = this.detectMemoryLeaks();
        const recommendations = this.generateRecommendations(summary, slowOperations, memoryLeaks);
        return {
            summary,
            memoryTrend,
            slowOperations,
            memoryLeaks,
            recommendations,
        };
    }
    /**
     * Start profiler
     */
    start() {
        if (!this.config.enabled)
            return;
        this.logger.info('Performance profiler started');
        // Take baseline measurement
        this.baselineMemory = process.memoryUsage();
        this.lastCpuUsage = process.cpuUsage();
        // Start periodic snapshots
        this.snapshotTimer = setInterval(() => {
            this.takeSnapshot();
        }, 30000); // Every 30 seconds
        // Start export timer
        if (this.config.exportInterval > 0) {
            this.exportTimer = setInterval(() => {
                this.exportProfileData();
            }, this.config.exportInterval);
        }
    }
    /**
     * Stop profiler
     */
    stop() {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        if (this.snapshotTimer) {
            clearInterval(this.snapshotTimer);
        }
        if (this.exportTimer) {
            clearInterval(this.exportTimer);
        }
        this.logger.info('Performance profiler stopped');
    }
    initialize() {
        this.setupPerformanceObserver();
        this.setupMetrics();
        this.start();
        this.logger.info('Performance profiler initialized', {
            sampleRate: this.config.sampleRate,
            slowOperationThreshold: this.config.slowOperationThreshold,
            memoryLeakThreshold: this.config.memoryLeakThreshold,
        });
    }
    setupPerformanceObserver() {
        if (typeof PerformanceObserver === 'undefined') {
            this.logger.warn('PerformanceObserver not available, some profiling features disabled');
            return;
        }
        this.performanceObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'gc') {
                    this.recordGcEvent(entry);
                }
                else if (entry.entryType === 'function' || entry.entryType === 'measure') {
                    this.recordPerformanceEntry(entry);
                }
            }
        });
        // Observe GC events
        try {
            this.performanceObserver.observe({ entryTypes: ['gc', 'measure', 'function'] });
        }
        catch (error) {
            this.logger.warn('Failed to observe performance entries', {
                error: error.message,
            });
        }
    }
    setupMetrics() {
        // Register profiler metrics
        const operationsCounter = globalMetricsRegistry.counter('profiler.operations.total', 'Total profiled operations');
        const slowOperationsCounter = globalMetricsRegistry.counter('profiler.operations.slow', 'Slow operations detected');
        const memoryLeaksCounter = globalMetricsRegistry.counter('profiler.memory.leaks', 'Memory leaks detected');
        // Update metrics periodically
        setInterval(() => {
            const metrics = this.getMetrics();
            operationsCounter.increment(metrics.totalOperations);
            slowOperationsCounter.increment(metrics.slowOperations);
            memoryLeaksCounter.increment(metrics.memoryLeaksDetected);
        }, 60000); // Every minute
    }
    recordProfile(profile) {
        this.profiles.push(profile);
        this.metrics.totalOperations++;
        this.metrics.operationTimes.push(profile.duration);
        this.metrics.totalProfiledTime += profile.duration;
        // Update operation type counter
        const currentCount = this.metrics.operationTypes.get(profile.operationName) || 0;
        this.metrics.operationTypes.set(profile.operationName, currentCount + 1);
        // Check if it's a slow operation
        if (profile.duration > this.config.slowOperationThreshold) {
            this.metrics.slowOperations++;
            this.logger.warn('Slow operation detected', {
                operationName: profile.operationName,
                duration: profile.duration,
                memoryDelta: profile.memoryDelta,
                tags: profile.tags,
            });
        }
        // Cleanup old profiles
        this.cleanupOldProfiles();
    }
    recordGcEvent(entry) {
        this.metrics.gcEvents++;
        this.metrics.gcDurations.push(entry.duration);
        // Add to latest snapshot if available
        const latestSnapshot = this.snapshots[this.snapshots.length - 1];
        if (latestSnapshot && Date.now() - latestSnapshot.timestamp < 5000) {
            latestSnapshot.gc = {
                type: entry.kind,
                duration: entry.duration,
                reclaimed: entry.detail?.reclaimed || 0,
            };
        }
    }
    recordPerformanceEntry(entry) {
        // Record performance entries for detailed analysis
        this.logger.debug('Performance entry recorded', {
            name: entry.name,
            type: entry.entryType,
            duration: entry.duration,
            startTime: entry.startTime,
        });
    }
    measureEventLoopDelay() {
        const start = performance.now();
        setImmediate(() => {
            const delay = performance.now() - start;
            return delay;
        });
        return 0; // Simplified for this example
    }
    cleanupOldProfiles() {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        this.profiles = this.profiles.filter(p => p.startTime > cutoffTime);
    }
    cleanupOldSnapshots() {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        this.snapshots = this.snapshots.filter(s => s.timestamp > cutoffTime);
    }
    exportProfileData() {
        const report = this.generateReport();
        this.logger.info('Performance profile exported', {
            totalOperations: report.summary.totalOperations,
            slowOperations: report.slowOperations.length,
            memoryLeaks: report.memoryLeaks.length,
        });
        // Here you would export to external monitoring systems
        // For now, we'll just log a summary
    }
    generateRecommendations(summary, slowOperations, memoryLeaks) {
        const recommendations = [];
        // Memory recommendations
        if (memoryLeaks.length > 0) {
            recommendations.push(`Detected ${memoryLeaks.length} potential memory leaks. Review memory allocation patterns.`);
        }
        // Performance recommendations
        if (summary.slowOperations / summary.totalOperations > 0.1) {
            recommendations.push('High percentage of slow operations detected. Consider optimization.');
        }
        if (summary.avgOperationTime > 100) {
            recommendations.push('Average operation time is high. Consider implementing caching or optimization.');
        }
        // GC recommendations
        if (summary.avgGcDuration > 50) {
            recommendations.push('Garbage collection taking significant time. Consider reducing object allocations.');
        }
        // Operation-specific recommendations
        const topSlowOperation = slowOperations[0];
        if (topSlowOperation && topSlowOperation.duration > 1000) {
            recommendations.push(`Operation "${topSlowOperation.operationName}" is consistently slow (${topSlowOperation.duration}ms). Consider optimization.`);
        }
        return recommendations;
    }
}
/**
 * Operation Profiler for individual operations
 */
export class OperationProfiler {
    constructor(operationName, tags, slowThreshold, onFinish) {
        this.operationName = operationName;
        this.tags = tags;
        this.slowThreshold = slowThreshold;
        this.onFinish = onFinish;
        this.finished = false;
        this.startTime = Date.now();
        this.memoryBefore = process.memoryUsage();
    }
    /**
     * Mark operation as successful
     */
    success() {
        // No-op, success is assumed unless error is called
    }
    /**
     * Mark operation as failed
     */
    error(error) {
        this.operationError = error;
    }
    /**
     * Finish profiling and record results
     */
    finish() {
        if (this.finished)
            return;
        this.finished = true;
        const endTime = Date.now();
        const memoryAfter = process.memoryUsage();
        const profile = {
            operationName: this.operationName,
            startTime: this.startTime,
            endTime,
            duration: endTime - this.startTime,
            memoryBefore: this.memoryBefore.heapUsed,
            memoryAfter: memoryAfter.heapUsed,
            memoryDelta: memoryAfter.heapUsed - this.memoryBefore.heapUsed,
            tags: this.tags,
            error: this.operationError?.message,
            stackTrace: this.operationError?.stack,
        };
        this.onFinish(profile);
    }
}
/**
 * No-op profiler for when profiling is disabled
 */
export class NoOpOperationProfiler extends OperationProfiler {
    constructor() {
        super('', {}, 0, () => { });
    }
    success() { }
    error(_error) { }
    finish() { }
}
/**
 * Profiler decorators for automatic instrumentation
 */
export class ProfilerDecorators {
    /**
     * Profile method execution time and memory usage
     */
    static profile(profiler, operationName, tags) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            const opName = operationName || `${target.constructor.name}.${propertyKey}`;
            descriptor.value = async function (...args) {
                if (originalMethod.constructor.name === 'AsyncFunction') {
                    return await profiler.profileAsync(opName, () => originalMethod.apply(this, args), tags || {});
                }
                else {
                    return profiler.profileSync(opName, () => originalMethod.apply(this, args), tags || {});
                }
            };
            return descriptor;
        };
    }
}
// Global profiler instance
export const globalProfiler = new PerformanceProfiler({
    enabled: process.env.NODE_ENV !== 'test',
    sampleRate: parseFloat(process.env.PROFILER_SAMPLE_RATE || '0.1'),
    enableMemoryProfiling: true,
    enableCpuProfiling: true,
    enableIoProfiling: false,
    memoryLeakThreshold: 10 * 1024 * 1024, // 10MB
    slowOperationThreshold: 1000, // 1 second
    retentionPeriod: 3600000, // 1 hour
    exportInterval: 300000, // 5 minutes
});
//# sourceMappingURL=performance-profiler.js.map