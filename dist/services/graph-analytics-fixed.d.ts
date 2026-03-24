/**
 * Fixed Graph Analytics with Memory Management and Query Optimization
 * Addresses memory leaks, N+1 queries, and production failures
 */
import type { Driver } from 'neo4j-driver';
interface CharacterNode {
    id: string;
    name: string;
    centrality: number;
    connections: number;
    cluster?: number;
}
interface CharacterNetwork {
    nodes: CharacterNode[];
    clusters: number;
    isolated: string[];
    density: number;
}
interface PlotAnalysis {
    threadCount: number;
    avgThreadLength: number;
    convergencePoints: number;
    complexity: number;
}
interface NarrativeStructure {
    chapters: ChapterInfo[];
    tensionCurve: number[];
    avgIntensity: number;
    climaxChapter: number;
}
interface ChapterInfo {
    id: string;
    title: string;
    characters: number;
    plotThreads: number;
    intensity: number;
}
export declare class GraphAnalytics {
    private driver;
    private readonly batchSize;
    private readonly scanLimit;
    private gdsAvailable;
    private rateLimiter;
    private performanceMetrics;
    private queryCache;
    private readonly cacheTimeout;
    constructor(driver: Driver);
    /**
     * Cache management utilities
     */
    private getCachedResult;
    private setCachedResult;
    private cleanupCache;
    /**
     * Track performance metrics
     */
    private trackPerformance;
    /**
     * Check if Graph Data Science library is available with caching and error handling
     */
    private checkGDSAvailability;
    /**
     * Safely get numeric value from Neo4j result with validation
     */
    private safeGetNumber;
    /**
     * Analyze character network with GDS or fallback, caching, and performance tracking
     */
    analyzeCharacterNetwork(): Promise<CharacterNetwork>;
    /**
     * GDS-based character network analysis
     */
    private analyzeCharacterNetworkGDS;
    /**
     * Basic character network analysis without GDS
     */
    private analyzeCharacterNetworkBasic;
    /**
     * Analyze plot threads
     */
    analyzePlotThreads(): Promise<PlotAnalysis>;
    /**
     * Analyze narrative structure
     */
    analyzeNarrativeStructure(): Promise<NarrativeStructure>;
    /**
     * Get timeline analysis
     */
    analyzeTimeline(): Promise<{
        events: Array<{
            id: string;
            date: string;
            description: string;
        }>;
        gaps: Array<{
            start: string;
            end: string;
            days: number;
        }>;
        density: number;
    }>;
    /**
     * Run comprehensive analysis
     */
    runFullAnalysis(): Promise<{
        characters: CharacterNetwork;
        plot: PlotAnalysis;
        narrative: NarrativeStructure;
        timeline: Record<string, unknown>;
    }>;
    /**
     * Get recommendation based on analysis
     */
    getRecommendations(): Promise<string[]>;
    /**
     * Enhanced batch analysis with transaction management and comprehensive error handling
     */
    performBatchAnalysis(documentIds: string[]): Promise<{
        characterNetworks: CharacterNetwork[];
        plotAnalyses: PlotAnalysis[];
        narrativeStructures: NarrativeStructure[];
        processingStats: {
            totalProcessed: number;
            successRate: number;
            avgProcessingTime: string;
            errors: string[];
        };
    }>;
    /**
     * Process a batch with proper transaction management
     */
    private processBatchWithTransaction;
    /**
     * Process individual document within transaction context
     */
    private processDocumentInTransaction;
    /**
     * Build character network from Neo4j records
     */
    private buildCharacterNetworkFromRecords;
}
export {};
//# sourceMappingURL=graph-analytics-fixed.d.ts.map