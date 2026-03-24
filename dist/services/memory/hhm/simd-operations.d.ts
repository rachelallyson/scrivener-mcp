/**
 * SIMD-optimized operations for hypervectors
 * Uses typed arrays and batch operations for performance
 */
export declare class SIMDOperations {
    private static readonly CHUNK_SIZE;
    private static readonly CACHE_SIZE;
    /**
     * Optimized dot product using unrolled loops
     */
    static dotProduct(a: Int8Array, b: Int8Array): number;
    /**
     * Optimized circular convolution using cache-friendly access patterns
     */
    static circularConvolution(a: Int8Array, b: Int8Array): Int8Array;
    /**
     * Optimized bundling using parallel accumulation
     */
    static bundle(vectors: Int8Array[]): Int8Array;
    /**
     * Batch similarity computation
     */
    static batchSimilarity(query: Int8Array, vectors: Int8Array[], threshold?: number): Float32Array;
    /**
     * Optimized XOR for binding operations
     */
    static xor(a: Int8Array, b: Int8Array): Int8Array;
    /**
     * Optimized permutation for sequential encoding
     */
    static permute(vector: Int8Array, shift: number): Int8Array;
    /**
     * Fast random vector generation using pre-computed random pool
     */
    private static randomPool;
    private static randomPoolIndex;
    private static readonly RANDOM_POOL_SIZE;
    static generateRandomVector(dimensions: number): Int8Array;
    /**
     * Batch encode multiple values efficiently
     */
    static batchEncode(values: number[], dimensions: number, bits?: number): Int8Array[];
    /**
     * Compute Hamming distance between vectors
     */
    static hammingDistance(a: Int8Array, b: Int8Array): number;
    /**
     * Get performance statistics
     */
    static getStats(): Record<string, unknown>;
}
//# sourceMappingURL=simd-operations.d.ts.map