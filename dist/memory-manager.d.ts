import type { DatabaseService } from './handlers/database/database-service.js';
export interface ProjectMemory {
    version: string;
    lastUpdated: string;
    characters: CharacterProfile[];
    worldBuilding: WorldElement[];
    plotThreads: PlotThread[];
    styleGuide: StyleGuide;
    writingStats: WritingStatistics;
    documentContexts: Map<string, DocumentContext>;
    customContext: Record<string, unknown>;
}
export interface CharacterProfile {
    id: string;
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
    description: string;
    traits: string[];
    arc: string;
    relationships: {
        characterId: string;
        relationship: string;
    }[];
    appearances: {
        documentId: string;
        context: string;
    }[];
    notes: string;
}
export interface WorldElement {
    id: string;
    name: string;
    type: 'location' | 'object' | 'concept' | 'organization';
    description: string;
    significance: string;
    appearances: {
        documentId: string;
        context: string;
    }[];
}
export interface PlotThread {
    id: string;
    name: string;
    description: string;
    status: 'setup' | 'development' | 'climax' | 'resolution';
    documents: string[];
    keyEvents: {
        documentId: string;
        event: string;
    }[];
}
export interface StyleGuide {
    tone: string[];
    voice: string;
    pov: 'first' | 'second' | 'third-limited' | 'third-omniscient';
    tense: 'past' | 'present' | 'future';
    vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'literary';
    sentenceComplexity: 'simple' | 'varied' | 'complex';
    paragraphLength: 'short' | 'medium' | 'long' | 'varied';
    customGuidelines: string[];
    genre?: string;
    audience?: string;
    styleNotes?: string[];
}
export interface WritingStatistics {
    totalWords: number;
    averageChapterLength: number;
    sessionsCount: number;
    lastSession: string;
    dailyWordCounts: {
        date: string;
        count: number;
    }[];
    completionPercentage: number;
    estimatedCompletionDate?: string;
}
export interface DocumentContext {
    documentId: string;
    lastAnalyzed: string;
    summary: string;
    themes: string[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    pacing: 'slow' | 'moderate' | 'fast';
    keyElements: string[];
    suggestions: string[];
    continuityNotes: string[];
}
export declare class MemoryManager {
    private memoryPath;
    private memory;
    private autoSaveInterval?;
    private databaseService?;
    constructor(projectPath: string, databaseService?: DatabaseService);
    private createEmptyMemory;
    initialize(): Promise<void>;
    loadMemory(): Promise<void>;
    saveMemory(): Promise<void>;
    private cleanupOldBackups;
    addCharacter(character: Omit<CharacterProfile, 'id'>): CharacterProfile;
    updateCharacter(id: string, updates: Partial<CharacterProfile>): void;
    getCharacter(id: string): CharacterProfile | undefined;
    getAllCharacters(): CharacterProfile[];
    setDocumentContext(documentId: string, context: Omit<DocumentContext, 'documentId' | 'lastAnalyzed'>): void;
    getDocumentContext(documentId: string): DocumentContext | undefined;
    updateStyleGuide(updates: Partial<StyleGuide>): void;
    getStyleGuide(): StyleGuide;
    addPlotThread(thread: Omit<PlotThread, 'id'>): PlotThread;
    updatePlotThread(id: string, updates: Partial<PlotThread>): void;
    getPlotThreads(): PlotThread[];
    updateWritingStats(updates: Partial<WritingStatistics>): void;
    getWritingStats(): WritingStatistics;
    setCustomContext(key: string, value: unknown): void;
    getCustomContext(key: string): unknown;
    getFullMemory(): ProjectMemory;
    importMemory(memory: ProjectMemory): Promise<void>;
    stopAutoSave(): Promise<void>;
    cleanup(): void;
    private generateId;
    /**
     * Load memory data from database
     */
    private loadFromDatabase;
    /**
     * Save memory data to database
     */
    private saveToDatabase;
    /**
     * Sync memory data to Neo4j for relationship analysis
     */
    private syncToNeo4j;
}
//# sourceMappingURL=memory-manager.d.ts.map