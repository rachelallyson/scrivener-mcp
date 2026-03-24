/**
 * Self-Healing Systems with Automatic Recovery
 * Circuit breakers, health checks, automatic failover, and recovery strategies
 */
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { AsyncUtils } from './shared-patterns.js';
export class CircuitBreaker extends EventEmitter {
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.config = {
            failureThreshold: 5,
            resetTimeout: 60000, // 1 minute
            monitoringPeriod: 300000, // 5 minutes
            halfOpenMaxCalls: 3,
            errorThresholdPercentage: 50,
            volumeThreshold: 10,
            ...config,
        };
        this.state = {
            state: 'closed',
            failures: 0,
            successCount: 0,
            lastStateChange: Date.now(),
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            recentCalls: [],
        };
    }
    async execute(operation) {
        if (this.state.state === 'open') {
            if (this.shouldAttemptReset()) {
                this.state.state = 'half-open';
                this.state.lastStateChange = Date.now();
                this.emit('state-change', { from: 'open', to: 'half-open', circuit: this.name });
            }
            else {
                const error = new Error(`Circuit breaker '${this.name}' is OPEN`);
                error.circuitBreakerOpen = true;
                throw error;
            }
        }
        if (this.state.state === 'half-open' &&
            this.state.successCount >= this.config.halfOpenMaxCalls) {
            const error = new Error(`Circuit breaker '${this.name}' is HALF-OPEN and at max calls`);
            error.circuitBreakerHalfOpen = true;
            throw error;
        }
        const startTime = performance.now();
        let success = false;
        let error;
        try {
            const result = await operation();
            success = true;
            this.onSuccess(performance.now() - startTime);
            return result;
        }
        catch (err) {
            error = err instanceof Error ? err : new Error(String(err));
            this.onFailure(performance.now() - startTime);
            throw error;
        }
        finally {
            this.recordCall(success, performance.now() - startTime);
        }
    }
    onSuccess(_duration) {
        this.state.totalCalls++;
        this.state.successfulCalls++;
        if (this.state.state === 'half-open') {
            this.state.successCount++;
            if (this.state.successCount >= this.config.halfOpenMaxCalls) {
                this.state.state = 'closed';
                this.state.failures = 0;
                this.state.successCount = 0;
                this.state.lastStateChange = Date.now();
                this.emit('state-change', { from: 'half-open', to: 'closed', circuit: this.name });
            }
        }
        else if (this.state.state === 'closed') {
            this.state.failures = Math.max(0, this.state.failures - 1); // Gradually recover
        }
    }
    onFailure(_duration) {
        this.state.totalCalls++;
        this.state.failedCalls++;
        this.state.failures++;
        this.state.lastFailureTime = Date.now();
        if (this.state.state === 'half-open') {
            this.state.state = 'open';
            this.state.lastStateChange = Date.now();
            this.emit('state-change', { from: 'half-open', to: 'open', circuit: this.name });
        }
        else if (this.state.state === 'closed' && this.shouldOpenCircuit()) {
            this.state.state = 'open';
            this.state.lastStateChange = Date.now();
            this.emit('state-change', { from: 'closed', to: 'open', circuit: this.name });
        }
    }
    shouldOpenCircuit() {
        // Check if we have enough volume
        if (this.state.totalCalls < this.config.volumeThreshold) {
            return false;
        }
        // Check failure threshold
        if (this.state.failures >= this.config.failureThreshold) {
            return true;
        }
        // Check error percentage in recent calls
        const now = Date.now();
        const recentCalls = this.state.recentCalls.filter((call) => now - call.timestamp < this.config.monitoringPeriod);
        if (recentCalls.length >= this.config.volumeThreshold) {
            const errorCount = recentCalls.filter((call) => !call.success).length;
            const errorPercentage = (errorCount / recentCalls.length) * 100;
            return errorPercentage >= this.config.errorThresholdPercentage;
        }
        return false;
    }
    shouldAttemptReset() {
        return Date.now() - this.state.lastStateChange >= this.config.resetTimeout;
    }
    recordCall(success, duration) {
        this.state.recentCalls.push({
            timestamp: Date.now(),
            success,
            duration,
        });
        // Keep only recent calls within monitoring period
        const cutoff = Date.now() - this.config.monitoringPeriod;
        this.state.recentCalls = this.state.recentCalls.filter((call) => call.timestamp > cutoff);
    }
    getState() {
        return { ...this.state };
    }
    reset() {
        this.state = {
            state: 'closed',
            failures: 0,
            successCount: 0,
            lastStateChange: Date.now(),
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            recentCalls: [],
        };
        this.emit('reset', { circuit: this.name });
    }
}
export class SelfHealingSystem extends EventEmitter {
    constructor() {
        super();
        this.healthChecks = new Map();
        this.circuitBreakers = new Map();
        this.recoveryStrategies = new Map();
        this.activeRecoveries = new Map();
        this.suppressedIssues = new Set();
        this.isShuttingDown = false;
        this.systemHealth = {
            status: 'healthy',
            score: 100,
            lastUpdate: Date.now(),
            checks: new Map(),
            issues: [],
            recoveryActions: [],
        };
        this.setupPeriodicTasks();
        this.setupDefaultStrategies();
    }
    // Health Check Management
    registerHealthCheck(check) {
        this.healthChecks.set(check.id, check);
        this.emit('health-check-registered', check);
    }
    unregisterHealthCheck(id) {
        const removed = this.healthChecks.delete(id);
        if (removed) {
            this.systemHealth.checks.delete(id);
            this.emit('health-check-unregistered', { id });
        }
        return removed;
    }
    async runHealthCheck(id) {
        const check = this.healthChecks.get(id);
        if (!check) {
            throw new Error(`Health check '${id}' not found`);
        }
        const startTime = performance.now();
        let attempt = 0;
        let lastError;
        while (attempt < check.retries + 1) {
            try {
                const result = await Promise.race([
                    check.check(),
                    this.createTimeoutPromise(check.timeout),
                ]);
                result.duration = performance.now() - startTime;
                result.timestamp = Date.now();
                this.systemHealth.checks.set(id, result);
                this.updateSystemHealth();
                if (result.status !== 'healthy' && check.onFailure) {
                    await check.onFailure(result);
                }
                else if (result.status === 'healthy' && check.onRecovery) {
                    const previousResult = this.systemHealth.checks.get(id);
                    if (previousResult && previousResult.status !== 'healthy') {
                        await check.onRecovery(result);
                    }
                }
                this.emit('health-check-completed', result);
                return result;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                attempt++;
                if (attempt < check.retries + 1) {
                    await AsyncUtils.sleep(1000 * attempt); // Exponential backoff
                }
            }
        }
        // All retries failed
        const failedResult = {
            id,
            status: 'unhealthy',
            message: `Health check failed after ${check.retries + 1} attempts: ${lastError?.message}`,
            details: { error: lastError?.message, attempts: attempt },
            timestamp: Date.now(),
            duration: performance.now() - startTime,
        };
        this.systemHealth.checks.set(id, failedResult);
        this.updateSystemHealth();
        if (check.onFailure) {
            await check.onFailure(failedResult);
        }
        this.emit('health-check-completed', failedResult);
        return failedResult;
    }
    async createTimeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), timeout);
        });
    }
    // Circuit Breaker Management
    createCircuitBreaker(name, config) {
        const breaker = new CircuitBreaker(name, config);
        this.circuitBreakers.set(name, breaker);
        breaker.on('state-change', (event) => {
            this.emit('circuit-breaker-state-change', event);
            if (event.to === 'open') {
                this.createIssue({
                    severity: 'high',
                    title: `Circuit Breaker Opened`,
                    description: `Circuit breaker '${name}' has opened due to failures`,
                    source: 'circuit-breaker',
                    metadata: { circuitBreaker: name, event },
                });
            }
        });
        this.emit('circuit-breaker-created', { name, breaker });
        return breaker;
    }
    getCircuitBreaker(name) {
        return this.circuitBreakers.get(name);
    }
    // Recovery Strategy Management
    registerRecoveryStrategy(strategy) {
        this.recoveryStrategies.set(strategy.id, strategy);
        this.emit('recovery-strategy-registered', strategy);
    }
    async triggerRecovery(strategyId, triggeredBy, _metadata) {
        const strategy = this.recoveryStrategies.get(strategyId);
        if (!strategy || !strategy.enabled) {
            throw new Error(`Recovery strategy '${strategyId}' not found or disabled`);
        }
        // Check cooldown
        const recentExecutions = this.systemHealth.recoveryActions.filter((action) => action.strategyId === strategyId &&
            Date.now() - action.startedAt < strategy.cooldownPeriod);
        if (recentExecutions.length > 0) {
            throw new Error(`Recovery strategy '${strategyId}' is in cooldown period`);
        }
        const execution = {
            id: this.generateId(),
            strategyId,
            triggeredBy,
            startedAt: Date.now(),
            status: 'running',
            actions: strategy.actions.map((action) => ({
                action,
                status: 'pending',
            })),
        };
        this.activeRecoveries.set(execution.id, execution);
        this.systemHealth.recoveryActions.push(execution);
        this.emit('recovery-started', execution);
        // Execute actions sequentially
        this.executeRecoveryActions(execution).catch((error) => {
            execution.status = 'failed';
            execution.completedAt = Date.now();
            execution.result = {
                success: false,
                message: `Recovery failed: ${error.message}`,
                details: { error: error.message },
            };
            this.emit('recovery-failed', execution);
        });
        return execution.id;
    }
    async executeRecoveryActions(execution) {
        try {
            for (const actionExecution of execution.actions) {
                actionExecution.status = 'running';
                actionExecution.startedAt = Date.now();
                try {
                    const result = await this.executeRecoveryAction(actionExecution.action);
                    actionExecution.status = 'completed';
                    actionExecution.completedAt = Date.now();
                    actionExecution.result = result;
                }
                catch (error) {
                    actionExecution.status = 'failed';
                    actionExecution.completedAt = Date.now();
                    actionExecution.error =
                        error instanceof Error ? error : new Error(String(error));
                    // Decide whether to continue or abort based on action criticality
                    if (actionExecution.action.config.critical) {
                        throw error;
                    }
                }
            }
            execution.status = 'completed';
            execution.completedAt = Date.now();
            execution.result = {
                success: true,
                message: 'Recovery completed successfully',
                details: {
                    actionsCompleted: execution.actions.filter((a) => a.status === 'completed')
                        .length,
                    actionsFailed: execution.actions.filter((a) => a.status === 'failed').length,
                },
            };
            this.emit('recovery-completed', execution);
        }
        finally {
            this.activeRecoveries.delete(execution.id);
        }
    }
    async executeRecoveryAction(action) {
        const timeout = action.timeout || 30000;
        const execute = async () => {
            switch (action.type) {
                case 'restart-service':
                    return this.executeRestartService(action.config);
                case 'clear-cache':
                    return this.executeClearCache(action.config);
                case 'scale-resources':
                    return this.executeScaleResources(action.config);
                case 'failover':
                    return this.executeFailover(action.config);
                case 'throttle-requests':
                    return this.executeThrottleRequests(action.config);
                case 'custom':
                    return this.executeCustomAction(action.config);
                default:
                    throw new Error(`Unknown recovery action type: ${action.type}`);
            }
        };
        return Promise.race([
            execute(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Recovery action timeout')), timeout)),
        ]);
    }
    async executeRestartService(config) {
        const serviceName = config.serviceName;
        this.emit('service-restart-requested', { serviceName });
        // Implementation would restart the actual service
        return `Service ${serviceName} restart initiated`;
    }
    async executeClearCache(config) {
        const cacheType = config.cacheType;
        this.emit('cache-clear-requested', { cacheType });
        // Implementation would clear the specified cache
        return `Cache ${cacheType} cleared`;
    }
    async executeScaleResources(config) {
        const resourceType = config.resourceType;
        const scaleFactor = config.scaleFactor;
        this.emit('resource-scaling-requested', { resourceType, scaleFactor });
        // Implementation would scale resources
        return `Resources scaled: ${resourceType} by factor ${scaleFactor}`;
    }
    async executeFailover(config) {
        const primaryService = config.primaryService;
        const fallbackService = config.fallbackService;
        this.emit('failover-requested', { primaryService, fallbackService });
        // Implementation would perform failover
        return `Failover completed: ${primaryService} -> ${fallbackService}`;
    }
    async executeThrottleRequests(config) {
        const throttleRate = config.throttleRate;
        this.emit('throttling-requested', { throttleRate });
        // Implementation would apply request throttling
        return `Request throttling applied: ${throttleRate}%`;
    }
    async executeCustomAction(config) {
        const handler = config.handler;
        if (typeof handler !== 'function') {
            throw new Error('Custom action handler must be a function');
        }
        return handler(config);
    }
    // Issue Management
    createIssue(issue) {
        const newIssue = {
            ...issue,
            id: this.generateId(),
            detectedAt: Date.now(),
            status: 'open',
        };
        this.systemHealth.issues.push(newIssue);
        this.emit('issue-detected', newIssue);
        // Auto-trigger recovery strategies
        this.evaluateRecoveryTriggers(newIssue);
        return newIssue;
    }
    evaluateRecoveryTriggers(issue) {
        for (const strategy of this.recoveryStrategies.values()) {
            if (!strategy.enabled)
                continue;
            for (const trigger of strategy.triggers) {
                if (this.shouldTriggerRecovery(trigger, issue)) {
                    this.triggerRecovery(strategy.id, `auto-trigger:${issue.id}`, { issue }).catch((error) => {
                        this.emit('auto-recovery-failed', {
                            strategy: strategy.id,
                            issue: issue.id,
                            error,
                        });
                    });
                    break; // Only trigger once per strategy
                }
            }
        }
    }
    shouldTriggerRecovery(trigger, issue) {
        switch (trigger.type) {
            case 'health-check-failure':
                return (issue.source === 'health-check' &&
                    issue.severity === trigger.conditions.severity);
            case 'circuit-breaker-open':
                return issue.source === 'circuit-breaker';
            case 'resource-exhaustion':
                return issue.source === 'resource-monitor' && issue.severity === 'critical';
            case 'performance-degradation':
                return issue.source === 'performance-monitor';
            default:
                return false;
        }
    }
    // System Health Management
    updateSystemHealth() {
        const checks = Array.from(this.systemHealth.checks.values());
        const totalChecks = checks.length;
        if (totalChecks === 0) {
            this.systemHealth.status = 'healthy';
            this.systemHealth.score = 100;
            return;
        }
        const healthyChecks = checks.filter((c) => c.status === 'healthy').length;
        const degradedChecks = checks.filter((c) => c.status === 'degraded').length;
        const unhealthyChecks = checks.filter((c) => c.status === 'unhealthy').length;
        // Calculate health score
        this.systemHealth.score = Math.round((healthyChecks * 100 + degradedChecks * 50 + unhealthyChecks * 0) / totalChecks);
        // Determine overall status
        if (unhealthyChecks > 0) {
            this.systemHealth.status = 'unhealthy';
        }
        else if (degradedChecks > 0) {
            this.systemHealth.status = 'degraded';
        }
        else {
            this.systemHealth.status = 'healthy';
        }
        this.systemHealth.lastUpdate = Date.now();
        this.emit('system-health-updated', this.systemHealth);
    }
    // Default Recovery Strategies
    setupDefaultStrategies() {
        // Memory pressure recovery
        this.registerRecoveryStrategy({
            id: 'memory-pressure-recovery',
            name: 'Memory Pressure Recovery',
            description: 'Clear caches and trigger garbage collection when memory usage is high',
            triggers: [
                {
                    type: 'resource-exhaustion',
                    conditions: { resource: 'memory', severity: 'high' },
                },
            ],
            actions: [
                {
                    type: 'clear-cache',
                    config: { cacheType: 'all' },
                    timeout: 10000,
                    retries: 1,
                },
                {
                    type: 'custom',
                    config: {
                        handler: async () => {
                            if (global.gc) {
                                global.gc();
                                return 'Garbage collection triggered';
                            }
                            return 'Garbage collection not available';
                        },
                    },
                    timeout: 5000,
                    retries: 0,
                },
            ],
            cooldownPeriod: 60000, // 1 minute
            maxRetries: 3,
            enabled: true,
            priority: 1,
        });
        // Circuit breaker recovery
        this.registerRecoveryStrategy({
            id: 'circuit-breaker-recovery',
            name: 'Circuit Breaker Recovery',
            description: 'Attempt to recover from circuit breaker failures',
            triggers: [
                {
                    type: 'circuit-breaker-open',
                    conditions: {},
                },
            ],
            actions: [
                {
                    type: 'throttle-requests',
                    config: { throttleRate: 50 },
                    timeout: 5000,
                    retries: 0,
                },
            ],
            cooldownPeriod: 120000, // 2 minutes
            maxRetries: 2,
            enabled: true,
            priority: 2,
        });
    }
    // Periodic Tasks
    setupPeriodicTasks() {
        // Run health checks
        this.healthCheckTimer = setInterval(() => {
            this.runAllHealthChecks();
        }, 30000); // Every 30 seconds
        // Cleanup old data
        this.cleanupTimer = setInterval(() => {
            this.performCleanup();
        }, 300000); // Every 5 minutes
    }
    async runAllHealthChecks() {
        if (this.isShuttingDown)
            return;
        const promises = Array.from(this.healthChecks.values())
            .filter((check) => check.enabled)
            .map((check) => this.runHealthCheck(check.id).catch((error) => {
            this.emit('health-check-error', { checkId: check.id, error });
        }));
        await Promise.allSettled(promises);
    }
    performCleanup() {
        const now = Date.now();
        const retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        // Clean up old issues
        this.systemHealth.issues = this.systemHealth.issues.filter((issue) => issue.status !== 'resolved' || now - (issue.resolvedAt || 0) < retentionPeriod);
        // Clean up old recovery actions
        this.systemHealth.recoveryActions = this.systemHealth.recoveryActions.filter((action) => now - action.startedAt < retentionPeriod);
        // Clean up old health check results
        for (const [id, result] of this.systemHealth.checks) {
            if (now - result.timestamp > retentionPeriod) {
                this.systemHealth.checks.delete(id);
            }
        }
    }
    // Public API
    getSystemHealth() {
        return { ...this.systemHealth };
    }
    getCircuitBreakerStates() {
        const states = {};
        for (const [name, breaker] of this.circuitBreakers) {
            states[name] = breaker.getState();
        }
        return states;
    }
    async shutdown() {
        if (this.isShuttingDown)
            return;
        this.isShuttingDown = true;
        if (this.healthCheckTimer)
            clearInterval(this.healthCheckTimer);
        if (this.cleanupTimer)
            clearInterval(this.cleanupTimer);
        // Cancel active recoveries
        for (const recovery of this.activeRecoveries.values()) {
            recovery.status = 'cancelled';
            recovery.completedAt = Date.now();
        }
        this.emit('shutdown');
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
//# sourceMappingURL=self-healing.js.map