/**
 * Document compilation and export service
 */
import type { ProjectStatistics, ScrivenerDocument } from '../types/index.js';
import type { RTFContent } from './parsers/rtf-handler.js';
export interface CompilationOptions {
    separator?: string;
    outputFormat?: 'text' | 'markdown' | 'html' | 'latex' | 'json';
    includeSynopsis?: boolean;
    includeNotes?: boolean;
    hierarchical?: boolean;
}
export interface SearchOptions {
    caseSensitive?: boolean;
    regex?: boolean;
    searchMetadata?: boolean;
    maxResults?: number;
}
export interface SearchResult {
    documentId: string;
    title: string;
    matches: string[];
    path?: string;
    wordCount?: number;
}
export declare class CompilationService {
    private rtfHandler;
    constructor();
    /**
     * Compile multiple documents into a single output
     */
    compileDocuments(documents: Array<{
        id: string;
        content: RTFContent | string;
        title: string;
    }>, options?: CompilationOptions): Promise<string | object>;
    /**
     * Search content across documents
     */
    searchInDocuments(documents: Array<{
        id: string;
        content: string;
        title: string;
        metadata?: Record<string, unknown>;
    }>, query: string, options?: SearchOptions): SearchResult[];
    /**
     * Export project in various formats
     */
    exportProject(structure: ScrivenerDocument[], format: string, options?: Record<string, unknown>): Promise<{
        format: string;
        content: string;
        metadata: Record<string, unknown>;
    }>;
    /**
     * Extract annotations from RTF content
     */
    extractAnnotations(rtfContent: string): Map<string, string>;
    /**
     * Get project statistics
     */
    getStatistics(documents: ScrivenerDocument[]): ProjectStatistics;
    private compileToText;
    private compileToMarkdown;
    private compileToHtml;
    private compileToLatex;
    private compileToJson;
    private findMatches;
    private matchesQuery;
    private exportAsMarkdown;
    private exportAsHtml;
    private escapeHtml;
    private escapeLatex;
    private countDocuments;
}
//# sourceMappingURL=compilation-service.d.ts.map