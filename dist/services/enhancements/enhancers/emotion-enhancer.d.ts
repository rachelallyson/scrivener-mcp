import { MLWordClassifierPro } from '../../../analysis/ml-word-classifier-pro.js';
import type { Change } from '../content-enhancer.js';
export declare class EmotionEnhancer {
    private classifier;
    constructor(classifier: MLWordClassifierPro);
    showDontTell(content: string, changes: Change[]): string;
    private detectTellingPatterns;
    private convertToShowing;
    private generateEmotionResponse;
    private generatePhysicalResponse;
}
//# sourceMappingURL=emotion-enhancer.d.ts.map