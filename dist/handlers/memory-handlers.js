/**
 * MCP handlers for HHM memory operations
 */
import { HolographicMemorySystem } from '../services/memory/hhm/holographic-memory-system.js';
import { HyperVector } from '../services/memory/hhm/hypervector.js';
import { quickBenchmark } from '../services/memory/hhm/benchmark.js';
import { CacheManager } from '../services/memory/hhm/vector-cache.js';
import { GPUAccelerator } from '../services/memory/hhm/gpu-accelerator.js';
import { getLogger } from '../core/logger.js';
const logger = getLogger('memory-handlers');
// Global HHM instance
let hhmSystem = null;
/**
 * Initialize HHM system
 */
export async function initializeHHM(config) {
    if (hhmSystem) {
        await hhmSystem.destroy();
    }
    const defaultConfig = {
        dimensions: 10000,
        maxMemories: 1000000,
        useGPU: GPUAccelerator.isSupported(),
        similarityThreshold: 0.4,
        autoEvolve: true,
        ...config,
    };
    hhmSystem = new HolographicMemorySystem(defaultConfig);
    logger.info('HHM system initialized', {
        dimensions: defaultConfig.dimensions,
        maxMemories: defaultConfig.maxMemories,
        useGPU: defaultConfig.useGPU,
        autoEvolve: defaultConfig.autoEvolve,
    });
}
/**
 * Get HHM system instance
 */
export function getHHMSystem() {
    if (!hhmSystem) {
        throw new Error('HHM system not initialized. Call initializeHHM first.');
    }
    return hhmSystem;
}
/**
 * Memory formation handlers
 */
export const memoryHandlers = {
    /**
     * Memorize text content
     */
    async memorizeText(params) {
        const system = getHHMSystem();
        return system.memorizeText(params.text, params.id);
    },
    /**
     * Memorize Scrivener document
     */
    async memorizeDocument(params) {
        const system = getHHMSystem();
        return system.memorizeDocument(params.document);
    },
    /**
     * Memorize composite data
     */
    async memorizeComposite(params) {
        const system = getHHMSystem();
        return system.memorizeComposite(params.inputs);
    },
    /**
     * Memorize temporal sequence
     */
    async memorizeSequence(params) {
        const system = getHHMSystem();
        return system.memorizeSequence(params.events);
    },
    /**
     * Memorize relationship
     */
    async memorizeRelationship(params) {
        const system = getHHMSystem();
        // Convert Float32Array to HyperVector if needed
        const subjectVector = typeof params.subject === 'string'
            ? params.subject
            : HyperVector.fromFloat32Array(params.subject.vector);
        const objectVector = typeof params.object === 'string'
            ? params.object
            : HyperVector.fromFloat32Array(params.object.vector);
        return system.memorizeRelationship(subjectVector, params.relation, objectVector);
    },
};
/**
 * Memory retrieval handlers
 */
export const retrievalHandlers = {
    /**
     * Query memory with text
     */
    async queryText(params) {
        const system = getHHMSystem();
        return system.queryText(params.text, params.k || 10);
    },
    /**
     * Query memory with vector
     */
    async queryVector(params) {
        const system = getHHMSystem();
        const hyperVector = HyperVector.fromFloat32Array(params.vector);
        return system.query(hyperVector, params.k || 10);
    },
    /**
     * Find analogies
     */
    async findAnalogy(params) {
        const system = getHHMSystem();
        return system.findAnalogy(params.a, params.b, params.c);
    },
};
/**
 * Memory management handlers
 */
export const managementHandlers = {
    /**
     * Check consistency
     */
    async checkConsistency(params) {
        const system = getHHMSystem();
        return system.checkConsistency(params.memoryIds);
    },
    /**
     * Generate novel concepts
     */
    async generateConcepts() {
        const system = getHHMSystem();
        return system.generateConcepts();
    },
    /**
     * Enter dream mode
     */
    async dreamMode(params) {
        const system = getHHMSystem();
        return system.dream(params.duration || 10000);
    },
    /**
     * Get system statistics
     */
    async getStats() {
        const system = getHHMSystem();
        return system.getStats();
    },
    /**
     * Export memory snapshot
     */
    async exportSnapshot() {
        const system = getHHMSystem();
        return system.exportSnapshot();
    },
    /**
     * Clear cache
     */
    async clearCache() {
        const cache = CacheManager.getInstance();
        cache.clear();
        logger.info('Memory cache cleared');
    },
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        const cache = CacheManager.getInstance();
        return cache.getStats();
    },
};
/**
 * Benchmarking handlers
 */
export const benchmarkHandlers = {
    /**
     * Run performance benchmark
     */
    async runBenchmark(params) {
        logger.info('Running HHM benchmark...');
        await quickBenchmark(params.dimensions || 10000);
        return 'Benchmark complete. Check console for results.';
    },
    /**
     * Test GPU acceleration
     */
    async testGPU() {
        if (!GPUAccelerator.isSupported()) {
            return {
                supported: false,
                message: 'WebGPU not supported in this environment',
            };
        }
        const accelerator = new GPUAccelerator();
        const initialized = await accelerator.initialize();
        if (!initialized) {
            return {
                supported: true,
                initialized: false,
                message: 'GPU acceleration available but initialization failed',
            };
        }
        const info = accelerator.getDeviceInfo();
        accelerator.destroy();
        return {
            supported: true,
            initialized: true,
            deviceInfo: info,
        };
    },
};
export function registerHHMHandlers(server) {
    // Memory formation
    server.setRequestHandler('hhm/memorize/text', memoryHandlers.memorizeText);
    server.setRequestHandler('hhm/memorize/document', memoryHandlers.memorizeDocument);
    server.setRequestHandler('hhm/memorize/composite', memoryHandlers.memorizeComposite);
    server.setRequestHandler('hhm/memorize/sequence', memoryHandlers.memorizeSequence);
    server.setRequestHandler('hhm/memorize/relationship', memoryHandlers.memorizeRelationship);
    // Memory retrieval
    server.setRequestHandler('hhm/query/text', retrievalHandlers.queryText);
    server.setRequestHandler('hhm/query/vector', retrievalHandlers.queryVector);
    server.setRequestHandler('hhm/query/analogy', retrievalHandlers.findAnalogy);
    // Memory management
    server.setRequestHandler('hhm/consistency/check', managementHandlers.checkConsistency);
    server.setRequestHandler('hhm/concepts/generate', managementHandlers.generateConcepts);
    server.setRequestHandler('hhm/dream', managementHandlers.dreamMode);
    server.setRequestHandler('hhm/stats', managementHandlers.getStats);
    server.setRequestHandler('hhm/export', managementHandlers.exportSnapshot);
    server.setRequestHandler('hhm/cache/clear', managementHandlers.clearCache);
    server.setRequestHandler('hhm/cache/stats', managementHandlers.getCacheStats);
    // Benchmarking
    server.setRequestHandler('hhm/benchmark/run', benchmarkHandlers.runBenchmark);
    server.setRequestHandler('hhm/benchmark/gpu', benchmarkHandlers.testGPU);
    logger.info('HHM handlers registered');
}
//# sourceMappingURL=memory-handlers.js.map