/**
 * Enhanced OpenAI Service with Comprehensive Resilience Patterns
 * Demonstrates integration of circuit breakers, retries, caching, metrics, and health checks
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import OpenAI from 'openai';
import { getLogger } from '../core/logger.js';
import { AppError, ErrorCode, generateHash, handleError, safeParse, safeStringify, truncate, validateInput, } from '../utils/common.js';
import { getTextMetrics } from '../utils/text-metrics.js';
// Import resilience patterns
import { Resilient, CircuitBreaker as CircuitBreakerDecorator, Retry, Cached, Metrics, Profile, Timeout, RateLimit, ResilientService, } from '../core/resilience/resilience-decorators.js';
import { CircuitBreakers, globalCacheManager, globalHealthManager, StandardHealthChecks, globalMetricsRegistry } from '../core/resilience/index.js';
const logger = getLogger('enhanced-openai-service');
/**
 * Enhanced OpenAI Service with full resilience integration
 */
let EnhancedOpenAIService = class EnhancedOpenAIService {
    constructor(config = {}) {
        this.client = null;
        // Metrics counters
        this.requestCounter = globalMetricsRegistry.counter('openai.requests.total', 'Total OpenAI API requests', { service: 'openai' });
        this.errorCounter = globalMetricsRegistry.counter('openai.requests.errors', 'Failed OpenAI API requests', { service: 'openai' });
        this.requestTimer = globalMetricsRegistry.timer('openai.request.duration', 'OpenAI API request duration', { service: 'openai' });
        this.config = {
            model: 'gpt-4o-mini',
            maxTokens: 2000,
            temperature: 0.3,
            enableResilience: true,
            enableCaching: true,
            ...config,
        };
        if (config.apiKey) {
            this.client = new OpenAI({
                apiKey: config.apiKey,
            });
            logger.info('Enhanced OpenAI service initialized', {
                model: this.config.model,
                maxTokens: this.config.maxTokens,
                temperature: this.config.temperature,
                hasApiKey: !!config.apiKey,
                resilienceEnabled: this.config.enableResilience,
                cachingEnabled: this.config.enableCaching,
            });
        }
        this.initializeResilience();
    }
    /**
     * Initialize resilience patterns
     */
    initializeResilience() {
        if (!this.config.enableResilience)
            return;
        // Setup cache if enabled
        if (this.config.enableCaching) {
            this.cache = globalCacheManager.getCache('openai-service', {
                enableL1: this.config.cacheConfig?.enableL1 !== false,
                enableL2: this.config.cacheConfig?.enableL2 || false,
                l1Config: {
                    ttl: this.config.cacheConfig?.ttl || 600000, // 10 minutes
                    maxSize: 50 * 1024 * 1024, // 50MB
                    maxEntries: 1000,
                },
            });
        }
        // Register health check
        globalHealthManager.register(StandardHealthChecks.externalApi('openai', 'https://api.openai.com', {
            name: 'openai-api',
            interval: 120000, // 2 minutes
            timeout: 30000,
            failureThreshold: 3,
            recoveryThreshold: 2,
            critical: false, // Not critical to core functionality
            enabled: !!this.client,
        }));
        logger.info('Resilience patterns initialized for OpenAI service');
    }
    /**
     * Configure OpenAI service with API key
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        if (config.apiKey) {
            this.client = new OpenAI({
                apiKey: config.apiKey,
            });
            logger.info('Enhanced OpenAI service configured with new API key');
        }
    }
    /**
     * Check if service is configured and ready
     */
    isConfigured() {
        return this.client !== null && !!this.config.apiKey;
    }
    /**
     * Get advanced writing suggestions using GPT with full resilience
     */
    async getWritingSuggestions(text, context) {
        if (!this.client) {
            throw new AppError('OpenAI service not configured. Please provide an API key.', ErrorCode.CONFIGURATION_ERROR);
        }
        // Enhanced input validation
        const validationSchema = {
            text: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 50000,
            },
            context: {
                type: 'object',
                required: false,
            },
        };
        validateInput({ text, context }, validationSchema);
        // Increment request counter
        this.requestCounter.increment();
        const operationStart = Date.now();
        try {
            const prompt = this.buildSuggestionsPrompt(text, context);
            if (!prompt) {
                throw new AppError('Failed to build suggestions prompt', ErrorCode.PROCESSING_ERROR);
            }
            const textMetrics = getTextMetrics(text);
            const textHash = generateHash(text.substring(0, 1000));
            logger.debug('Getting writing suggestions for text', {
                wordCount: textMetrics.wordCount,
                sentenceCount: textMetrics.sentenceCount,
                readingTime: textMetrics.readingTimeMinutes,
                genre: context?.genre,
                targetAudience: context?.targetAudience,
                textHash: textHash.substring(0, 8),
            });
            // Use circuit breaker for API call
            const response = await CircuitBreakers.openai.execute(async () => {
                if (!this.client) {
                    throw new Error('OpenAI client not configured');
                }
                return await this.client.chat.completions.create({
                    model: this.config.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert writing coach and editor. Analyze the provided text and return suggestions in valid JSON format.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                });
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                return [];
            }
            const suggestions = this.parseWritingSuggestions(content);
            // Record metrics
            this.requestTimer.record(Date.now() - operationStart);
            return suggestions;
        }
        catch (error) {
            this.errorCounter.increment();
            const appError = handleError(error, 'EnhancedOpenAIService.getWritingSuggestions');
            logger.error(appError.message, {
                operation: 'Getting writing suggestions',
                textLength: text.length,
                duration: Date.now() - operationStart,
            });
            return [];
        }
    }
    /**
     * Analyze writing style using GPT with enhanced resilience
     */
    async analyzeStyle(text) {
        if (!this.client) {
            throw new AppError('OpenAI service not configured. Please provide an API key.', ErrorCode.CONFIGURATION_ERROR);
        }
        // Validate and truncate input if necessary
        validateInput({ text }, {
            text: { type: 'string', required: true, minLength: 10, maxLength: 100000 },
        });
        const truncatedText = truncate(text, 10000);
        const textMetrics = getTextMetrics(truncatedText);
        this.requestCounter.increment();
        logger.debug('Analyzing writing style', {
            wordCount: textMetrics.wordCount,
            sentenceCount: textMetrics.sentenceCount,
            averageWordsPerSentence: textMetrics.averageWordsPerSentence,
            textTruncated: text.length > 10000,
        });
        const prompt = this.buildStyleAnalysisPrompt(truncatedText);
        try {
            const response = await this.client.chat.completions.create({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional writing analyst. Provide detailed style analysis in valid JSON format.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                return this.getDefaultStyleAnalysis();
            }
            return this.parseStyleAnalysis(content);
        }
        catch (error) {
            this.errorCounter.increment();
            const appError = handleError(error, 'EnhancedOpenAIService.analyzeStyle');
            logger.error(appError.message, {
                operation: 'Analyzing writing style',
                textLength: truncatedText.length,
                wordCount: textMetrics.wordCount,
            });
            return this.getDefaultStyleAnalysis();
        }
    }
    /**
     * Analyze character development and consistency with comprehensive resilience
     */
    async analyzeCharacters(text, characterNames) {
        if (!this.client) {
            throw new AppError('OpenAI service not configured. Please provide an API key.', ErrorCode.CONFIGURATION_ERROR);
        }
        // Validate input
        validateInput({ text, characterNames }, {
            text: { type: 'string', required: true, minLength: 50 },
            characterNames: { type: 'array', required: false },
        });
        const truncatedText = truncate(text, 15000);
        const textMetrics = getTextMetrics(truncatedText);
        this.requestCounter.increment();
        logger.debug('Analyzing character development', {
            wordCount: textMetrics.wordCount,
            characterCount: characterNames?.length || 'auto-detect',
            textTruncated: text.length > 15000,
        });
        const prompt = this.buildCharacterAnalysisPrompt(truncatedText, characterNames);
        try {
            const response = await this.client.chat.completions.create({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a character development expert. Analyze characters and return valid JSON.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                return [];
            }
            return this.parseCharacterAnalysis(content);
        }
        catch (error) {
            this.errorCounter.increment();
            const appError = handleError(error, 'EnhancedOpenAIService.analyzeCharacters');
            logger.error(appError.message, {
                operation: 'Analyzing character development',
                textLength: truncatedText.length,
                characterNames,
            });
            return [];
        }
    }
    /**
     * Get health status of the OpenAI service
     */
    getHealthStatus() {
        return {
            configured: this.isConfigured(),
            circuitBreaker: CircuitBreakers.openai.getMetrics(),
            cache: this.cache?.getMetrics(),
            metrics: {
                requests: this.requestCounter.getValue(),
                errors: this.errorCounter.getValue(),
            },
        };
    }
    /**
     * Get service performance metrics
     */
    getPerformanceMetrics() {
        const totalRequests = this.requestCounter.getValue();
        const totalErrors = this.errorCounter.getValue();
        const timerMetric = this.requestTimer.getMetric();
        const circuitBreakerMetric = CircuitBreakers.openai.getMetrics();
        return {
            totalRequests,
            errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
            averageResponseTime: timerMetric.mean,
            circuitBreakerStatus: circuitBreakerMetric.state,
            cacheHitRatio: this.cache?.getMetrics()?.hitRatio,
        };
    }
    // Private helper methods
    buildSuggestionsPrompt(text, context) {
        let contextInfo = '';
        if (context) {
            const parts = [];
            if (context.genre)
                parts.push(`Genre: ${context.genre}`);
            if (context.targetAudience)
                parts.push(`Target Audience: ${context.targetAudience}`);
            if (context.style)
                parts.push(`Style: ${context.style}`);
            contextInfo = parts.length > 0 ? `\nContext: ${parts.join(', ')}\n` : '';
        }
        return `Analyze the following text and provide specific writing suggestions:${contextInfo}
TEXT:
${text}

Focus on:
1. Grammar and syntax errors
2. Style improvements
3. Clarity and readability
4. Tone consistency
5. Structure and flow

Return suggestions in this JSON format:
[
    {
        "type": "grammar|style|clarity|tone|structure",
        "severity": "low|medium|high",
        "original": "exact text excerpt",
        "suggestion": "improved version",
        "explanation": "why this improvement helps",
        "confidence": 0.85
    }
]`;
    }
    buildStyleAnalysisPrompt(text) {
        return `Analyze the writing style of the following text and provide a detailed assessment:

TEXT:
${text}

Please analyze:
1. Overall tone (formal, casual, academic, literary, etc.)
2. Voice characteristics (first/third person, narrator type, etc.)
3. Key strengths in the writing
4. Areas that need improvement
5. Specific suggestions for enhancement

Return your analysis in this JSON format:
{
    "tone": "description of tone",
    "voice": "description of voice",
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "suggestions": [
        {
            "type": "style|grammar|clarity|tone|structure",
            "severity": "low|medium|high",
            "original": "text excerpt",
            "suggestion": "improvement",
            "explanation": "why this helps",
            "confidence": 0.85
        }
    ]
}`;
    }
    buildCharacterAnalysisPrompt(text, characterNames) {
        const charactersPrompt = characterNames && characterNames.length > 0
            ? `Focus on these specific characters: ${characterNames.join(', ')}.`
            : 'Identify and analyze all significant characters in the text.';
        return `Analyze character development in the following text:

TEXT:
${text}

${charactersPrompt}

For each character, assess:
1. Consistency of personality and behavior
2. Character development arc
3. Dialogue quality and authenticity
4. Areas for improvement

Return analysis in this JSON format:
{
    "characters": [
        {
            "name": "Character Name",
            "consistency": 0.85,
            "development": "well-developed|developing|flat|inconsistent",
            "dialogue_quality": 0.90,
            "suggestions": ["suggestion1", "suggestion2"]
        }
    ]
}`;
    }
    // Parsing methods remain the same as original service
    parseWritingSuggestions(content) {
        try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            const suggestions = safeParse(jsonStr, []);
            if (Array.isArray(suggestions)) {
                return suggestions.map((s) => {
                    const suggestion = s;
                    return {
                        type: String(suggestion.type || 'style'),
                        severity: String(suggestion.severity || 'medium'),
                        original: String(suggestion.original || ''),
                        suggestion: String(suggestion.suggestion || ''),
                        explanation: String(suggestion.explanation || ''),
                        confidence: Number(suggestion.confidence || 0.5),
                    };
                });
            }
            return [];
        }
        catch (error) {
            logger.error('Failed to parse writing suggestions', { error });
            return [];
        }
    }
    parseStyleAnalysis(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            const analysis = safeParse(jsonStr, {});
            return {
                tone: String(analysis.tone || 'neutral'),
                voice: String(analysis.voice || 'third person'),
                strengths: Array.isArray(analysis.strengths) ? analysis.strengths.map(String) : [],
                weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses.map(String) : [],
                suggestions: Array.isArray(analysis.suggestions)
                    ? analysis.suggestions.map((s) => {
                        if (typeof s === 'object' && s !== null) {
                            const suggestion = s;
                            return {
                                type: String(suggestion.type || 'style'),
                                severity: String(suggestion.severity || 'medium'),
                                original: String(suggestion.original || ''),
                                suggestion: String(suggestion.suggestion || ''),
                                explanation: String(suggestion.explanation || ''),
                                confidence: Number(suggestion.confidence || 0.5),
                            };
                        }
                        return {
                            type: 'style',
                            severity: 'medium',
                            original: '',
                            suggestion: String(s),
                            explanation: '',
                            confidence: 0.5,
                        };
                    })
                    : [],
            };
        }
        catch (error) {
            logger.error('Failed to parse style analysis', { error });
            return this.getDefaultStyleAnalysis();
        }
    }
    parseCharacterAnalysis(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : content;
            const analysis = safeParse(jsonStr, {});
            if (analysis.characters && Array.isArray(analysis.characters)) {
                return analysis.characters.map((char) => {
                    const character = char;
                    return {
                        name: String(character.name || 'Unknown'),
                        consistency: Number(character.consistency || 0.5),
                        development: String(character.development || 'developing'),
                        dialogue_quality: Number(character.dialogue_quality || 0.5),
                        suggestions: Array.isArray(character.suggestions)
                            ? character.suggestions.map(String)
                            : [],
                    };
                });
            }
            return [];
        }
        catch (error) {
            logger.error('Failed to parse character analysis', { error });
            return [];
        }
    }
    getDefaultStyleAnalysis() {
        return {
            tone: 'neutral',
            voice: 'third person',
            strengths: [],
            weaknesses: [],
            suggestions: [],
        };
    }
};
__decorate([
    Resilient({
        circuitBreaker: {
            enabled: true,
            name: 'openai-suggestions',
            failureThreshold: 3,
            successThreshold: 2,
            timeWindow: 60000,
            openTimeout: 60000,
        },
        retry: {
            enabled: true,
            strategy: 'network',
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 10000,
        },
        cache: {
            enabled: true,
            ttl: 600000, // 10 minutes
            keyGenerator: (text, context) => {
                const contextStr = context ? safeStringify(context) : '';
                return generateHash(`suggestions:${text}:${contextStr}`);
            },
        },
        metrics: {
            enabled: true,
            operationName: 'getWritingSuggestions',
        },
        profiling: {
            enabled: true,
            operationName: 'openai.suggestions',
        },
        timeout: {
            enabled: true,
            duration: 45000, // 45 seconds
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnhancedOpenAIService.prototype, "getWritingSuggestions", null);
__decorate([
    CircuitBreakerDecorator('openai-style-analysis'),
    Retry('network'),
    Cached({
        ttl: 900000, // 15 minutes
        keyGenerator: (text) => generateHash(`style-analysis:${text}`),
    }),
    Metrics('analyzeStyle', { type: 'analysis' }),
    Profile('openai.style.analysis'),
    Timeout(30000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EnhancedOpenAIService.prototype, "analyzeStyle", null);
__decorate([
    Resilient({
        circuitBreaker: { enabled: true, name: 'character-analysis' },
        retry: { enabled: true, strategy: 'conservative' },
        cache: { enabled: true, ttl: 1200000 }, // 20 minutes
        metrics: { enabled: true },
        profiling: { enabled: true },
        timeout: { enabled: true, duration: 40000 },
    }),
    RateLimit(30) // Max 30 character analyses per second
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], EnhancedOpenAIService.prototype, "analyzeCharacters", null);
EnhancedOpenAIService = __decorate([
    ResilientService({
        circuitBreaker: true,
        retry: 'network',
        cache: true,
        metrics: true,
        profiling: true,
        timeout: 60000,
        rateLimit: 60, // 60 requests per second
    }),
    __metadata("design:paramtypes", [Object])
], EnhancedOpenAIService);
export { EnhancedOpenAIService };
// Export enhanced singleton instance
export const enhancedOpenAIService = new EnhancedOpenAIService();
//# sourceMappingURL=openai-service-enhanced.js.map