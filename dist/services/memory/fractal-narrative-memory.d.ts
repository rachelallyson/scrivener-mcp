/**
 * Fractal Narrative Memory System
 * Implements multi-scale narrative memory with fractal segmentation,
 * graph-based relationship tracking, and motif clustering
 */
import { EventEmitter } from 'events';
import { Database } from 'sqlite3';
import type { ScrivenerDocument } from '../../types/index.js';
export interface MicroSegment {
    id: string;
    chapter: number;
    paraIndex: number;
    sentIndex: number;
    beatIndex?: number;
    text: string;
    startChar: number;
    endChar: number;
    embeddingId?: string;
    tokens: number;
}
export interface MesoSegment {
    id: string;
    chapter: number;
    startChar: number;
    endChar: number;
    text: string;
    microIds: string[];
    embeddingId?: string;
    sceneType?: 'action' | 'dialogue' | 'description' | 'transition';
    tokens: number;
}
export interface MacroSegment {
    id: string;
    chapterOrArc: string;
    startChar: number;
    endChar: number;
    text: string;
    mesoIds: string[];
    embeddingId?: string;
    arcType?: 'setup' | 'rising' | 'climax' | 'falling' | 'resolution';
}
export interface GraphNode {
    nodeId: string;
    nodeType: 'character' | 'object' | 'motif' | 'setting' | 'event' | 'segment';
    canonicalName: string;
    attributesJson: Record<string, any>;
    frequency: number;
    centrality?: number;
}
export interface GraphEdge {
    edgeId: string;
    fromNode: string;
    toNode: string;
    edgeType: 'interacts' | 'cooccurrence' | 'emotional' | 'causal' | 'temporal';
    weight: number;
    evidenceJson: Record<string, any>;
}
export interface MotifCluster {
    clusterId: number;
    keywords: string[];
    label?: string;
    segments: string[];
    centroid?: Float32Array;
    coherenceScore: number;
}
export interface RetrievalResult {
    scale: 'micro' | 'meso' | 'macro';
    segmentId: string;
    score: number;
    segment: MicroSegment | MesoSegment | MacroSegment;
    graphBoost: number;
    contextBoost: number;
}
export interface FractalMemoryConfig {
    microTokenRange: [number, number];
    mesoTokenRange: [number, number];
    mesoOverlap: number;
    scaleWeights: {
        micro: number;
        meso: number;
        macro: number;
    };
    graphBoostWeight: number;
    contextBoostWeight: number;
    minClusterSize: number;
    embeddingModel: string;
}
export declare class FractalSegmenter {
    private logger;
    private sentenceTokenizer;
    private config;
    constructor(config: FractalMemoryConfig);
    segment(chapterText: string, chapterIndex: number): Promise<{
        micro: MicroSegment[];
        meso: MesoSegment[];
        macro: MacroSegment[];
    }>;
    private createMicroSegments;
    private createMesoSegments;
    private detectSceneBreaks;
    private createMacroSegment;
    private splitLongSentence;
    private countTokens;
    private getParagraphIndex;
    private splitIntoSentences;
    private createSlidingWindows;
    private createScenesFromBreaks;
    private detectSceneType;
    private detectArcType;
}
export declare class FractalRetriever {
    private logger;
    private microIndex;
    private mesoIndex;
    private macroIndex;
    private config;
    private embedder;
    constructor(config: FractalMemoryConfig);
    initialize(): Promise<void>;
    retrieve(query: string, k?: number, scaleWeights?: Partial<typeof this.config.scaleWeights>, graphDB?: Database): Promise<RetrievalResult[]>;
    private embed;
    private getIndexForScale;
    private computeGraphBoost;
    private computeContextBoost;
    private getSegmentIdFromLabel;
    private loadSegment;
}
export declare class NarrativeGraphManager {
    db: Database;
    private logger;
    private corefResolver;
    private motifDetector;
    constructor(dbPath: string);
    private initializeSchema;
    updateGraphForSegment(segment: MesoSegment): Promise<void>;
    private extractEntities;
    private detectMotifs;
    private upsertNode;
    private upsertMotifNode;
    private upsertEdge;
    private linkSegmentToNode;
    private generateNodeId;
    private canonicalize;
    private updateCentralityMetrics;
    checkContinuity(character: string): Promise<any[]>;
    private detectViolations;
}
export declare class MotifClusteringEngine {
    private logger;
    private clusterer;
    private minClusterSize;
    constructor(minClusterSize?: number);
    clusterMotifs(embeddings: Float32Array[]): Promise<MotifCluster[]>;
    private runClustering;
    private computeCentroid;
    private extractKeywords;
    private computeCoherence;
    labelClusters(clusters: MotifCluster[], humanLabels?: Map<number, string>): Promise<void>;
    private generateLabel;
}
export declare class FractalNarrativeMemory extends EventEmitter {
    private segmenter;
    private retriever;
    private graphManager;
    private motifEngine;
    private config;
    private logger;
    private db;
    private cache;
    constructor(config?: Partial<FractalMemoryConfig>);
    initialize(): Promise<void>;
    private initializeDatabase;
    ingestDocument(document: ScrivenerDocument): Promise<void>;
    private indexSegments;
    private storeSegment;
    private indexSegment;
    query(queryText: string, options?: {
        k?: number;
        scaleWeights?: Partial<{
            micro: number;
            meso: number;
            macro: number;
        }>;
        policy?: 'line-fix' | 'scene-fix' | 'thematic';
    }): Promise<RetrievalResult[]>;
    private applyPolicy;
    checkContinuity(character: string): Promise<any[]>;
    findMotif(motifName: string): Promise<RetrievalResult[]>;
    expandBeat(segmentId: string, context?: string): Promise<string>;
    private clusterMotifs;
    getStats(): Promise<any>;
    private getSegmentCount;
    private getNodeCount;
    private getEdgeCount;
    private getMotifCount;
}
//# sourceMappingURL=fractal-narrative-memory.d.ts.map