/**
 * Efficient Document Indexing and Search Service
 * Provides fast O(1) document lookup and optimized search
 */
import type { ScrivenerDocument } from '../types/index.js';
export interface DocumentInfo {
    document: ScrivenerDocument;
    path: Array<{
        id: string;
        title: string;
        type: string;
    }>;
    location: 'active' | 'trash' | 'unknown';
    parentId?: string;
    depth: number;
}
export interface SearchResult {
    documentId: string;
    title: string;
    matches: string[];
    score: number;
    snippet?: string;
}
export interface IndexStats {
    documentCount: number;
    wordCount: number;
    indexSize: number;
    lastUpdated: Date;
}
/**
 * Ring buffer for efficient memory management
 */
export declare class RingBuffer<T> {
    private buffer;
    private writeIndex;
    private size;
    private count;
    constructor(size: number);
    push(item: T): void;
    getAll(): T[];
    clear(): void;
    getSize(): number;
}
/**
 * Document Indexer with O(1) lookup and efficient search
 */
export declare class DocumentIndexer {
    private documentIndex;
    private searchIndex;
    private documentWords;
    private contentHashes;
    private dirtyDocuments;
    private lastSyncTime;
    private eventListeners;
    private operationMetrics;
    constructor();
    /**
     * Build complete index from documents
     */
    buildIndex(documents: ScrivenerDocument[], location?: 'active' | 'trash'): Promise<void>;
    /**
     * Build document index with O(1) lookup
     */
    private buildDocumentIndex;
    /**
     * Build search index for fast content search
     */
    private buildSearchIndex;
    /**
     * Update search index for a specific document
     */
    updateDocumentInIndex(documentId: string, content: string): Promise<void>;
    /**
     * Get document info with O(1) complexity
     */
    getDocumentInfo(documentId: string): DocumentInfo | undefined;
    /**
     * Search content using index
     */
    searchContent(query: string, options?: {
        caseSensitive?: boolean;
        regex?: boolean;
        limit?: number;
        scoreThreshold?: number;
    }): Promise<SearchResult[]>;
    /**
     * Regex search (slower, scans documents)
     */
    private regexSearch;
    /**
     * Mark document as changed (dirty state tracking)
     */
    markDocumentChanged(documentId: string): void;
    /**
     * Flush pending changes
     */
    flushChanges(): Promise<void>;
    /**
     * Get dirty documents
     */
    getDirtyDocuments(): string[];
    /**
     * Clear all indexes and cleanup
     */
    clearIndex(): void;
    /**
     * Get index statistics
     */
    getStats(): IndexStats;
    /**
     * Get operation metrics
     */
    getMetrics(): {
        averageSearchTime: number;
        averageIndexTime: number;
        successRate: number;
    };
    /**
     * Tokenize text for indexing
     */
    private tokenize;
    /**
     * Event emitter functionality
     */
    private emit;
    on(event: string, listener: (...args: unknown[]) => unknown): void;
    off(event: string, listener: (...args: unknown[]) => unknown): void;
    /**
     * Cleanup resources
     */
    dispose(): void;
}
export declare const documentIndexer: DocumentIndexer;
//# sourceMappingURL=document-indexer.d.ts.map