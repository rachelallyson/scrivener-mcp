import { MLWordClassifierPro } from '../../../analysis/ml-word-classifier-pro.js';
import type { Change } from '../content-enhancer.js';
export declare class DescriptionEnhancer {
    private classifier;
    constructor(classifier: MLWordClassifierPro);
    enhanceDescriptions(content: string, changes: Change[]): string;
    addSensoryDetails(content: string, changes: Change[]): string;
    expandContent(content: string, changes: Change[], targetLength?: number): string;
    private shouldEnhanceNoun;
    private calculateGenericScore;
    private generateContextualAdjective;
    private categorizeNoun;
    private analyzeContext;
    private detectSceneType;
    private enrichWithSensory;
    private generateSensoryEnhancement;
    private findBestInsertionPoint;
    private lacksSensoryDetail;
    private calculateSensoryScore;
    private expandWithActionDetails;
    private generateActionExpansion;
}
//# sourceMappingURL=description-enhancer.d.ts.map