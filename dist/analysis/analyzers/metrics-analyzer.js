import { getTextMetrics } from '../../utils/text-metrics.js';
import { simdTextProcessor } from '../../utils/simd-text-processor.js';
import { wasmAccelerator } from '../../utils/wasm-accelerator.js';
import { generateHash } from '../../utils/common.js';
export class MetricsAnalyzer {
    constructor(predictiveMetricsCache, memoizeAsync, getResourceFromPool, returnResourceToPool) {
        this.predictiveMetricsCache = predictiveMetricsCache;
        this.memoizeAsync = memoizeAsync;
        this.getResourceFromPool = getResourceFromPool;
        this.returnResourceToPool = returnResourceToPool;
        this.simdProcessor = simdTextProcessor;
        this.wasmProcessor = wasmAccelerator;
        this.isWasmInitialized = false;
    }
    setWasmInitialized(initialized) {
        this.isWasmInitialized = initialized;
    }
    async calculateMetrics(content, textMetrics) {
        const contentHash = generateHash(content.substring(0, 500));
        const cacheKey = `metrics:${contentHash}`;
        const context = ['metrics', 'text-analysis', contentHash.substring(0, 8)];
        // Try predictive cache first
        const cachedMetrics = await this.predictiveMetricsCache.get(cacheKey, context, 'metrics-session');
        if (cachedMetrics) {
            return cachedMetrics;
        }
        const result = await this.memoizeAsync(cacheKey, async () => {
            // Use pre-calculated metrics if available, otherwise calculate
            const metrics = textMetrics || getTextMetrics(content);
            // Use vectorized word counting for performance
            const vectorizedWordCount = this.simdProcessor.countWordsVectorized(content);
            const correctedMetrics = {
                ...metrics,
                wordCount: vectorizedWordCount,
            };
            // Use resource pooling for expensive word processing
            const words = this.getResourceFromPool('word-array', () => []);
            words.length = 0; // Clear the array
            words.push(...content.split(/\s+/).filter((w) => w.length > 0));
            // Calculate readability scores using WASM acceleration when available
            const readabilityResult = this.isWasmInitialized
                ? await this.calculateReadabilityWithWasm(content, correctedMetrics)
                : this.calculateReadabilityWithSIMD(content, correctedMetrics, words);
            const { fleschReadingEase, fleschKincaidGrade } = readabilityResult;
            // Return word array to pool
            this.returnResourceToPool('word-array', words);
            return {
                wordCount: correctedMetrics.wordCount,
                sentenceCount: correctedMetrics.sentenceCount,
                paragraphCount: correctedMetrics.paragraphCount,
                averageSentenceLength: correctedMetrics.averageWordsPerSentence,
                averageParagraphLength: correctedMetrics.averageWordsPerParagraph,
                readingTime: correctedMetrics.readingTimeMinutes,
                fleschReadingEase,
                fleschKincaidGrade,
            };
        });
        // Store in predictive cache for future access
        await this.predictiveMetricsCache.set(cacheKey, result, context, 'metrics-session');
        return result;
    }
    countSyllables(words) {
        return words.reduce((count, word) => {
            word = word.toLowerCase().replace(/[^a-z]/g, '');
            let syllables = 0;
            let previousWasVowel = false;
            for (let i = 0; i < word.length; i++) {
                const isVowel = /[aeiou]/.test(word[i]);
                if (isVowel && !previousWasVowel)
                    syllables++;
                previousWasVowel = isVowel;
            }
            // Adjustments
            if (word.endsWith('e'))
                syllables--;
            if (word.endsWith('le') && word.length > 2)
                syllables++;
            if (syllables === 0)
                syllables = 1;
            return count + syllables;
        }, 0);
    }
    calculateReadability(words, sentences, syllables) {
        // Handle edge cases
        if (words === 0 || sentences === 0) {
            return {
                fleschReadingEase: 0,
                fleschKincaidGrade: 0,
            };
        }
        const avgSyllablesPerWord = syllables / words;
        const avgWordsPerSentence = words / sentences;
        const fleschReadingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
        const fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
        return {
            fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
            fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
        };
    }
    async calculateReadabilityWithWasm(content, metrics) {
        try {
            // Use WASM for ultra-fast readability calculation
            const result = await this.wasmProcessor.calculateReadabilityWasm(content);
            return {
                fleschReadingEase: result.fleschReadingEase,
                fleschKincaidGrade: result.fleschKincaidGrade,
            };
        }
        catch {
            return this.fallbackReadabilityCalculation(metrics);
        }
    }
    calculateReadabilityWithSIMD(content, metrics, words) {
        try {
            // Use SIMD for vectorized readability calculation
            const simdMetrics = this.simdProcessor.calculateReadabilityMetricsVectorized(content);
            return {
                fleschReadingEase: simdMetrics.fleschReadingEase,
                fleschKincaidGrade: simdMetrics.fleschKincaidGrade,
            };
        }
        catch {
            return this.fallbackReadabilityCalculation(metrics, words);
        }
    }
    fallbackReadabilityCalculation(metrics, words) {
        const syllableCount = words ? this.countSyllables(words) : metrics.wordCount * 1.4; // Rough estimate
        return this.calculateReadability(metrics.wordCount, metrics.sentenceCount, syllableCount);
    }
}
//# sourceMappingURL=metrics-analyzer.js.map