import type { DatabaseService } from './database-service.js';
import type { ScrivenerDocument } from '../../types/index.js';
export interface VectorSearchResult {
    id: string;
    content: string;
    score: number;
    metadata?: Record<string, unknown>;
}
export interface DatabaseResult {
    id: string;
    title: string;
    content: string;
    [key: string]: unknown;
}
export interface StructuredQuery {
    text: string;
    filters?: Record<string, unknown>;
    limit?: number;
    [key: string]: unknown;
}
export interface DatabaseSchema {
    tables: Array<{
        name: string;
        columns: Array<{
            name: string;
            type: string;
            nullable?: boolean;
        }>;
    }>;
    relationships?: Array<{
        from: string;
        to: string;
        type: string;
    }>;
}
export interface SemanticQueryResult {
    documents: Array<{
        id: string;
        title: string;
        content: string;
        relevanceScore: number;
        explanation: string;
    }>;
    entities: Array<{
        name: string;
        type: 'character' | 'location' | 'concept' | 'theme';
        mentions: number;
        documents: string[];
    }>;
    relationships: Array<{
        from: string;
        to: string;
        type: string;
        strength: number;
        evidence: string[];
    }>;
    insights: {
        summary: string;
        themes: string[];
        patterns: string[];
        suggestions: string[];
    };
}
export interface KnowledgeGraph {
    nodes: Array<{
        id: string;
        label: string;
        type: string;
        properties: Record<string, unknown>;
        embeddings?: number[];
    }>;
    edges: Array<{
        id: string;
        from: string;
        to: string;
        type: string;
        properties: Record<string, unknown>;
        weight: number;
    }>;
    metadata: {
        totalNodes: number;
        totalEdges: number;
        lastUpdated: string;
        version: string;
    };
}
export interface EntityAnalysis {
    entity: string;
    type: string;
    mentions: Array<{
        documentId: string;
        documentTitle: string;
        context: string;
        sentiment: number;
        importance: number;
    }>;
    relationships: Array<{
        relatedEntity: string;
        relationship: string;
        strength: number;
        contexts: string[];
    }>;
    progression: Array<{
        chapter: number;
        development: string;
        significance: number;
    }>;
    insights: {
        characterization: string[];
        plot_relevance: string;
        thematic_connection: string[];
        inconsistencies: string[];
    };
    processingTime?: number;
    connections?: Array<{
        entity: string;
        type: string;
        strength: number;
    }>;
}
export declare class SemanticDatabaseLayer {
    private databaseService;
    private langchain;
    private advanced;
    private vectorStore;
    private logger;
    private knowledgeGraphCache;
    private cacheTimeout;
    private lastCacheUpdate;
    constructor(databaseService: DatabaseService);
    initialize(): Promise<void>;
    semanticQuery(naturalLanguage: string, options?: {
        includeEntities?: boolean;
        includeRelationships?: boolean;
        maxResults?: number;
        threshold?: number;
    }): Promise<SemanticQueryResult>;
    private parseNaturalLanguageQuery;
    private executeSemanticSearch;
    private performTraditionalSearch;
    private mergeAndRankResults;
    private generateResultExplanation;
    private extractEntitiesFromQuery;
    private mapEntityType;
    private analyzeRelationships;
    private generateQueryInsights;
    intelligentSync(documents: ScrivenerDocument[]): Promise<{
        knowledgeGraph: KnowledgeGraph;
        insights: {
            newEntities: number;
            newRelationships: number;
            updatedNodes: number;
            conflicts: string[];
        };
    }>;
    private extractKnowledgeGraph;
    private syncToGraph;
    private updateVectorStore;
    private generateSyncInsights;
    crossReferenceAnalysis(entity: string): Promise<EntityAnalysis>;
    private findEntityMentions;
    private analyzeMentionSentiment;
    private calculateMentionImportance;
    private analyzeEntityRelationships;
    private analyzeEntityProgression;
    private generateEntityInsights;
    private determineEntityType;
    getKnowledgeGraph(): Promise<KnowledgeGraph | null>;
    nl2sql(naturalLanguage: string, schema?: DatabaseSchema): Promise<{
        sql: string;
        explanation: string;
        confidence: number;
    }>;
    close(): Promise<void>;
}
//# sourceMappingURL=langchain-semantic-layer.d.ts.map