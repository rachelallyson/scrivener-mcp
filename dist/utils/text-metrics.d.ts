/**
 * Unified text metrics utilities for accurate word, sentence, and paragraph counting
 * Handles Unicode, contractions, acronyms, and special characters properly
 */
/**
 * Accurate word counting that handles:
 * - Numbers with commas/decimals (count as 1 word)
 * - Hyphenated words (split unless dictionary word)
 * - Smart quotes and dashes
 */
export declare function getAccurateWordCount(content: string): number;
/**
 * Count sentences accurately
 * Handles abbreviations, decimals, and dialogue
 */
export declare function getAccurateSentenceCount(content: string): number;
/**
 * Count paragraphs accurately
 * A paragraph is text separated by blank lines or indentation
 */
export declare function getAccurateParagraphCount(content: string): number;
/**
 * Split text into sentences (returns array of sentences)
 */
export declare function splitIntoSentences(content: string): string[];
/**
 * Get comprehensive text metrics
 */
export interface TextMetrics {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordsPerSentence: number;
    averageWordsPerParagraph: number;
    readingTimeMinutes: number;
}
export declare function getTextMetrics(content: string): TextMetrics;
/**
 * Calculate character count (with and without spaces)
 */
export declare function getCharacterCount(content: string, includeSpaces?: boolean): number;
/**
 * Get word frequency map
 * Uses NLP to identify stop words and common words
 */
export declare function getWordFrequency(content: string, ignoreCommonWords?: boolean): Map<string, number>;
/**
 * Split text into words
 */
export declare function splitIntoWords(text: string): string[];
/**
 * Get word pairs (bigrams) from text or word array
 */
export declare function getWordPairs(input: string | string[]): Array<[string, string]>;
/**
 * Export a function that matches the old signature for backward compatibility
 */
export declare function countWords(text: string): number;
//# sourceMappingURL=text-metrics.d.ts.map