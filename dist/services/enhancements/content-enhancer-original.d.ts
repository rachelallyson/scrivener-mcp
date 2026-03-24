import type { StyleGuide } from '../../memory-manager.js';
export type EnhancementType = 'rewrite' | 'expand' | 'condense' | 'improve-flow' | 'enhance-descriptions' | 'strengthen-dialogue' | 'fix-pacing' | 'add-sensory-details' | 'show-dont-tell' | 'eliminate-filter-words' | 'vary-sentences' | 'strengthen-verbs' | 'fix-continuity' | 'match-style';
export interface EnhancementOptions {
    documentId?: string;
    context?: string;
    tone?: 'maintain' | 'lighter' | 'darker' | 'more-serious' | 'more-humorous';
    length?: 'maintain' | 'shorter' | 'longer' | number;
    complexity?: 'simplify' | 'maintain' | 'elevate';
    perspective?: 'maintain' | 'first' | 'second' | 'third-limited' | 'third-omniscient';
    tense?: 'maintain' | 'past' | 'present' | 'future';
    preserveDialogue?: boolean;
    preserveNames?: boolean;
    aggressiveness?: 'light' | 'moderate' | 'heavy';
}
export interface EnhancementRequest {
    content: string;
    type: EnhancementType;
    options?: EnhancementOptions;
    styleGuide?: StyleGuide;
    context?: string;
}
export interface EnhancementResult {
    original: string;
    enhanced: string;
    changes: Change[];
    metrics: {
        originalWordCount: number;
        enhancedWordCount: number;
        readabilityChange: number;
        changesApplied: number;
        processingTime?: number;
    };
    suggestions: string[];
    qualityValidation?: {
        coherence: number;
        consistency: number;
        improvement: number;
        overallScore: number;
    };
}
export interface Change {
    type: string;
    original: string;
    replacement: string;
    reason: string;
    location: {
        start: number;
        end: number;
    };
}
export interface WritingPrompt {
    type: 'scene' | 'dialogue' | 'description' | 'action' | 'transition' | 'opening' | 'ending';
    context: string;
    constraints?: {
        wordCount?: {
            min?: number;
            max?: number;
        };
        includeCharacters?: string[];
        setting?: string;
        mood?: string;
        conflict?: string;
        pointOfView?: string;
    };
    styleGuide?: StyleGuide;
}
export interface GeneratedContent {
    content: string;
    type: string;
    wordCount: number;
    suggestions: string[];
    alternativeVersions?: string[];
}
export declare class ContentEnhancer {
    private classifier;
    constructor();
    enhance(request: EnhancementRequest): Promise<EnhancementResult>;
    private eliminateFilterWords;
    private strengthenVerbs;
    private varySentences;
    private addSensoryDetails;
    private enrichWithSensory;
    private analyzeContext;
    private detectSceneType;
    private generateSensoryEnhancement;
    private findBestInsertionPoint;
    private showDontTell;
    private detectTellingPatterns;
    private convertToShowing;
    private generateEmotionResponse;
    private improveFlow;
    private enhanceDescriptions;
    private generateContextualAdjective;
    private categorizeNoun;
    private strengthenDialogue;
    private analyzeDialogueEmotion;
    private selectContextualDialogueTag;
    private condenseContent;
    private fixPacing;
    private expandContent;
    private rewriteContent;
    private fixContinuity;
    private matchStyle;
    private shouldRemoveFilterWord;
    private shouldEnhanceNoun;
    private calculateGenericScore;
    private countSyllables;
    private lacksSensoryDetail;
    private calculateSensoryScore;
    private startsSimilarly;
    private varyOpening;
    private varyLength;
    private needsTransition;
    private detectTopicShift;
    private selectTransition;
    private analyzeTransitionType;
    private breakLongSentence;
    private expandSentence;
    private generateActionExpansion;
    private generateExpansion;
    private rewriteSentence;
    private parseContext;
    private findNameVariations;
    private convertTense;
    private isVerbPattern;
    private isCommonVerbStem;
    private applyTenseConversion;
    private makePastTense;
    private getIrregularForm;
    private getIrregularPresent;
    private simplifySentences;
    private complexifySentences;
    private combineSentences;
    private calculateReadabilityChange;
    private calculateTextMetrics;
    private countSyllablesAdvanced;
    private generateSuggestions;
    private isArticle;
}
//# sourceMappingURL=content-enhancer-original.d.ts.map