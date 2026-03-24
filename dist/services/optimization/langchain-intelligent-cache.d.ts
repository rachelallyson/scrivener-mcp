import { LangChainCache } from '../ai/langchain-optimizations.js';
export interface ContentEnhancementParams {
    content: string;
    style?: string;
    tone?: string;
    targetLength?: number;
    preserveVoice?: boolean;
    focusAreas?: string[];
}
export interface QueryOptimizationParams {
    query: string;
    context?: string;
    maxResults?: number;
    filters?: Record<string, unknown>;
}
export interface CompilationParams {
    documents: string[];
    format: string;
    includeMetadata?: boolean;
    template?: string;
    options?: Record<string, unknown>;
}
export interface AnalysisParams {
    content: string;
    analysisType: string;
    includeDetails?: boolean;
    options?: Record<string, unknown>;
}
export type OperationParams = ContentEnhancementParams | QueryOptimizationParams | CompilationParams | AnalysisParams | Record<string, unknown>;
export interface UsagePattern {
    operation: string;
    parameters: OperationParams;
    frequency: number;
    lastUsed: number;
    variations: Array<{
        params: OperationParams;
        frequency: number;
        similarity: number;
    }>;
}
export interface CacheStrategy {
    preGenerate: boolean;
    variations: number;
    ttl: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    warmupTrigger: number;
}
export interface OptimizationResult {
    originalQuery: OperationParams;
    optimizedQuery: OperationParams;
    cacheKey: string;
    estimatedSavings: number;
    confidence: number;
}
export interface CacheMetrics {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    averageResponseTime: number;
    memoryUsage: number;
    predictionAccuracy: number;
    costSavings: {
        tokensaved: number;
        estimatedDollars: number;
    };
}
export interface BatchOperation {
    id: string;
    operations: Array<{
        operation: string;
        params: unknown;
        priority: number;
    }>;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    results: Map<string, unknown>;
    startTime: number;
    completionTime?: number;
}
export declare class IntelligentLangChainCache extends LangChainCache {
    private predictor;
    private optimizer;
    private batchProcessor;
    private usagePatterns;
    private cacheStrategies;
    private metrics;
    private intelligentLogger;
    private langchain;
    private metricsTracker;
    constructor();
    /**
     * Get comprehensive metrics including operation performance
     */
    getOperationMetrics(): Record<string, import("../../utils/operation-metrics.js").MetricsResult>;
    private initializeMetrics;
    private initializeStrategies;
    private startMetricsCollection;
    intelligentCache(operation: string, params: OperationParams): Promise<unknown>;
    private executeWithIntelligentStrategies;
    private schedulePreGeneration;
    private generateParameterVariations;
    private varyStyleParameter;
    private varyLengthParameter;
    private varyToneParameter;
    private trackUsagePattern;
    private trackParameterVariations;
    private calculateParameterSimilarity;
    private generatePatternKey;
    private extractEssentialParameters;
    private categorizeLengthParameter;
    private hashObject;
    private getCategoryFromOperation;
    private mapOperationToTemplateType;
    private getPriorityScore;
    private recordCacheHit;
    private recordCacheMiss;
    private updateRunningAverage;
    private updateMetrics;
    private calculateMemoryUsage;
    private calculateCostSavings;
    private optimizeCacheStrategies;
    getMetrics(): CacheMetrics;
    getUsagePatterns(): Array<{
        operation: string;
        frequency: number;
        lastUsed: Date;
    }>;
    optimizeCache(): Promise<{
        evicted: number;
        compressed: number;
        reorganized: boolean;
    }>;
    warmupCache(operations: Array<{
        operation: string;
        params: OperationParams;
    }>): Promise<number>;
}
//# sourceMappingURL=langchain-intelligent-cache.d.ts.map