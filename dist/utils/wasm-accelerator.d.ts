/**
 * WebAssembly-Accelerated Text Analysis Engine
 * Provides near-native performance for CPU-intensive text operations
 */
/**
 * WebAssembly Text Analysis Accelerator
 * Compiles critical text processing functions to WebAssembly for maximum performance
 */
export declare class WasmAccelerator {
    private static instance;
    private wasmModule;
    private isInitialized;
    private initPromise;
    private performanceMetrics;
    private readonly wasmSource;
    private constructor();
    static getInstance(): WasmAccelerator;
    /**
     * Initialize WebAssembly module
     */
    initialize(): Promise<void>;
    private doInitialize;
    private compileWasmSource;
    /**
     * High-performance sentiment analysis using WebAssembly
     */
    analyzeSentimentWasm(text: string): Promise<number>;
    /**
     * Ultra-fast syllable counting using WebAssembly
     */
    countSyllablesWasm(text: string): Promise<number>;
    /**
     * Advanced readability calculation with WebAssembly acceleration
     */
    calculateReadabilityWasm(text: string): Promise<{
        fleschReadingEase: number;
        fleschKincaidGrade: number;
        syllableCount: number;
        wordCount: number;
        sentenceCount: number;
    }>;
    /**
     * Batch process multiple texts with WebAssembly acceleration
     */
    batchProcessWasm(texts: string[]): Promise<Array<{
        sentiment: number;
        syllables: number;
        readability: number;
    }>>;
    private fallbackSentimentAnalysis;
    private fallbackSyllableCount;
    private fastWordCount;
    private fastSentenceCount;
    private trackPerformance;
    /**
     * Get performance comparison between WebAssembly and JavaScript
     */
    getPerformanceComparison(): {
        wasmEnabled: boolean;
        operations: {
            [key: string]: {
                avg: number;
                speedup: string;
            };
        };
    };
    /**
     * Warm up WebAssembly module with test data
     */
    warmup(): Promise<void>;
}
export declare const wasmAccelerator: WasmAccelerator;
//# sourceMappingURL=wasm-accelerator.d.ts.map