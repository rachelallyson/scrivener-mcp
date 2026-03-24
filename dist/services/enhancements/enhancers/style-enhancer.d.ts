import type { StyleGuide } from '../../../memory-manager.js';
import { MLWordClassifierPro } from '../../../analysis/ml-word-classifier-pro.js';
import type { Change } from '../content-enhancer.js';
export declare class StyleEnhancer {
    private classifier;
    constructor(classifier: MLWordClassifierPro);
    eliminateFilterWords(content: string, changes: Change[]): string;
    strengthenVerbs(content: string, changes: Change[]): string;
    varySentences(content: string, changes: Change[]): string;
    matchStyle(content: string, changes: Change[], styleGuide?: StyleGuide): string;
    private shouldRemoveFilterWord;
    private isWeakVerb;
    private strengthenVerb;
    private startsSimilarly;
    private varyOpening;
    private varyLength;
    private needsTransition;
    private detectTopicShift;
    private selectTransition;
    private analyzeTransitionType;
    private breakLongSentence;
    private expandSentence;
    private isActionVerb;
    private selectAdverb;
}
//# sourceMappingURL=style-enhancer.d.ts.map