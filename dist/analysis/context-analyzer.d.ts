import type { DatabaseService } from '../handlers/database/database-service.js';
import type { ContentAnalyzer } from './base-analyzer.js';
export interface ScrivenerDocument {
    id: string;
    title: string;
    type: 'Text' | 'Folder' | 'Other';
    synopsis?: string;
    notes?: string;
    wordCount: number;
    characterCount: number;
    children?: ScrivenerDocument[];
}
export interface ChapterContext {
    documentId: string;
    title: string;
    synopsis?: string;
    notes?: string;
    wordCount: number;
    characters: Array<{
        id: string;
        name: string;
        role?: string;
        appearances: number;
        lastMention?: string;
    }>;
    themes: Array<{
        name: string;
        prominence: number;
        examples: string[];
    }>;
    plotThreads: Array<{
        id: string;
        name: string;
        status: string;
        developments: string[];
    }>;
    previousChapter?: {
        id: string;
        title: string;
        summary: string;
    };
    nextChapter?: {
        id: string;
        title: string;
    };
    emotionalArc: {
        start: string;
        peak: string;
        end: string;
        overall: string;
    };
    pacing: {
        score: number;
        description: string;
        suggestions: string[];
    };
    keyEvents: string[];
    cliffhangers: string[];
    foreshadowing: string[];
    callbacks: string[];
}
export interface StoryContext {
    projectTitle: string;
    totalWordCount: number;
    chapterCount: number;
    characterArcs: Map<string, {
        character: string;
        introduction: string;
        development: string[];
        currentStatus: string;
        projectedArc: string;
    }>;
    themeProgression: Map<string, {
        theme: string;
        introduction: string;
        developments: string[];
        currentStrength: number;
    }>;
    plotThreads: Map<string, {
        thread: string;
        status: 'setup' | 'developing' | 'climax' | 'resolved';
        chapters: string[];
        keyEvents: string[];
    }>;
    overallPacing: {
        trend: 'accelerating' | 'steady' | 'decelerating' | 'variable';
        intensityPoints: Array<{
            chapter: string;
            intensity: number;
        }>;
        suggestions: string[];
    };
}
export declare class ContextAnalyzer {
    private databaseService;
    private contentAnalyzer;
    constructor(databaseService: DatabaseService, contentAnalyzer: ContentAnalyzer);
    /**
     * Analyze a chapter and build its context
     */
    private _analyzeChapter;
    analyzeChapter(document: ScrivenerDocument, content: string, allDocuments: ScrivenerDocument[]): Promise<ChapterContext>;
    /**
     * Build complete story context
     */
    buildStoryContext(_documents: ScrivenerDocument[], chapterContexts: ChapterContext[]): Promise<StoryContext>;
    /**
     * Extract character mentions from content
     */
    private extractCharacterMentions;
    /**
     * Find a specific character in content
     */
    private findCharacterInContent;
    /**
     * Extract themes from content
     */
    private extractThemes;
    /**
     * Get plot threads for a chapter
     */
    private getChapterPlotThreads;
    /**
     * Analyze emotional arc of content
     */
    private analyzeEmotionalArc;
    /**
     * Detect dominant emotion in text
     */
    private detectDominantEmotion;
    /**
     * Extract key events from content
     */
    private extractKeyEvents;
    /**
     * Extract cliffhangers
     */
    private extractCliffhangers;
    /**
     * Extract foreshadowing
     */
    private extractForeshadowing;
    /**
     * Extract callbacks to previous chapters
     */
    private extractCallbacks;
    /**
     * Describe pacing score
     */
    private describePacing;
    /**
     * Build character arcs across chapters
     */
    private buildCharacterArcs;
    /**
     * Build theme progression
     */
    private buildThemeProgression;
    /**
     * Build plot thread map
     */
    private buildPlotThreadMap;
    /**
     * Determine thread status based on developments
     */
    private determineThreadStatus;
    /**
     * Analyze overall pacing
     */
    private analyzeOverallPacing;
    /**
     * Store chapter context in database
     */
    private storeChapterContext;
    /**
     * Store story context in database
     */
    private storeStoryContext;
    /**
     * Get chapter context from database
     */
    getChapterContext(documentId: string): Promise<ChapterContext | null>;
    /**
     * Get story context from database
     */
    getStoryContext(): Promise<StoryContext | null>;
}
//# sourceMappingURL=context-analyzer.d.ts.map