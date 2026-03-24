/**
 * Filter words elimination enhancement
 */
import type { Change } from '../../types/enhancements.js';
export declare class FilterWordsEnhancer {
    eliminate(content: string, changes: Change[]): string;
    private isFilterUsage;
    private rewriteWithoutFilter;
    private convertVisualFilter;
    private convertAuditoryFilter;
    private convertTactileFilter;
    private convertCognitiveFilter;
    private convertObservationFilter;
}
//# sourceMappingURL=filter-words.d.ts.map