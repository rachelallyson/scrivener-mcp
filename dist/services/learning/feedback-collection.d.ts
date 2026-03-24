import { EventEmitter } from 'events';
import type { FeedbackData } from './langchain-continuous-learning.js';
export interface FeedbackWidget {
    id: string;
    sessionId: string;
    operation: string;
    timestamp: Date;
    isVisible: boolean;
    autoHideDelay?: number;
}
export interface FeedbackUI {
    showRatingDialog(options: {
        title: string;
        message: string;
        context?: Record<string, unknown>;
        onRating: (rating: number, comments?: string) => void;
        onSkip?: () => void;
    }): void;
    showInlineRating(options: {
        elementId: string;
        operation: string;
        onRating: (rating: number) => void;
    }): void;
    collectImplicitFeedback(options: {
        operation: string;
        userActions: string[];
        timeSpent: number;
    }): ImplicitFeedback;
}
export interface ImplicitFeedback {
    operation: string;
    engagementScore: number;
    usagePatterns: {
        timeSpent: number;
        actionsPerformed: string[];
        completionRate: number;
    };
    inferredSatisfaction: number;
}
export interface FeedbackPrompt {
    trigger: 'completion' | 'time_based' | 'error' | 'session_end';
    timing: {
        delay?: number;
        frequency?: 'always' | 'periodic' | 'adaptive';
    };
    content: {
        question: string;
        followUpQuestions?: string[];
        contextualHints?: string[];
    };
}
export declare class FeedbackCollectionService extends EventEmitter {
    private activeWidgets;
    private feedbackPrompts;
    private sessionData;
    private logger;
    private adaptivePrompting;
    private userFeedbackHistory;
    constructor();
    initializeSession(sessionId: string, userId?: string): Promise<void>;
    collectExplicitFeedback(sessionId: string, operation: string, result: unknown, options?: {
        immediate?: boolean;
        customPrompt?: string;
        userId?: string;
    }): Promise<void>;
    collectImplicitFeedback(sessionId: string, operation: string, behaviorData: {
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
    }): Promise<ImplicitFeedback>;
    showContextualFeedbackPrompt(options: {
        sessionId: string;
        operation: string;
        context: {
            documentType?: string;
            currentContent?: string;
            userGoal?: string;
        };
        result: unknown;
        userId?: string;
    }): Promise<void>;
    setupMicroFeedback(options: {
        sessionId: string;
        operations: string[];
        thumbsUpDown?: boolean;
        starRating?: boolean;
        quickComments?: string[];
    }): Promise<void>;
    analyzeSessionFeedback(sessionId: string): Promise<{
        explicitFeedback: FeedbackData[];
        implicitMetrics: {
            engagementScore: number;
            completionRate: number;
            errorRate: number;
            sessionDuration: number;
        };
        recommendations: string[];
    }>;
    endSession(sessionId: string, options?: {
        showExitSurvey?: boolean;
        userId?: string;
    }): Promise<void>;
    private initializePrompts;
    private setupAdaptivePrompting;
    private shouldPromptForFeedback;
    private calculateEngagementScore;
    private calculateCompletionRate;
    private inferSatisfaction;
    private generateContextualPrompt;
    private showFeedbackDialog;
    private showFeedbackPrompt;
    private processFeedback;
    private getSessionFeedback;
    private calculateSessionEngagement;
    private generateSessionRecommendations;
    private showExitSurvey;
    private setPromptFrequency;
}
//# sourceMappingURL=feedback-collection.d.ts.map