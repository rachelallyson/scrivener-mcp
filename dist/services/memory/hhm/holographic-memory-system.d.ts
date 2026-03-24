/**
 * Holographic Hyperdimensional Memory System
 * Main integration point for all HHM components
 */
import type { HyperVector } from './hypervector.js';
import type { RetrievalResult } from './memory-substrate.js';
import type { ConceptCandidate, EvolutionConfig } from './memory-evolution.js';
import type { ScrivenerDocument } from '../../../types/index.js';
export interface HHMConfig {
    dimensions?: number;
    maxMemories?: number;
    useGPU?: boolean;
    evolution?: Partial<EvolutionConfig>;
    similarityThreshold?: number;
    autoEvolve?: boolean;
}
export interface MemoryFormationResult {
    id: string;
    vector: HyperVector;
    modalities: string[];
    metadata: Record<string, unknown>;
}
export interface QueryResult extends RetrievalResult {
    reconstructed?: unknown;
    explanation?: string;
}
export declare class HolographicMemorySystem {
    private dimensions;
    private substrate;
    private encoder;
    private logical;
    private evolution;
    private config;
    private memoryIndex;
    constructor(config?: HHMConfig);
    /**
     * Form a memory from text input
     */
    memorizeText(text: string, id?: string): Promise<MemoryFormationResult>;
    /**
     * Form a memory from a Scrivener document
     */
    memorizeDocument(document: ScrivenerDocument): Promise<MemoryFormationResult>;
    /**
     * Form a composite memory from multiple inputs
     */
    memorizeComposite(inputs: Array<{
        data: unknown;
        modality: string;
        id?: string;
    }>): Promise<MemoryFormationResult>;
    /**
     * Form a temporal sequence memory
     */
    memorizeSequence(events: Array<{
        data: unknown;
        modality: string;
        timestamp?: number;
    }>): Promise<MemoryFormationResult>;
    /**
     * Remember a logical relationship
     */
    memorizeRelationship(subject: HyperVector | string, relation: string, object: HyperVector | string): Promise<MemoryFormationResult>;
    /**
     * Query memory with text
     */
    queryText(text: string, k?: number): Promise<QueryResult[]>;
    /**
     * Query memory with a hypervector
     */
    query(queryVector: HyperVector, k?: number): Promise<QueryResult[]>;
    /**
     * Perform analogical reasoning
     */
    findAnalogy(a: string, b: string, c: string): Promise<QueryResult[]>;
    /**
     * Check logical consistency of stored memories
     */
    checkConsistency(memoryIds: string[]): Promise<{
        consistent: boolean;
        conflicts?: Array<{
            id1: string;
            id2: string;
            issue: string;
        }>;
    }>;
    /**
     * Generate novel concepts
     */
    generateConcepts(): Promise<ConceptCandidate[]>;
    /**
     * Enter dream mode for creative recombination
     */
    dream(duration?: number): Promise<ConceptCandidate[]>;
    /**
     * Explain what a memory represents
     */
    private explainMemory;
    /**
     * Get system statistics
     */
    getStats(): Record<string, unknown>;
    /**
     * Export memory snapshot
     */
    exportSnapshot(): Promise<{
        config: HHMConfig;
        stats: Record<string, unknown>;
        timestamp: number;
    }>;
    /**
     * Clean up and destroy the system
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=holographic-memory-system.d.ts.map