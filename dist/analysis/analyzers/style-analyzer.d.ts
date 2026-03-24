import type { PredictiveCacheFactory } from '../../utils/predictive-cache.js';
export interface StyleAnalysis {
    sentenceVariety: 'low' | 'medium' | 'high';
    vocabularyComplexity: 'simple' | 'moderate' | 'complex' | 'advanced';
    adverbUsage: 'minimal' | 'moderate' | 'heavy';
    passiveVoicePercentage: number;
    dialoguePercentage: number;
    descriptionPercentage: number;
    mostFrequentWords: {
        word: string;
        count: number;
    }[];
    styleConsistency: number;
}
export declare class StyleAnalyzer {
    private predictiveStyleCache;
    private countSyllables;
    private commonWords;
    constructor(predictiveStyleCache: ReturnType<typeof PredictiveCacheFactory.createMetadataCache>, countSyllables: (words: string[]) => number);
    analyzeStyle(content: string): Promise<StyleAnalysis>;
    private calculateVariance;
    private isPassiveIndicator;
    private getDefaultStyleAnalysis;
}
//# sourceMappingURL=style-analyzer.d.ts.map