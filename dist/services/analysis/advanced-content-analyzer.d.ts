/**
 * Advanced Content Analyzer with proper linguistic analysis
 * Fixes all the critical issues in the original implementation
 */
export interface SceneBreakAnalysis {
    totalBreaks: number;
    types: {
        explicit: number;
        temporal: number;
        spatial: number;
        povSwitch: number;
        whiteSpace: number;
    };
    averageSceneLength: number;
    sceneList: Array<{
        start: number;
        end: number;
        type: string;
        trigger?: string;
    }>;
}
export interface ShowVsTellAnalysis {
    ratio: number;
    issues: Array<{
        type: 'filter_word' | 'emotional_telling' | 'sensory_filter' | 'abstract_language';
        text: string;
        suggestion: string;
        location: {
            line: number;
            column: number;
        };
    }>;
    score: number;
}
export interface DialogueAttributionAnalysis {
    totalDialogueLines: number;
    attributionTypes: {
        said: number;
        saidBookisms: number;
        actionBeats: number;
        unattributed: number;
        adverbialTags: number;
    };
    efficiency: number;
    issues: string[];
    floatingDialogue: number;
}
export interface POVAnalysis {
    type: 'first' | 'second' | 'third_limited' | 'third_omniscient' | 'mixed';
    consistency: number;
    focalCharacter?: string;
    violations: Array<{
        type: 'head_hopping' | 'pov_shift' | 'omniscient_intrusion' | 'filter_word';
        text: string;
        location: {
            line: number;
            column: number;
        };
        severity: 'minor' | 'major';
    }>;
    narrativeDistance: 'intimate' | 'close' | 'medium' | 'distant' | 'variable';
}
export interface PassiveVoiceAnalysis {
    instances: Array<{
        sentence: string;
        passive: string;
        active_suggestion?: string;
        location: {
            line: number;
            column: number;
        };
    }>;
    percentage: number;
    byAgentPresent: number;
    agentlessPassives: number;
}
export declare class AdvancedContentAnalyzer {
    private syllableCache;
    /**
     * Accurate syllable counting using dictionary + fallback algorithm
     */
    countSyllables(word: string): number;
    /**
     * Calculate accurate readability scores
     */
    calculateReadability(text: string): {
        fleschReadingEase: number;
        fleschKincaidGrade: number;
        gunningFog: number;
        smog: number;
        automatedReadability: number;
    };
    /**
     * Intelligent scene break detection
     */
    detectSceneBreaks(text: string): SceneBreakAnalysis;
    /**
     * Sophisticated Show vs Tell analysis
     */
    analyzeShowVsTell(text: string): ShowVsTellAnalysis;
    /**
     * Comprehensive dialogue attribution analysis
     */
    analyzeDialogueAttribution(text: string): DialogueAttributionAnalysis;
    /**
     * Proper passive voice detection using grammatical parsing
     */
    detectPassiveVoice(text: string): PassiveVoiceAnalysis;
    /**
     * POV and focal character tracking
     */
    analyzePOV(text: string): POVAnalysis;
    /**
     * Generate content hash for proper caching
     */
    generateContentHash(content: string): string;
    /**
     * Create cache key using content hash
     */
    createCacheKey(documentId: string, content: string, analysisType: string): string;
}
export declare const advancedAnalyzer: AdvancedContentAnalyzer;
//# sourceMappingURL=advanced-content-analyzer.d.ts.map