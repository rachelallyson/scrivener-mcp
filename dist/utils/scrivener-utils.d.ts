import type { BinderItem, BinderContainer, MetaDataItem } from '../types/internal.js';
/**
 * Scrivener-specific utility functions
 * Enhanced with better type safety, error handling, and organization
 */
/** Scrivener file extensions */
export declare const SCRIVENER_EXTENSIONS: {
    readonly PROJECT: ".scriv";
    readonly RTF: ".rtf";
    readonly TEXT: ".txt";
    readonly XML: ".scrivx";
};
/** Scrivener special folder types */
export declare const SCRIVENER_FOLDERS: {
    readonly DRAFT: "DraftFolder";
    readonly RESEARCH: "ResearchFolder";
    readonly TRASH: "TrashFolder";
    readonly FOLDER: "Folder";
};
/** Maximum limits for Scrivener */
export declare const SCRIVENER_LIMITS: {
    readonly MAX_TITLE_LENGTH: 255;
    readonly MAX_CONTENT_SIZE: number;
    readonly MAX_SYNOPSIS_LENGTH: 5000;
    readonly MAX_NOTES_LENGTH: 100000;
};
/**
 * Generate document path from ID
 */
export declare function getDocumentPath(projectPath: string, documentId: string): string;
/**
 * Generate synopsis path from ID
 */
export declare function getSynopsisPath(projectPath: string, documentId: string): string;
/**
 * Generate notes path from ID
 */
export declare function getNotesPath(projectPath: string, documentId: string): string;
/**
 * Get all document paths for a given ID
 */
export declare function getDocumentPaths(projectPath: string, documentId: string): {
    content: string;
    synopsis: string;
    notes: string;
    directory: string;
    comments: string;
    snapshots: string;
};
/**
 * Generate a Scrivener-compatible UUID (uppercase)
 */
export declare function generateScrivenerUUID(): string;
/**
 * Check if string is a valid Scrivener UUID (uppercase)
 */
export declare function isScrivenerUUID(id: string): boolean;
/**
 * Check if string is a valid Scrivener numeric ID
 */
export declare function isScrivenerNumericId(id: string): boolean;
/**
 * Validate Scrivener document ID (UUID or numeric)
 */
export declare function isValidScrivenerDocumentId(id: string): boolean;
export declare function findBinderItem(container: BinderContainer | undefined, documentId: string, useCache?: boolean): BinderItem | null;
/**
 * Clear binder cache
 */
export declare function clearBinderCache(): void;
/**
 * Traverse binder and apply callback to each item
 */
export declare function traverseBinder(container: BinderContainer | undefined, callback: (item: BinderItem, depth: number, parent?: BinderItem) => void, depth?: number, parent?: BinderItem): void;
/**
 * Get all binder items as flat array
 */
export declare function flattenBinder(container: BinderContainer | undefined): BinderItem[];
/**
 * Find parent of a binder item
 */
export declare function findBinderParent(container: BinderContainer | undefined, documentId: string): BinderItem | null;
/**
 * Get binder path (breadcrumb) for an item
 */
export declare function getBinderPath(container: BinderContainer | undefined, documentId: string): BinderItem[];
/**
 * Find metadata item by field ID
 */
export declare function findMetadataField(metadataItems: MetaDataItem[] | MetaDataItem | undefined, fieldId: string): MetaDataItem | undefined;
/**
 * Extract metadata value
 */
export declare function getMetadataValue(metadataItems: MetaDataItem[] | MetaDataItem | undefined, fieldId: string): string | undefined;
/**
 * Parse metadata into key-value pairs
 */
export declare function parseMetadata(metadataItems: MetaDataItem[] | MetaDataItem | undefined): Record<string, string>;
/**
 * Build metadata items from key-value pairs
 */
export declare function buildMetadataItems(metadata: Record<string, string | undefined>): MetaDataItem[];
/**
 * Determine document type from Scrivener type code
 */
export declare function getDocumentType(typeCode?: string): 'Text' | 'Folder' | 'Other';
/**
 * Check if folder type
 */
export declare function isFolderType(type?: string): boolean;
/**
 * Check if item is in trash
 */
export declare function isInTrash(item: BinderItem): boolean;
/**
 * Check if item should be included in compile
 */
export declare function shouldIncludeInCompile(item: BinderItem): boolean;
/**
 * Search binder items by predicate
 */
