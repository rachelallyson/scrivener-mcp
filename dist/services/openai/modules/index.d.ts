export interface TextAnalyzer {
    analyzeText(content: string): Promise<any>;
    getReadabilityMetrics(content: string): Promise<any>;
}
export interface StyleAnalyzer {
    analyzeWritingStyle(content: string): Promise<any>;
    compareStyles(text1: string, text2: string): Promise<any>;
}
export interface CharacterAnalyzer {
    analyzeCharacters(content: string, characterNames?: string[]): Promise<any[]>;
    trackCharacterDevelopment(content: string): Promise<any>;
}
export interface PlotAnalyzer {
    analyzePlotStructure(content: string): Promise<any>;
    identifyPlotPoints(content: string): Promise<any[]>;
}
export interface SuggestionEngine {
    generateSuggestions(content: string, context?: any): Promise<any[]>;
    improvementRecommendations(content: string): Promise<any[]>;
}
export interface PromptGenerator {
    generateWritingPrompts(options: any): Promise<any>;
    createCustomPrompts(requirements: any): Promise<any[]>;
}
//# sourceMappingURL=index.d.ts.map