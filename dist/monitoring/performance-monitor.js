/**
 * Performance Monitoring System with Metrics Collection and Alerting
 */
import { EventEmitter } from 'events';
import * as os from 'os';
import * as process from 'process';
import { performance } from 'perf_hooks';
import { formatDuration } from '../utils/common.js';
/**
 * Performance monitoring and metrics collection system
 */
export class PerformanceMonitor extends EventEmitter {
    constructor(logger) {
        super();
        this.alertRules = new Map();
        this.activeAlerts = new Map();
        this.metrics = {
            system: [],
            application: [],
            performance: [],
        };
        this.collectors = [];
        this.isMonitoring = false;
        this.collectionInterval = 30000; // 30 seconds
        this.retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        this.currentProfileStack = [];
        this.logger = logger;
        this.setupDefaultAlertRules();
    }
    /**
     * Start performance monitoring
     */
    start() {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        // System metrics collection
        const systemCollector = setInterval(() => {
            this.collectSystemMetrics();
        }, this.collectionInterval);
        this.collectors.push(systemCollector);
        // Application metrics collection
        const appCollector = setInterval(() => {
            this.collectApplicationMetrics();
        }, this.collectionInterval);
        this.collectors.push(appCollector);
        // Alert evaluation
        const alertEvaluator = setInterval(() => {
            this.evaluateAlerts();
        }, 10000); // Check alerts every 10 seconds
        this.collectors.push(alertEvaluator);
        // Cleanup old metrics
        const cleaner = setInterval(() => {
            this.cleanupOldMetrics();
        }, 60000); // Clean up every minute
        this.collectors.push(cleaner);
        this.logger.info('Performance monitoring started', {
            collectionInterval: this.collectionInterval,
            retentionPeriod: formatDuration(this.retentionPeriod),
        });
        this.emit('started');
    }
    /**
     * Stop performance monitoring
     */
    stop() {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        // Clear all collectors
        this.collectors.forEach(collector => clearInterval(collector));
        this.collectors = [];
        this.logger.info('Performance monitoring stopped');
        this.emit('stopped');
    }
    /**
     * Start performance profiling for an operation
     */
    startProfile(operation, metadata, tags) {
        const profile = {
            operation,
            startTime: performance.now(),
            metadata,
            tags,
            children: [],
        };
        // Add to current parent or root level
        if (this.currentProfileStack.length > 0) {
            const parent = this.currentProfileStack[this.currentProfileStack.length - 1];
            parent.children.push(profile);
        }
        else {
            this.metrics.performance.push(profile);
        }
        this.currentProfileStack.push(profile);
        const profileId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.logger.debug('Performance profiling started', { operation, profileId, metadata });
        return profileId;
    }
    /**
     * End performance profiling
     */
    endProfile(profileId) {
        if (this.currentProfileStack.length === 0) {
            this.logger.warn('No active performance profile to end');
            return null;
        }
        const profile = this.currentProfileStack.pop();
        profile.endTime = performance.now();
        profile.duration = profile.endTime - profile.startTime;
        this.logger.performance(profile.operation, profile.duration, {
            profileId,
            metadata: profile.metadata,
            tags: profile.tags,
            children: profile.children.length,
        });
        this.emit('profileCompleted', profile);
        return profile;
    }
    /**
     * Add custom metric
     */
    recordMetric(name, value, type = 'gauge', tags, metadata) {
        const metric = {
            name,
            value,
            type,
            timestamp: new Date(),
            tags,
            metadata,
        };
        this.logger.info('Custom metric recorded', metric);
        this.emit('customMetric', metric);
    }
    /**
     * Add alert rule
     */
    addAlertRule(rule) {
        this.alertRules.set(rule.id, rule);
        this.logger.info('Alert rule added', { ruleId: rule.id, name: rule.name });
        this.emit('alertRuleAdded', rule);
    }
    /**
     * Remove alert rule
     */
    removeAlertRule(ruleId) {
        if (this.alertRules.delete(ruleId)) {
            this.logger.info('Alert rule removed', { ruleId });
            this.emit('alertRuleRemoved', ruleId);
        }
    }
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId, acknowledgedBy, note) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert)
            return;
        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
        if (note) {
            alert.metadata.acknowledgmentNote = note;
        }
        this.logger.info('Alert acknowledged', {
            alertId,
            acknowledgedBy,
            note,
        });
        this.emit('alertAcknowledged', alert);
    }
    /**
     * Get current dashboard data
     */
    getDashboardData() {
        const latestSystem = this.getLatestMetric(this.metrics.system);
        const latestApplication = this.getLatestMetric(this.metrics.application);
        const activeAlertsArray = Array.from(this.activeAlerts.values());
        return {
            systemMetrics: latestSystem || this.createEmptySystemMetrics(),
            applicationMetrics: latestApplication || this.createEmptyApplicationMetrics(),
            activeAlerts: activeAlertsArray,
            recentPerformance: this.getRecentPerformanceData(),
            healthStatus: this.getHealthStatus(latestSystem, latestApplication, activeAlertsArray),
        };
    }
    /**
     * Get performance trends over time
     */
    getPerformanceTrends(hours = 24) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        const systemMetrics = this.metrics.system.filter(m => m.timestamp >= cutoffTime);
        const appMetrics = this.metrics.application.filter(m => m.timestamp >= cutoffTime);
        const timestamps = systemMetrics.map(m => m.timestamp);
        return {
            timestamps,
            metrics: {
                responseTime: appMetrics.map(m => m.requests.averageResponseTime),
                errorRate: appMetrics.map(m => m.requests.errorRate),
                throughput: appMetrics.map(m => m.requests.perSecond),
                memoryUsage: systemMetrics.map(m => m.memory.percentage),
                cpuUsage: systemMetrics.map(m => m.cpu.usage),
            },
        };
    }
    /**
     * Export metrics for external monitoring systems
     */
    exportMetrics(format = 'json') {
        const data = {
            system: this.getLatestMetric(this.metrics.system),
            application: this.getLatestMetric(this.metrics.application),
            alerts: Array.from(this.activeAlerts.values()),
            performance: this.getRecentPerformanceData(),
        };
        switch (format) {
            case 'prometheus':
                return this.formatPrometheusMetrics(data);
            case 'csv':
                return this.formatCsvMetrics(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }
    // Private methods
    collectSystemMetrics() {
        try {
            const metrics = {
                timestamp: new Date(),
                cpu: {
                    usage: this.getCpuUsage(),
                    loadAverage: os.loadavg(),
                    cores: os.cpus().length,
                },
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem(),
                    percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
                    heap: process.memoryUsage(),
                },
                disk: this.getDiskUsage(),
                network: this.getNetworkStats(),
            };
            this.metrics.system.push(metrics);
            this.emit('systemMetrics', metrics);
        }
        catch (error) {
            this.logger.error('Failed to collect system metrics', error);
        }
    }
    collectApplicationMetrics() {
        try {
            const metrics = {
                timestamp: new Date(),
                requests: this.getRequestMetrics(),
                database: this.getDatabaseMetrics(),
                ai: this.getAiMetrics(),
            };
            this.metrics.application.push(metrics);
            this.emit('applicationMetrics', metrics);
        }
        catch (error) {
            this.logger.error('Failed to collect application metrics', error);
        }
    }
    evaluateAlerts() {
        const latestSystem = this.getLatestMetric(this.metrics.system);
        const latestApplication = this.getLatestMetric(this.metrics.application);
        if (!latestSystem || !latestApplication)
            return;
        for (const rule of this.alertRules.values()) {
            if (!rule.enabled)
                continue;
            // Check cooldown period
            if (rule.lastTriggered) {
                const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
                if (timeSinceLastTrigger < rule.cooldownMs)
                    continue;
            }
            const currentValue = this.getMetricValue(rule.metric, latestSystem, latestApplication);
            const isTriggered = this.evaluateCondition(currentValue, rule.operator, rule.threshold);
            if (isTriggered) {
                this.triggerAlert(rule, currentValue);
            }
            else {
                // Check if we should resolve the alert
                const activeAlert = Array.from(this.activeAlerts.values()).find(a => a.ruleId === rule.id);
                if (activeAlert && !activeAlert.resolvedAt) {
                    this.resolveAlert(activeAlert);
                }
            }
        }
    }
    triggerAlert(rule, currentValue) {
        const alertId = `alert-${rule.id}-${Date.now()}`;
        const alert = {
            id: alertId,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            metric: rule.metric,
            currentValue,
            threshold: rule.threshold,
            operator: rule.operator,
            message: this.generateAlertMessage(rule, currentValue),
            triggeredAt: new Date(),
            acknowledged: false,
            metadata: {
                description: rule.description,
                channels: rule.channels,
            },
        };
        this.activeAlerts.set(alertId, alert);
        rule.lastTriggered = new Date();
        this.logger.error('Alert triggered', undefined, {
            alertId,
            ruleName: rule.name,
            metric: rule.metric,
            currentValue,
            threshold: rule.threshold,
            severity: rule.severity,
        });
        this.emit('alertTriggered', alert);
    }
    resolveAlert(alert) {
        alert.resolvedAt = new Date();
        this.logger.info('Alert resolved', {
            alertId: alert.id,
            ruleName: alert.ruleName,
            duration: formatDuration(alert.resolvedAt.getTime() - alert.triggeredAt.getTime()),
        });
        this.emit('alertResolved', alert);
        // Remove from active alerts after a delay to allow for notifications
        setTimeout(() => {
            this.activeAlerts.delete(alert.id);
        }, 300000); // 5 minutes
    }
    getMetricValue(metricPath, systemMetrics, appMetrics) {
        const path = metricPath.split('.');
        let value = { system: systemMetrics, app: appMetrics };
        for (const part of path) {
            value = value?.[part];
        }
        return typeof value === 'number' ? value : 0;
    }
    evaluateCondition(value, operator, threshold) {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'gte': return value >= threshold;
            case 'lt': return value < threshold;
            case 'lte': return value <= threshold;
            case 'eq': return value === threshold;
            default: return false;
        }
    }
    generateAlertMessage(rule, currentValue) {
        return `${rule.name}: ${rule.metric} is ${currentValue} (${rule.operator} ${rule.threshold})`;
    }
    setupDefaultAlertRules() {
        const defaultRules = [
            {
                id: 'high-cpu-usage',
                name: 'High CPU Usage',
                description: 'CPU usage is above 80%',
                metric: 'system.cpu.usage',
                operator: 'gt',
                threshold: 80,
                duration: 60000,
                severity: 'warning',
                enabled: true,
                channels: ['email', 'slack'],
                cooldownMs: 300000, // 5 minutes
            },
            {
                id: 'high-memory-usage',
                name: 'High Memory Usage',
                description: 'Memory usage is above 85%',
                metric: 'system.memory.percentage',
                operator: 'gt',
                threshold: 85,
                duration: 60000,
                severity: 'warning',
                enabled: true,
                channels: ['email', 'slack'],
                cooldownMs: 300000,
            },
            {
                id: 'high-error-rate',
                name: 'High Error Rate',
                description: 'Request error rate is above 5%',
                metric: 'app.requests.errorRate',
                operator: 'gt',
                threshold: 0.05,
                duration: 120000,
                severity: 'error',
                enabled: true,
                channels: ['email', 'slack', 'pagerduty'],
                cooldownMs: 600000, // 10 minutes
            },
            {
                id: 'slow-response-time',
                name: 'Slow Response Time',
                description: 'Average response time is above 5 seconds',
                metric: 'app.requests.averageResponseTime',
                operator: 'gt',
                threshold: 5000,
                duration: 300000,
                severity: 'warning',
                enabled: true,
                channels: ['slack'],
                cooldownMs: 300000,
            },
        ];
        for (const rule of defaultRules) {
            this.addAlertRule(rule);
        }
    }
    getCpuUsage() {
        // Simplified CPU usage calculation
        // In production, you'd use a more sophisticated method
        const usage = process.cpuUsage();
        const total = usage.user + usage.system;
        return (total / 1000000) / os.cpus().length; // Convert to percentage
    }
    getDiskUsage() {
        // Simplified disk usage - in production you'd use actual disk space queries
        return {
            total: 1000000000000, // 1TB
            used: 500000000000, // 500GB
            free: 500000000000, // 500GB
            percentage: 50,
        };
    }
    getNetworkStats() {
        // Simplified network stats - in production you'd use actual network metrics
        return {
            connections: 10,
            bytesIn: 1024000,
            bytesOut: 512000,
        };
    }
    getRequestMetrics() {
        // This would integrate with actual request tracking
        return {
            total: 1000,
            perSecond: 10.5,
            averageResponseTime: 250,
            errors: 15,
            errorRate: 0.015,
        };
    }
    getDatabaseMetrics() {
        // This would integrate with actual database metrics
        return {
            connections: {
                active: 8,
                idle: 12,
                total: 20,
            },
            queries: {
                total: 500,
                perSecond: 5.2,
                averageTime: 45,
                slowQueries: 3,
            },
            cache: {
                hitRate: 0.85,
                size: 1000000,
                memoryUsage: 256000000,
            },
        };
    }
    getAiMetrics() {
        // This would integrate with actual AI service metrics
        return {
            requests: {
                total: 50,
                perSecond: 0.8,
                averageTime: 1500,
                errors: 2,
            },
            tokens: {
                input: 25000,
                output: 15000,
                total: 40000,
            },
            costs: {
                totalUsd: 12.50,
                perRequest: 0.25,
            },
        };
    }
    getLatestMetric(metrics) {
        return metrics.length > 0 ? metrics[metrics.length - 1] : null;
    }
    cleanupOldMetrics() {
        const cutoffTime = new Date(Date.now() - this.retentionPeriod);
        this.metrics.system = this.metrics.system.filter(m => m.timestamp >= cutoffTime);
        this.metrics.application = this.metrics.application.filter(m => m.timestamp >= cutoffTime);
        this.metrics.performance = this.metrics.performance.filter(m => new Date(m.startTime) >= cutoffTime);
    }
    getRecentPerformanceData() {
        // Aggregate recent performance data
        const recentProfiles = this.metrics.performance.slice(-100);
        const operationStats = new Map();
        const errorStats = new Map();
        for (const profile of recentProfiles) {
            if (!profile.duration)
                continue;
            const existing = operationStats.get(profile.operation) || { totalTime: 0, count: 0 };
            existing.totalTime += profile.duration;
            existing.count++;
            operationStats.set(profile.operation, existing);
        }
        const operations = Array.from(operationStats.entries()).map(([name, stats]) => ({
            name,
            avgTime: stats.totalTime / stats.count,
            count: stats.count,
        }));
        return {
            operations,
            errors: Array.from(errorStats.entries()).map(([type, stats]) => ({
                type,
                count: stats.count,
                lastOccurred: stats.lastOccurred,
            })),
            trends: {
                responseTime: this.metrics.application.slice(-20).map(m => m.requests.averageResponseTime),
                errorRate: this.metrics.application.slice(-20).map(m => m.requests.errorRate),
                throughput: this.metrics.application.slice(-20).map(m => m.requests.perSecond),
                memoryUsage: this.metrics.system.slice(-20).map(m => m.memory.percentage),
            },
        };
    }
    getHealthStatus(systemMetrics, appMetrics, alerts) {
        const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolvedAt);
        const errorAlerts = alerts.filter(a => a.severity === 'error' && !a.resolvedAt);
        let overall = 'healthy';
        if (criticalAlerts.length > 0) {
            overall = 'critical';
        }
        else if (errorAlerts.length > 0 ||
            (systemMetrics && (systemMetrics.cpu.usage > 90 || systemMetrics.memory.percentage > 95))) {
            overall = 'critical';
        }
        else if (alerts.filter(a => a.severity === 'warning' && !a.resolvedAt).length > 0 ||
            (systemMetrics && (systemMetrics.cpu.usage > 80 || systemMetrics.memory.percentage > 85))) {
            overall = 'warning';
        }
        return {
            overall,
            services: [
                { name: 'SQLite Database', status: 'healthy', lastCheck: new Date() },
                { name: 'Neo4j Database', status: 'healthy', lastCheck: new Date() },
                { name: 'Redis Cache', status: 'healthy', lastCheck: new Date() },
                { name: 'AI Services', status: 'healthy', lastCheck: new Date() },
            ],
        };
    }
    createEmptySystemMetrics() {
        return {
            timestamp: new Date(),
            cpu: { usage: 0, loadAverage: [0, 0, 0], cores: os.cpus().length },
            memory: { total: 0, used: 0, free: 0, percentage: 0, heap: process.memoryUsage() },
            disk: { total: 0, used: 0, free: 0, percentage: 0 },
            network: { connections: 0, bytesIn: 0, bytesOut: 0 },
        };
    }
    createEmptyApplicationMetrics() {
        return {
            timestamp: new Date(),
            requests: { total: 0, perSecond: 0, averageResponseTime: 0, errors: 0, errorRate: 0 },
            database: {
                connections: { active: 0, idle: 0, total: 0 },
                queries: { total: 0, perSecond: 0, averageTime: 0, slowQueries: 0 },
                cache: { hitRate: 0, size: 0, memoryUsage: 0 },
            },
            ai: {
                requests: { total: 0, perSecond: 0, averageTime: 0, errors: 0 },
                tokens: { input: 0, output: 0, total: 0 },
                costs: { totalUsd: 0, perRequest: 0 },
            },
        };
    }
    formatPrometheusMetrics(data) {
        // Convert metrics to Prometheus format
        let output = '';
        if (data.system) {
            output += `# HELP system_cpu_usage CPU usage percentage\n`;
            output += `# TYPE system_cpu_usage gauge\n`;
            output += `system_cpu_usage ${data.system.cpu.usage}\n`;
            output += `# HELP system_memory_usage Memory usage percentage\n`;
            output += `# TYPE system_memory_usage gauge\n`;
            output += `system_memory_usage ${data.system.memory.percentage}\n`;
        }
        if (data.application) {
            output += `# HELP app_requests_total Total number of requests\n`;
            output += `# TYPE app_requests_total counter\n`;
            output += `app_requests_total ${data.application.requests.total}\n`;
            output += `# HELP app_response_time Average response time in milliseconds\n`;
            output += `# TYPE app_response_time gauge\n`;
            output += `app_response_time ${data.application.requests.averageResponseTime}\n`;
        }
        return output;
    }
    formatCsvMetrics(data) {
        // Convert metrics to CSV format
        const headers = ['timestamp', 'metric', 'value'];
        const rows = [headers.join(',')];
        const timestamp = new Date().toISOString();
        if (data.system) {
            rows.push(`${timestamp},cpu_usage,${data.system.cpu.usage}`);
            rows.push(`${timestamp},memory_usage,${data.system.memory.percentage}`);
        }
        if (data.application) {
            rows.push(`${timestamp},request_total,${data.application.requests.total}`);
            rows.push(`${timestamp},response_time,${data.application.requests.averageResponseTime}`);
        }
        return rows.join('\n');
    }
}
//# sourceMappingURL=performance-monitor.js.map