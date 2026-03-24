/**
 * LangChain service for advanced AI operations
 * Provides document chunking, vector storage, and RAG capabilities
 * Enhanced with intelligent robustness: circuit breakers, adaptive rate limiting,
 * intelligent caching, predictive failure detection, and graceful degradation
 */
import type { Document as LangchainDocument } from 'langchain/document';
import type { ScrivenerDocument } from '../../types/index.js';
interface ChunkingOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}
interface RAGOptions {
    topK?: number;
    temperature?: number;
    maxTokens?: number;
}
export declare class LangChainService {
    private llm;
    private embeddings;
    private vectorStore;
    private textSplitter;
    private contexts;
    private logger;
    private utilRateLimiter;
    private operationMetrics;
    private circuitBreaker;
    private rateLimiter;
    private performanceMetrics;
    private intelligentCache;
    private healthScore;
    private degradationLevel;
    private fallbackResponses;
    private predictionModel;
    constructor(apiKey?: string);
    /**
     * Enhanced operation metrics tracking using common utilities
     */
    private updateOperationMetrics;
    /**
     * Enhanced circuit breaker implementation with utility integration
     */
    private withCircuitBreaker;
    /**
     * Adaptive rate limiter that adjusts based on success rates and system health
     */
    private checkRateLimit;
    /**
     * Intelligent cache with adaptive TTL and LRU eviction
     */
    private getCached;
    private setCached;
    private evictLRU;
    /**
     * Predictive failure detection using pattern analysis
     */
    private predictFailureRisk;
    private analyzeTimePatterns;
    private detectEscalation;
    /**
     * Graceful degradation system
     */
    private adjustDegradationLevel;
    private getFallbackResponse;
    /**
     * Health monitoring and metrics recording
     */
    private recordSuccess;
    private recordFailure;
    private updateHealthScore;
    private getLatencyPenalty;
    /**
     * Background monitoring processes
     */
    private startHealthMonitoring;
    private startCacheCleanup;
    private initializeFallbacks;
    /**
     * Process and chunk a document for vector storage
     */
    processDocument(document: ScrivenerDocument, options?: ChunkingOptions): Promise<LangchainDocument[]>;
    /**
     * Build or update vector store with documents
     */
    buildVectorStore(documents: ScrivenerDocument[]): Promise<void>;
    /**
     * Perform semantic search across documents
     */
    semanticSearch(query: string, topK?: number): Promise<LangchainDocument[]>;
    /**
     * Generate writing suggestions using RAG
     */
    generateWithContext(prompt: string, options?: RAGOptions): Promise<string>;
    /**
     * Analyze writing style from samples
     */
    analyzeWritingStyle(samples: string[]): Promise<Record<string, unknown>>;
    /**
     * Generate chapter summaries
     */
    summarizeChapter(content: string, maxLength?: number): Promise<string>;
    /**
     * Check plot consistency across documents
     */
    checkPlotConsistency(documents: ScrivenerDocument[]): Promise<Array<{
        issue: string;
        severity: 'low' | 'medium' | 'high';
        locations: string[];
        suggestion: string;
    }>>;
    /**
     * Get comprehensive service health status
     */
    getHealthStatus(): {
        healthScore: number;
        circuitBreakerState: string;
        degradationLevel: string;
        performanceMetrics: {
            avgLatency: number;
            errorRate: number;
            successRate: number;
        };
        failureRisk: number;
        cacheStats: {
            size: number;
            hitRate: number;
        };
    };
    /**
     * Force reset service to healthy state (for emergency recovery)
     */
    resetToHealthyState(): void;
    /**
     * Clear vector store and contexts
     */
    clearMemory(): void;
}
export {};
//# sourceMappingURL=langchain-service.d.ts.map