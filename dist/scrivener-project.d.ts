/**
 * Scrivener Project class using modular services
 */
import { ContextAnalyzer } from './analysis/index.js';
import { DatabaseService } from './handlers/database/index.js';
import { ContextSyncService, type SyncStatus } from './sync/context-sync.js';
import type { ChapterContext } from './analysis/context-analyzer.js';
import type { RTFContent } from './services/parsers/rtf-handler.js';
import type { ExportOptions, ProjectStatistics, ProjectStructure, ScrivenerDocument, ScrivenerMetadata } from './types/index.js';
export interface ScrivenerProjectOptions {
    autoSave?: boolean;
    autoBackup?: boolean;
    cacheSize?: number;
    syncInterval?: number;
}
export declare class ScrivenerProject {
    private projectPath;
    private documentManager;
    private projectLoader;
    private compilationService;
    private metadataManager;
    private databaseService;
    private contentAnalyzer;
    private contextAnalyzer?;
    private contextSync?;
    private cleanupManager;
    private options;
    private indexInitialized;
    constructor(projectPath: string, options?: ScrivenerProjectOptions);
    /**
     * Load the project
     */
    loadProject(): Promise<void>;
    /**
     * Save the project
     */
    saveProject(): Promise<void>;
    /**
     * Get project structure
     */
    getProjectStructure(includeTrash?: boolean): Promise<ScrivenerDocument[]>;
    /**
     * Get all documents
     */
    getAllDocuments(includeTrash?: boolean): Promise<ScrivenerDocument[]>;
    readDocument(documentId: string): Promise<string>;
    readDocumentFormatted(documentId: string): Promise<RTFContent>;
    writeDocument(documentId: string, content: string | RTFContent): Promise<void>;
    createDocument(title: string, content?: string, parentId?: string, type?: 'Text' | 'Folder'): Promise<string>;
    deleteDocument(documentId: string): Promise<void>;
    renameDocument(documentId: string, newTitle: string): Promise<void>;
    moveDocument(documentId: string, newParentId: string | null, _position?: number): Promise<void>;
    getWordCount(documentId?: string): Promise<{
        words: number;
        characters: number;
    }>;
    getTotalWordCount(): Promise<number>;
    compileDocuments(documentIds: string[], separator?: string, outputFormat?: 'text' | 'markdown' | 'html' | 'latex' | 'json'): Promise<string | object>;
    searchContent(query: string, options?: {
        caseSensitive?: boolean;
        regex?: boolean;
        searchMetadata?: boolean;
        includeTrash?: boolean;
    }): Promise<Array<{
        documentId: string;
        title: string;
        matches: string[];
    }>>;
    exportProject(format: string, _outputPath?: string, options?: Partial<ExportOptions>): Promise<unknown>;
    getStatistics(): Promise<ProjectStatistics>;
    updateMetadata(documentId: string, metadata: Record<string, unknown>): Promise<void>;
    updateDocumentMetadata(documentId: string, metadata: {
        synopsis?: string;
        notes?: string;
        label?: string;
        status?: string;
    }): Promise<void>;
    updateSynopsisAndNotes(documentId: string, synopsis?: string, notes?: string): Promise<void>;
    batchUpdateSynopsisAndNotes(updates: Array<{
        documentId: string;
        synopsis?: string;
        notes?: string;
    }>): Promise<Array<{
        documentId: string;
        success: boolean;
        error?: string;
    }>>;
    getProjectMetadata(): Promise<ScrivenerMetadata>;
    refreshProject(): Promise<void>;
    isProjectModified(): Promise<boolean>;
    clearCache(documentId?: string): void;
    getDatabaseService(): DatabaseService;
    getContextAnalyzer(): ContextAnalyzer | undefined;
    getContextSync(): ContextSyncService | undefined;
    analyzeChapterEnhanced(documentId: string): Promise<ChapterContext>;
    buildStoryContext(): Promise<unknown>;
    getSyncStatus(): SyncStatus | {
        enabled: false;
        message: string;
    };
    markDocumentChanged(documentId: string): void;
    exportContextFiles(exportPath: string): Promise<void>;
    getDocumentInfo(documentId: string): Promise<{
        document: ScrivenerDocument | null;
        path: Array<{
            id: string;
            title: string;
            type: string;
        }>;
        metadata: Record<string, unknown>;
        location: 'active' | 'trash' | 'unknown';
    }>;
    getTrashDocuments(): Promise<ScrivenerDocument[]>;
    searchTrash(query: string, options?: {
        caseSensitive?: boolean;
        regex?: boolean;
    }): Promise<Array<{
        documentId: string;
        title: string;
        matches: string[];
    }>>;
    recoverFromTrash(documentId: string, targetParentId?: string): Promise<void>;
    getProjectStructureLimited(options?: {
        maxDepth?: number;
        folderId?: string;
        includeTrash?: boolean;
        summaryOnly?: boolean;
    }): Promise<ProjectStructure>;
    getDocumentAnnotations(documentId: string): Promise<Map<string, string>>;
    getDocument(documentId: string): Promise<ScrivenerDocument>;
    getStructure(options?: {
        includeContent?: boolean;
        maxDepth?: number;
    }): Promise<ProjectStructure>;
    get metadata(): ScrivenerMetadata;
    get title(): string;
    get structure(): Promise<ProjectStructure>;
    private performInitialSync;
    private syncDocumentToDatabase;
    private findBinderItem;
    close(): Promise<void>;
}
//# sourceMappingURL=scrivener-project.d.ts.map