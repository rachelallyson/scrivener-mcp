export interface EmotionalAnalysis {
    dominantEmotion: string;
    emotionalArc: {
        position: number;
        emotion: string;
        intensity: number;
    }[];
    tensionLevel: number;
    moodConsistency: number;
}
export declare class EmotionAnalyzer {
    analyzeEmotions(content: string): Promise<EmotionalAnalysis>;
    private splitIntoSegments;
    private detectSegmentEmotion;
    private analyzeEmotionPatterns;
    private isJoyWord;
    private isSadnessWord;
    private isAngerWord;
    private isFearWord;
    private isSurpriseWord;
    private isDisgustWord;
    private getDefaultEmotionalAnalysis;
}
//# sourceMappingURL=emotion-analyzer.d.ts.map