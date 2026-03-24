import type { WritingMetrics } from './metrics-analyzer.js';
import type { StyleAnalysis } from './style-analyzer.js';
import type { QualityIndicators } from './quality-analyzer.js';
export interface Suggestion {
    type: 'style' | 'structure' | 'grammar' | 'clarity' | 'impact';
    severity: 'minor' | 'moderate' | 'major';
    location?: {
        paragraph: number;
        sentence?: number;
    };
    issue: string;
    suggestion: string;
    example?: string;
}
export declare class SuggestionGenerator {
    generateSuggestions(content: string, metrics: WritingMetrics, style: StyleAnalysis, quality: QualityIndicators): Promise<Suggestion[]>;
}
//# sourceMappingURL=suggestion-generator.d.ts.map