/**
 * Style Guide Formatting Utilities
 * Consolidates style guide formatting across AI services
 */
import type { StyleGuide } from '../memory-manager.js';
export interface StyleGuideContextOptions {
    contextType?: 'general' | 'critique' | 'perspective' | 'analysis';
    includeGuidelines?: boolean;
    maxGuidelines?: number;
    customFields?: string[];
}
/**
 * Format style guide information for prompts
 * Eliminates duplicate style guide formatting code
 */
export declare function formatStyleGuideContext(styleGuide?: StyleGuide, options?: StyleGuideContextOptions): string;
/**
 * Generate style guide validation prompt
 */
export declare function createStyleGuideValidationPrompt(styleGuide: StyleGuide, content: string, focusAreas?: string[]): string;
/**
 * Check if content has sufficient style guide information
 */
export declare function hasMinimalStyleGuideInfo(styleGuide?: StyleGuide): boolean;
/**
 * Extract style guide summary for logging
 */
export declare function getStyleGuideSummary(styleGuide?: StyleGuide): Record<string, unknown>;
//# sourceMappingURL=style-guide-formatter.d.ts.map