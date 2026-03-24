import type { CharacterAnalysis as OpenAICharacterAnalysis, PlotAnalysis as OpenAIPlotAnalysis, StyleAnalysis as OpenAIStyleAnalysis } from '../services/openai-service.js';
import type { ContentExtractionOptions, ParsedWebContent, ReadabilityComparison, ReadabilityMetrics, ReadabilityTrends, ResearchData, WritingSuggestion } from '../types/analysis.js';
import { type WritingMetrics, type StyleAnalysis, type StructureAnalysis, type QualityIndicators, type EmotionalAnalysis, type PacingAnalysis, type Suggestion } from './analyzers/index.js';
export interface ContentAnalysis {
    documentId: string;
    timestamp: string;
    metrics: WritingMetrics;
    style: StyleAnalysis;
    structure: StructureAnalysis;
    quality: QualityIndicators;
    suggestions: Suggestion[];
    emotions: EmotionalAnalysis;
    pacing: PacingAnalysis;
}
export type { WritingMetrics, StyleAnalysis, StructureAnalysis, QualityIndicators, EmotionalAnalysis, PacingAnalysis, Suggestion };
export declare class ContentAnalyzer {
    private readonly memoizedCalculations;
    private readonly performanceMetrics;
    private readonly resourcePool;
    private readonly analysisQueue;
    private readonly predictiveAnalysisCache;
    private readonly predictiveMetricsCache;
    private readonly predictiveStyleCache;
    private isProcessingQueue;
    private maxCacheSize;
    private readonly maxPoolSize;
    private readonly simdProcessor;
    private readonly wasmProcessor;
    private isWasmInitialized;
    private readonly metricsAnalyzer;
    private readonly styleAnalyzer;
    private readonly structureAnalyzer;
    private readonly qualityAnalyzer;
    private readonly emotionAnalyzer;
    private readonly pacingAnalyzer;
    private readonly suggestionGenerator;
    constructor();
    /**
     * Initialize advanced optimization modules
     */
    initializeOptimizations(): Promise<void>;
    private memoizeAsync;
    private trackPerformance;
    private getResourceFromPool;
    private returnResourceToPool;
    private processAnalysisQueue;
    private performAnalysis;
    analyzeContent(content: string, documentId: string): Promise<ContentAnalysis>;
    analyzeContentDirect(content: string, documentId: string): Promise<ContentAnalysis>;
    private countSyllables;
    /**
     * Get advanced readability analysis using multiple algorithms
     */
    getAdvancedReadabilityAnalysis(content: string): Promise<ReadabilityMetrics>;
    /**
     * Compare readability between two texts
     */
    compareReadability(text1: string, text2: string): Promise<ReadabilityComparison>;
    /**
     * Analyze readability trends across document sections
     */
    analyzeReadabilityTrends(content: string, segments?: number): Promise<ReadabilityTrends>;
    /**
     * Get AI-powered writing suggestions using OpenAI
     */
    getAISuggestions(content: string, context?: {
        genre?: string;
        targetAudience?: string;
        style?: string;
    }): Promise<WritingSuggestion[]>;
    /**
     * Analyze writing style using AI
     */
    analyzeStyleWithAI(content: string): Promise<OpenAIStyleAnalysis | null>;
    /**
     * Analyze characters using AI
     */
    analyzeCharactersWithAI(content: string, characterNames?: string[]): Promise<OpenAICharacterAnalysis[]>;
    /**
     * Analyze plot structure using AI
     */
    analyzePlotWithAI(content: string): Promise<OpenAIPlotAnalysis | null>;
    /**
     * Parse HTML content and extract text
     */
    parseWebContent(html: string, baseUrl?: string, options?: ContentExtractionOptions): ParsedWebContent;
    /**
     * Convert HTML to Markdown
     */
    convertHtmlToMarkdown(html: string, options?: {
        preserveImages?: boolean;
        preserveLinks?: boolean;
    }): string;
    /**
     * Extract research data from web content
     */
    extractResearchData(parsedContent: ParsedWebContent, keywords?: string[]): ResearchData;
    /**
     * Configure OpenAI service
     */
    configureOpenAI(config: {
        apiKey?: string;
        model?: string;
        maxTokens?: number;
        temperature?: number;
    }): void;
    /**
     * Check if OpenAI is configured
     */
    isOpenAIConfigured(): boolean;
    /**
     * Generate writing prompts using AI
     */
    generateWritingPrompts(options?: {
        genre?: string;
        theme?: string;
        count?: number;
        complexity?: 'simple' | 'moderate' | 'complex';
        promptType?: 'scene' | 'character' | 'dialogue' | 'description' | 'conflict' | 'mixed';
        existingCharacters?: string[];
        currentPlotPoints?: string[];
        storyContext?: string;
        targetWordCount?: number;
        writingStyle?: string;
        mood?: string;
    }): Promise<{
        prompts: Array<{
            prompt: string;
            type: string;
            difficulty: string;
            estimatedWords: number;
            tips: string[];
            relatedCharacters?: string[];
            suggestedTechniques?: string[];
        }>;
        overallTheme: string;
        writingGoals: string[];
    }>;
    /**
     * Get the OpenAI service instance
     */
    getOpenAIService(): import("../services/openai-service.js").OpenAIService;
    getPerformanceMetrics(): {
        [operation: string]: {
            avg: number;
            min: number;
            max: number;
            count: number;
        };
    };
    getCacheEfficiency(): {
        hitRate: number;
        size: number;
        maxSize: number;
        lockFreeStats: {
            operations: Record<string, number>;
            contentions: Record<string, number>;
            throughput: Record<string, number>;
            uptime: number;
        };
    };
    getResourcePoolStatus(): {
        [type: string]: {
            used: number;
            max: number;
        };
    };
    analyzeContentStream(content: string, documentId: string, chunkSize?: number): AsyncGenerator<Partial<ContentAnalysis>, ContentAnalysis, unknown>;
    private intelligentChunk;
    private mergePartialAnalyses;
    private mergeMetrics;
    optimizeForPerformance(): void;
    analyzeWithOptimalStrategy(content: string, documentId: string): Promise<ContentAnalysis>;
    private analyzeContentWithWasm;
    private analyzeContentWithSIMD;
    /**
     * Get predictive cache statistics
     */
    getPredictiveCacheStats(): {
        analysisCache: {
            hitRate: number;
            prefetchHitRate: number;
            size: number;
            maxSize: number;
            entryCount: number;
        };
        metricsCache: {
            hitRate: number;
            prefetchHitRate: number;
            size: number;
            maxSize: number;
            entryCount: number;
        };
        styleCache: {
            hitRate: number;
            prefetchHitRate: number;
            size: number;
            maxSize: number;
            entryCount: number;
        };
        totalHitRate: number;
        totalPrefetchRate: number;
    };
    /**
     * Get optimization status and performance comparison
     */
    getOptimizationStatus(): {
        wasmEnabled: boolean;
        simdEnabled: boolean;
        lockFreeEnabled: boolean;
        predictiveCacheEnabled: boolean;
        performanceComparison: Record<string, unknown>;
        optimizationRecommendations: string[];
        lockFreeStats: {
            operations: Record<string, number>;
            contentions: Record<string, number>;
            throughput: Record<string, number>;
            uptime: number;
        };
        predictiveCacheStats: {
            analysisCache: {
                hitRate: number;
                prefetchHitRate: number;
                size: number;
                maxSize: number;
                entryCount: number;
            };
            metricsCache: {
                hitRate: number;
                prefetchHitRate: number;
                size: number;
                maxSize: number;
                entryCount: number;
            };
            styleCache: {
                hitRate: number;
                prefetchHitRate: number;
                size: number;
                maxSize: number;
                entryCount: number;
            };
            totalHitRate: number;
            totalPrefetchRate: number;
        };
    };
    private getDefaultStyleAnalysis;
    private getDefaultQualityIndicators;
    private getDefaultEmotionalAnalysis;
    private getDefaultPacingAnalysis;
    private getMinimalAnalysis;
}
//# sourceMappingURL=base-analyzer.d.ts.map