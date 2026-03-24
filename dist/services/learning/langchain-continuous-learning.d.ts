import { EventEmitter } from 'events';
export interface FeedbackData {
    sessionId: string;
    userId?: string;
    operation: string;
    input: unknown;
    output: unknown;
    userRating: number;
    userComments?: string;
    timestamp: Date;
    context: {
        documentType?: string;
        genre?: string;
        userExperience?: 'beginner' | 'intermediate' | 'advanced';
        targetAudience?: string;
        operation?: string;
        sessionId?: string;
        type?: string;
        engagementScore?: number;
        completionRate?: number;
    };
}
export interface PromptEvolution {
    templateId: string;
    originalPrompt: string;
    currentPrompt: string;
    performanceMetrics: {
        averageRating: number;
        successRate: number;
        usageCount: number;
        lastUpdated: Date;
    };
    variations: Array<{
        prompt: string;
        aTestResults: {
            ratingA: number;
            ratingB: number;
            significanceLevel: number;
        };
    }>;
}
export interface UserPersonalization {
    userId: string;
    preferences: {
        writingStyle: string[];
        tonePreferences: string[];
        contentTypes: string[];
        difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    };
    learningPatterns: {
        frequentOperations: string[];
        preferredFeedbackTypes: string[];
        responseToSuggestions: 'accepts_most' | 'selective' | 'rarely_accepts';
    };
    customizedPrompts: Map<string, string>;
    performanceHistory: Array<{
        operation: string;
        satisfaction: number;
        timestamp: Date;
    }>;
}
export interface LearningInsights {
    globalTrends: {
        popularOperations: string[];
        emergingPatterns: string[];
        commonIssues: string[];
    };
    promptOptimizations: {
        highPerformingPrompts: string[];
        underperformingPrompts: string[];
        suggestedImprovements: string[];
    };
    userBehaviorPatterns: {
        peakUsageTimes: string[];
        sessionLengths: number[];
        commonWorkflows: string[];
    };
}
export declare class LangChainContinuousLearning extends EventEmitter {
    private feedbackStore;
    private promptEvolutions;
    private userProfiles;
    private abTestingActive;
    private logger;
    private learningEnabled;
    constructor();
    initialize(): Promise<void>;
    collectFeedback(feedback: FeedbackData): Promise<void>;
    getPersonalizedPrompt(templateId: string, userId?: string, context?: Record<string, unknown>): Promise<string>;
    evolvePrompt(templateId: string): Promise<{
        prompt: string;
        confidence: number;
    }>;
    startABTest(templateId: string, variantPrompt: string): Promise<string>;
    getLearningInsights(): Promise<LearningInsights>;
    exportLearningData(): Promise<{
        feedback: FeedbackData[];
        promptEvolutions: PromptEvolution[];
        userProfiles: UserPersonalization[];
        insights: LearningInsights;
    }>;
    importLearningData(data: {
        feedback?: FeedbackData[];
        promptEvolutions?: PromptEvolution[];
        userProfiles?: UserPersonalization[];
    }): Promise<void>;
    private loadExistingData;
    private startPeriodicAnalysis;
    private performPeriodicAnalysis;
    private updateUserPersonalization;
    private analyzePromptPerformance;
    private personalizePrompt;
    private getFeedbackForTemplate;
    private analyzePromptEffectiveness;
    private generateImprovedPrompt;
    private identifyCommonIssues;
    private analyzeGlobalTrends;
    private identifyEmergingPatterns;
    private analyzePromptOptimizations;
    private analyzeUserBehaviorPatterns;
    private extractTemplateId;
    private getOptimizedPrompt;
}
//# sourceMappingURL=langchain-continuous-learning.d.ts.map