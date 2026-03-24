import { ApplicationError as AppError, ErrorCode } from '../core/errors.js';
import { getLogger } from '../core/logger.js';
import { FeedbackCollectionService } from '../services/learning/feedback-collection.js';
import { LangChainContinuousLearning } from '../services/learning/langchain-continuous-learning.js';
import { PersonalizationEngine } from '../services/learning/personalization-engine.js';
export class LangChainContinuousLearningHandler {
    constructor() {
        this.initialized = false;
        this.continuousLearning = new LangChainContinuousLearning();
        this.feedbackCollection = new FeedbackCollectionService();
        this.personalizationEngine = new PersonalizationEngine();
        this.logger = getLogger('ContinuousLearningHandler');
        this.setupEventListeners();
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            await Promise.all([
                this.continuousLearning.initialize(),
                this.personalizationEngine.initialize(),
            ]);
            this.initialized = true;
            this.logger.info('Continuous learning handler initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize continuous learning handler', {
                error: error.message,
            });
            throw new AppError('Continuous learning initialization failed', ErrorCode.INITIALIZATION_ERROR);
        }
    }
    async startFeedbackSession(sessionId, userId) {
        if (!this.initialized) {
            await this.initialize();
        }
        try {
            await this.feedbackCollection.initializeSession(sessionId, userId);
            if (userId) {
                // Ensure user has a personalization profile
                const profile = await this.personalizationEngine.exportUserProfile(userId);
                if (!profile) {
                    await this.personalizationEngine.createUserProfile(userId);
                }
            }
            this.logger.debug('Feedback session started', { sessionId, userId });
        }
        catch (error) {
            this.logger.error('Failed to start feedback session', {
                sessionId,
                userId,
                error: error.message,
            });
            throw new AppError('Feedback session initialization failed', ErrorCode.INITIALIZATION_ERROR);
        }
    }
    async collectFeedback(feedback) {
        try {
            // Process feedback through continuous learning system
            await this.continuousLearning.collectFeedback(feedback);
            // Update personalization profile if user ID provided
            if (feedback.userId) {
                await this.personalizationEngine.updateUserProfile(feedback.userId, feedback);
            }
            this.logger.debug('Feedback collected and processed', {
                sessionId: feedback.sessionId,
                operation: feedback.operation,
                rating: feedback.userRating,
            });
        }
        catch (error) {
            this.logger.error('Failed to collect feedback', {
                error: error.message,
                feedback: feedback.sessionId,
            });
            throw new AppError('Feedback collection failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async collectImplicitFeedback(sessionId, operation, behaviorData) {
        try {
            const implicitFeedback = await this.feedbackCollection.collectImplicitFeedback(sessionId, operation, behaviorData);
            // Convert implicit feedback to explicit feedback format for learning system
            const explicitFeedback = {
                sessionId,
                operation,
                input: behaviorData,
                output: implicitFeedback,
                userRating: implicitFeedback.inferredSatisfaction,
                timestamp: new Date(),
                context: {
                    type: 'implicit',
                    engagementScore: implicitFeedback.engagementScore,
                    completionRate: implicitFeedback.usagePatterns.completionRate,
                },
            };
            await this.continuousLearning.collectFeedback(explicitFeedback);
            return implicitFeedback;
        }
        catch (error) {
            this.logger.error('Failed to collect implicit feedback', {
                sessionId,
                operation,
                error: error.message,
            });
            throw new AppError('Implicit feedback collection failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async endFeedbackSession(sessionId, options) {
        try {
            await this.feedbackCollection.endSession(sessionId, options);
            // Analyze session and generate insights
            const sessionAnalysis = await this.feedbackCollection.analyzeSessionFeedback(sessionId);
            if (options?.userId && sessionAnalysis.recommendations.length > 0) {
                this.logger.info('Session analysis completed', {
                    sessionId,
                    userId: options.userId,
                    recommendations: sessionAnalysis.recommendations.length,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to end feedback session', {
                sessionId,
                error: error.message,
            });
            // Don't throw here as session ending should be resilient
        }
    }
    async personalizeContent(userId, content, operation, context) {
        try {
            const personalizedContent = await this.personalizationEngine.personalizeContent(userId, content, operation, context);
            this.logger.debug('Content personalized', {
                userId,
                operation,
                personalizationScore: personalizedContent.metadata.personalizationScore,
                adaptations: personalizedContent.adaptations.length,
            });
            return personalizedContent;
        }
        catch (error) {
            this.logger.error('Content personalization failed', {
                userId,
                operation,
                error: error.message,
            });
            throw new AppError('Content personalization failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async getPersonalizedRecommendations(userId) {
        try {
            const recommendations = await this.personalizationEngine.generatePersonalizedRecommendations(userId);
            this.logger.debug('Generated personalized recommendations', {
                userId,
                count: recommendations.length,
            });
            return recommendations;
        }
        catch (error) {
            this.logger.error('Failed to get personalized recommendations', {
                userId,
                error: error.message,
            });
            return [];
        }
    }
    async createUserProfile(userId, preferences) {
        try {
            const profilePreferences = preferences
                ? {
                    writingPreferences: {
                        genres: [],
                        tonePreferences: preferences.tone &&
                            ['formal', 'casual', 'creative', 'academic', 'business'].includes(preferences.tone)
                            ? [
                                preferences.tone,
                            ]
                            : ['casual'],
                        styleGuides: [],
                        preferredLength: 'detailed',
                        complexityLevel: 'intermediate',
                    },
                }
                : undefined;
            await this.personalizationEngine.createUserProfile(userId, profilePreferences);
            this.logger.info('User profile created', { userId });
        }
        catch (error) {
            this.logger.error('Failed to create user profile', {
                userId,
                error: error.message,
            });
            throw new AppError('User profile creation failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async evolvePrompt(templateId) {
        try {
            const evolution = await this.continuousLearning.evolvePrompt(templateId);
            this.logger.debug('Prompt evolved', {
                templateId,
                confidence: evolution.confidence,
            });
            return evolution;
        }
        catch (error) {
            this.logger.error('Prompt evolution failed', {
                templateId,
                error: error.message,
            });
            throw new AppError('Prompt evolution failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async getPersonalizedPrompt(templateId, userId, context) {
        try {
            let prompt = await this.continuousLearning.getPersonalizedPrompt(templateId, userId, context);
            // Apply additional personalization if user ID provided
            if (userId) {
                const adaptiveSuggestions = await this.personalizationEngine.getAdaptivePromptSuggestions(userId, prompt, context || {});
                // Use the best suggestion if confidence is high
                if (adaptiveSuggestions.confidence > 0.7 &&
                    adaptiveSuggestions.suggestedPrompts.length > 0) {
                    prompt = adaptiveSuggestions.suggestedPrompts[0];
                    this.logger.debug('Applied adaptive prompt suggestion', {
                        templateId,
                        userId,
                        confidence: adaptiveSuggestions.confidence,
                    });
                }
            }
            return prompt;
        }
        catch (error) {
            this.logger.error('Failed to get personalized prompt', {
                templateId,
                userId,
                error: error.message,
            });
            throw new AppError('Personalized prompt retrieval failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async startABTest(templateId, variantPrompt) {
        try {
            const testId = await this.continuousLearning.startABTest(templateId, variantPrompt);
            this.logger.info('A/B test started', { templateId, testId });
            return testId;
        }
        catch (error) {
            this.logger.error('Failed to start A/B test', {
                templateId,
                error: error.message,
            });
            throw new AppError('A/B test initialization failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async getLearningInsights() {
        try {
            const insights = await this.continuousLearning.getLearningInsights();
            this.logger.debug('Learning insights generated', {
                globalTrends: insights.globalTrends.popularOperations.length,
                promptOptimizations: insights.promptOptimizations.highPerformingPrompts.length,
                userPatterns: insights.userBehaviorPatterns.commonWorkflows.length,
            });
            return insights;
        }
        catch (error) {
            this.logger.error('Failed to get learning insights', {
                error: error.message,
            });
            throw new AppError('Learning insights generation failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async exportLearningData(userId) {
        try {
            const continuousLearningData = await this.continuousLearning.exportLearningData();
            let personalizationData = null;
            if (userId) {
                personalizationData = await this.personalizationEngine.exportUserProfile(userId);
            }
            const exportData = {
                userInsights: continuousLearningData.insights || {
                    globalTrends: {
                        popularOperations: [],
                        emergingPatterns: [],
                        commonIssues: [],
                    },
                    promptOptimizations: {
                        highPerformingPrompts: [],
                        underperformingPrompts: [],
                        suggestedImprovements: [],
                    },
                    userBehaviorPatterns: {
                        peakUsageTimes: [],
                        sessionLengths: [],
                        commonWorkflows: [],
                    },
                },
                feedbackHistory: continuousLearningData.feedback || [],
                behaviorPatterns: (personalizationData?.behaviors || []).map((behavior) => {
                    const b = behavior;
                    return {
                        timeSpent: b.timeSpent || 0,
                        userActions: b.userActions || [],
                        scrollBehavior: b.scrollBehavior,
                        editingBehavior: b.editingBehavior,
                        navigationBehavior: b.navigationBehavior,
                        context: b.context,
                    };
                }),
                recommendations: (personalizationData?.recommendations || []).map((rec) => {
                    const r = rec;
                    return {
                        type: (['content', 'feature', 'workflow', 'settings'].includes(r.type)
                            ? r.type
                            : 'content'),
                        priority: (['low', 'medium', 'high'].includes(r.priority)
                            ? r.priority
                            : 'medium'),
                        title: r.title || r.content || '',
                        description: r.description || r.content || '',
                        actionable: r.actionable || true,
                        implementation: r.implementation || {
                            steps: [],
                            estimatedImpact: 0.5,
                            effort: 'medium',
                        },
                        ...r,
                    };
                }),
                exportTimestamp: new Date().toISOString(),
                version: '1.0',
            };
            this.logger.info('Learning data exported', {
                userId,
                feedbackCount: continuousLearningData.feedback.length,
                promptEvolutionsCount: continuousLearningData.promptEvolutions.length,
            });
            return exportData;
        }
        catch (error) {
            this.logger.error('Failed to export learning data', {
                userId,
                error: error.message,
            });
            throw new AppError('Learning data export failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    async importLearningData(data) {
        try {
            if (data.continuousLearning) {
                await this.continuousLearning.importLearningData(data.continuousLearning);
            }
            // Note: LearningDataExport doesn't currently include personalization data
            // This section is reserved for future personalization import functionality
            this.logger.info('Learning data imported successfully');
        }
        catch (error) {
            this.logger.error('Failed to import learning data', {
                error: error.message,
            });
            throw new AppError('Learning data import failed', ErrorCode.PROCESSING_ERROR);
        }
    }
    // Enhanced methods for integration with existing services
    async enhanceWithLearning(operation, baseFunction, options) {
        const { sessionId, userId, context, collectFeedback = true } = options;
        const startTime = Date.now();
        try {
            // Get personalized configuration for the operation
            let personalizedContext = context;
            if (userId) {
                // This could personalize parameters, prompts, etc.
                personalizedContext = await this.getPersonalizedContext(userId, operation, context || {});
            }
            // Execute the base function
            const result = await baseFunction();
            // Collect implicit feedback based on execution
            if (collectFeedback) {
                const executionTime = Date.now() - startTime;
                await this.collectImplicitFeedback(sessionId, operation, {
                    timeSpent: executionTime,
                    userActions: ['execute_operation'],
                    success: true,
                    context: typeof personalizedContext === 'string'
                        ? personalizedContext
                        : JSON.stringify(personalizedContext),
                });
            }
            return result;
        }
        catch (error) {
            // Collect error feedback
            if (collectFeedback) {
                const executionTime = Date.now() - startTime;
                await this.collectImplicitFeedback(sessionId, operation, {
                    timeSpent: executionTime,
                    userActions: ['execute_operation', 'encounter_error'],
                    success: false,
                    error: error.message,
                    context: typeof context === 'string' ? context : JSON.stringify(context),
                });
            }
            throw error;
        }
    }
    setupEventListeners() {
        this.feedbackCollection.on('feedbackCollected', (feedback) => {
            // Forward to continuous learning system
            this.continuousLearning.collectFeedback(feedback).catch((error) => {
                this.logger.error('Failed to forward feedback to continuous learning', {
                    error: error.message,
                });
            });
        });
        // Listen for implicit feedback events
        this.feedbackCollection.on('implicitFeedback', ({ sessionId, feedback }) => {
            // Could trigger additional analysis or learning
            this.logger.debug('Implicit feedback received', {
                sessionId,
                feedback: feedback.operation,
            });
        });
        // Listen for learning insights updates
        this.continuousLearning.on('insightsUpdated', (insights) => {
            this.logger.info('Learning insights updated', {
                popularOperations: insights.globalTrends.popularOperations.length,
            });
        });
        // Listen for prompt evolution events
        this.continuousLearning.on('promptEvolved', ({ templateId, confidence }) => {
            this.logger.info('Prompt evolved', { templateId, confidence });
        });
    }
    async getPersonalizedContext(userId, operation, baseContext) {
        try {
            // Get user profile for personalization
            const profile = await this.personalizationEngine.exportUserProfile(userId);
            if (!profile) {
                return baseContext;
            }
            // Apply personalized settings based on user preferences
            const personalizedContext = {
                ...baseContext,
                userPreferences: {
                    complexityLevel: profile.writingPreferences.complexityLevel,
                    tonePreferences: profile.writingPreferences.tonePreferences,
                    preferredLength: profile.writingPreferences.preferredLength,
                },
                adaptationSettings: profile.adaptationSettings,
            };
            return personalizedContext;
        }
        catch (error) {
            this.logger.warn('Failed to get personalized context', {
                userId,
                operation,
                error: error.message,
            });
            return baseContext;
        }
    }
}
//# sourceMappingURL=langchain-continuous-learning-handler.js.map