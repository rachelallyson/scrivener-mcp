/**
 * OpenAI API Integration Service
 * Provides advanced AI-powered writing suggestions and analysis
 */
export interface OpenAIConfig {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}
export interface WritingSuggestion {
    type: 'grammar' | 'style' | 'clarity' | 'tone' | 'structure' | 'character' | 'plot';
    severity: 'low' | 'medium' | 'high';
    original: string;
    suggestion: string;
    explanation: string;
    confidence: number;
}
export interface StyleAnalysis {
    tone: string;
    voice: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: WritingSuggestion[];
}
export interface CharacterAnalysis {
    name: string;
    consistency: number;
    development: string;
    dialogue_quality: number;
    suggestions: string[];
}
export interface PlotAnalysis {
    pacing: 'slow' | 'moderate' | 'fast';
    tension: number;
    structure_issues: string[];
    plot_holes: string[];
    suggestions: string[];
}
export interface WritingPrompt {
    prompt: string;
    type: string;
    difficulty: string;
    estimatedWords: number;
    tips: string[];
    relatedCharacters: string[];
    suggestedTechniques: string[];
}
export interface WritingPromptsResponse {
    prompts: WritingPrompt[];
    overallTheme: string;
    writingGoals: string[];
}
export declare class OpenAIService {
    private client;
    private config;
    private rateLimiter;
    private metricsTracker;
    constructor(config?: OpenAIConfig);
    /**
     * Get operation metrics for monitoring
     */
    getOperationMetrics(): Record<string, import("../utils/operation-metrics.js").MetricsResult>;
    /**
     * Configure OpenAI service with API key
     */
    configure(config: OpenAIConfig): void;
    /**
     * Check if service is configured and ready
     */
    isConfigured(): boolean;
    /**
     * Get advanced writing suggestions using GPT with enhanced utility integration
     */
    getWritingSuggestions(text: string, context?: {
        genre?: string;
        targetAudience?: string;
        style?: string;
    }): Promise<WritingSuggestion[]>;
    /**
     * Analyze writing style using GPT with enhanced utility integration
     */
    analyzeStyle(text: string): Promise<StyleAnalysis>;
    /**
     * Analyze character development and consistency with enhanced processing
     */
    analyzeCharacters(text: string, characterNames?: string[]): Promise<CharacterAnalysis[]>;
    /**
     * Analyze plot structure and pacing with enhanced metrics
     */
    analyzePlot(text: string): Promise<PlotAnalysis>;
    /**
     * Analyze project context to generate more relevant prompts
     */
    analyzeProjectForPrompts(projectData: {
        characters: Array<{
            name: string;
            role?: string;
            traits?: string[];
        }>;
        plotThreads: Array<{
            name: string;
            status?: string;
        }>;
        themes: string[];
        genre?: string;
        recentScenes?: string[];
        wordCount?: number;
    }): Promise<{
        suggestedPromptTypes: string[];
        contextualThemes: string[];
        characterDevelopmentNeeds: string[];
        plotGaps: string[];
        recommendedExercises: string[];
    }>;
    /**
     * Analyze multiple texts in batch for efficiency
     */
    analyzeBatch(texts: string[], options?: {
        analysisTypes?: ('style' | 'suggestions' | 'plot' | 'characters')[];
        context?: {
            genre?: string;
            targetAudience?: string;
            style?: string;
        };
        batchSize?: number;
    }): Promise<Array<{
        text: string;
        textHash: string;
        results: {
            style?: StyleAnalysis;
            suggestions?: WritingSuggestion[];
            plot?: PlotAnalysis;
            characters?: CharacterAnalysis[];
        };
        processingTime: string;
        error?: string;
    }>>;
    /**
     * Generate intelligent, context-aware writing prompts
     */
    generateWritingPrompts(options?: {
        genre?: string;
        theme?: string;
        count?: number;
        complexity?: 'simple' | 'moderate' | 'complex';
        promptType?: 'scene' | 'character' | 'dialogue' | 'description' | 'conflict' | 'mixed';
        existingCharacters?: string[];
        currentPlotPoints?: string[];
        storyContext?: string;
        targetWordCount?: number;
        writingStyle?: string;
        mood?: string;
    }): Promise<{
        prompts: Array<{
            prompt: string;
            type: string;
            difficulty: string;
            estimatedWords: number;
            tips: string[];
            relatedCharacters?: string[];
            suggestedTechniques?: string[];
        }>;
        overallTheme: string;
        writingGoals: string[];
    }>;
    /**
     * Generate actual content based on a writing prompt
     */
    generateContent(prompt: string, options?: {
        length?: number;
        style?: 'narrative' | 'dialogue' | 'descriptive' | 'academic' | 'creative';
        tone?: string;
        perspective?: '1st' | '2nd' | '3rd';
        genre?: string;
        context?: string;
    }): Promise<{
        content: string;
        wordCount: number;
        type: string;
        suggestions: string[];
        alternativeVersions: string[];
    }>;
    /**
     * Get default content response when API fails
     */
    private getDefaultContentResponse;
    /**
     * Get default prompt response when API fails
     */
    private getDefaultPromptResponse;
    /**
     * Get default prompt by type
     */
    private getDefaultPromptByType;
    /**
     * Get default tips by prompt type
     */
    private getDefaultTips;
    /**
     * Get default techniques based on complexity
     */
    private getDefaultTechniques;
    /**
     * Get default writing goals
     */
    private getDefaultWritingGoals;
    /**
     * Map complexity to difficulty
     */
    private mapComplexityToDifficulty;
    /**
     * Build prompt for writing suggestions
     */
    private buildSuggestionsPrompt;
    /**
     * Parse writing suggestions from GPT response
     */
    private parseWritingSuggestions;
    /**
     * Parse style analysis from GPT response
     */
    private parseStyleAnalysis;
    /**
     * Parse character analysis from GPT response
     */
    private parseCharacterAnalysis;
    /**
     * Parse plot analysis from GPT response
     */
    private parsePlotAnalysis;
    /**
     * Default style analysis fallback
     */
    private getDefaultStyleAnalysis;
    /**
     * Default plot analysis fallback
     */
    private getDefaultPlotAnalysis;
}
export declare const openaiService: OpenAIService;
//# sourceMappingURL=openai-service.d.ts.map