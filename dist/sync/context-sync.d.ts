import type { ContextAnalyzer } from '../analysis/context-analyzer.js';
import type { DatabaseService } from '../handlers/database/database-service.js';
export interface SyncOptions {
    autoSync: boolean;
    syncInterval: number;
    contextFileFormat: 'json' | 'markdown' | 'both';
    includeAnalysis: boolean;
    includeRelationships: boolean;
}
export interface SyncStatus {
    lastSync: Date;
    documentsInSync: number;
    documentsOutOfSync: number;
    pendingChanges: string[];
    errors: string[];
}
export declare class ContextSyncService {
    private projectPath;
    private databaseService;
    private contextAnalyzer;
    private options;
    private syncTimer?;
    private pendingChanges;
    private syncStatus;
    private contextDir;
    constructor(projectPath: string, databaseService: DatabaseService, contextAnalyzer: ContextAnalyzer, options?: SyncOptions);
    /**
     * Initialize context directory
     */
    private initializeContextDirectory;
    /**
     * Start automatic synchronization
     */
    startAutoSync(): void;
    /**
     * Stop automatic synchronization
     */
    stopAutoSync(): void;
    /**
     * Mark document as changed
     */
    markDocumentChanged(documentId: string): void;
    /**
     * Perform full synchronization
     */
    performSync(): Promise<void>;
    /**
     * Sync a single document
     */
    syncDocument(documentId: string): Promise<void>;
    /**
     * Write chapter context files
     */
    private writeChapterContextFiles;
    /**
     * Convert context to markdown
     */
    private contextToMarkdown;
    /**
     * Sync document relationships
     */
    private syncDocumentRelationships;
    /**
     * Ensure theme exists in database
     */
    private ensureThemeExists;
    /**
     * Generate story-wide context
     */
    private generateStoryContext;
    /**
     * Convert story context to markdown
     */
    private storyContextToMarkdown;
    /**
     * Check if context is outdated
     */
    private isContextOutdated;
    /**
     * Get document from database
     */
    private getDocumentFromDatabase;
    /**
     * Get document content
     */
    private getDocumentContent;
    /**
     * Get all documents
     */
    private getAllDocuments;
    /**
     * Get all chapter contexts
     */
    private getAllChapterContexts;
    /**
     * Count synced documents
     */
    private countSyncedDocuments;
    /**
     * Sanitize filename - now uses truncate utility
     */
    private sanitizeFileName;
    /**
     * Get sync status
     */
    getSyncStatus(): SyncStatus;
    /**
     * Export all context files
     */
    exportContextFiles(exportPath: string): Promise<void>;
    /**
     * Clean up and close
     */
    close(): void;
}
//# sourceMappingURL=context-sync.d.ts.map