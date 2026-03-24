/**
 * Advanced Work Scheduler with Priority-Based Task Management
 * Enterprise-grade task scheduling with dynamic priority adjustment,
 * resource allocation, load balancing, and intelligent queue management
 */
import { EventEmitter } from 'events';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low' | 'background';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';
export type ResourceType = 'cpu' | 'memory' | 'io' | 'network' | 'custom';
export interface TaskDefinition<T = unknown, R = unknown> {
    id: string;
    name: string;
    priority: TaskPriority;
    estimatedDuration?: number;
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    dependencies?: string[];
    resources?: Partial<Record<ResourceType, number>>;
    tags?: string[];
    metadata?: Record<string, unknown>;
    execute: (input: T, context: TaskExecutionContext) => Promise<R> | R;
    onProgress?: (progress: number, message?: string) => void;
    onRetry?: (attempt: number, error: Error) => void;
    validate?: (input: T) => boolean | Promise<boolean>;
}
export interface TaskExecutionContext {
    taskId: string;
    attempt: number;
    startTime: number;
    signal: AbortSignal;
    updateProgress: (progress: number, message?: string) => void;
    setMetadata: (key: string, value: unknown) => void;
    getResource: <T>(type: ResourceType, id: string) => T | undefined;
}
export interface TaskInstance<T = unknown, R = unknown> {
    definition: TaskDefinition<T, R>;
    input: T;
    id: string;
    status: TaskStatus;
    priority: TaskPriority;
    scheduledAt: number;
    startedAt?: number;
    completedAt?: number;
    duration?: number;
    result?: R;
    error?: Error;
    attempts: number;
    maxRetries: number;
    progress: number;
    progressMessage?: string;
    metadata: Record<string, unknown>;
    abortController: AbortController;
    dependencies: string[];
    resourceAllocations: Partial<Record<ResourceType, number>>;
    estimatedCompletionTime?: number;
}
export interface WorkerConfig {
    id: string;
    maxConcurrentTasks: number;
    supportedPriorities: TaskPriority[];
    resourceCapacity: Partial<Record<ResourceType, number>>;
    specialization?: string[];
}
export interface SchedulerConfig {
    maxQueueSize: number;
    defaultTimeout: number;
    enableLoadBalancing: boolean;
    enablePriorityAging: boolean;
    priorityAgingInterval: number;
    enableResourceTracking: boolean;
    enableDeadlockDetection: boolean;
    deadlockCheckInterval: number;
    enablePerformanceOptimization: boolean;
    metricsRetentionPeriod: number;
}
export interface SchedulerMetrics {
    totalTasksScheduled: number;
    totalTasksCompleted: number;
    totalTasksFailed: number;
    averageExecutionTime: number;
    averageQueueTime: number;
    currentQueueSize: number;
    activeWorkers: number;
    resourceUtilization: Partial<Record<ResourceType, number>>;
    throughput: number;
    errorRate: number;
    priorityDistribution: Record<TaskPriority, number>;
}
export declare class AdvancedTaskScheduler extends EventEmitter {
    private config;
    private taskQueue;
    private runningTasks;
    private completedTasks;
    private workers;
    private globalResourceUsage;
    private globalResourceCapacity;
    private taskDefinitions;
    private dependencyGraph;
    private metrics;
    private isRunning;
    private schedulingInterval;
    private maintenanceInterval;
    private priorityAgingInterval;
    private deadlockCheckInterval;
    private performanceHistory;
    constructor(config?: Partial<SchedulerConfig>);
    /**
     * Start the scheduler
     */
    start(): Promise<void>;
    /**
     * Stop the scheduler gracefully
     */
    stop(gracefulShutdownTimeout?: number): Promise<void>;
    /**
     * Register a worker with the scheduler
     */
    registerWorker(config: WorkerConfig): void;
    /**
     * Unregister a worker
     */
    unregisterWorker(workerId: string, gracefulTimeout?: number): Promise<void>;
    /**
     * Submit a task for execution
     */
    submitTask<T, R>(definition: TaskDefinition<T, R>, input: T, options?: {
        priority?: TaskPriority;
        dependencies?: string[];
        estimatedDuration?: number;
        metadata?: Record<string, unknown>;
    }): Promise<string>;
    /**
     * Cancel a task
     */
    cancelTask(taskId: string, reason?: string): Promise<boolean>;
    /**
     * Get task status and details
     */
    getTaskStatus(taskId: string): TaskInstance | null;
    /**
     * Get scheduler metrics
     */
    getMetrics(): SchedulerMetrics;
    /**
     * Get detailed performance report
     */
    getPerformanceReport(): {
        metrics: SchedulerMetrics;
        workers: Array<{
            id: string;
            currentLoad: number;
            totalProcessed: number;
            averageDuration: number;
            resourceUtilization: Partial<Record<ResourceType, number>>;
        }>;
        queueAnalysis: {
            totalPending: number;
            priorityBreakdown: Record<TaskPriority, number>;
            averageWaitTime: number;
            oldestTaskAge: number;
        };
        resourceAnalysis: {
            globalUtilization: Partial<Record<ResourceType, number>>;
            globalCapacity: Partial<Record<ResourceType, number>>;
            bottlenecks: string[];
        };
        performanceTrends: Array<{
            timestamp: number;
            throughput: number;
            errorRate: number;
        }>;
    };
    private scheduleNextTasks;
    private assignTasksToWorkers;
    private findBestWorkerForTask;
    private canWorkerHandleTask;
    private calculateWorkerResourceScore;
    private executeTask;
    private completeTask;
    private allocateWorkerResources;
    private freeWorkerResources;
    private calculatePriorityScore;
    private calculateResourceScore;
    private sortTaskQueue;
    private areAllDependenciesComplete;
    private updateDependencyGraph;
    private validateDependencies;
    private performMaintenance;
    private performPriorityAging;
    private detectAndResolveDeadlocks;
    private findCyclesInWaitGraph;
    private updateMetrics;
    private recordPerformanceHistory;
    private cleanupCompletedTasks;
    private initializeResourceCapacity;
    private setupPerformanceMonitoring;
    private generateTaskId;
}
export declare const globalScheduler: AdvancedTaskScheduler;
//# sourceMappingURL=advanced-scheduler.d.ts.map