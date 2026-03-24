import { MLWordClassifierPro } from '../../../analysis/ml-word-classifier-pro.js';
import type { Change, EnhancementOptions } from '../content-enhancer.js';
export declare class ClarityEnhancer {
    private classifier;
    constructor(classifier: MLWordClassifierPro);
    improveFlow(content: string, changes: Change[]): string;
    condenseContent(content: string, changes: Change[], options: EnhancementOptions, targetLength?: number): string;
    fixPacing(content: string, changes: Change[], options: EnhancementOptions): string;
    simplifySentences(content: string, changes: Change[]): string;
    complexifySentences(content: string, changes: Change[]): string;
    convertTense(content: string, tense: string, changes: Change[]): string;
    private needsTransition;
    private detectTopicShift;
    private selectTransition;
    private removeRedundancy;
    private combineSentences;
    private removeNonEssentialModifiers;
    private breakLongSentence;
    private canCombineSentences;
    private combineTwoSentences;
    private breakCompoundSentences;
    private simplifyVocabulary;
    private removeQualifiers;
    private combineSentencesComplex;
    private enhanceVocabulary;
    private addSubordinateClauses;
    private generateSubordinateClause;
    private categorizeNoun;
    private isLessEssentialAdjective;
    private isVerbPattern;
    private applyTenseConversion;
    private makePastTense;
    private makePresentTense;
}
//# sourceMappingURL=clarity-enhancer.d.ts.map