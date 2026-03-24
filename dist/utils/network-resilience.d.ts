/**
 * Network Resilience Utilities
 * Provides intelligent connection handling, retries, and fallbacks
 */
export interface NetworkOptions {
    timeout: number;
    retries: number;
    backoff: 'linear' | 'exponential';
    jitter: boolean;
    circuitBreaker?: CircuitBreakerOptions;
}
export interface CircuitBreakerOptions {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
}
export interface ConnectionResult {
    success: boolean;
    latency?: number;
    error?: string;
    fallbackUsed?: boolean;
}
export declare class NetworkResilience {
    private static readonly DEFAULT_OPTIONS;
    private static circuitBreakers;
    /**
     * Test network connectivity with resilience
     */
    static testConnection(host: string, port: number, options?: Partial<NetworkOptions>): Promise<ConnectionResult>;
    /**
     * Connect with intelligent retry and fallback
     */
    private static connectWithResilience;
    /**
     * Get or create circuit breaker for a connection
     */
    private static getCircuitBreaker;
    /**
     * Test multiple connection options and return the best one
     */
    static findBestConnection(connections: Array<{
        host: string;
        port: number;
        priority?: number;
    }>, options?: Partial<NetworkOptions>): Promise<{
        host: string;
        port: number;
        latency: number;
    } | null>;
    /**
     * Create adaptive timeout based on network conditions
     */
    static calculateAdaptiveTimeout(baseTimeout: number, recentLatencies: number[], percentile?: number): number;
}
/**
 * Network health monitor
 */
export declare class NetworkHealthMonitor {
    private latencyHistory;
    private readonly maxHistory;
    recordLatency(latency: number): void;
    getAverageLatency(): number;
    getPercentileLatency(percentile: number): number;
    isHealthy(maxLatency?: number): boolean;
    getHealthScore(): number;
}
//# sourceMappingURL=network-resilience.d.ts.map