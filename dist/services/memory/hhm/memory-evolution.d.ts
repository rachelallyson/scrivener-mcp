/**
 * Dynamic Memory Evolution and Novel Concept Generation for HHM
 * Implements memory consolidation, forgetting, and creative concept synthesis
 */
import { HyperVector } from './hypervector.js';
import type { HolographicMemorySubstrate } from './memory-substrate.js';
export interface ConceptCandidate {
    vector: HyperVector;
    name: string;
    components: string[];
    novelty: number;
    coherence: number;
    utility: number;
}
export interface EvolutionConfig {
    consolidationInterval: number;
    consolidationThreshold: number;
    decayRate: number;
    decayInterval: number;
    creativityThreshold: number;
    minNovelty: number;
    minCoherence: number;
}
export declare class MemoryEvolution {
    private substrate;
    private logical;
    private config;
    private consolidationTimer?;
    private decayTimer?;
    private conceptHistory;
    constructor(substrate: HolographicMemorySubstrate, config?: Partial<EvolutionConfig>);
    /**
     * Start automatic memory evolution processes
     */
    start(): void;
    /**
     * Stop automatic memory evolution
     */
    stop(): void;
    /**
     * Consolidate frequently accessed memories
     */
    private consolidateMemories;
    /**
     * Apply decay to old memories
     */
    private decayMemories;
    /**
     * Generate novel concepts through creative binding
     */
    generateNovelConcepts(): Promise<ConceptCandidate[]>;
    /**
     * Synthesize a new concept from two memories
     */
    private synthesizeConcept;
    /**
     * Blend two vectors with weighted interpolation
     */
    private blendVectors;
    /**
     * Calculate novelty of a concept
     */
    private calculateNovelty;
    /**
     * Calculate coherence of a concept
     */
    private calculateCoherence;
    /**
     * Calculate utility of a concept
     */
    private calculateUtility;
    /**
     * Evaluate if a concept candidate is worth keeping
     */
    private evaluateConcept;
    /**
     * Generate a name for a novel concept
     */
    private generateConceptName;
    /**
     * Store a generated concept as a new memory
     */
    storeConcept(candidate: ConceptCandidate): Promise<void>;
    /**
     * Evolve a specific memory through targeted operations
     */
    evolveMemory(memoryId: string, evolutionType: 'strengthen' | 'weaken' | 'mutate'): Promise<void>;
    /**
     * Perform dream-like recombination of memories
     */
    dream(duration?: number): Promise<ConceptCandidate[]>;
    /**
     * Get statistics about memory evolution
     */
    getEvolutionStats(): Record<string, unknown>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
//# sourceMappingURL=memory-evolution.d.ts.map