import type { MLWordClassifierPro } from '../ml-word-classifier-pro.js';
export interface QualityIndicators {
    repetitiveness: number;
    cliches: string[];
    filterWords: string[];
    tellingVsShowing: number;
    sensoryDetails: 'lacking' | 'adequate' | 'rich';
    whiteSpace: 'cramped' | 'balanced' | 'excessive';
}
export declare class QualityAnalyzer {
    private classifier;
    private clichePhrases;
    constructor(classifier: MLWordClassifierPro);
    assessQuality(content: string): Promise<QualityIndicators>;
    private isCognitiveVerb;
    private getDefaultQualityIndicators;
}
//# sourceMappingURL=quality-analyzer.d.ts.map