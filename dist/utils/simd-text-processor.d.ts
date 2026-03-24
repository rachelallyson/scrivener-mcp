/**
 * SIMD-Optimized Text Processing Engine
 * Leverages CPU SIMD instructions for parallel text operations
 */
export declare class SIMDTextProcessor {
    private static instance;
    private readonly simdWidth;
    private readonly textEncoder;
    private readonly textDecoder;
    private readonly workBuffer;
    private readonly uint8View;
    private readonly uint32View;
    private readonly float32View;
    private readonly vowelMask;
    private readonly consonantMask;
    private readonly whitespaceMask;
    private readonly punctuationMask;
    private constructor();
    static getInstance(): SIMDTextProcessor;
    private initializeLookupTables;
    private warmupSIMD;
    /**
     * Ultra-fast word counting using SIMD vectorization
     */
    countWordsVectorized(text: string): number;
    /**
     * Vectorized character distribution analysis
     */
    analyzeCharacterDistributionVectorized(text: string): {
        vowels: number;
        consonants: number;
        whitespace: number;
        punctuation: number;
        digits: number;
        others: number;
    };
    /**
     * Zero-copy sentence boundary detection using SIMD
     */
    findSentenceBoundariesVectorized(text: string): number[];
    /**
     * Parallel pattern matching using SIMD
     */
    findPatternsVectorized(text: string, patterns: string[]): Map<string, number[]>;
    /**
     * Advanced readability analysis using vectorized operations
     */
    calculateReadabilityMetricsVectorized(text: string): {
        fleschReadingEase: number;
        fleschKincaidGrade: number;
        averageWordsPerSentence: number;
        averageSyllablesPerWord: number;
        complexity: number;
    };
    /**
     * Memory-efficient text preprocessing with zero allocations
     */
    preprocessTextZeroCopy(text: string): {
        normalizedBytes: Uint8Array;
        wordBoundaries: Uint32Array;
        sentenceBoundaries: Uint32Array;
        metadata: {
            wordCount: number;
            sentenceCount: number;
        };
    };
    /**
     * Get performance statistics for the SIMD processor
     */
    getPerformanceStats(): {
        simdWidth: number;
        bufferSize: number;
        lookupTableSize: number;
        estimatedThroughput: string;
    };
}
export declare const simdTextProcessor: SIMDTextProcessor;
//# sourceMappingURL=simd-text-processor.d.ts.map