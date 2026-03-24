/**
 * Professional ML-based word classifier using industry-standard NLP packages
 * Replaces custom implementations with battle-tested libraries
 */
export interface WordFeatures {
    word: string;
    length: number;
    syllables: number;
    frequency: number;
    position: 'start' | 'middle' | 'end';
    precedingWord?: string;
    followingWord?: string;
    sentenceLength: number;
    isCapitalized: boolean;
    hasPrefix: boolean;
    hasSuffix: boolean;
    partOfSpeech?: string;
    phonemePattern?: string;
    morphology?: string;
    sentiment?: number;
    stem?: string;
}
export interface ClassificationResult {
    isFilterWord: boolean;
    isCommonWord: boolean;
    isWeakVerb: boolean;
    isCliche: boolean;
    confidence: number;
    suggestedAlternative?: string;
    sentiment?: number;
    complexity?: number;
}
export declare class MLWordClassifierPro {
    private contextCache;
    private sentimentAnalyzer;
    private posTagger;
    private lexer;
    private readonly classificationCache;
    private readonly featureCache;
    private readonly performanceMetrics;
    private readonly maxCacheSize;
    private readonly maxWorkers;
    constructor();
    private initializeWorkerPool;
    private getCachedClassification;
    private setCachedClassification;
    private trackClassificationPerformance;
    /**
     * Enhanced classify with intelligent caching and optimization
     */
    classify(word: string, context: string, position: number): ClassificationResult;
    /**
     * Extract features using professional NLP tools
     */
    private extractAdvancedFeatures;
    /**
     * Perform classification using professional algorithms
     */
    private performProfessionalClassification;
    /**
     * Detect filter words using linguistic analysis
     */
    private detectFilterWord;
    /**
     * Detect common words using TF-IDF and frequency analysis
     */
    private detectCommonWord;
    /**
     * Detect weak verbs using semantic analysis
     */
    private detectWeakVerb;
    /**
     * Detect clichés using n-gram analysis
     */
    private detectCliche;
    /**
     * Generate smart alternatives using semantic similarity
     */
    private generateSmartAlternative;
    /**
     * Generate alternative from word stem
     */
    private generateFromStem;
    /**
     * Calculate word complexity score
     */
    private calculateComplexity;
    /**
     * Helper methods
     */
    private findWordIndex;
    private calculateTermFrequency;
    private detectPrefix;
    private detectSuffix;
    private countSyllables;
    private generatePhonemes;
    /**
     * Clear caches to free memory
     */
    clearCache(): void;
    /**
     * Batch classify multiple words for efficiency using batch processing
     */
    classifyBatch(words: string[], context: string): Promise<ClassificationResult[]>;
    /**
     * Analyze entire document for optimization suggestions with error handling
     */
    analyzeDocument(text: string): {
        filterWords: string[];
        weakVerbs: string[];
        cliches: string[];
        suggestions: Map<string, string>;
    };
    getPerformanceAnalytics(): {
        classifications: {
            total: number;
            cacheHits: number;
            computeTime: number;
        };
        cacheEfficiency: {
            hitRate: number;
            size: number;
            maxSize: number;
        };
        recommendations: string[];
    };
    optimizePerformance(): void;
}
export declare const classifier: MLWordClassifierPro;
export default MLWordClassifierPro;
//# sourceMappingURL=ml-word-classifier-pro.d.ts.map