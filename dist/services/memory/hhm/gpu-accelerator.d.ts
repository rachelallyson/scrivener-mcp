/**
 * GPU Acceleration Module for HHM
 * Provides WebGPU acceleration with automatic CPU fallback
 */
import { HyperVector } from './hypervector.js';
export interface GPUConfig {
    preferredDevice?: 'high-performance' | 'low-power';
    maxBufferSizeMB?: number;
    workgroupSize?: number;
}
export declare class GPUAccelerator {
    private device;
    private adapter;
    private computePipelines;
    private bufferPool;
    private isInitialized;
    private config;
    constructor(config?: GPUConfig);
    /**
     * Check WebGPU availability
     */
    static isSupported(): boolean;
    /**
     * Initialize GPU device
     */
    initialize(): Promise<boolean>;
    /**
     * Create reusable compute pipelines
     */
    private createComputePipelines;
    /**
     * Compute similarities between query and multiple vectors
     */
    computeSimilarities(query: HyperVector, vectors: HyperVector[]): Promise<Float32Array>;
    /**
     * GPU-accelerated circular convolution
     */
    circularConvolution(a: HyperVector, b: HyperVector): Promise<HyperVector>;
    /**
     * GPU-accelerated bundling
     */
    bundle(vectors: HyperVector[]): Promise<HyperVector>;
    /**
     * CPU fallback for similarity computation
     */
    private cpuSimilarities;
    /**
     * Get or create a reusable buffer
     */
    private getOrCreateBuffer;
    /**
     * Get GPU device information
     */
    getDeviceInfo(): Record<string, unknown> | null;
    /**
     * Clean up GPU resources
     */
    destroy(): void;
}
//# sourceMappingURL=gpu-accelerator.d.ts.map