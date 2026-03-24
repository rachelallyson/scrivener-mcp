import type { CharacterAnalysis as OpenAICharacterAnalysis, PlotAnalysis as OpenAIPlotAnalysis, StyleAnalysis as OpenAIStyleAnalysis } from '../services/openai-service.js';
import type { ContentExtractionOptions, ParsedWebContent, ReadabilityComparison, ReadabilityMetrics, ReadabilityTrends, ResearchData, WritingSuggestion } from '../types/analysis.js';
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
export interface WritingMetrics {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageSentenceLength: number;
    averageParagraphLength: number;
    readingTime: number;
    fleschReadingEase: number;
    fleschKincaidGrade: number;
}
export interface StyleAnalysis {
    sentenceVariety: 'low' | 'medium' | 'high';
    vocabularyComplexity: 'simple' | 'moderate' | 'complex' | 'advanced';
    adverbUsage: 'minimal' | 'moderate' | 'heavy';
    passiveVoicePercentage: number;
    dialoguePercentage: number;
    descriptionPercentage: number;
    mostFrequentWords: {
        word: string;
        count: number;
    }[];
    styleConsistency: number;
}
export interface StructureAnalysis {
    sceneBreaks: number;
    chapters: number;
    averageSceneLength: number;
    openingStrength: 'weak' | 'moderate' | 'strong';
    endingStrength: 'weak' | 'moderate' | 'strong';
    hookPresence: boolean;
    cliffhangers: number;
}
export interface QualityIndicators {
    repetitiveness: number;
    cliches: string[];
    filterWords: string[];
    tellingVsShowing: number;
    sensoryDetails: 'lacking' | 'adequate' | 'rich';
    whiteSpace: 'cramped' | 'balanced' | 'excessive';
}
export interface Suggestion {
    type: 'style' | 'structure' | 'grammar' | 'clarity' | 'impact';
    severity: 'minor' | 'moderate' | 'major';
    location?: {
        paragraph: number;
        sentence?: number;
    };
    issue: string;
    suggestion: string;
    example?: string;
}
export interface EmotionalAnalysis {
    dominantEmotion: string;
    emotionalArc: {
        position: number;
        emotion: string;
        intensity: number;
    }[];
    tensionLevel: number;
    moodConsistency: number;
}
export interface PacingAnalysis {
    overall: 'slow' | 'moderate' | 'fast' | 'variable';
    sections: {
        start: number;
        end: number;
        pace: 'slow' | 'moderate' | 'fast';
    }[];
    actionVsReflection: number;
    recommendedAdjustments: string[];
}
export declare class ContentAnalyzer {
    private classifier;
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
    private commonWords;
    private clichePhrases;
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
    private calculateMetrics;
    private analyzeStyle;
    private analyzeStructure;
    private assessQuality;
    private generateSuggestions;
    private analyzeEmotions;
    private analyzePacing;
    private countSyllables;
    private calculateReadability;
    private calculateVariance;
    private assessOpeningStrength;
    private assessEndingStrength;
    private detectHook;
    private countCliffhangers;
    private splitIntoSegments;
    private detectSegmentEmotion;
    private isPassiveIndicator;
    private isCognitiveVerb;
    private analyzeEmotionPatterns;
    private isJoyWord;
    private isSadnessWord;
    private isAngerWord;
    private isFearWord;
    private isSurpriseWord;
    private isDisgustWord;
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
    private getDefaultStyleAnalysis;
    private getDefaultQualityIndicators;
    private getDefaultEmotionalAnalysis;
    private getDefaultPacingAnalysis;
    private getMinimalAnalysis;
    private calculateReadabilityWithWasm;
    private calculateReadabilityWithSIMD;
    private fallbackReadabilityCalculation;
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
}
//# sourceMappingURL=base-analyzer-original.d.ts.map