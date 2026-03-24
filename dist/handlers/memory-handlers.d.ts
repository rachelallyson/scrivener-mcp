/**
 * MCP handlers for HHM memory operations
 */
import type { HHMConfig, MemoryFormationResult, QueryResult } from '../services/memory/hhm/holographic-memory-system.js';
import { HolographicMemorySystem } from '../services/memory/hhm/holographic-memory-system.js';
import type { ScrivenerDocument } from '../types/index.js';
/**
 * Initialize HHM system
 */
export declare function initializeHHM(config?: HHMConfig): Promise<void>;
/**
 * Get HHM system instance
 */
export declare function getHHMSystem(): HolographicMemorySystem;
/**
 * Memory formation handlers
 */
export declare const memoryHandlers: {
    /**
     * Memorize text content
     */
    memorizeText(params: {
        text: string;
        id?: string;
    }): Promise<MemoryFormationResult>;
    /**
     * Memorize Scrivener document
     */
    memorizeDocument(params: {
        document: ScrivenerDocument;
    }): Promise<MemoryFormationResult>;
    /**
     * Memorize composite data
     */
    memorizeComposite(params: {
        inputs: Array<{
            data: unknown;
            modality: string;
            id?: string;
        }>;
    }): Promise<MemoryFormationResult>;
    /**
     * Memorize temporal sequence
     */
    memorizeSequence(params: {
        events: Array<{
            data: unknown;
            modality: string;
            timestamp?: number;
        }>;
    }): Promise<MemoryFormationResult>;
    /**
     * Memorize relationship
     */
    memorizeRelationship(params: {
        subject: string | {
            vector: Float32Array;
        };
        relation: string;
        object: string | {
            vector: Float32Array;
        };
    }): Promise<MemoryFormationResult>;
};
/**
 * Memory retrieval handlers
 */
export declare const retrievalHandlers: {
    /**
     * Query memory with text
     */
    queryText(params: {
        text: string;
        k?: number;
    }): Promise<QueryResult[]>;
    /**
     * Query memory with vector
     */
    queryVector(params: {
        vector: Float32Array;
        k?: number;
    }): Promise<QueryResult[]>;
    /**
     * Find analogies
     */
    findAnalogy(params: {
        a: string;
        b: string;
        c: string;
    }): Promise<QueryResult[]>;
};
/**
 * Memory management handlers
 */
export declare const managementHandlers: {
    /**
     * Check consistency
     */
    checkConsistency(params: {
        memoryIds: string[];
    }): Promise<{
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
    generateConcepts(): Promise<unknown[]>;
    /**
     * Enter dream mode
     */
    dreamMode(params: {
        duration?: number;
    }): Promise<unknown[]>;
    /**
     * Get system statistics
     */
    getStats(): Promise<Record<string, unknown>>;
    /**
     * Export memory snapshot
     */
    exportSnapshot(): Promise<unknown>;
    /**
     * Clear cache
     */
    clearCache(): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<Record<string, unknown>>;
};
/**
 * Benchmarking handlers
 */
export declare const benchmarkHandlers: {
    /**
     * Run performance benchmark
     */
    runBenchmark(params: {
        dimensions?: number;
    }): Promise<string>;
    /**
     * Test GPU acceleration
     */
    testGPU(): Promise<Record<string, unknown>>;
};
/**
 * Register all HHM handlers with MCP
 */
type MCPServer = {
    setRequestHandler: ((method: string, handler: Function) => void) | (<T>(requestSchema: T, handler: Function) => void);
};
export declare function registerHHMHandlers(server: MCPServer): void;
export {};
//# sourceMappingURL=memory-handlers.d.ts.map