/**
 * Advanced SQLite Query Optimizer
 * Provides intelligent query analysis, optimization, and performance monitoring
 */
import type { SQLiteManager } from './sqlite-manager.js';
export interface QueryPlan {
    id: number;
    parent: number;
    notused: number;
    detail: string;
}
export interface QueryStats {
    query: string;
    hash: string;
    executionCount: number;
    totalTime: number;
    avgTime: number;
    lastExecuted: Date;
    queryPlan?: QueryPlan[];
    isOptimized: boolean;
}
export interface IndexRecommendation {
    table: string;
    columns: string[];
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImprovement: string;
}
/**
 * SQLite Query Optimizer and Performance Analyzer
 */
export declare class SQLiteOptimizer {
    private sqliteManager;
    private queryStats;
    private slowQueryThreshold;
    private analysisCache;
    constructor(sqliteManager: SQLiteManager);
    /**
     * Analyze query performance and generate execution plan
     */
    analyzeQuery(sql: string, params?: unknown[]): Promise<{
        plan: QueryPlan[];
        recommendations: IndexRecommendation[];
        performance: {
            executionTime: number;
            isOptimal: boolean;
            scanCount: number;
            indexUsage: string[];
        };
    }>;
    /**
     * Create recommended indexes based on query analysis
     */
    createOptimalIndexes(): Promise<{
        created: string[];
        failed: string[];
        performance: Record<string, number>;
    }>;
    /**
     * Optimize database configuration for performance
     */
    optimizeConfiguration(): Promise<void>;
    /**
     * Generate index recommendations based on query patterns
     */
    private generateIndexRecommendations;
    /**
     * Update query statistics
     */
    private updateQueryStats;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): {
        totalQueries: number;
        slowQueries: number;
        optimizedQueries: number;
        averageExecutionTime: number;
        topSlowQueries: QueryStats[];
    };
    /**
     * Generate performance report
     */
    generatePerformanceReport(): string;
    private extractWhereColumns;
    private extractJoinColumns;
    private extractOrderColumns;
    private extractSelectColumns;
    private extractTableName;
    private extractIndexName;
    private hashQuery;
}
//# sourceMappingURL=sqlite-optimizer.d.ts.map