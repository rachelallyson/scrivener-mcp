/**
 * LangChain Service Wrapper
 * Provides backward compatibility while using enhanced features internally
 */
import type { Document as LangchainDocument } from 'langchain/document';
import type { ScrivenerDocument } from '../../types/index.js';
interface ChunkingOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}
interface RAGOptions {
    topK?: number;
    temperature?: number;
    maxTokens?: number;
}
/**
 * Drop-in replacement for the original LangChainService
 * Uses enhanced features internally while maintaining the same API
 */
export declare class LangChainService {
    private enhancedService;
    private advancedFeatures;
    private logger;
    private useAdvancedFeatures;
    constructor(apiKey?: string, options?: {
        useAdvanced?: boolean;
    });
    /**
     * Process and chunk a document for vector storage
     * Maintains backward compatibility while using enhanced chunking
     */
    processDocument(document: ScrivenerDocument, options?: ChunkingOptions): Promise<LangchainDocument[]>;
    /**
     * Build or update vector store with documents
     * Uses enhanced vector store with better indexing
     */
    buildVectorStore(documents: ScrivenerDocument[]): Promise<void>;
    /**
     * Perform semantic search across documents
     * Enhanced with reranking for better results
     */
    semanticSearch(query: string, topK?: number): Promise<LangchainDocument[]>;
    /**
     * Generate writing suggestions using RAG
     * Uses specialized templates when available
     */
    generateWithContext(prompt: string, options?: RAGOptions): Promise<string>;
    /**
     * Analyze writing style from samples
     * Enhanced with structured output
     */
    analyzeWritingStyle(samples: string[]): Promise<Record<string, unknown>>;
    /**
     * Generate chapter summaries
     * Maintains original API
     */
    summarizeChapter(content: string, maxLength?: number): Promise<string>;
    /**
     * Check plot consistency across documents
     * Enhanced with graph-based analysis
     */
    checkPlotConsistency(documents: ScrivenerDocument[]): Promise<Array<{
        issue: string;
        severity: 'low' | 'medium' | 'high';
        locations: string[];
        suggestion: string;
    }>>;
    /**
     * Clear vector store and contexts
     */
    clearMemory(): void;
    /**
     * Get service statistics
     * Extended with additional metrics
     */
    getStatistics(): Record<string, unknown>;
    /**
     * Additional methods for enhanced functionality
     * These are new additions not in the original API
     */
    /**
     * Generate alternative versions of text
     */
    generateAlternatives(passage: string, styles: Array<'literary' | 'commercial' | 'minimalist' | 'ornate' | 'noir' | 'comedic'>): Promise<Record<string, string>>;
    /**
     * Simulate beta reader feedback
     */
    simulateBetaReader(document: ScrivenerDocument, profile?: {
        genre_preference: string;
        reading_level: 'casual' | 'avid' | 'professional';
        focus: 'plot' | 'character' | 'prose' | 'general';
    }): Promise<Record<string, unknown>>;
    /**
     * Generate comprehensive manuscript report
     */
    generateManuscriptReport(documents: ScrivenerDocument[]): Promise<Record<string, unknown>>;
    /**
     * Create a writing coach for specific areas
     */
    createWritingCoach(focusArea: 'dialogue' | 'description' | 'pacing' | 'character'): Promise<{
        invoke: (text: string) => Promise<string>;
    }>;
    /**
     * Find similar scenes using semantic search
     */
    findSimilarScenes(sceneDescription: string, documents: ScrivenerDocument[], options?: {
        minSimilarity?: number;
        maxResults?: number;
        includeContext?: boolean;
    }): Promise<Array<{
        document: ScrivenerDocument;
        similarity: number;
        excerpt: string;
    }>>;
}
export { AdvancedLangChainFeatures } from './langchain-advanced-features.js';
export { EnhancedLangChainService } from './langchain-service-enhanced.js';
//# sourceMappingURL=langchain-service-wrapper.d.ts.map