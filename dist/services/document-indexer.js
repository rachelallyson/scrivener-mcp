/**
 * Efficient Document Indexing and Search Service
 * Provides fast O(1) document lookup and optimized search
 */
import { getLogger } from '../core/logger.js';
import { generateHash } from '../utils/common.js';
import { splitIntoWords } from '../utils/text-metrics.js';
const logger = getLogger('document-indexer');
/**
 * Ring buffer for efficient memory management
 */
export class RingBuffer {
    constructor(size) {
        this.writeIndex = 0;
        this.count = 0;
        this.size = size;
        this.buffer = new Array(size);
    }
    push(item) {
        this.buffer[this.writeIndex % this.size] = item;
        this.writeIndex++;
        if (this.count < this.size) {
            this.count++;
        }
    }
    getAll() {
        const result = [];
        const startIdx = Math.max(0, this.writeIndex - this.count);
        for (let i = startIdx; i < this.writeIndex; i++) {
            const item = this.buffer[i % this.size];
            if (item !== undefined) {
                result.push(item);
            }
        }
        return result;
    }
    clear() {
        this.buffer = new Array(this.size);
        this.writeIndex = 0;
        this.count = 0;
    }
    getSize() {
        return this.count;
    }
}
/**
 * Document Indexer with O(1) lookup and efficient search
 */
