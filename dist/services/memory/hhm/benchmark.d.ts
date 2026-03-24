/**
 * Performance benchmarking utilities for HHM
 */
export interface BenchmarkResult {
    operation: string;
    iterations: number;
    totalTimeMs: number;
    avgTimeMs: number;
    opsPerSecond: number;
    memoryUsedMB: number;
}
export declare class HHMBenchmark {
    private results;
    private gpuAccelerator;
    /**
     * Run complete benchmark suite
     */
    runFullBenchmark(dimensions?: number): Promise<BenchmarkResult[]>;
    /**
     * Benchmark basic vector operations
     */
    benchmarkVectorOperations(dimensions: number): Promise<void>;
    /**
     * Benchmark SIMD operations
     */
    benchmarkSIMDOperations(dimensions: number): Promise<void>;
    /**
     * Benchmark GPU operations
     */
    benchmarkGPUOperations(dimensions: number): Promise<void>;
    /**
     * Benchmark memory substrate operations
     */
    benchmarkMemorySubstrate(dimensions: number): Promise<void>;
    /**
     * Add benchmark result
     */
    private addResult;
    /**
     * Get benchmark results summary
     */
    getSummary(): string;
    /**
     * Compare CPU vs GPU performance
     */
    comparePerformance(): Record<string, unknown>;
    /**
     * Export results to JSON
     */
    exportResults(): string;
}
/**
 * Run quick benchmark
 */
export declare function quickBenchmark(dimensions?: number): Promise<void>;
//# sourceMappingURL=benchmark.d.ts.map