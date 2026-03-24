/**
 * Advanced Writing Analytics Service
 * Provides deep insights into writing patterns, productivity, and quality
 */
import type { Neo4jManager } from './neo4j-manager.js';
import type { SQLiteManager } from './sqlite-manager.js';
export interface WritingPattern {
    mostProductiveTime: string;
    averageSessionLength: number;
    averageWordsPerSession: number;
    writingStreak: number;
    longestStreak: number;
    preferredSceneLength: number;
    dialogueToNarrativeRatio: number;
}
export interface ProductivityTrend {
    date: string;
    wordsWritten: number;
    sessionsCount: number;
    efficiency: number;
    quality: number;
}
export interface CharacterVoiceAnalysis {
    characterId: string;
    name: string;
    vocabularyComplexity: number;
    sentenceLength: number;
    distinctPhrases: string[];
    emotionalTone: string;
    speakingPatterns: string[];
    consistency: number;
}
export interface SceneEffectiveness {
    sceneId: string;
    title: string;
    purpose: 'action' | 'dialogue' | 'exposition' | 'transition';
    tensionLevel: number;
    characterCount: number;
    wordCount: number;
    effectiveness: number;
    suggestions: string[];
}
export declare class WritingAnalytics {
    private sqliteManager;
    private neo4jManager;
    constructor(sqliteManager: SQLiteManager | null, neo4jManager: Neo4jManager | null);
    /**
     * Analyze writing patterns and habits
     */
    analyzeWritingPatterns(): Promise<WritingPattern>;
    /**
     * Track productivity trends over time
     */
    getProductivityTrends(days?: number): Promise<ProductivityTrend[]>;
    /**
     * Analyze character voice consistency
     */
    analyzeCharacterVoices(): Promise<CharacterVoiceAnalysis[]>;
    /**
     * Analyze scene effectiveness
     */
    analyzeSceneEffectiveness(): Promise<SceneEffectiveness[]>;
    /**
     * Get personalized writing recommendations
     */
    getWritingRecommendations(): Promise<{
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
        exercises: Array<{
            title: string;
            description: string;
            benefit: string;
        }>;
    }>;
    /**
     * Track and predict project completion
     */
    predictProjectCompletion(targetWords: number): Promise<{
        currentWords: number;
        targetWords: number;
        percentComplete: number;
        estimatedCompletionDate: string;
        recommendedDailyWords: number;
        onTrack: boolean;
    }>;
    /**
     * Helper methods
     */
    private calculateDialogueRatio;
    private analyzeDialogue;
    private determineScenePurpose;
    private calculateSceneEffectiveness;
}
//# sourceMappingURL=writing-analytics.d.ts.map