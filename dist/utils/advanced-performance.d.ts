/**
 * Advanced Performance Profiler and Memory Management
 * Enterprise-grade performance monitoring with memory pressure detection,
 * automatic optimization, and predictive resource management
 */
import * as v8 from 'v8';
import { EventEmitter } from 'events';
export interface PerformanceMetrics {
    timestamp: number;
    operation: string;
    duration: number;
    memoryUsage: NodeJS.MemoryUsage;
    heapSnapshot?: v8.HeapSpaceStatistics[];
    cpuUsage: NodeJS.CpuUsage;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export interface MemoryPressureLevel {
    level: 'low' | 'medium' | 'high' | 'critical';
    heapUsedPercent: number;
    heapAvailablePercent: number;
    recommendation: 'continue' | 'throttle' | 'cleanup' | 'emergency_cleanup';
}
export interface ProfilerConfig {
    enableHeapProfiling: boolean;
    enableCpuProfiling: boolean;
    memoryThresholds: {
        medium: number;
        high: number;
        critical: number;
    };
    gcThresholds: {
        frequency: number;
        memoryPressure: number;
    };
    metricsRetention: number;
    aggregationWindow: number;
}
export interface OperationProfile {
    name: string;
    totalCalls: number;
    totalDuration: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    errorRate: number;
    throughput: number;
    memoryImpact: number;
    lastExecuted: number;
    trending: 'improving' | 'stable' | 'degrading';
}
export interface PredictiveInsights {
    memoryPressureTrend: 'decreasing' | 'stable' | 'increasing';
    nextGcPrediction: number;
    operationBottlenecks: string[];
    resourceRecommendations: string[];
    performanceScore: number;
}
export declare class AdvancedPerformanceProfiler extends EventEmitter {
    private config;
    private metrics;
    private operationProfiles;
    private correlationTracker;
    private memoryBaseline;
    private lastGc;
    private gcStats;
    private cpuBaseline;
    private isProfilingActive;
    private cleanupInterval;
    private monitoringInterval;
    constructor(config?: Partial<ProfilerConfig>);
    /**
     * Start advanced performance profiling
     */
    startProfiling(): Promise<void>;
    /**
     * Stop profiling and cleanup
     */
    stopProfiling(): Promise<void>;
    /**
     * Profile an operation with advanced metrics
     */
    profileOperation<T>(operationName: string, operation: () => Promise<T> | T, metadata?: Record<string, unknown>): Promise<T>;
    /**
     * Get current memory pressure level
     */
    getMemoryPressure(): MemoryPressureLevel;
    /**
     * Get comprehensive operation profiles
     */
    getOperationProfiles(): Map<string, OperationProfile>;
    /**
     * Get predictive insights based on collected metrics
     */
    getPredictiveInsights(): PredictiveInsights;
    /**
     * Force garbage collection if conditions are met
     */
    forceGarbageCollection(reason?: string): Promise<boolean>;
    /**
     * Get detailed performance report
     */
    getPerformanceReport(): {
        summary: {
            totalOperations: number;
            averageResponseTime: number;
            memoryEfficiency: number;
            errorRate: number;
            uptime: number;
        };
        operationProfiles: OperationProfile[];
        memoryAnalysis: {
            current: MemoryPressureLevel;
            trend: string;
            gcFrequency: number;
            recommendations: string[];
        };
        insights: PredictiveInsights;
    };
    private recordMetric;
    private updateOperationProfile;
    private updateOperationProfiles;
    private checkMemoryPressure;
    private performMaintenance;
    private performEmergencyCleanup;
    private setupGcMonitoring;
    private startBackgroundMonitoring;
    private generateCorrelationId;
    private getPercentile;
    private analyzeMemoryTrend;
    private identifyBottlenecks;
    private generateRecommendations;
    private calculatePerformanceScore;
    private predictNextGc;
    private calculateMemoryEfficiency;
    private calculateGcFrequency;
    private performPredictiveAnalysis;
}
export declare const globalProfiler: AdvancedPerformanceProfiler;
//# sourceMappingURL=advanced-performance.d.ts.map