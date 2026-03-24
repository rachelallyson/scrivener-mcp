import { EventEmitter } from 'events';
import type { FeedbackData } from './langchain-continuous-learning.js';
export interface PersonalizationProfile {
    userId: string;
    createdAt: Date;
    lastUpdated: Date;
    writingPreferences: {
        genres: string[];
        tonePreferences: ('formal' | 'casual' | 'creative' | 'academic' | 'business')[];
        styleGuides: string[];
        preferredLength: 'concise' | 'detailed' | 'comprehensive';
        complexityLevel: 'simple' | 'intermediate' | 'advanced';
    };
    behaviorPatterns: {
        activeHours: number[];
        sessionDuration: number;
        frequentOperations: Map<string, number>;
        preferredInputMethods: string[];
        responseSpeed: 'immediate' | 'thoughtful' | 'slow';
    };
    feedbackPatterns: {
        responsivenessToSuggestions: number;
        feedbackFrequency: number;
        commonComplaintTopics: string[];
        commonPraiseTopics: string[];
        satisfactionTrend: number[];
    };
    adaptationSettings: {
        enableLearning: boolean;
        adaptationSpeed: 'conservative' | 'moderate' | 'aggressive';
        privacyLevel: 'minimal' | 'balanced' | 'comprehensive';
        shareDataForImprovement: boolean;
    };
    behaviors?: Array<{
        action: string;
        frequency: number;
        context: string[];
    }>;
    recommendations?: Array<{
        type: string;
        content: string;
        priority: number;
    }>;
}
export interface PersonalizedContent {
    originalContent: string;
    personalizedContent: string;
    adaptations: {
        type: 'tone' | 'complexity' | 'length' | 'style' | 'examples';
        description: string;
        confidence: number;
    }[];
    metadata: {
        templateUsed: string;
        personalizationScore: number;
        processingTime: number;
    };
}
export interface LearningRecommendation {
    type: 'content' | 'feature' | 'workflow' | 'settings';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    actionable: boolean;
    implementation: {
        steps: string[];
        estimatedImpact: number;
        effort: 'low' | 'medium' | 'high';
    };
}
export declare class PersonalizationEngine extends EventEmitter {
    private userProfiles;
    private adaptationRules;
    private learningModels;
    private logger;
    private isLearning;
    constructor();
    initialize(): Promise<void>;
    createUserProfile(userId: string, initialPreferences?: Partial<PersonalizationProfile>): Promise<PersonalizationProfile>;
    updateUserProfile(userId: string, feedback: FeedbackData): Promise<void>;
    personalizeContent(userId: string, content: string, operation: string, context?: Record<string, unknown>): Promise<PersonalizedContent>;
    generatePersonalizedRecommendations(userId: string): Promise<LearningRecommendation[]>;
    getAdaptivePromptSuggestions(userId: string, basePrompt: string, context: Record<string, unknown>): Promise<{
        suggestedPrompts: string[];
        rationale: string[];
        confidence: number;
    }>;
    exportUserProfile(userId: string): Promise<PersonalizationProfile | null>;
    importUserProfile(profile: PersonalizationProfile): Promise<void>;
    private initializeAdaptationRules;
    private loadUserProfiles;
    private initializeLearningModels;
    private analyzeAndUpdateFeedbackTopics;
    private shouldAdaptTone;
    private shouldAdaptComplexity;
    private shouldAdaptLength;
    private shouldAdaptStyle;
    private adaptTone;
    private adaptComplexity;
    private adaptLength;
    private adaptStyle;
    private calculatePersonalizationScore;
    private generateWorkflowRecommendations;
    private generateFeatureRecommendations;
    private generateContentRecommendations;
    private simplifyPrompt;
    private enhancePrompt;
    private adaptPromptTone;
    private clarifyPrompt;
    private calculateAdaptationConfidence;
    private getTemplateId;
}
//# sourceMappingURL=personalization-engine.d.ts.map