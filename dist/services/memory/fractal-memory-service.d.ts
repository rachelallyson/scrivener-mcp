/**
 * Fractal Memory Service
 * Integrates Python fractal memory system with TypeScript MCP handlers
 */
interface FractalSegment {
    id: string;
    scale: 'micro' | 'meso' | 'macro';
    text: string;
    chapterId: string;
    startPos: number;
    endPos: number;
    parentId?: string;
    sequenceNum: number;
    metadata?: Record<string, unknown>;
}
interface Entity {
    id: string;
    type: 'character' | 'location' | 'object' | 'concept';
    name: string;
    aliases?: string[];
    description?: string;
    properties?: Record<string, unknown>;
}
interface Motif {
    id: string;
    name: string;
    description?: string;
    patternType: 'theme' | 'symbol' | 'phrase' | 'structure';
    examples?: string[];
    clusterId?: number;
    strength: number;
}
interface RetrievalPolicy {
    name: string;
    scaleWeights: {
        micro: number;
        meso: number;
        macro: number;
    };
    entityBoost?: number;
    motifBoost?: number;
    recencyWeight?: number;
    frequencyWeight?: number;
}
interface SearchResult {
    segments: FractalSegment[];
    entities?: Entity[];
    motifs?: Motif[];
    score: number;
    metadata?: Record<string, unknown>;
}
export declare class FractalMemoryService {
    private db;
    private pythonProcess;
    private dbPath;
    private pythonScriptPath;
    private initialized;
    constructor(dbPath?: string);
    /**
     * Initialize the fractal memory service
     */
    initialize(): Promise<void>;
    /**
     * Initialize SQLite database
     */
    private initializeDatabase;
    /**
     * Ingest text into fractal memory system
     */
    ingestText(text: string, chapterId: string, options?: {
        forceRebuild?: boolean;
        extractEntities?: boolean;
        clusterMotifs?: boolean;
    }): Promise<void>;
    /**
     * Search using fractal retrieval
     */
    search(query: string, options?: {
        policy?: 'line-fix' | 'scene-fix' | 'thematic' | 'continuity';
        k?: number;
        chapterId?: string;
        includeGraph?: boolean;
    }): Promise<SearchResult[]>;
    /**
     * Fallback search implementation in TypeScript
     */
    private searchFallback;
    /**
     * Find co-occurrences of entities/motifs
     */
    findCoOccurrences(items: string[], options?: {
        itemTypes?: ('entity' | 'motif')[];
        minDistance?: number;
        maxDistance?: number;
    }): Promise<any[]>;
    /**
     * Check character continuity
     */
    checkContinuity(characterName: string, options?: {
        chapterId?: string;
        includeRelationships?: boolean;
    }): Promise<any>;
    /**
     * Identify gaps in character continuity
     */
    private identifyContinuityGaps;
    /**
     * Track motif patterns
     */
    trackMotifs(options?: {
        chapterId?: string;
        minStrength?: number;
        patternType?: string;
    }): Promise<any[]>;
    /**
     * Update retrieval policy
     */
    updatePolicy(name: string, policy: Partial<RetrievalPolicy>): Promise<void>;
    /**
     * Call Python script for advanced operations
     */
    private callPythonScript;
    /**
     * Get analytics and performance metrics
     */
    getAnalytics(options?: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<any>;
    /**
     * Summarize analytics
     */
    private summarizeAnalytics;
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
}
export {};
//# sourceMappingURL=fractal-memory-service.d.ts.map