/**
 * Enhanced OpenAI Service with Comprehensive Resilience Patterns
 * Demonstrates integration of circuit breakers, retries, caching, metrics, and health checks
 */
export interface OpenAIConfig {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    enableResilience?: boolean;
    enableCaching?: boolean;
    cacheConfig?: {
        ttl?: number;
        enableL1?: boolean;
        enableL2?: boolean;
    };
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
/**
 * Enhanced OpenAI Service with full resilience integration
 */
export declare class EnhancedOpenAIService {
    private client;
    private config;
    private cache;
    private requestCounter;
    private errorCounter;
    private requestTimer;
    constructor(config?: OpenAIConfig);
    /**
     * Initialize resilience patterns
     */
    private initializeResilience;
    /**
     * Configure OpenAI service with API key
     */
    configure(config: OpenAIConfig): void;
    /**
     * Check if service is configured and ready
     */
    isConfigured(): boolean;
    /**
     * Get advanced writing suggestions using GPT with full resilience
     */
    getWritingSuggestions(text: string, context?: {
        genre?: string;
        targetAudience?: string;
        style?: string;
    }): Promise<WritingSuggestion[]>;
    /**
     * Analyze writing style using GPT with enhanced resilience
     */
    analyzeStyle(text: string): Promise<StyleAnalysis>;
    /**
     * Analyze character development and consistency with comprehensive resilience
     */
    analyzeCharacters(text: string, characterNames?: string[]): Promise<CharacterAnalysis[]>;
    /**
     * Get health status of the OpenAI service
     */
    getHealthStatus(): {
        configured: boolean;
        circuitBreaker: any;
        cache: any;
        metrics: any;
    };
    /**
     * Get service performance metrics
     */
    getPerformanceMetrics(): {
        totalRequests: number;
        errorRate: number;
        averageResponseTime: number;
        circuitBreakerStatus: string;
        cacheHitRatio?: number;
    };
    private buildSuggestionsPrompt;
    private buildStyleAnalysisPrompt;
    private buildCharacterAnalysisPrompt;
    private parseWritingSuggestions;
    private parseStyleAnalysis;
    private parseCharacterAnalysis;
    private getDefaultStyleAnalysis;
}
export declare const enhancedOpenAIService: EnhancedOpenAIService;
//# sourceMappingURL=openai-service-enhanced.d.ts.map