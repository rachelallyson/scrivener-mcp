/**
 * Document compilation and export service
 */
import { DOCUMENT_TYPES } from '../core/constants.js';
import { createError, ErrorCode } from '../core/errors.js';
import { getLogger } from '../core/logger.js';
import { getAccurateWordCount } from '../utils/text-metrics.js';
import { RTFHandler } from './parsers/rtf-handler.js';
const logger = getLogger('compilation-service');
export class CompilationService {
    constructor() {
        this.rtfHandler = new RTFHandler();
    }
    /**
     * Compile multiple documents into a single output
     */
    async compileDocuments(documents, options = {}) {
        const { separator = '\n\n---\n\n', outputFormat = 'text', includeSynopsis = false, includeNotes = false, } = options;
        // Convert all content to RTFContent format
        const rtfContents = documents.map((doc) => {
            if (typeof doc.content === 'string') {
                return {
                    plainText: doc.content,
                    formattedText: [{ text: doc.content }],
                    metadata: {},
                };
            }
            return doc.content;
        });
        switch (outputFormat) {
            case 'text':
                return this.compileToText(rtfContents, separator);
            case 'markdown':
                return this.compileToMarkdown(rtfContents, separator, documents);
            case 'html':
                return this.compileToHtml(rtfContents, separator, documents);
            case 'latex':
                return this.compileToLatex(rtfContents, documents);
            case 'json':
                return this.compileToJson(documents, rtfContents, {
                    includeSynopsis,
                    includeNotes,
                });
            default:
                throw createError(ErrorCode.INVALID_INPUT, undefined, `Unsupported output format: ${outputFormat}`);
        }
    }
    /**
     * Search content across documents
     */
    searchInDocuments(documents, query, options = {}) {
        const { caseSensitive = false, regex = false, searchMetadata = false, maxResults = Infinity, } = options;
        const results = [];
        let resultCount = 0;
        for (const doc of documents) {
            if (resultCount >= maxResults)
                break;
            const matches = [];
            // Search in content
            matches.push(...this.findMatches(doc.content, query, { caseSensitive, regex }));
            // Search in metadata if requested
            if (searchMetadata && doc.metadata) {
                if (this.matchesQuery(doc.title, query, caseSensitive)) {
                    matches.push(`Title: ${doc.title}`);
                }
                if (doc.metadata.synopsis &&
                    typeof doc.metadata.synopsis === 'string' &&
                    this.matchesQuery(doc.metadata.synopsis, query, caseSensitive)) {
                    matches.push(`Synopsis: ${doc.metadata.synopsis.substring(0, 100)}...`);
                }
                if (doc.metadata.notes &&
                    typeof doc.metadata.notes === 'string' &&
                    this.matchesQuery(doc.metadata.notes, query, caseSensitive)) {
                    matches.push(`Notes: ${doc.metadata.notes.substring(0, 100)}...`);
                }
                if (doc.metadata.keywords && Array.isArray(doc.metadata.keywords)) {
                    for (const keyword of doc.metadata.keywords) {
                        if (typeof keyword === 'string' &&
                            this.matchesQuery(keyword, query, caseSensitive)) {
                            matches.push(`Keyword: ${keyword}`);
                        }
                    }
                }
            }
            if (matches.length > 0) {
                results.push({
                    documentId: doc.id,
                    title: doc.title,
                    matches: matches.slice(0, 10), // Limit matches per document
                    wordCount: getAccurateWordCount(doc.content),
                });
                resultCount++;
            }
        }
        return results;
    }
    /**
     * Export project in various formats
     */
    async exportProject(structure, format, options = {}) {
        logger.info(`Exporting project as ${format}`);
        let content = '';
        const metadata = {
            exportDate: new Date().toISOString(),
            format,
            documentCount: this.countDocuments(structure),
        };
        switch (format) {
            case 'markdown':
                content = this.exportAsMarkdown(structure, options);
                break;
            case 'html':
                content = this.exportAsHtml(structure, options);
                break;
            case 'json':
                content = JSON.stringify(structure, null, 2);
                break;
            case 'epub':
                // Placeholder for EPUB export
                throw createError(ErrorCode.NOT_IMPLEMENTED, undefined, 'EPUB export not yet implemented');
            default:
                throw createError(ErrorCode.INVALID_INPUT, undefined, `Unsupported export format: ${format}`);
        }
        return { format, content, metadata };
    }
    /**
     * Extract annotations from RTF content
     */
    extractAnnotations(rtfContent) {
        return this.rtfHandler.preserveScrivenerAnnotations(rtfContent);
    }
    /**
     * Get project statistics
     */
    getStatistics(documents) {
        const stats = {
            totalDocuments: 0,
            totalFolders: 0,
            totalWords: 0,
            totalCharacters: 0,
            draftDocuments: 0,
            researchDocuments: 0,
            trashedDocuments: 0,
            metadata: {},
            documentsByType: {},
            documentsByStatus: {},
            documentsByLabel: {},
            averageDocumentLength: 0,
            longestDocument: null,
            shortestDocument: null,
            recentlyModified: [],
        };
        const processDocuments = (docs) => {
            for (const doc of docs) {
                stats.totalDocuments++;
                if (doc.type === DOCUMENT_TYPES.FOLDER) {
                    stats.totalFolders++;
                }
                stats.documentsByType[doc.type] = (stats.documentsByType[doc.type] || 0) + 1;
                if (doc.children) {
                    processDocuments(doc.children);
                }
            }
        };
        processDocuments(documents);
        const textDocs = stats.totalDocuments - stats.totalFolders;
        if (textDocs > 0) {
            stats.averageDocumentLength = Math.round(stats.totalWords / textDocs);
        }
        return stats;
    }
    // Private helper methods
    compileToText(contents, separator) {
        return contents
            .map((c) => c.plainText)
            .filter((text) => text.trim())
            .join(separator);
    }
    compileToMarkdown(contents, separator, documents) {
        const parts = [];
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            const doc = documents[i];
            if (content.plainText?.trim()) {
                // Add document title as heading
                parts.push(`# ${doc.title}\n`);
                // Process formatted text
                if (content.formattedText) {
                    let mdContent = '';
                    for (const part of content.formattedText) {
                        let text = part.text;
                        if (part.style?.bold && part.style?.italic) {
                            text = `***${text}***`;
                        }
                        else if (part.style?.bold) {
                            text = `**${text}**`;
                        }
                        else if (part.style?.italic) {
                            text = `*${text}*`;
                        }
                        mdContent += text;
                    }
                    parts.push(mdContent);
                }
                else {
                    parts.push(content.plainText || '');
                }
            }
        }
        return parts.join(separator);
    }
    compileToHtml(_contents, _separator, _documents) {
        const parts = ['<!DOCTYPE html><html><body>'];
        parts.push('</body></html>');
        return parts.join('\n');
    }
    compileToLatex(_contents, _documents) {
        const parts = ['\\documentclass{article}', '\\begin{document}'];
        for (let i = 0; i < _contents.length; i++) {
            const content = _contents[i];
            const doc = _documents[i];
            if (content.plainText?.trim()) {
                parts.push(`\\section{${this.escapeLatex(doc.title)}}`);
                if (content.formattedText) {
                    let latexContent = '';
                    for (const part of content.formattedText) {
                        let text = this.escapeLatex(part.text);
                        if (part.style?.bold && part.style?.italic) {
                            text = `\\textbf{\\textit{${text}}}`;
                        }
                        else if (part.style?.bold) {
                            text = `\\textbf{${text}}`;
                        }
                        else if (part.style?.italic) {
                            text = `\\textit{${text}}`;
                        }
                        latexContent += text;
                    }
                    parts.push(latexContent);
                }
                else {
                    const text = content.plainText || '';
                    parts.push(this.escapeLatex(text));
                }
                if (i < _contents.length - 1) {
                    parts.push('\\par\\bigskip');
                }
            }
        }
        parts.push('\\end{document}');
        return parts.join('\n\n');
    }
    compileToJson(documents, contents, options) {
        const result = {
            documents: documents.map((doc, index) => {
                const content = contents[index];
                const docData = {
                    id: doc.id,
                    title: doc.title,
                    content: content.plainText || '',
                    wordCount: getAccurateWordCount(content.plainText || ''),
                };
                if (content.formattedText) {
                    docData.formattedText = content.formattedText;
                }
                // Include optional metadata based on options
                if (options.includeSynopsis && content.metadata?.synopsis) {
                    docData.synopsis = content.metadata.synopsis;
                }
                if (options.includeNotes && content.metadata?.notes) {
                    docData.notes = content.metadata.notes;
                }
                return docData;
            }),
            totalWordCount: contents.reduce((sum, c) => {
                const text = c.plainText || '';
                return sum + getAccurateWordCount(text);
            }, 0),
            metadata: {
                compiledAt: new Date().toISOString(),
                documentCount: documents.length,
            },
        };
        return result;
    }
    findMatches(content, query, options) {
        const matches = [];
        if (options.regex) {
            try {
                const flags = options.caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(query, flags);
                const found = content.match(regex);
                if (found) {
                    // Get context around matches
                    for (const match of found) {
                        const index = content.indexOf(match);
                        const contextStart = Math.max(0, index - 50);
                        const contextEnd = Math.min(content.length, index + match.length + 50);
                        matches.push(content.substring(contextStart, contextEnd));
                    }
                }
            }
            catch (error) {
                logger.warn('Invalid regex pattern:', { query, error });
            }
        }
        else {
            const searchContent = options.caseSensitive ? content : content.toLowerCase();
            const searchQuery = options.caseSensitive ? query : query.toLowerCase();
            let index = searchContent.indexOf(searchQuery);
            while (index !== -1 && matches.length < 10) {
                const contextStart = Math.max(0, index - 50);
                const contextEnd = Math.min(content.length, index + query.length + 50);
                const context = content.substring(contextStart, contextEnd);
                // Avoid duplicate contexts
                if (!matches.includes(context)) {
                    matches.push(context);
                }
                index = searchContent.indexOf(searchQuery, index + 1);
            }
        }
        return matches;
    }
    matchesQuery(text, query, caseSensitive) {
        const searchText = caseSensitive ? text : text.toLowerCase();
        const searchQuery = caseSensitive ? query : query.toLowerCase();
        return searchText.includes(searchQuery);
    }
    exportAsMarkdown(structure, options) {
        const lines = [];
        const includeMetadata = options.includeMetadata ?? true;
        const maxDepth = options.maxDepth ?? Infinity;
        const includeWordCounts = options.includeWordCounts ?? false;
        const includeStatus = options.includeStatus ?? false;
        const processDocument = (doc, depth) => {
            if (depth > maxDepth)
                return;
            const heading = '#'.repeat(Math.min(depth + 1, 6));
            lines.push(`${heading} ${doc.title}`);
            if (includeMetadata) {
                if (doc.synopsis) {
                    lines.push(`\n> ${doc.synopsis}\n`);
                }
                if (doc.keywords?.length) {
                    lines.push(`**Keywords:** ${doc.keywords.join(', ')}\n`);
                }
                if (includeStatus && doc.status) {
                    lines.push(`**Status:** ${doc.status}\n`);
                }
                if (includeWordCounts && doc.wordCount) {
                    lines.push(`**Word Count:** ${doc.wordCount}\n`);
                }
            }
            if (doc.content) {
                lines.push(`\n${doc.content}\n`);
            }
            if (doc.children) {
                for (const child of doc.children) {
                    processDocument(child, depth + 1);
                }
            }
        };
        for (const doc of structure) {
            processDocument(doc, 0);
        }
        return lines.join('\n');
    }
    exportAsHtml(structure, options) {
        const includeMetadata = options.includeMetadata ?? true;
        const maxDepth = options.maxDepth ?? Infinity;
        const includeWordCounts = options.includeWordCounts ?? false;
        const includeStatus = options.includeStatus ?? false;
        const lines = [
            '<!DOCTYPE html>',
            '<html>',
            '<head>',
            '<meta charset="UTF-8">',
            '<title>Scrivener Project Export</title>',
            '<style>',
            'body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; }',
            'h1, h2, h3, h4, h5, h6 { font-family: Arial, sans-serif; }',
            '.synopsis { font-style: italic; color: #666; }',
            '.keywords { color: #999; font-size: 0.9em; }',
            '.status { color: #007acc; font-weight: bold; }',
            '.word-count { color: #888; font-size: 0.8em; }',
            '</style>',
            '</head>',
            '<body>',
        ];
        const processDocument = (doc, depth) => {
            if (depth > maxDepth)
                return;
            const tag = `h${Math.min(depth + 1, 6)}`;
            lines.push(`<${tag}>${this.escapeHtml(doc.title)}</${tag}>`);
            if (includeMetadata) {
                if (doc.synopsis) {
                    lines.push(`<p class="synopsis">${this.escapeHtml(doc.synopsis)}</p>`);
                }
                if (doc.keywords?.length) {
                    lines.push(`<p class="keywords">Keywords: ${doc.keywords.map((k) => this.escapeHtml(k)).join(', ')}</p>`);
                }
                if (includeStatus && doc.status) {
                    lines.push(`<p class="status">Status: ${this.escapeHtml(doc.status)}</p>`);
                }
                if (includeWordCounts && doc.wordCount) {
                    lines.push(`<p class="word-count">Word Count: ${doc.wordCount}</p>`);
                }
            }
            if (doc.content) {
                lines.push(`<div>${this.escapeHtml(doc.content)}</div>`);
            }
            if (doc.children) {
                lines.push('<div class="children">');
                for (const child of doc.children) {
                    processDocument(child, depth + 1);
                }
                lines.push('</div>');
            }
        };
        for (const doc of structure) {
            processDocument(doc, 0);
        }
        lines.push('</body>', '</html>');
        return lines.join('\n');
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    escapeLatex(text) {
        return text
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/[{}]/g, '\\$&')
            .replace(/[_%#&$]/g, '\\$&')
            .replace(/~/g, '\\textasciitilde{}')
            .replace(/\^/g, '\\textasciicircum{}');
    }
    countDocuments(structure) {
        let count = 0;
        const traverse = (docs) => {
            for (const doc of docs) {
                count++;
                if (doc.children) {
                    traverse(doc.children);
                }
            }
        };
        traverse(structure);
        return count;
    }
}
//# sourceMappingURL=compilation-service.js.map