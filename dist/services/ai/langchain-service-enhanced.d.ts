/**
 * Enhanced LangChain service for advanced AI operations
 * Provides improved document processing, conversation memory, streaming, and multi-model support
 */
import { RunnableSequence } from '@langchain/core/runnables';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import type { Document as LangchainDocument } from 'langchain/document';
import type { ScrivenerDocument } from '../../types/index.js';
interface ChunkingOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
    strategy?: 'semantic' | 'structural' | 'hybrid';
}
interface AgentPersona {
    name: string;
    role: string;
    perspective: string;
    expertise: string[];
}
interface CritiqueStyle {
    approach: 'constructive' | 'analytical' | 'creative' | 'technical';
    focus: string[];
    tone: 'gentle' | 'direct' | 'encouraging' | 'professional';
}
interface ExpertAnalysis {
    expert: string;
    analysis: string;
    confidence: number;
    recommendations: string[];
}
interface RAGOptions {
    topK?: number;
    temperature?: number;
    maxTokens?: number;
    includeMetadata?: boolean;
    reranking?: boolean;
    format?: string;
    character?: string;
    genre?: string;
    entity?: string;
    maxLength?: number;
    customPrompt?: string;
    agentPersona?: AgentPersona;
    focusAreas?: string[];
    agent?: AgentPersona;
    otherPerspective?: AgentPersona;
    critiqueStyle?: CritiqueStyle;
    discussionRound?: number;
    round?: number;
    expertAnalyses?: ExpertAnalysis[];
    context?: Record<string, unknown>;
    style?: string;
    preserveEssentials?: boolean;
    preserveStyle?: boolean;
    audience?: string;
    target?: string;
}
interface ModelConfig {
    provider: 'openai';
    modelName: string;
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
}
interface StreamCallback {
    onToken?: (token: string) => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}
