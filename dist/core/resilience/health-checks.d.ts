/**
 * Health Check System
 * Comprehensive health monitoring for services, databases, and external dependencies
 */
export declare enum HealthStatus {
    HEALTHY = "HEALTHY",
    DEGRADED = "DEGRADED",
    UNHEALTHY = "UNHEALTHY",
    UNKNOWN = "UNKNOWN"
}
export interface HealthCheckConfig {
    /** Unique name for the health check */
    name: string;
    /** Health check function */
    check: () => Promise<HealthCheckResult>;
    /** How often to run the check (ms) */
    interval: number;
    /** Timeout for individual checks (ms) */
    timeout: number;
    /** Number of consecutive failures before marking unhealthy */
    failureThreshold: number;
    /** Number of consecutive successes to mark healthy again */
    recoveryThreshold: number;
    /** Enable retries for transient failures */
    retryOnFailure: boolean;
    /** Tags for grouping and filtering */
    tags?: string[];
    /** Critical health check (affects overall system health) */
    critical: boolean;
    /** Enabled state */
    enabled: boolean;
}
export interface HealthCheckResult {
    status: HealthStatus;
    message?: string;
    details?: Record<string, unknown>;
    timestamp: number;
    responseTime: number;
    metadata?: Record<string, unknown>;
}
export interface SystemHealthStatus {
    status: HealthStatus;
    timestamp: number;
    checks: Record<string, HealthCheckResult>;
    summary: {
        total: number;
        healthy: number;
        degraded: number;
        unhealthy: number;
        unknown: number;
        critical: {
            total: number;
            healthy: number;
            unhealthy: number;
        };
    };
}
export declare class HealthCheck {
    private readonly config;
    private currentStatus;
    private consecutiveFailures;
    private consecutiveSuccesses;
    private lastCheck?;
    private checkInterval?;
    private readonly logger;
    private readonly retryStrategy;
    constructor(config: HealthCheckConfig);
    /**
     * Start periodic health checking
     */
    start(): void;
    /**
     * Stop periodic health checking
     */
    stop(): void;
    /**
     * Perform a single health check
     */
    performCheck(): Promise<HealthCheckResult>;
    /**
     * Get current health status
     */
    getCurrentStatus(): HealthStatus;
    /**
     * Get last check result
     */
    getLastResult(): HealthCheckResult | undefined;
    /**
     * Get health check configuration
     */
    getConfig(): HealthCheckConfig;
    private onCheckComplete;
    private transitionToStatus;
    private executeWithTimeout;
}
/**
 * Health Check Manager
 */
export declare class HealthCheckManager {
    private healthChecks;
    private readonly logger;
    /**
     * Register a health check
     */
    register(config: HealthCheckConfig): HealthCheck;
    /**
     * Unregister a health check
     */
    unregister(name: string): boolean;
    /**
     * Start all health checks
     */
    startAll(): void;
    /**
     * Stop all health checks
     */
    stopAll(): void;
    /**
     * Get health check by name
     */
    getHealthCheck(name: string): HealthCheck | undefined;
    /**
     * Get system health status
     */
    getSystemHealth(): SystemHealthStatus;
    /**
     * Get health checks by tag
     */
    getHealthChecksByTag(tag: string): HealthCheck[];
}
/**
 * Predefined Health Checks
 */
export declare class StandardHealthChecks {
    /**
     * Database connectivity health check
     */
    static database(name: string, checkFn: () => Promise<boolean>, config?: Partial<HealthCheckConfig>): HealthCheckConfig;
    /**
     * External API health check
     */
    static externalApi(name: string, url: string, config?: Partial<HealthCheckConfig>): HealthCheckConfig;
    /**
     * Memory usage health check
     */
    static memoryUsage(thresholdPercent?: number, config?: Partial<HealthCheckConfig>): HealthCheckConfig;
}
export declare const globalHealthManager: HealthCheckManager;
//# sourceMappingURL=health-checks.d.ts.map