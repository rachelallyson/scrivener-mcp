/**
 * HHM Memory Substrate
 * GPU-accelerated storage and retrieval system for hypervectors
 */
import { HyperVector } from './hypervector.js';
export interface MemoryEntry {
    id: string;
    vector: HyperVector;
    metadata: {
        timestamp: number;
        accessCount: number;
        lastAccessed: number;
        strength: number;
        context?: Record<string, unknown>;
        modality?: string;
        tags?: string[];
    };
}
export interface RetrievalResult {
    entry: MemoryEntry;
    similarity: number;
    rank: number;
}
export declare class HolographicMemorySubstrate {
    private memories;
    private vectorMatrix;
    private dimensions;
    private maxMemories;
    private useGPU;
    private gpuDevice;
    private gpuBuffer;
    constructor(dimensions?: number, maxMemories?: number, useGPU?: boolean);
    /**
     * Check if WebGPU is available
     */
    private checkWebGPUSupport;
    /**
     * Initialize WebGPU for accelerated operations
     */
    private initializeGPU;
    /**
     * Store a memory in the substrate
     */
    store(id: string, vector: HyperVector, metadata?: Partial<MemoryEntry['metadata']>): Promise<void>;
    /**
     * Retrieve memories similar to query vector
     */
    retrieve(query: HyperVector, k?: number, threshold?: number): Promise<RetrievalResult[]>;
    /**
     * CPU-based similarity search
     */
    private cpuSimilaritySearch;
    /**
     * GPU-accelerated similarity search using WebGPU
     */
    private gpuSimilaritySearch;
    /**
     * Update GPU buffer with current memories
     */
    private updateGPUBuffer;
    /**
     * Consolidate memory by strengthening frequently accessed memories
     */
    consolidate(strengthThreshold?: number): Promise<void>;
    /**
     * Decay old memories
     */
    decay(decayRate?: number, maxAge?: number): Promise<void>;
    /**
     * Get memory by ID
     */
    get(id: string): MemoryEntry | undefined;
    /**
     * Delete memory by ID
     */
    delete(id: string): Promise<boolean>;
    /**
     * Clear all memories
     */
    clear(): Promise<void>;
    /**
     * Get statistics about the memory substrate
     */
    getStats(): Record<string, unknown>;
    /**
     * Cleanup GPU resources
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=memory-substrate.d.ts.map