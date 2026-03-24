/**
 * Advanced Readability Metrics Service
 * Provides comprehensive text readability analysis using multiple algorithms
 * Implements standard readability formulas manually for reliability
 */
export interface ReadabilityMetrics {
    [key: string]: number | string | ReadingLevel | ReadabilityRecommendation[] | undefined;
    fleschReadingEase: number;
    fleschKincaidGrade: number;
    smogIndex: number;
    colemanLiauIndex: number;
    automatedReadabilityIndex: number;
    gunningFogIndex: number;
    linsearWriteFormula: number;
    textStandard: string;
    averageWordsPerSentence: number;
    daleChallReadabilityScore: number;
    gunningFog: number;
    syllableCount: number;
    lexiconCount: number;
    sentenceCount: number;
    characterCount: number;
    averageSentenceLength: number;
    averageSyllablesPerWord: number;
    averageLettersPerWord: number;
    difficultWords: number;
    readingTimeMinutes: number;
    readingLevel: ReadingLevel;
    comprehensionDifficulty: 'very_easy' | 'easy' | 'fairly_easy' | 'standard' | 'fairly_difficult' | 'difficult' | 'very_difficult';
    targetAudience: string;
    recommendations: ReadabilityRecommendation[];
}
export interface ReadabilityRecommendation {
    category: 'sentence_length' | 'vocabulary' | 'paragraph_structure' | 'word_choice' | 'overall_structure';
    severity: 'low' | 'medium' | 'high';
    issue: string;
    suggestion: string;
    impact: string;
}
export interface ReadingLevel {
    grade: number;
    description: string;
    ageRange: string;
    examples: string[];
}
export interface ComparativeAnalysis {
    text1: ReadabilityMetrics;
    text2: ReadabilityMetrics;
    comparison: {
        easier: 'text1' | 'text2' | 'similar';
        keyDifferences: string[];
        recommendations: string[];
    };
}
export interface ReadabilityTrends {
    segments: Array<{
        position: number;
        fleschScore: number;
        avgSentenceLength: number;
        difficultWords: number;
    }>;
    overallTrend: 'improving' | 'declining' | 'stable';
    problematicSections: number[];
    recommendations?: string[];
}
export declare class AdvancedReadabilityService {
    private readingSpeedWPM;
    /**
     * Calculate comprehensive readability metrics for text
     */
    calculateMetrics(text: string): ReadabilityMetrics;
    /**
     * Calculate metrics for multiple texts efficiently
     */
    calculateMetricsBatch(texts: string[]): Promise<ReadabilityMetrics[]>;
    /**
     * Compare readability between two texts
     */
    compareReadability(text1: string, text2: string): ComparativeAnalysis;
    /**
     * Analyze readability trends across document sections
     */
    analyzeReadabilityTrends(text: string, segmentCount?: number): ReadabilityTrends;
    /**
     * Get readability recommendations for specific audience
     */
    getAudienceSpecificRecommendations(text: string, targetAudience: 'elementary' | 'middle_school' | 'high_school' | 'college' | 'graduate' | 'general_public'): ReadabilityRecommendation[];
    /**
     * Calculate readability score for different writing contexts
     */
    getContextualReadability(text: string, context: 'academic' | 'business' | 'creative' | 'technical' | 'marketing' | 'educational'): {
        score: number;
        contextAppropriateness: string;
        suggestions: string[];
    };
    /**
     * Determine reading level from grade level score
     */
    private determineReadingLevel;
    /**
     * Determine comprehension difficulty from Flesch Reading Ease score
     */
    private determineComprehensionDifficulty;
    /**
     * Determine target audience based on metrics
     */
    private determineTargetAudience;
    /**
     * Generate readability recommendations
     */
    private generateRecommendations;
    /**
     * Get empty metrics for error cases
     */
    private getEmptyMetrics;
    /**
     * Determine which text is easier to read
     */
    private determineEasierText;
    /**
     * Identify key differences between two texts
     */
    private identifyKeyDifferences;
    /**
     * Generate comparative recommendations
     */
    private generateComparativeRecommendations;
    /**
     * Split text into segments for trend analysis
     */
    private splitTextIntoSegments;
    /**
     * Determine overall readability trend
     */
    private determineTrend;
    /**
     * Identify problematic sections with low readability
     */
    private identifyProblematicSections;
    /**
     * Get target grade level for audience
     */
    private getTargetGradeLevel;
    /**
     * Get audience-specific suggestions
     */
    private getAudienceSpecificSuggestions;
    /**
     * Get contextual ranges for different writing contexts
     */
    private getContextualRanges;
    /**
     * Manual text analysis methods
     */
    private countSentences;
    private countWords;
    private countSyllables;
    private syllablesInWord;
    private countCharacters;
    private countDifficultWords;
    private countComplexWords;
    private calculateFleschReadingEase;
    private calculateFleschKincaidGrade;
    private calculateSmogIndex;
    private calculateColemanLiauIndex;
    private calculateAutomatedReadabilityIndex;
    private calculateGunningFogIndex;
    private calculateLinsearWriteFormula;
    private determineTextStandard;
}
export declare const advancedReadabilityService: AdvancedReadabilityService;
//# sourceMappingURL=advanced-readability.d.ts.map