export declare function searchBinder(container: BinderContainer | undefined, predicate: (item: BinderItem) => boolean): BinderItem[];
/**
 * Find documents by type
 */
export declare function findDocumentsByType(container: BinderContainer | undefined, type: 'Text' | 'Folder' | 'Other'): BinderItem[];
/**
 * Find documents by title (case-insensitive)
 */
export declare function findDocumentsByTitle(container: BinderContainer | undefined, searchTerm: string, exact?: boolean): BinderItem[];
/**
 * Validation schema for document operations
 */
export declare const documentValidationSchema: {
    documentId: {
        type: "string";
        required: boolean;
        custom: (id: unknown) => true | "Document ID must be a string" | "Invalid document ID format";
    };
    title: {
        type: "string";
        required: boolean;
        minLength: number;
        maxLength: 255;
    };
    content: {
        type: "string";
        required: boolean;
        custom: (value: unknown) => string | true;
    };
};
/**
 * Validate document operation input
 */
export declare function validateDocumentInput(input: unknown): void;
/**
 * Get binder statistics
 */
export declare function getBinderStatistics(container: BinderContainer | undefined): {
    totalItems: number;
    folders: number;
    documents: number;
    inTrash: number;
    totalWords: number;
};
/**
 * Get text statistics from metadata
 */
export declare function getTextStatistics(item: BinderItem): {
    words: number;
    characters: number;
    paragraphs: number;
};
/**
 * Generate deterministic UUID from seed (useful for testing)
 */
export declare function generateSeededUUID(seed: string): string;
declare const _default: {
    SCRIVENER_EXTENSIONS: {
        readonly PROJECT: ".scriv";
        readonly RTF: ".rtf";
        readonly TEXT: ".txt";
        readonly XML: ".scrivx";
    };
    SCRIVENER_FOLDERS: {
        readonly DRAFT: "DraftFolder";
        readonly RESEARCH: "ResearchFolder";
        readonly TRASH: "TrashFolder";
        readonly FOLDER: "Folder";
    };
    SCRIVENER_LIMITS: {
        readonly MAX_TITLE_LENGTH: 255;
        readonly MAX_CONTENT_SIZE: number;
        readonly MAX_SYNOPSIS_LENGTH: 5000;
        readonly MAX_NOTES_LENGTH: 100000;
    };
    getDocumentPath: typeof getDocumentPath;
    getSynopsisPath: typeof getSynopsisPath;
    getNotesPath: typeof getNotesPath;
    getDocumentPaths: typeof getDocumentPaths;
    generateScrivenerUUID: typeof generateScrivenerUUID;
    generateSeededUUID: typeof generateSeededUUID;
    isScrivenerUUID: typeof isScrivenerUUID;
    isScrivenerNumericId: typeof isScrivenerNumericId;
    isValidScrivenerDocumentId: typeof isValidScrivenerDocumentId;
    findBinderItem: typeof findBinderItem;
    clearBinderCache: typeof clearBinderCache;
    traverseBinder: typeof traverseBinder;
    flattenBinder: typeof flattenBinder;
    findBinderParent: typeof findBinderParent;
    getBinderPath: typeof getBinderPath;
    getBinderStatistics: typeof getBinderStatistics;
    findMetadataField: typeof findMetadataField;
    getMetadataValue: typeof getMetadataValue;
    parseMetadata: typeof parseMetadata;
    buildMetadataItems: typeof buildMetadataItems;
    getTextStatistics: typeof getTextStatistics;
    getDocumentType: typeof getDocumentType;
    isFolderType: typeof isFolderType;
    isInTrash: typeof isInTrash;
    shouldIncludeInCompile: typeof shouldIncludeInCompile;
    searchBinder: typeof searchBinder;
    findDocumentsByType: typeof findDocumentsByType;
    findDocumentsByTitle: typeof findDocumentsByTitle;
    documentValidationSchema: {
        documentId: {
            type: "string";
            required: boolean;
            custom: (id: unknown) => true | "Document ID must be a string" | "Invalid document ID format";
        };
        title: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: 255;
        };
        content: {
            type: "string";
            required: boolean;
            custom: (value: unknown) => string | true;
        };
    };
    validateDocumentInput: typeof validateDocumentInput;
};
export default _default;
//# sourceMappingURL=scrivener-utils.d.ts.map