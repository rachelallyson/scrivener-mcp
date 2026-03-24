/**
 * Self-Healing Systems with Automatic Recovery
 * Circuit breakers, health checks, automatic failover, and recovery strategies
 */
import { EventEmitter } from 'events';
export interface HealthCheck {
    id: string;
    name: string;
    description: string;
    interval: number;
    timeout: number;
    retries: number;
    enabled: boolean;
    critical: boolean;
    check: () => Promise<HealthCheckResult>;
    onFailure?: (result: HealthCheckResult) => Promise<void>;
    onRecovery?: (result: HealthCheckResult) => Promise<void>;
}
export interface HealthCheckResult {
    id: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    details?: Record<string, unknown>;
    timestamp: number;
    duration: number;
    metadata?: Record<string, unknown>;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
    halfOpenMaxCalls: number;
    errorThresholdPercentage: number;
    volumeThreshold: number;
}
export interface CircuitBreakerState {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    successCount: number;
    lastFailureTime?: number;
    lastStateChange: number;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    recentCalls: Array<{
        timestamp: number;
        success: boolean;
        duration: number;
    }>;
}
export interface RecoveryStrategy {
    id: string;
    name: string;
    description: string;
    triggers: RecoveryTrigger[];
    actions: RecoveryAction[];
    cooldownPeriod: number;
    maxRetries: number;
    enabled: boolean;
    priority: number;
}
export interface RecoveryTrigger {
    type: 'health-check-failure' | 'circuit-breaker-open' | 'resource-exhaustion' | 'performance-degradation' | 'manual';
    conditions: Record<string, unknown>;
}
export interface RecoveryAction {
    type: 'restart-service' | 'clear-cache' | 'scale-resources' | 'failover' | 'throttle-requests' | 'custom';
    config: Record<string, unknown>;
    timeout: number;
    retries: number;
}
export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    lastUpdate: number;
    checks: Map<string, HealthCheckResult>;
    issues: SystemIssue[];
    recoveryActions: RecoveryExecution[];
}
export interface SystemIssue {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    source: string;
    detectedAt: number;
    resolvedAt?: number;
    status: 'open' | 'investigating' | 'resolved' | 'suppressed';
    metadata: Record<string, unknown>;
}
export interface RecoveryExecution {
    id: string;
    strategyId: string;
    triggeredBy: string;
    startedAt: number;
    completedAt?: number;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    actions: Array<{
        action: RecoveryAction;
        status: 'pending' | 'running' | 'completed' | 'failed';
        startedAt?: number;
        completedAt?: number;
        error?: Error;
        result?: unknown;
    }>;
    result?: {
        success: boolean;
        message: string;
        details?: Record<string, unknown>;
    };
}
export declare class CircuitBreaker extends EventEmitter {
    private config;
    private state;
    private name;
    constructor(name: string, config?: Partial<CircuitBreakerConfig>);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private shouldOpenCircuit;
    private shouldAttemptReset;
    private recordCall;
    getState(): CircuitBreakerState;
    reset(): void;
}
export declare class SelfHealingSystem extends EventEmitter {
    private healthChecks;
    private circuitBreakers;
    private recoveryStrategies;
    private systemHealth;
    private activeRecoveries;
    private suppressedIssues;
    private healthCheckTimer?;
    private cleanupTimer?;
    private isShuttingDown;
    constructor();
    registerHealthCheck(check: HealthCheck): void;
    unregisterHealthCheck(id: string): boolean;
    runHealthCheck(id: string): Promise<HealthCheckResult>;
    private createTimeoutPromise;
    createCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
    getCircuitBreaker(name: string): CircuitBreaker | undefined;
    registerRecoveryStrategy(strategy: RecoveryStrategy): void;
    triggerRecovery(strategyId: string, triggeredBy: string, _metadata?: Record<string, unknown>): Promise<string>;
    private executeRecoveryActions;
    private executeRecoveryAction;
    private executeRestartService;
    private executeClearCache;
    private executeScaleResources;
    private executeFailover;
    private executeThrottleRequests;
    private executeCustomAction;
    private createIssue;
    private evaluateRecoveryTriggers;
    private shouldTriggerRecovery;
    private updateSystemHealth;
    private setupDefaultStrategies;
    private setupPeriodicTasks;
    private runAllHealthChecks;
    private performCleanup;
    getSystemHealth(): SystemHealth;
    getCircuitBreakerStates(): Record<string, CircuitBreakerState>;
    shutdown(): Promise<void>;
    private generateId;
}
//# sourceMappingURL=self-healing.d.ts.map