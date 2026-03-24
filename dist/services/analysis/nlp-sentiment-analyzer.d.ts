/**
 * Advanced NLP-based sentiment analyzer using Compromise.js
 * Fixes context issues like "unhappy" triggering as joy and "enjoying misery" double-counting
 */
export interface SentimentResult {
    score: number;
    comparative: number;
    emotion: string;
    confidence: number;
    tokens: TokenAnalysis[];
    negations: NegationContext[];
    context: string;
}
export interface TokenAnalysis {
    word: string;
    pos: string;
    sentiment: number;
    negated: boolean;
    intensifier?: string;
}
export interface NegationContext {
    negator: string;
    scope: string[];
    originalSentiment: string;
    invertedSentiment: string;
}
export interface EmotionVector {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
}
export declare class NLPSentimentAnalyzer {
    private readonly negationWords;
    private readonly intensifiers;
    private readonly emotionLexicon;
    /**
     * Analyzes sentiment with full context awareness
     */
    analyzeSentiment(text: string): SentimentResult;
    /**
     * Analyzes a sentence with full grammatical context
     */
    private analyzeSentenceWithContext;
    /**
     * Detects if a word is within negation scope
     */
    private isInNegationScope;
    /**
     * Gets intensifier for a word
     */
    private getIntensifier;
    /**
     * Applies intensifier effect to sentiment
     */
    private applyIntensifier;
    /**
     * Gets sentiment score for a word considering POS and negation
     */
    private getWordSentiment;
    /**
     * Gets emotion vector for a word
     */
    private getEmotionVector;
    /**
     * Detects negation contexts in a sentence
     */
    private detectNegationContexts;
    /**
     * Gets the scope of a negation word
     */
    private getNegationScope;
    /**
     * Gets emotion for a scope of words
     */
    private getScopeEmotion;
    /**
     * Gets dominant emotion from emotion vector
     */
    private getDominantEmotion;
    /**
     * Calculates confidence in sentiment analysis
     */
    private calculateConfidence;
    /**
     * Determines overall context of the text
     */
    private determineContext;
    /**
     * Extracts POS tag from Compromise tags
     */
    private extractPOSTag;
    /**
     * Analyzes emotional arc with proper context
     */
    analyzeEmotionalArc(text: string, segments?: number): Array<{
        position: number;
        emotion: string;
        intensity: number;
        sentiment: number;
        confidence: number;
    }>;
    /**
     * Detects pacing through linguistic analysis
     */
    analyzePacing(text: string): {
        overall: 'slow' | 'moderate' | 'fast' | 'variable';
        sentenceComplexity: number;
        actionDensity: number;
        dialogueRatio: number;
    };
}
export declare const nlpAnalyzer: NLPSentimentAnalyzer;
//# sourceMappingURL=nlp-sentiment-analyzer.d.ts.map