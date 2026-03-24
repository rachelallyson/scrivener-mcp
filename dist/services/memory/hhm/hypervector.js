/**
 * Holographic Hyperdimensional Memory (HHM) System
 * Core Hypervector Implementation
 *
 * Implements high-dimensional binary vectors for distributed representation
 * of concepts, memories, and relationships in a holographic memory substrate.
 */
var _a;
import { SIMDOperations } from './simd-operations.js';
export class HyperVector {
    constructor(dimensions = 10000, components) {
        if (dimensions < 1000) {
            throw new Error('Hypervectors require at least 1000 dimensions for proper distribution');
        }
        this.dimensions = dimensions;
        this.components = components || this.generateRandomVector(dimensions);
    }
    /**
     * Generate a random binary hypervector using SIMD operations
     */
    generateRandomVector(dimensions) {
        return SIMDOperations.generateRandomVector(dimensions);
    }
    /**
     * Circular convolution for binding two hypervectors using SIMD
     * Z = X ⊗ Y
     */
    bind(other) {
        if (this.dimensions !== other.dimensions) {
            throw new Error('Cannot bind vectors of different dimensions');
        }
        // Use SIMD-optimized circular convolution
        const result = SIMDOperations.circularConvolution(this.components, other.components);
        return new HyperVector(this.dimensions, result);
    }
    /**
     * Unbind operation using inverse circular convolution
     * X' = Y'⁻¹ ⊗ Z
     */
    unbind(other) {
        const inverse = other.inverse();
        return this.bind(inverse);
    }
    /**
     * Compute inverse of hypervector for unbinding
     * For binary vectors, the inverse reverses the order
     */
    inverse() {
        const inverted = new Int8Array(this.dimensions);
        inverted[0] = this.components[0];
        for (let i = 1; i < this.dimensions; i++) {
            inverted[i] = this.components[this.dimensions - i];
        }
        return new HyperVector(this.dimensions, inverted);
    }
    /**
     * Bundle multiple hypervectors using SIMD operations
     * Used for representing "A AND B" relationships
     */
    static bundle(vectors) {
        if (vectors.length === 0) {
            throw new Error('Cannot bundle empty vector array');
        }
        const dimensions = vectors[0].dimensions;
        // Verify all vectors have same dimensions
        for (const vector of vectors) {
            if (vector.dimensions !== dimensions) {
                throw new Error('All vectors must have same dimensions for bundling');
            }
        }
        // Use SIMD-optimized bundling
        const componentArrays = vectors.map((v) => v.components);
        const result = SIMDOperations.bundle(componentArrays);
        return new HyperVector(dimensions, result);
    }
    /**
     * Compute similarity using SIMD-optimized dot product
     * High dot product indicates high similarity
     */
    similarity(other) {
        if (this.dimensions !== other.dimensions) {
            throw new Error('Cannot compute similarity of vectors with different dimensions');
        }
        const dotProduct = SIMDOperations.dotProduct(this.components, other.components);
        // Normalize to [0, 1] range
        return (dotProduct + this.dimensions) / (2 * this.dimensions);
    }
    /**
     * Permute vector components using SIMD operations
     * Used for representing sequence and order
     */
    permute(shift) {
        const result = SIMDOperations.permute(this.components, shift);
        return new HyperVector(this.dimensions, result);
    }
    /**
     * Add noise to vector for memory consolidation/decay
     */
    addNoise(noiseLevel) {
        const noisy = new Int8Array(this.dimensions);
        const flipProbability = noiseLevel;
        for (let i = 0; i < this.dimensions; i++) {
            if (Math.random() < flipProbability) {
                noisy[i] = -this.components[i];
            }
            else {
                noisy[i] = this.components[i];
            }
        }
        return new HyperVector(this.dimensions, noisy);
    }
    /**
     * Get raw components for GPU operations
     */
    getComponents() {
        return this.components;
    }
    /**
     * Get dimensionality
     */
    getDimensions() {
        return this.dimensions;
    }
    /**
     * Clone the hypervector
     */
    clone() {
        return new HyperVector(this.dimensions, new Int8Array(this.components));
    }
    /**
     * Convert to Float32Array for GPU operations
     */
    toFloat32Array() {
        const float32 = new Float32Array(this.dimensions);
        for (let i = 0; i < this.dimensions; i++) {
            float32[i] = this.components[i];
        }
        return float32;
    }
    /**
     * Create from Float32Array (from GPU operations)
     */
    static fromFloat32Array(array) {
        const components = new Int8Array(array.length);
        for (let i = 0; i < array.length; i++) {
            components[i] = array[i] >= 0 ? 1 : -1;
        }
        return new HyperVector(array.length, components);
    }
}
// Predefined semantic role vectors
export class SemanticVectors {
    static setDimensions(dims) {
        this.dimensions = dims;
        this.cache.clear();
    }
    static get(role) {
        if (!this.cache.has(role)) {
            // Use deterministic seed for consistent vectors
            const seed = this.hashString(role);
            const vector = this.generateSeededVector(seed);
            this.cache.set(role, vector);
        }
        return this.cache.get(role);
    }
    static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    static generateSeededVector(seed) {
        const components = new Int8Array(this.dimensions);
        let rand = seed;
        for (let i = 0; i < this.dimensions; i++) {
            // Simple linear congruential generator
            rand = (rand * 1664525 + 1013904223) & 0xffffffff;
            components[i] = rand & 1 ? 1 : -1;
        }
        return new HyperVector(this.dimensions, components);
    }
    // Additional semantic roles
    static getRole(role) {
        return this.get(role);
    }
}
_a = SemanticVectors;
SemanticVectors.cache = new Map();
SemanticVectors.dimensions = 10000;
// Common semantic roles
SemanticVectors.NEGATION = () => _a.get('NOT');
SemanticVectors.CAUSALITY = () => _a.get('CAUSES');
SemanticVectors.TEMPORAL_BEFORE = () => _a.get('BEFORE');
SemanticVectors.TEMPORAL_AFTER = () => _a.get('AFTER');
SemanticVectors.LOCATION = () => _a.get('AT');
SemanticVectors.POSSESSION = () => _a.get('HAS');
SemanticVectors.IDENTITY = () => _a.get('IS');
SemanticVectors.SIMILARITY = () => _a.get('LIKE');
//# sourceMappingURL=hypervector.js.map