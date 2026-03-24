/**
 * GPU-Accelerated Text Processing via WebGL Compute Shaders
 * Leverages GPU parallel processing for ultra-high-performance text analysis
 */
import '../types/webgpu.js';
/**
 * GPU Text Processing Accelerator using WebGL Compute Shaders
 * Provides 100-1000x speedup for parallel text operations
 */
export declare class GPUAccelerator {
    private static instance;
    private device;
    private isInitialized;
    private initPromise;
    private performanceMetrics;
    private bufferPool;
    private readonly textAnalysisShader;
    private constructor();
    static getInstance(): GPUAccelerator;
    /**
     * Initialize WebGPU device and compute pipeline
     */
    initialize(): Promise<void>;
    private doInitialize;
    private initializeBufferPool;
    private getPooledBuffer;
    private returnToPool;
    /**
     * Ultra-fast parallel word counting using GPU
     */
    countWordsGPU(text: string): Promise<number>;
    /**
     * Massively parallel sentiment analysis using GPU
     */
    analyzeSentimentGPU(text: string): Promise<number>;
    /**
     * GPU-accelerated readability calculation
     */
    calculateReadabilityGPU(text: string): Promise<{
        fleschReadingEase: number;
        fleschKincaidGrade: number;
        wordCount: number;
        sentenceCount: number;
        syllableCount: number;
    }>;
    private computeReadabilityMetrics;
    /**
     * Batch process multiple texts with massive GPU parallelization
     */
    batchProcessGPU(texts: string[]): Promise<Array<{
        wordCount: number;
        sentiment: number;
        readability: number;
    }>>;
    private fallbackWordCount;
    private fallbackSentiment;
    private fallbackReadability;
    private trackPerformance;
    /**
     * Get performance comparison between GPU and CPU implementations
     */
    getPerformanceComparison(): {
        gpuEnabled: boolean;
        operations: {
            [key: string]: {
                avg: number;
                speedup: string;
            };
        };
    };
    /**
     * Warm up GPU with test workloads
     */
    warmup(): Promise<void>;
    /**
     * Cleanup GPU resources
     */
    cleanup(): void;
}
export declare const gpuAccelerator: GPUAccelerator;
//# sourceMappingURL=gpu-accelerator.d.ts.map