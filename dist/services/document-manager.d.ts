/**
 * Document management service for Scrivener projects
 */
import type { ScrivenerDocument } from '../types/index.js';
import type { ProjectStructure } from '../types/internal.js';
import type { RTFContent } from './parsers/rtf-handler.js';
export declare class DocumentManager {
    private projectPath;
    private rtfHandler;
    private documentCache;
    private projectStructure?;
    private operationQueue;
    private readonly batchSize;
    private pendingWrites;
    constructor(projectPath: string);
    setProjectStructure(structure: ProjectStructure): void;
    getProjectStructureData(): ProjectStructure | undefined;
    /**
     * Read document content with deduplication
     */
    readDocument(documentId: string): Promise<string>;
    /**
     * Deduplicate operations to prevent redundant work
     */
    private dedupedOperation;
    /**
     * Read raw RTF document content (for annotation extraction)
     */
    readDocumentRaw(documentId: string): Promise<string>;
    /**
     * Read document with formatting preserved
     */
    readDocumentFormatted(documentId: string): Promise<RTFContent>;
    /**
     * Write document content with batching and deduplication
     */
    writeDocument(documentId: string, content: string | RTFContent, immediate?: boolean): Promise<void>;
    /**
     * Write document immediately
     */
    private writeDocumentImmediate;
    /**
     * Flush pending writes in batches
     */
    private flushPendingWrites;
    /**
     * Create a new document
     */
    createDocument(title: string, content?: string, parentId?: string, type?: 'Text' | 'Folder'): Promise<string>;
    /**
     * Delete a document (move to trash)
     */
    deleteDocument(documentId: string): Promise<void>;
    /**
     * Rename a document
     */
    renameDocument(documentId: string, newTitle: string): Promise<void>;
    /**
     * Move a document to a different parent
     */
    moveDocument(documentId: string, newParentId: string | null): Promise<void>;
    /**
     * Recover a document from trash
     */
    recoverFromTrash(documentId: string, targetParentId?: string): Promise<void>;
    /**
     * Get word count for a document
     */
    getWordCount(documentId?: string): Promise<{
        words: number;
        characters: number;
    }>;
    /**
     * Get all documents in the project
     */
    getAllDocuments(includeTrash?: boolean): Promise<ScrivenerDocument[]>;
    /**
     * Get project structure as hierarchical documents
     */
    getProjectStructure(includeTrash?: boolean): Promise<ScrivenerDocument[]>;
    /**
     * Clear document cache
     */
    clearCache(documentId?: string): void;
    /**
     * Clean up resources
     */
    close(): Promise<void>;
    private buildDocumentTree;
    private binderItemToDocument;
}
//# sourceMappingURL=document-manager.d.ts.map