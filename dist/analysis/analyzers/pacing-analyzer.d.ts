export interface PacingAnalysis {
    overall: 'slow' | 'moderate' | 'fast' | 'variable';
    sections: {
        start: number;
        end: number;
        pace: 'slow' | 'moderate' | 'fast';
    }[];
    actionVsReflection: number;
    recommendedAdjustments: string[];
}
export declare class PacingAnalyzer {
    analyzePacing(content: string): Promise<PacingAnalysis>;
    private splitIntoSegments;
    private getDefaultPacingAnalysis;
}
//# sourceMappingURL=pacing-analyzer.d.ts.map