export class DocumentIndexer {
    constructor() {
        // Document index for O(1) lookup
        this.documentIndex = new Map();
        // Search index: word -> Set of document IDs
        this.searchIndex = new Map();
        // Reverse index: document ID -> Set of words
        this.documentWords = new Map();
        // Content hash cache to detect changes
        this.contentHashes = new Map();
        // Dirty state tracking
        this.dirtyDocuments = new Set();
        this.lastSyncTime = new Map();
        // Event listeners for cleanup
        this.eventListeners = new Map();
        // Metrics collection
        this.operationMetrics = new RingBuffer(1000);
        logger.info('Document indexer initialized');
    }
    /**
     * Build complete index from documents
     */
    async buildIndex(documents, location = 'active') {
        const startTime = Date.now();
        logger.info(`Building index for ${documents.length} documents...`);
        // Clear existing index for this location
        if (location === 'active') {
            this.clearIndex();
        }
        // Build document index with paths
        await this.buildDocumentIndex(documents, location);
        // Build search index
        await this.buildSearchIndex();
        const duration = Date.now() - startTime;
        this.operationMetrics.push({
            operation: 'buildIndex',
            duration,
            success: true,
            timestamp: Date.now(),
        });
        logger.info(`Index built in ${duration}ms: ${this.documentIndex.size} documents, ${this.searchIndex.size} unique words`);
    }
    /**
     * Build document index with O(1) lookup
     */
    async buildDocumentIndex(documents, location, parentPath = [], parentId) {
        for (const doc of documents) {
            const path = [...parentPath, { id: doc.id, title: doc.title, type: doc.type }];
            this.documentIndex.set(doc.id, {
                document: doc,
                path,
                location,
                parentId,
                depth: path.length,
            });
            // Recursively index children
            if (doc.children && doc.children.length > 0) {
                await this.buildDocumentIndex(doc.children, location, path, doc.id);
            }
        }
    }
    /**
     * Build search index for fast content search
     */
    async buildSearchIndex() {
        // This will be populated incrementally as documents are read
        // Initial build just sets up the structure
        logger.debug('Search index structure initialized');
    }
    /**
     * Update search index for a specific document
     */
    async updateDocumentInIndex(documentId, content) {
        const startTime = Date.now();
        // Check if content has changed
        const newHash = generateHash(content);
        const oldHash = this.contentHashes.get(documentId);
        if (oldHash === newHash) {
            logger.debug(`Document ${documentId} unchanged, skipping index update`);
            return;
        }
        // Remove old words from index
        const oldWords = this.documentWords.get(documentId);
        if (oldWords) {
            for (const word of oldWords) {
                const docs = this.searchIndex.get(word);
                if (docs) {
                    docs.delete(documentId);
                    if (docs.size === 0) {
                        this.searchIndex.delete(word);
                    }
                }
            }
        }
        // Tokenize and add new words
        const words = this.tokenize(content.toLowerCase());
        const uniqueWords = new Set(words);
        for (const word of uniqueWords) {
            if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, new Set());
            }
            this.searchIndex.get(word).add(documentId);
        }
        // Update document words and hash
        this.documentWords.set(documentId, uniqueWords);
        this.contentHashes.set(documentId, newHash);
        // Mark as synced
        this.dirtyDocuments.delete(documentId);
        this.lastSyncTime.set(documentId, Date.now());
        const duration = Date.now() - startTime;
        logger.debug(`Updated index for document ${documentId} in ${duration}ms`);
    }
    /**
     * Get document info with O(1) complexity
     */
    getDocumentInfo(documentId) {
        return this.documentIndex.get(documentId);
    }
    /**
     * Search content using index
     */
    async searchContent(query, options = {}) {
        const startTime = Date.now();
        const results = [];
        if (options.regex) {
            // Regex search requires scanning documents
            return this.regexSearch(query, options);
        }
        // Tokenize query
        const queryWords = this.tokenize(options.caseSensitive ? query : query.toLowerCase());
        // Find documents containing all query words (AND search)
        const documentScores = new Map();
        const documentMatches = new Map();
        for (const word of queryWords) {
            const searchWord = options.caseSensitive ? word : word.toLowerCase();
            const docs = this.searchIndex.get(searchWord);
            if (!docs || docs.size === 0) {
                // If any word is not found, no results for AND search
                return [];
            }
            for (const docId of docs) {
                const currentScore = documentScores.get(docId) || 0;
                documentScores.set(docId, currentScore + 1);
                if (!documentMatches.has(docId)) {
                    documentMatches.set(docId, new Set());
                }
                documentMatches.get(docId).add(word);
            }
        }
        // Filter documents that contain all query words
        const minScore = queryWords.length;
        const scoreThreshold = options.scoreThreshold || 0.5;
        for (const [docId, score] of documentScores.entries()) {
            if (score >= minScore * scoreThreshold) {
                const docInfo = this.documentIndex.get(docId);
                if (docInfo) {
                    results.push({
                        documentId: docId,
                        title: docInfo.document.title,
                        matches: Array.from(documentMatches.get(docId) || []),
                        score: score / queryWords.length,
                    });
                }
            }
        }
        // Sort by score and apply limit
        results.sort((a, b) => b.score - a.score);
        if (options.limit) {
            results.splice(options.limit);
        }
        const duration = Date.now() - startTime;
        this.operationMetrics.push({
            operation: 'searchContent',
            duration,
            success: true,
            timestamp: Date.now(),
        });
        logger.debug(`Search completed in ${duration}ms, found ${results.length} results`);
        return results;
    }
    /**
     * Regex search (slower, scans documents)
     */
    async regexSearch(pattern, options = {}) {
        const results = [];
        const regex = new RegExp(pattern, options.caseSensitive ? 'g' : 'gi');
        for (const [docId, docInfo] of this.documentIndex.entries()) {
            const words = this.documentWords.get(docId);
            if (!words)
                continue;
            const matches = [];
            for (const word of words) {
                if (regex.test(word)) {
                    matches.push(word);
                    if (matches.length >= 10)
                        break; // Limit matches per doc
                }
            }
            if (matches.length > 0) {
                results.push({
                    documentId: docId,
                    title: docInfo.document.title,
                    matches,
                    score: matches.length,
                });
            }
            if (options.limit && results.length >= options.limit) {
                break;
            }
        }
        return results;
    }
    /**
     * Mark document as changed (dirty state tracking)
     */
    markDocumentChanged(documentId) {
        this.dirtyDocuments.add(documentId);
        // Auto-flush if too many dirty documents
        if (this.dirtyDocuments.size >= 10) {
            void this.flushChanges();
        }
    }
    /**
     * Flush pending changes
     */
    async flushChanges() {
        if (this.dirtyDocuments.size === 0)
            return;
        logger.info(`Flushing ${this.dirtyDocuments.size} dirty documents`);
        const documents = Array.from(this.dirtyDocuments);
        this.dirtyDocuments.clear();
        // Emit flush event
        this.emit('flush', documents);
    }
    /**
     * Get dirty documents
     */
    getDirtyDocuments() {
        return Array.from(this.dirtyDocuments);
    }
    /**
     * Clear all indexes and cleanup
     */
    clearIndex() {
        // Clear all data structures
        this.documentIndex.clear();
        this.searchIndex.clear();
        this.documentWords.clear();
        this.contentHashes.clear();
        this.dirtyDocuments.clear();
        this.lastSyncTime.clear();
        // Clear event listeners
        for (const listeners of this.eventListeners.values()) {
            listeners.length = 0;
        }
        this.eventListeners.clear();
        logger.info('Index cleared');
    }
    /**
     * Get index statistics
     */
    getStats() {
        let totalWords = 0;
        for (const words of this.documentWords.values()) {
            totalWords += words.size;
        }
        return {
            documentCount: this.documentIndex.size,
            wordCount: this.searchIndex.size,
            indexSize: totalWords,
            lastUpdated: new Date(),
        };
    }
    /**
     * Get operation metrics
     */
    getMetrics() {
        const metrics = this.operationMetrics.getAll();
        if (metrics.length === 0) {
            return {
                averageSearchTime: 0,
                averageIndexTime: 0,
                successRate: 1,
            };
        }
        const searchOps = metrics.filter((m) => m.operation === 'searchContent');
        const indexOps = metrics.filter((m) => m.operation === 'buildIndex' || m.operation === 'updateDocument');
        const successful = metrics.filter((m) => m.success);
        return {
            averageSearchTime: searchOps.length > 0
                ? searchOps.reduce((sum, m) => sum + m.duration, 0) / searchOps.length
                : 0,
            averageIndexTime: indexOps.length > 0
                ? indexOps.reduce((sum, m) => sum + m.duration, 0) / indexOps.length
                : 0,
            successRate: metrics.length > 0 ? successful.length / metrics.length : 1,
        };
    }
    /**
     * Tokenize text for indexing
     */
    tokenize(text) {
        // Use NLP-based tokenization from utils
        const words = splitIntoWords(text.toLowerCase());
        // Filter out very short words for indexing
        return words.filter((word) => word.length > 2);
    }
    /**
     * Event emitter functionality
     */
    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        for (const listener of listeners) {
            try {
                listener(data);
            }
            catch (error) {
                logger.error(`Error in event listener for ${event}:`, { error, data });
            }
        }
    }
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }
    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * Cleanup resources
     */
    dispose() {
        this.clearIndex();
        this.operationMetrics.clear();
        logger.info('Document indexer disposed');
    }
}
// Singleton instance
export const documentIndexer = new DocumentIndexer();
//# sourceMappingURL=document-indexer.js.map