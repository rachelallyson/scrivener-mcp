/**
 * Web Content Parser Service
 * Extracts and processes content from HTML sources using Cheerio
 */
import type { ContentExtractionOptions } from '../types/analysis.js';
export interface ParsedWebContent {
    title?: string;
    author?: string;
    publishDate?: string;
    content: string;
    summary?: string;
    metadata: {
        wordCount?: number;
        paragraphCount?: number;
        imageCount?: number;
        linkCount?: number;
        headingCount?: number;
        [key: string]: string | number | boolean | undefined;
    };
    links: Array<{
        text: string;
        url: string;
        type?: 'internal' | 'external' | string;
    }>;
    images: Array<{
        alt?: string;
        src?: string;
        url?: string;
        title?: string;
        caption?: string;
    }>;
    headings?: Array<{
        level: number;
        text: string;
        id?: string;
    }>;
}
export interface ResearchExtraction {
    facts: string[];
    quotes: string[];
    statistics: string[];
    sources: string[];
    keyTerms: string[];
    relevanceScore: number;
}
export declare class WebContentParser {
    private turndownService;
    constructor();
    /**
     * Parse HTML content and extract structured data
     */
    parseHtmlContent(html: string, baseUrl?: string, options?: ContentExtractionOptions): ParsedWebContent;
    /**
     * Extract research-relevant data from parsed content
     */
    extractResearchData(parsedContent: ParsedWebContent, keywords?: string[]): ResearchExtraction;
    /**
     * Convert HTML to clean, readable markdown
     */
    htmlToMarkdown(html: string, options?: {
        preserveImages?: boolean;
        preserveLinks?: boolean;
    }): string;
    /**
     * Extract article or blog post content from common CMS structures
     */
    extractArticleContent(html: string): {
        title: string;
        content: string;
        metadata: Record<string, unknown>;
    };
    /**
     * Extract main content using various strategies
     */
    private extractMainContent;
    /**
     * Extract title using multiple strategies
     */
    private extractTitle;
    /**
     * Extract author information
     */
    private extractAuthor;
    /**
     * Extract publish date
     */
    private extractPublishDate;
    /**
     * Extract summary or description
     */
    private extractSummary;
    /**
     * Extract all links from content
     */
    private extractLinks;
    /**
     * Extract all images from content
     */
    private extractImages;
    /**
     * Extract headings structure
     */
    private extractHeadings;
    /**
     * Calculate content metadata
     */
    private calculateMetadata;
    /**
     * Extract factual statements
     */
    private extractFacts;
    /**
     * Extract quotes from content
     */
    private extractQuotes;
    /**
     * Extract statistics and numerical data
     */
    private extractStatistics;
    /**
     * Extract source references
     */
    private extractSources;
    /**
     * Extract key terms from content
     */
    private extractKeyTerms;
    /**
     * Calculate relevance score based on key terms and keywords
     */
    private calculateRelevanceScore;
    /**
     * Extract article-specific metadata
     */
    private extractArticleMetadata;
}
export declare const webContentParser: WebContentParser;
//# sourceMappingURL=web-content-parser.d.ts.map