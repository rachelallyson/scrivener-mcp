/**
 * Adaptive Timeout and Progress Monitoring Utilities
 * Consolidated implementation with proper state management and error handling
 */
import { EventEmitter } from 'events';
/**
 * Ring buffer for efficient memory management
 */
export declare class RingBuffer<T> {
    private buffer;
    private writeIndex;
    private size;
    constructor(size: number);
    push(item: T): void;
    getAll(): T[];
    clear(): void;
    getLatest(count: number): T[];
    get length(): number;
    slice(start?: number, end?: number): T[];
    get(index: number): T | undefined;
}
/**
 * Metrics collector for learning from past operations
 */
export declare class MetricsCollector {
    private metrics;
    recordOperation(operation: string, duration: number, success: boolean, progressIntervals: number[]): void;
    suggestTimeout(operation: string): {
        base: number;
        max: number;
        stall: number;
    };
}
export interface ProgressIndicator {
    type: 'output' | 'file_size' | 'network' | 'heartbeat' | 'completion_check';
    check: () => Promise<boolean | number>;
    description: string;
}
export interface AdaptiveTimeoutOptions {
    operation: string;
    baseTimeout: number;
    maxTimeout: number;
    progressIndicators?: ProgressIndicator[];
    stallTimeout?: number;
    completionCheck?: () => Promise<boolean>;
    onProgress?: (progress: ProgressUpdate) => void;
    useExponentialBackoff?: boolean;
    metricsCollector?: MetricsCollector;
}
export interface ProgressUpdate {
    timestamp: number;
    operation: string;
    progress?: number;
    message?: string;
    phase?: string;
    [key: string]: unknown;
}
export declare class AdaptiveTimeout extends EventEmitter {
    private options;
    private startTime;
    private lastProgressTime;
    private progressHistory;
    private timeoutHandle;
    private progressCheckHandle;
    private isCompleted;
    private isCancelled;
    constructor(options: AdaptiveTimeoutOptions);
    /**
     * Wait for operation completion with adaptive timeout
     */
    wait<T>(operationPromise: Promise<T>): Promise<T>;
    /**
     * Start progress monitoring with multiple indicators
     */
    private startProgressMonitoring;
    /**
     * Check progress using all available indicators
     */
    private checkProgress;
    /**
     * Record progress update
     */
    private recordProgress;
    /**
     * Extend timeout when progress is detected
     */
    private extendTimeout;
    /**
     * Handle timeout scenario
     */
    private handleTimeout;
    /**
     * Cancel the operation
     */
    cancel(): void;
    /**
     * Cleanup resources
     */
    private cleanup;
    /**
     * Get progress statistics
     */
    getProgressStats(): {
        elapsed: number;
        timeSinceProgress: number;
        progressEvents: number;
        averageProgressInterval: number;
    };
}
/**
 * Common progress indicators for different operation types
 */
export declare class ProgressIndicators {
    /**
     * Monitor command output for activity
     */
    static outputProgress(lastOutput: {
        value: string;
    }): ProgressIndicator;
    /**
     * Monitor file size changes
     */
    static fileSizeProgress(filePath: string): ProgressIndicator;
    /**
     * Monitor network connectivity
     */
    static networkProgress(host: string, port: number): ProgressIndicator;
    /**
     * Monitor process existence
     */
    static processHeartbeat(processName: string): ProgressIndicator;
}
//# sourceMappingURL=adaptive-timeout.d.ts.map