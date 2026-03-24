/**
 * Document metadata management service
 */
import type { BinderItem, ProjectStructure } from '../types/internal.js';
export interface DocumentMetadata {
    title?: string;
    synopsis?: string;
    notes?: string;
    label?: string;
    status?: string;
    keywords?: string[];
    includeInCompile?: boolean;
    customMetadata?: Record<string, string>;
    created?: string;
    modified?: string;
}
export interface ProjectMetadata {
    title?: string;
    author?: string;
    keywords?: string[];
    projectTargets?: {
        draft?: number;
        session?: number;
        deadline?: string;
    };
    customFields?: Record<string, string>;
}
export declare class MetadataManager {
    private projectTitle;
    private validationCache;
    private metadataCache;
    private readonly maxStringLength;
    constructor();
    /**
     * Get the project title
     */
    getProjectTitle(): string;
    /**
     * Set the project title
     */
    setProjectTitle(title: string): void;
    /**
     * Update metadata for a binder item with validation
     */
    updateDocumentMetadata(item: BinderItem, metadata: DocumentMetadata): void;
    /**
     * Get metadata from a binder item
     */
    getDocumentMetadata(item: BinderItem): DocumentMetadata;
    /**
     * Batch update metadata for multiple documents with retry logic
     */
    batchUpdateMetadata(items: Map<string, BinderItem>, updates: Array<{
        id: string;
        metadata: DocumentMetadata;
    }>): Promise<Array<{
        id: string;
        success: boolean;
        error?: string;
    }>>;
    /**
     * Update project-level metadata with validation
     */
    updateProjectMetadata(projectStructure: ProjectStructure, metadata: ProjectMetadata): void;
    /**
     * Get project-level metadata
     */
    getProjectMetadata(projectStructure: ProjectStructure): ProjectMetadata;
    /**
     * Search metadata across all documents
     */
    searchMetadata(items: BinderItem[], query: string, fields?: Array<'title' | 'synopsis' | 'notes' | 'keywords' | 'custom'>): Array<{
        id: string;
        field: string;
        value: string;
    }>;
    /**
     * Get statistics about metadata usage
     */
    getMetadataStatistics(items: BinderItem[]): Record<string, unknown>;
    private updateCustomMetadata;
    private extractCustomMetadata;
    /**
     * Validate metadata completeness with caching
     */
    validateMetadata(item: BinderItem, requiredFields?: string[]): {
        valid: boolean;
        missing: string[];
    };
    /**
     * Validate metadata input
     */
    private validateMetadataInput;
    /**
     * Validate project metadata input
     */
    private validateProjectMetadataInput;
    /**
     * Batch process metadata with enhanced error handling and timeout protection
     */
    batchProcessMetadata<T>(items: BinderItem[], processor: (item: BinderItem) => Promise<T> | T, options?: {
        concurrency?: number;
        continueOnError?: boolean;
        timeoutMs?: number;
        retryOptions?: {
            maxAttempts?: number;
            initialDelay?: number;
            maxDelay?: number;
        };
    }): Promise<Array<{
        item: BinderItem;
        result?: T;
        error?: string;
    }>>;
    /**
     * Validate multiple items with async processing and caching
     */
    validateMultipleItems(items: BinderItem[], requiredFields?: string[], options?: {
        concurrency?: number;
        useCache?: boolean;
    }): Promise<Array<{
        item: BinderItem;
        validation: {
            valid: boolean;
            missing: string[];
        };
    }>>;
    /**
     * Batch validate and repair metadata with timeout protection
     */
    batchValidateAndRepair(items: BinderItem[], repairOptions?: {
        addMissingTitles?: boolean;
        generateSynopsis?: boolean;
        setDefaultStatus?: boolean;
        defaultStatus?: string;
    }, processingOptions?: {
        concurrency?: number;
        timeoutMs?: number;
    }): Promise<Array<{
        item: BinderItem;
        repaired: boolean;
        changes: string[];
    }>>;
    /**
     * Search metadata with async processing and result caching
     */
    searchMetadataAsync(items: BinderItem[], query: string, fields?: Array<'title' | 'synopsis' | 'notes' | 'keywords' | 'custom'>, options?: {
        cacheResults?: boolean;
        timeout?: number;
    }): Promise<Array<{
        id: string;
        field: string;
        value: string;
    }>>;
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Cleanup expired cache entries periodically
     */
    scheduleCleanup(): void;
}
//# sourceMappingURL=metadata-manager.d.ts.map