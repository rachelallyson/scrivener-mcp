/**
 * Neo4j Query Optimizer and Performance Monitor
 * Provides intelligent query profiling, batching, and performance optimization
 */
import type { Driver, QueryResult } from 'neo4j-driver';
import type { QueryParameters } from '../../types/database.js';
export interface QueryProfile {
    query: string;
    parameters: QueryParameters;
    executionTime: number;
    dbTime: number;
    rows: number;
    plan?: QueryPlan;
    profiledAt: Date;
}
export interface QueryPlan {
    operatorType: string;
    identifiers: string[];
    arguments: Record<string, unknown>;
    children?: QueryPlan[];
    dbHits?: number;
    rows?: number;
    pageCacheHits?: number;
    pageCacheMisses?: number;
    time?: number;
}
export interface BatchOperation {
    query: string;
    parameters: QueryParameters[];
    maxBatchSize?: number;
    parallelism?: number;
}
export interface PerformanceMetrics {
    totalQueries: number;
    slowQueries: number;
    avgExecutionTime: number;
    avgDbTime: number;
    totalRows: number;
    cacheHitRatio: number;
    topSlowQueries: QueryProfile[];
    indexUsage: IndexUsageStats[];
    constraintViolations: number;
}
export interface IndexUsageStats {
    index: string;
    label: string;
    property: string;
    hits: number;
    misses: number;
    hitRatio: number;
}
export interface BatchResult {
    successful: number;
    failed: number;
    executionTime: number;
    errors: Error[];
}
/**
 * Advanced Neo4j query optimizer and performance monitor
 */
export declare class Neo4jOptimizer {
    private driver;
    private database;
    private queryProfiles;
    private slowQueryThreshold;
    private enableProfiling;
    constructor(driver: Driver, database?: string);
    /**
     * Execute and profile a Cypher query
     */
    profileQuery(cypher: string, parameters?: QueryParameters): Promise<{
        result: QueryResult;
        profile: QueryProfile;
    }>;
    /**
     * Execute batch operations with optimized parallelism
     */
    executeBatch(operation: BatchOperation): Promise<BatchResult>;
    /**
     * Optimize database schema with indexes and constraints
     */
    optimizeSchema(): Promise<{
        indexesCreated: string[];
        constraintsCreated: string[];
        recommendations: string[];
    }>;
    /**
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Generate optimization recommendations
     */
    generateRecommendations(): Promise<string[]>;
    /**
     * Enable or disable query profiling
     */
    setProfilingEnabled(enabled: boolean): void;
    /**
     * Clear collected performance data
     */
    clearProfiles(): void;
    /**
     * Export performance data for analysis
     */
    exportPerformanceData(): {
        metrics: PerformanceMetrics;
        profiles: Record<string, QueryProfile[]>;
        recommendations: string[];
    };
    private storeProfile;
    private normalizeQuery;
    private extractDbTime;
    private extractQueryPlan;
    private convertPlan;
    private extractCacheStats;
    private calculateIndexUsage;
    private analyzeIndexUsageInPlan;
    private analyzeIndexNeeds;
    private analyzeQueryPatterns;
}
//# sourceMappingURL=neo4j-optimizer.d.ts.map