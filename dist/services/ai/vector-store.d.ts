export interface VectorDocument {
    id: string;
    content: string;
    metadata: {
        title?: string;
        type?: string;
        wordCount?: number;
        synopsis?: string;
        [key: string]: unknown;
    };
    embedding?: number[];
}
export interface SearchResult {
    id: string;
    title: string;
    content: string;
    score: number;
    metadata: Record<string, unknown>;
}
export interface MentionResult {
    documentId: string;
    title: string;
    context: string;
    position: number;
}
export declare class VectorStore {
    private documents;
    private embeddings;
    private logger;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    addDocuments(documents: Array<Omit<VectorDocument, 'embedding'>>): Promise<void>;
    similaritySearch(query: string, limit?: number): Promise<SearchResult[]>;
    findMentions(entity: string): Promise<MentionResult[]>;
    updateDocument(id: string, updates: Partial<Omit<VectorDocument, 'id' | 'embedding'>>): Promise<void>;
    deleteDocument(id: string): Promise<void>;
    getDocument(id: string): Promise<VectorDocument | null>;
    getStats(): {
        totalDocuments: number;
        totalSize: number;
        initialized: boolean;
    };
    clear(): Promise<void>;
    close(): Promise<void>;
    private generateEmbedding;
    private simpleHash;
    private cosineSimilarity;
    semanticSearch(query: string, options?: {
        threshold?: number;
        maxResults?: number;
        includeMetadata?: boolean;
    }): Promise<SearchResult[]>;
    hybridSearch(query: string, options?: {
        semanticWeight?: number;
        keywordWeight?: number;
        maxResults?: number;
    }): Promise<SearchResult[]>;
    private keywordSearch;
    private combineSearchResults;
}
//# sourceMappingURL=vector-store.d.ts.map