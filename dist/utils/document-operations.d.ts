/**
 * Unified Document Operations Utility
 * Provides transaction-wrapped document operations with consistent error handling
 */
export interface DocumentCreationOptions {
    title: string;
    content?: string;
    parentId?: string;
    type?: 'Text' | 'Folder';
    metadata?: {
        synopsis?: string;
        notes?: string;
        label?: string;
        status?: string;
        keywords?: string[];
    };
}
export interface DocumentCreationResult {
    id: string;
    path: string[];
    created: Date;
}
export interface DocumentOperationContext {
    projectStructure: unknown;
    projectPath: string;
    writeDocument?: (id: string, content: string) => Promise<void>;
    saveProject?: () => Promise<void>;
}
/**
 * Transaction wrapper for document operations
 * Ensures atomic operations with proper rollback on failure
 */
export declare function withDocumentTransaction<T>(operation: () => Promise<T>, context: DocumentOperationContext, operationName?: string): Promise<T>;
/**
 * Unified document creation with transaction support
 * Replaces duplicate createDocument implementations across the codebase
 */
export declare function createDocument(options: DocumentCreationOptions, context: DocumentOperationContext): Promise<DocumentCreationResult>;
/**
 * Batch document creation with transaction support
 */
export declare function createDocuments(documents: DocumentCreationOptions[], context: DocumentOperationContext): Promise<DocumentCreationResult[]>;
/**
 * Move document with transaction support
 */
export declare function moveDocument(documentId: string, targetParentId: string, context: DocumentOperationContext): Promise<void>;
/**
 * Delete document with transaction support
 */
export declare function deleteDocument(documentId: string, context: DocumentOperationContext, moveToTrash?: boolean): Promise<void>;
//# sourceMappingURL=document-operations.d.ts.map