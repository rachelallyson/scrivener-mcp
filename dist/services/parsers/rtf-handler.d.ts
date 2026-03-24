export interface RTFStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
}
export interface RTFContent {
    plainText: string;
    formattedText: Array<{
        text: string;
        style?: RTFStyle;
    }>;
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string;
        synopsis?: string;
        notes?: string;
        creationDate?: Date;
        modificationDate?: Date;
    };
}
/**
 * Comprehensive RTF handler for Scrivener documents
 */
export declare class RTFHandler {
    private readonly SPECIAL_CHARS;
    private readonly SPECIAL_CHARS_REVERSE;
    /**
     * Read and parse an RTF file
     */
    readRTF(filePath: string): Promise<RTFContent>;
    /**
     * Parse RTF string content
     */
    parseRTF(rtfString: string): Promise<RTFContent>;
    /**
     * Write RTF content to a file
     */
    writeRTF(filePath: string, content: RTFContent | string): Promise<void>;
    /**
     * Unified RTF conversion that handles both plain text and formatted content
     */
    private unifiedConvertToRTF;
    /**
     * Build RTF header with optional metadata
     */
    private buildRTFHeader;
    /**
     * Build formatted RTF body from text segments
     */
    private buildFormattedRTF;
    /**
     * Enhanced manual RTF parsing with better Scrivener support
     */
    private enhancedRTFParse;
    /**
     * Extract metadata from RTF info group
     */
    private extractMetadata;
    /**
     * Strip RTF headers and control tables
     */
    private stripRTFHeaders;
    /**
     * Parse RTF content into text segments with formatting
     */
    private parseRTFSegments;
    /**
     * Tokenize RTF content for easier parsing
     */
    private tokenizeRTF;
    /**
     * Apply RTF control word to current style
     */
    private applyControlWord;
    /**
     * Convert from parsed RTF document structure
     */
    private convertRTFDocument;
    /**
     * Convert to RTF (public interface)
     */
    convertToRTF(plainText: string): string;
    /**
     * Extract plain text from RTF
     */
    extractPlainText(rtfString: string): string;
    /**
     * Enhanced Scrivener annotation preservation
     */
    preserveScrivenerAnnotations(rtfString: string): Map<string, string>;
    /**
     * Clean annotation text by removing RTF formatting
     */
    private cleanAnnotationText;
    /**
     * Helper: Encode text for RTF
     */
    private encodeTextForRTF;
    /**
     * Helper: Encode RTF string (for metadata)
     */
    private encodeRTFString;
    /**
     * Helper: Decode RTF string
     */
    private decodeRTFString;
    /**
     * Helper: Encode non-ASCII characters
     */
    private encodeNonASCII;
    /**
     * Merge multiple RTF files
     */
    mergeRTFFiles(filePaths: string[]): Promise<string>;
}
//# sourceMappingURL=rtf-handler.d.ts.map