declare const WRITING_PROMPTS: {
    character_development: string;
    plot_structure: string;
    dialogue_enhancement: string;
    worldbuilding: string;
    pacing_rhythm: string;
    theme_symbolism: string;
    plot_analysis: string;
    character_arc_analysis: string;
    theme_analysis: string;
    tension_analysis: string;
    genre_identification: string;
    audience_identification: string;
    comparable_books: string;
    market_positioning: string;
    trend_analysis: string;
    commercial_viability: string;
    synthesis: string;
    recommendations: string;
    query_parsing: string;
    result_explanation: string;
    insight_generation: string;
    sentiment_analysis: string;
    importance_analysis: string;
    entity_insights: string;
    nl2sql: string;
    issue_detection: string;
    predictive_text: string;
    writing_suggestions: string;
    selection_suggestions: string;
    style_consistency: string;
    query_optimization: string;
    submission_optimization: string;
    pitch_optimization: string;
    content_condensation: string;
    content_enhancement: string;
    agent_analysis: string;
    discussion_contribution: string;
    find_agreements: string;
    extract_insights: string;
    identify_unresolved: string;
    editor_perspective: string;
    editor_critique: string;
    critic_perspective: string;
    critic_critique: string;
    researcher_perspective: string;
    researcher_critique: string;
    stylist_perspective: string;
    stylist_critique: string;
    plotter_perspective: string;
    plotter_critique: string;
    collaborative_critique: string;
    blurb_generation: string;
    pitch_generation: string;
    query_letter_generation: string;
    synopsis_generation: string;
    tagline_generation: string;
    hook_generation: string;
    comparison_generation: string;
    preview_generation: string;
    metadata_extraction: string;
    quality_assessment: string;
};
export declare class EnhancedLangChainService {
    private models;
    private primaryModel;
    private embeddings;
    private vectorStore;
    private textSplitter;
    private conversationMemory;
    private summaryMemory;
    private contexts;
    private qaChain;
    private logger;
    constructor(configs?: ModelConfig[]);
    private initializeModels;
    /**
     * Advanced document processing with semantic chunking
     */
    processDocument(document: ScrivenerDocument, options?: ChunkingOptions): Promise<LangchainDocument[]>;
    private semanticChunking;
    private structuralChunking;
    private hybridChunking;
    /**
     * Build or update vector store with advanced indexing
     */
    buildVectorStore(documents: ScrivenerDocument[], options?: {
        strategy?: ChunkingOptions['strategy'];
    }): Promise<void>;
    private initializeQAChain;
    /**
     * Enhanced semantic search with reranking
     */
    semanticSearch(query: string, options?: {
        topK?: number;
        rerank?: boolean;
    }): Promise<LangchainDocument[]>;
    private rerankResults;
    /**
     * Generate with streaming support
     */
    generateWithStreaming(prompt: string, context: string, callbacks: StreamCallback): Promise<void>;
    /**
     * Use specialized prompt template for specific writing task
     */
    generateWithTemplate(taskType: keyof typeof WRITING_PROMPTS, prompt: string, options?: RAGOptions): Promise<{
        content: string;
    }>;
    /**
     * Conversational Q&A with memory
     */
    askWithMemory(question: string, sessionId?: string): Promise<{
        answer: string;
        sources: LangchainDocument[];
    }>;
    /**
     * Multi-model fallback for reliability
     */
    generateWithFallback(prompt: string, modelPreference?: string[]): Promise<string>;
    /**
     * Advanced plot consistency check with graph-based analysis
     */
    checkPlotConsistencyAdvanced(documents: ScrivenerDocument[]): Promise<{
        issues: Array<{
            issue: string;
            severity: 'low' | 'medium' | 'high';
            locations: string[];
            suggestion: string;
            confidence: number;
        }>;
        characterGraph: Map<string, Set<string>>;
        timeline: Array<{
            event: string;
            chapter: string;
            timestamp?: string;
        }>;
    }>;
    private buildCharacterGraph;
    private extractTimeline;
    private extractTimestamp;
    private checkCharacterConsistency;
    private checkTimelineConsistency;
    private checkPlotHoles;
    private checkPacing;
    /**
     * Generate comprehensive manuscript analysis report
     */
    generateManuscriptReport(documents: ScrivenerDocument[]): Promise<{
        summary: string;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        statistics: Record<string, number>;
        marketability: {
            genre: string;
            targetAudience: string;
            comparableTitles: string[];
            uniqueSellingPoints: string[];
        };
    }>;
    private analyzeMarketability;
    /**
     * Analyze writing style from samples
     */
    analyzeWritingStyle(samples: string[]): Promise<Record<string, unknown>>;
    /**
     * Advanced RAG with createRetrievalChain and createStuffDocumentsChain
     */
    createAdvancedRAGChain(systemPrompt?: string): Promise<ReturnType<typeof createRetrievalChain>>;
    /**
     * Advanced analysis with RunnableLambda and RunnableMap
     */
    advancedDocumentAnalysis(documents: ScrivenerDocument[], analysisType?: 'comprehensive' | 'structural' | 'stylistic'): Promise<{
        analysis: string;
        metadata: Record<string, unknown>;
        insights: string[];
        recommendations: string[];
    }>;
    /**
     * Create a dynamic query processing chain with conditional logic
     */
    createDynamicQueryChain(): Promise<RunnableSequence<Record<string, unknown>, string>>;
    /**
     * Multi-stage manuscript review with RunnableLambda pipelines
     */
    performMultiStageReview(documents: ScrivenerDocument[]): Promise<{
        stageResults: Record<string, unknown>;
        finalRecommendations: string[];
        overallScore: number;
    }>;
    /**
     * Clear all memory and caches
     */
    clearMemory(): void;
    /**
     * Get service statistics
     */
    getStatistics(): {
        modelsLoaded: number;
        vectorStoreSize: number;
        activeConversations: number;
        contextsStored: number;
    };
}
export {};
//# sourceMappingURL=langchain-service-enhanced.d.ts.map