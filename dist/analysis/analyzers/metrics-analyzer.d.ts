import { getTextMetrics } from '../../utils/text-metrics.js';
import type { PredictiveCacheFactory } from '../../utils/predictive-cache.js';
export interface WritingMetrics {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageSentenceLength: number;
    averageParagraphLength: number;
    readingTime: number;
    fleschReadingEase: number;
    fleschKincaidGrade: number;
}
export declare class MetricsAnalyzer {
    private predictiveMetricsCache;
    private memoizeAsync;
    private getResourceFromPool;
    private returnResourceToPool;
    private readonly simdProcessor;
    private readonly wasmProcessor;
    private isWasmInitialized;
    constructor(predictiveMetricsCache: ReturnType<typeof PredictiveCacheFactory.createMetadataCache>, memoizeAsync: <T>(key: string, calculator: () => Promise<T>) => Promise<T>, getResourceFromPool: <T>(type: string, creator: () => T) => T, returnResourceToPool: <T>(type: string, resource: T) => void);
    setWasmInitialized(initialized: boolean): void;
    calculateMetrics(content: string, textMetrics?: ReturnType<typeof getTextMetrics>): Promise<WritingMetrics>;
    private countSyllables;
    private calculateReadability;
    private calculateReadabilityWithWasm;
    private calculateReadabilityWithSIMD;
    private fallbackReadabilityCalculation;
}
//# sourceMappingURL=metrics-analyzer.d.ts.map