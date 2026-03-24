/**
 * Advanced Object Pool Manager
 * Sophisticated object pooling system for high-frequency allocations
 * with automatic sizing, memory pressure response, and performance monitoring
 */
import { EventEmitter } from 'events';
export interface PoolConfig {
    name: string;
    initialSize: number;
    maxSize: number;
    minSize: number;
    factory: () => unknown;
    reset?: (obj: unknown) => void;
    validate?: (obj: unknown) => boolean;
    destroy?: (obj: unknown) => void;
    maxAge?: number;
    idleTimeout?: number;
    shrinkOnMemoryPressure?: boolean;
    warmupOnCreate?: boolean;
}
export interface PoolStatistics {
    name: string;
    totalCreated: number;
    totalDestroyed: number;
    totalBorrowed: number;
    totalReturned: number;
    currentSize: number;
    availableCount: number;
    borrowedCount: number;
    hitRate: number;
    averageCreateTime: number;
    averageResetTime: number;
    memoryUsage: number;
    peakSize: number;
    lastMaintenance: number;
}
export interface PoolManagerConfig {
    globalMaxObjects: number;
    memoryPressureThreshold: number;
    maintenanceInterval: number;
    enablePerformanceMonitoring: boolean;
    enableAutoSizing: boolean;
    autoSizingInterval: number;
}
export declare class ObjectPool<T> extends EventEmitter {
    private config;
    private pool;
    private borrowed;
    private stats;
    private createTimes;
    private resetTimes;
    private lastMaintenance;
    constructor(config: PoolConfig);
    /**
     * Borrow an object from the pool
     */
    borrow(): Promise<T>;
    /**
     * Return an object to the pool
     */
    return(obj: T): Promise<void>;
    /**
     * Perform pool maintenance
     */
    performMaintenance(): Promise<void>;
    /**
     * Get pool statistics
     */
    getStatistics(): PoolStatistics;
    /**
     * Drain the pool (destroy all objects)
     */
    drain(): Promise<void>;
    /**
     * Resize the pool
     */
    resize(newMinSize: number, newMaxSize: number): Promise<void>;
    /**
     * Warm up the pool to initial size
     */
    private warmUp;
    private getAvailableObject;
    private createObject;
    private destroyObject;
    private updateStatistics;
}
export declare class PoolManager extends EventEmitter {
    private pools;
    private config;
    private maintenanceInterval;
    private autoSizingInterval;
    private performanceHistory;
    constructor(config?: Partial<PoolManagerConfig>);
    /**
     * Create a new object pool
     */
    createPool<T>(config: PoolConfig): ObjectPool<T>;
    /**
     * Get a pool by name
     */
    getPool<T>(name: string): ObjectPool<T> | undefined;
    /**
     * Remove and drain a pool
     */
    removePool(name: string): Promise<void>;
    /**
     * Get statistics for all pools
     */
    getAllStatistics(): Map<string, PoolStatistics>;
    /**
     * Get global pool manager statistics
     */
    getGlobalStatistics(): {
        totalPools: number;
        totalObjects: number;
        totalMemoryUsage: number;
        averageHitRate: number;
        poolSummary: Array<{
            name: string;
            size: number;
            hitRate: number;
        }>;
    };
    /**
     * Drain all pools
     */
    drainAll(): Promise<void>;
    /**
     * Shutdown the pool manager
     */
    shutdown(): Promise<void>;
    private startMaintenance;
    private startAutoSizing;
    private performMaintenance;
    private handleMemoryPressure;
    private performAutoSizing;
    private setupPoolMonitoring;
}
export declare const globalPoolManager: PoolManager;
export declare function createStringPool(name: string, initialSize?: number, maxSize?: number): ObjectPool<string>;
export declare function createArrayPool<T>(name: string, initialSize?: number, maxSize?: number): ObjectPool<T[]>;
export declare function createObjectPool<T extends object>(name: string, factory: () => T, reset?: (obj: T) => void, initialSize?: number, maxSize?: number): ObjectPool<T>;
//# sourceMappingURL=object-pool.d.ts.map