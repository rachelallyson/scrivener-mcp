/**
 * Full-Text Search Service
 * Provides advanced search capabilities across SQLite and Neo4j
 */
import type { Neo4jManager } from './neo4j-manager.js';
import type { SQLiteManager } from './sqlite-manager.js';
export interface SearchResult {
    id: string;
    type: 'document' | 'character' | 'plot' | 'theme' | 'location';
    title: string;
    snippet: string;
    relevance: number;
    metadata?: Record<string, unknown>;
}
export interface SearchOptions {
    limit?: number;
    offset?: number;
    types?: Array<'document' | 'character' | 'plot' | 'theme' | 'location'>;
    fuzzy?: boolean;
    caseSensitive?: boolean;
    wholeWord?: boolean;
    dateRange?: {
        from?: string;
        to?: string;
    };
    sortBy?: 'relevance' | 'date' | 'title';
}
export declare class SearchService {
    private sqliteManager;
    private neo4jManager;
    constructor(sqliteManager: SQLiteManager | null, neo4jManager: Neo4jManager | null);
    /**
     * Perform full-text search across all content
     */
    search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
    /**
     * Search within documents using FTS5
     */
    private searchDocuments;
    /**
     * Search characters
     */
    private searchCharacters;
    /**
     * Search plot threads
     */
    private searchPlotThreads;
    /**
     * Search themes
     */
    private searchThemes;
    /**
     * Search locations
     */
    private searchLocations;
    /**
     * Semantic search using embeddings (future enhancement)
     */
    semanticSearch(query: string, options?: SearchOptions): Promise<SearchResult[]>;
    /**
     * Search for connections between entities
     */
    searchConnections(entity1: string, entity2: string, maxHops?: number): Promise<Array<{
        path: string[];
        length: number;
        type: string;
    }>>;
    /**
     * Helper methods
     */
    private prepareSearchQuery;
    private createSnippet;
    private calculateRelevance;
    private sortResults;
    /**
     * Get search suggestions based on partial input
     */
    getSuggestions(partial: string, limit?: number): Promise<string[]>;
}
//# sourceMappingURL=search-service.d.ts.map