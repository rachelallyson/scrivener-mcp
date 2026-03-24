/**
 * Holographic Hyperdimensional Memory (HHM) System
 * Core Hypervector Implementation
 *
 * Implements high-dimensional binary vectors for distributed representation
 * of concepts, memories, and relationships in a holographic memory substrate.
 */
export declare class HyperVector {
    private readonly dimensions;
    private readonly components;
    constructor(dimensions?: number, components?: Int8Array);
    /**
     * Generate a random binary hypervector using SIMD operations
     */
    private generateRandomVector;
    /**
     * Circular convolution for binding two hypervectors using SIMD
     * Z = X ⊗ Y
     */
    bind(other: HyperVector): HyperVector;
    /**
     * Unbind operation using inverse circular convolution
     * X' = Y'⁻¹ ⊗ Z
     */
    unbind(other: HyperVector): HyperVector;
    /**
     * Compute inverse of hypervector for unbinding
     * For binary vectors, the inverse reverses the order
     */
    inverse(): HyperVector;
    /**
     * Bundle multiple hypervectors using SIMD operations
     * Used for representing "A AND B" relationships
     */
    static bundle(vectors: HyperVector[]): HyperVector;
    /**
     * Compute similarity using SIMD-optimized dot product
     * High dot product indicates high similarity
     */
    similarity(other: HyperVector): number;
    /**
     * Permute vector components using SIMD operations
     * Used for representing sequence and order
     */
    permute(shift: number): HyperVector;
    /**
     * Add noise to vector for memory consolidation/decay
     */
    addNoise(noiseLevel: number): HyperVector;
    /**
     * Get raw components for GPU operations
     */
    getComponents(): Int8Array;
    /**
     * Get dimensionality
     */
    getDimensions(): number;
    /**
     * Clone the hypervector
     */
    clone(): HyperVector;
    /**
     * Convert to Float32Array for GPU operations
     */
    toFloat32Array(): Float32Array;
    /**
     * Create from Float32Array (from GPU operations)
     */
    static fromFloat32Array(array: Float32Array): HyperVector;
}
export declare class SemanticVectors {
    private static cache;
    private static dimensions;
    static setDimensions(dims: number): void;
    static get(role: string): HyperVector;
    private static hashString;
    private static generateSeededVector;
    static readonly NEGATION: () => HyperVector;
    static readonly CAUSALITY: () => HyperVector;
    static readonly TEMPORAL_BEFORE: () => HyperVector;
    static readonly TEMPORAL_AFTER: () => HyperVector;
    static readonly LOCATION: () => HyperVector;
    static readonly POSSESSION: () => HyperVector;
    static readonly IDENTITY: () => HyperVector;
    static readonly SIMILARITY: () => HyperVector;
    static getRole(role: string): HyperVector;
}
//# sourceMappingURL=hypervector.d.ts.map