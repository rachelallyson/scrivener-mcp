import type { ImplicitFeedback } from '../services/learning/feedback-collection.js';
import type { FeedbackData, LearningInsights } from '../services/learning/langchain-continuous-learning.js';
import type { LearningRecommendation, PersonalizedContent } from '../services/learning/personalization-engine.js';
export interface LearningDataExport {
    userInsights: LearningInsights;
    feedbackHistory: FeedbackData[];
    behaviorPatterns: BehaviorData[];
    recommendations: LearningRecommendation[];
    exportTimestamp: string;
    version: string;
}
export interface BehaviorData {
    timeSpent: number;
    userActions: string[];
    scrollBehavior?: {
        scrollDepth: number;
        timeSpent: number;
    };
    editingBehavior?: {
        charactersTyped: number;
        deletions: number;
    };
    navigationBehavior?: {
        pagesVisited: string[];
        backNavigations: number;
    };
    enhancementType?: string;
    documentsCount?: number;
    targetOptimization?: string;
    materialType?: string;
    success?: boolean;
    context?: string;
    error?: string;
}
export interface OperationContext {
    documentId?: string;
    operation?: string;
    timestamp?: Date;
    userPreferences?: Record<string, unknown>;
    sessionData?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface UserPreferences {
    language?: string;
    writingStyle?: string;
    tone?: string;
    preferredPrompts?: string[];
    customSettings?: Record<string, unknown>;
}
export interface LearningDataExport {
    userId?: string;
    sessions?: Array<{
        sessionId: string;
        feedback: FeedbackData[];
        insights: LearningInsights;
    }>;
    userProfiles?: Record<string, UserPreferences>;
    systemMetrics?: Record<string, unknown>;
    continuousLearning?: unknown;
    personalization?: unknown;
}
export interface ContinuousLearningHandler {
    startFeedbackSession(sessionId: string, userId?: string): Promise<void>;
    collectFeedback(feedback: FeedbackData): Promise<void>;
    collectImplicitFeedback(sessionId: string, operation: string, behaviorData: BehaviorData): Promise<ImplicitFeedback>;
    endFeedbackSession(sessionId: string, options?: {
        showExitSurvey?: boolean;
        userId?: string;
    }): Promise<void>;
    personalizeContent(userId: string, content: string, operation: string, context?: OperationContext): Promise<PersonalizedContent>;
    getPersonalizedRecommendations(userId: string): Promise<LearningRecommendation[]>;
    createUserProfile(userId: string, preferences?: UserPreferences): Promise<void>;
    evolvePrompt(templateId: string): Promise<{
        prompt: string;
        confidence: number;
    }>;
    getPersonalizedPrompt(templateId: string, userId?: string, context?: OperationContext): Promise<string>;
    startABTest(templateId: string, variantPrompt: string): Promise<string>;
    getLearningInsights(): Promise<LearningInsights>;
    exportLearningData(userId?: string): Promise<LearningDataExport>;
    importLearningData(data: LearningDataExport): Promise<void>;
}
export declare class LangChainContinuousLearningHandler implements ContinuousLearningHandler {
    private continuousLearning;
    private feedbackCollection;
    private personalizationEngine;
    private logger;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    startFeedbackSession(sessionId: string, userId?: string): Promise<void>;
    collectFeedback(feedback: FeedbackData): Promise<void>;
    collectImplicitFeedback(sessionId: string, operation: string, behaviorData: BehaviorData): Promise<ImplicitFeedback>;
    endFeedbackSession(sessionId: string, options?: {
        showExitSurvey?: boolean;
        userId?: string;
    }): Promise<void>;
    personalizeContent(userId: string, content: string, operation: string, context?: OperationContext): Promise<PersonalizedContent>;
    getPersonalizedRecommendations(userId: string): Promise<LearningRecommendation[]>;
    createUserProfile(userId: string, preferences?: UserPreferences): Promise<void>;
    evolvePrompt(templateId: string): Promise<{
        prompt: string;
        confidence: number;
    }>;
    getPersonalizedPrompt(templateId: string, userId?: string, context?: OperationContext): Promise<string>;
    startABTest(templateId: string, variantPrompt: string): Promise<string>;
    getLearningInsights(): Promise<LearningInsights>;
    exportLearningData(userId?: string): Promise<LearningDataExport>;
    importLearningData(data: LearningDataExport): Promise<void>;
    enhanceWithLearning<T>(operation: string, baseFunction: () => Promise<T>, options: {
        sessionId: string;
        userId?: string;
        context?: OperationContext;
        collectFeedback?: boolean;
    }): Promise<T>;
    private setupEventListeners;
    private getPersonalizedContext;
}
//# sourceMappingURL=langchain-continuous-learning-handler.d.ts.map