import type { Change, EnhancementOptions } from '../content-enhancer.js';
export declare class PacingEnhancer {
    fixPacing(content: string, changes: Change[], options: EnhancementOptions): string;
    fixContinuity(content: string, changes: Change[], context?: string): string;
    private breakLongSentence;
    private canCombineSentences;
    private combineSentences;
    private parseContext;
    private findNameVariations;
}
//# sourceMappingURL=pacing-enhancer.d.ts.map