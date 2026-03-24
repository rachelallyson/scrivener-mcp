export interface StructureAnalysis {
    sceneBreaks: number;
    chapters: number;
    averageSceneLength: number;
    openingStrength: 'weak' | 'moderate' | 'strong';
    endingStrength: 'weak' | 'moderate' | 'strong';
    hookPresence: boolean;
    cliffhangers: number;
}
export declare class StructureAnalyzer {
    analyzeStructure(content: string): StructureAnalysis;
    private assessOpeningStrength;
    private assessEndingStrength;
    private detectHook;
    private countCliffhangers;
}
//# sourceMappingURL=structure-analyzer.d.ts.map