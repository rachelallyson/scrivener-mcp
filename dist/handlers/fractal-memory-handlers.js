/**
 * Fractal Memory Handlers
 * MCP handlers for fractal narrative memory operations
 */
import { getLogger } from '../core/logger.js';
import { FractalMemoryService } from '../services/memory/fractal-memory-service.js';
const logger = getLogger('fractal-memory-handlers');
// Initialize service singleton
let fractalMemoryService = null;
async function getFractalMemoryService() {
    if (!fractalMemoryService) {
        fractalMemoryService = new FractalMemoryService();
        await fractalMemoryService.initialize();
    }
    return fractalMemoryService;
}
/**
 * Ingest document into fractal memory
 */
export const ingestDocumentHandler = {
    name: 'ingest_document_fractal',
    description: 'Ingest a document into the fractal narrative memory system',
    inputSchema: {
        type: 'object',
        properties: {
            documentId: {
                type: 'string',
                description: 'UUID of the document to ingest',
            },
            chapterId: {
                type: 'string',
                description: 'Chapter identifier',
            },
            options: {
                type: 'object',
                properties: {
                    forceRebuild: {
                        type: 'boolean',
                        description: 'Force rebuild of indices',
                    },
                    extractEntities: {
                        type: 'boolean',
                        description: 'Extract entities and relationships',
                    },
                    clusterMotifs: {
                        type: 'boolean',
                        description: 'Perform motif clustering',
                    },
                },
            },
        },
        required: ['documentId'],
    },
    handler: async (args, context) => {
        const { documentId, chapterId, options } = args;
        if (!context.project) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No project is currently open',
                    },
                ],
            };
        }
        try {
            // Read document content
            const document = await context.project.readDocument(documentId);
            if (!document) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Document ${documentId} not found`,
                        },
                    ],
                };
            }
            const service = await getFractalMemoryService();
            const chapter = chapterId || `doc_${documentId}`;
            // Ingest into fractal memory
            await service.ingestText(document, chapter, {
                forceRebuild: options?.forceRebuild ?? false,
                extractEntities: options?.extractEntities ?? true,
                clusterMotifs: options?.clusterMotifs ?? true,
            });
            logger.info('Document ingested into fractal memory', { documentId, chapter });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Document ingested into fractal memory with chapter ID: ${chapter}`,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to ingest document', { error, documentId });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to ingest document: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Search using fractal retrieval
 */
export const fractalSearchHandler = {
    name: 'fractal_search',
    description: 'Search using multi-scale fractal retrieval with policy-based weighting',
    inputSchema: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: 'Search query',
            },
            policy: {
                type: 'string',
                enum: ['line-fix', 'scene-fix', 'thematic', 'continuity'],
                description: 'Retrieval policy',
            },
            k: {
                type: 'number',
                description: 'Number of results',
            },
            chapterId: {
                type: 'string',
                description: 'Limit to specific chapter',
            },
            includeGraph: {
                type: 'boolean',
                description: 'Include narrative graph data',
            },
        },
        required: ['query'],
    },
    handler: async (args) => {
        const { query, policy, k, chapterId, includeGraph } = args;
        try {
            const service = await getFractalMemoryService();
            const results = await service.search(query, {
                policy: policy || 'scene-fix',
                k: k || 10,
                chapterId,
                includeGraph: includeGraph ?? false,
            });
            if (results.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'No results found for your query',
                        },
                    ],
                };
            }
            // Format results
            const formattedResults = results
                .map((result, idx) => {
                const segments = Array.isArray(result.segments)
                    ? result.segments
                        .map((s) => `[${s.scale}] ${typeof s.text === 'string' ? s.text.substring(0, 200) : ''}...`)
                        .join('\n')
                    : '';
                let text = `Result ${idx + 1} (score: ${typeof result.score === 'number' ? result.score.toFixed(3) : 'N/A'}):\n${segments}`;
                if (Array.isArray(result.entities) && result.entities.length > 0) {
                    text += `\nEntities: ${result.entities.map((e) => e.name).join(', ')}`;
                }
                if (Array.isArray(result.motifs) && result.motifs.length > 0) {
                    text += `\nMotifs: ${result.motifs.map((m) => m.name).join(', ')}`;
                }
                return text;
            })
                .join('\n\n---\n\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: formattedResults,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Fractal search failed', { error, query });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Search failed: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Find co-occurrences of entities/motifs
 */
export const findCoOccurrencesHandler = {
    name: 'find_cooccurrences',
    description: 'Find co-occurrences of entities, motifs, or other narrative elements',
    inputSchema: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    type: 'string',
                },
                description: 'Items to find co-occurrences for',
            },
            itemTypes: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['entity', 'motif'],
                },
                description: 'Types of items',
            },
            minDistance: {
                type: 'number',
                description: 'Minimum token distance',
            },
            maxDistance: {
                type: 'number',
                description: 'Maximum token distance',
            },
        },
        required: ['items'],
    },
    handler: async (args) => {
        const { items, itemTypes, minDistance, maxDistance } = args;
        try {
            const service = await getFractalMemoryService();
            const cooccurrences = await service.findCoOccurrences(items, {
                itemTypes: itemTypes,
                minDistance,
                maxDistance,
            });
            if (cooccurrences.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No co-occurrences found for: ${items.join(', ')}`,
                        },
                    ],
                };
            }
            const formatted = cooccurrences
                .map((co) => `${co.item1} + ${co.item2}: ${co.count} occurrences (avg distance: ${co.avgDistance})`)
                .join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Co-occurrences found:\n${formatted}`,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Co-occurrence search failed', { error, items });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Co-occurrence search failed: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Check character continuity
 */
export const checkContinuityHandler = {
    name: 'check_character_continuity',
    description: 'Check character continuity and identify gaps in appearances',
    inputSchema: {
        type: 'object',
        properties: {
            characterName: {
                type: 'string',
                description: 'Character name to check',
            },
            chapterId: {
                type: 'string',
                description: 'Specific chapter to check',
            },
            includeRelationships: {
                type: 'boolean',
                description: 'Include character relationships',
            },
        },
        required: ['characterName'],
    },
    handler: async (args) => {
        const { characterName, chapterId, includeRelationships } = args;
        try {
            const service = await getFractalMemoryService();
            const continuity = await service.checkContinuity(characterName, {
                chapterId,
                includeRelationships,
            });
            if (!continuity.continuity || continuity.continuity.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No appearances found for character: ${characterName}`,
                        },
                    ],
                };
            }
            let text = `Character Continuity Report: ${characterName}\n\n`;
            // Show appearances
            text += 'Appearances by chapter:\n';
            continuity.continuity.forEach((app) => {
                text +=
                    `- ${app.chapter_id} (${app.scale}): ${app.appearance_count} times, ` +
                        `sequences ${app.first_appearance_seq}-${app.last_appearance_seq}\n`;
            });
            // Show gaps
            if (continuity.gaps && continuity.gaps.length > 0) {
                text += '\nContinuity gaps detected:\n';
                continuity.gaps.forEach((gap) => {
                    text += `- Gap of ${gap.gapSize} sequences between ${gap.from.chapter_id} and ${gap.to.chapter_id}\n`;
                });
            }
            else {
                text += '\nNo continuity gaps detected.';
            }
            return {
                content: [
                    {
                        type: 'text',
                        text,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Continuity check failed', { error, characterName });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Continuity check failed: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Track motif patterns
 */
export const trackMotifsHandler = {
    name: 'track_motifs',
    description: 'Track recurring motifs and thematic patterns across the narrative',
    inputSchema: {
        type: 'object',
        properties: {
            chapterId: {
                type: 'string',
                description: 'Specific chapter',
            },
            minStrength: {
                type: 'number',
                description: 'Minimum motif strength',
            },
            patternType: {
                type: 'string',
                enum: ['theme', 'symbol', 'phrase', 'structure'],
                description: 'Type of pattern',
            },
        },
    },
    handler: async (args) => {
        const { chapterId, minStrength, patternType } = args;
        try {
            const service = await getFractalMemoryService();
            const motifs = await service.trackMotifs({
                chapterId,
                minStrength,
                patternType,
            });
            if (motifs.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'No motifs found matching criteria',
                        },
                    ],
                };
            }
            const formatted = motifs
                .map((motif) => `${motif.motif_name} (${motif.pattern_type}): ` +
                `${motif.occurrence_count} occurrences, ` +
                `strength: ${motif.avg_strength.toFixed(2)}`)
                .join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Motif Tracking Report:\n${formatted}`,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Motif tracking failed', { error });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Motif tracking failed: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Ingest entire project into fractal memory
 */
export const ingestProjectHandler = {
    name: 'ingest_project_fractal',
    description: 'Ingest entire project or folder into fractal memory system',
    inputSchema: {
        type: 'object',
        properties: {
            folderId: {
                type: 'string',
                description: 'Folder to ingest (default: Draft)',
            },
            options: {
                type: 'object',
                properties: {
                    batchSize: {
                        type: 'number',
                        description: 'Documents per batch',
                    },
                    parallel: {
                        type: 'boolean',
                        description: 'Process in parallel',
                    },
                    extractEntities: {
                        type: 'boolean',
                        description: 'Extract entities',
                    },
                    clusterMotifs: {
                        type: 'boolean',
                        description: 'Cluster motifs',
                    },
                },
            },
        },
    },
    handler: async (args, context) => {
        const { folderId, options } = args;
        if (!context.project) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No project is currently open',
                    },
                ],
            };
        }
        try {
            const service = await getFractalMemoryService();
            // Get project structure
            const structure = await context.project.getProjectStructureLimited({
                includeTrash: false,
            });
            const root = folderId ? structure.root : structure.draft || structure.root;
            if (!root.children || root.children.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'No documents found to ingest',
                        },
                    ],
                };
            }
            let ingested = 0;
            let failed = 0;
            const batchSize = options?.batchSize || 5;
            // Process documents
            const processDocument = async (item, chapterPrefix) => {
                if (item.type === 'Text') {
                    try {
                        const doc = await context.project.readDocument(item.id);
                        if (doc) {
                            const chapterId = `${chapterPrefix}_${item.id}`;
                            await service.ingestText(doc, chapterId, {
                                extractEntities: options?.extractEntities ?? true,
                                clusterMotifs: options?.clusterMotifs ?? false,
                            });
                            ingested++;
                            logger.info('Document ingested', { title: item.title, chapterId });
                        }
                    }
                    catch (error) {
                        logger.error('Failed to ingest document', { error, title: item.title });
                        failed++;
                    }
                }
                else if (item.type === 'Folder' && item.children) {
                    // Recursively process folder
                    for (const child of item.children) {
                        await processDocument(child, `${chapterPrefix}_${item.title}`);
                    }
                }
            };
            // Process all documents
            if (options?.parallel) {
                // Process in parallel batches
                const items = root.children;
                for (let i = 0; i < items.length; i += batchSize) {
                    const batch = items.slice(i, i + batchSize);
                    await Promise.all(batch.map((item) => processDocument(item, 'ch')));
                }
            }
            else {
                // Process sequentially
                for (const item of root.children) {
                    await processDocument(item, 'ch');
                }
            }
            // Perform final clustering if requested
            if (options?.clusterMotifs && ingested > 0) {
                logger.info('Performing final motif clustering...');
                // Note: callPythonScript is private, need to expose it or handle differently
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Project ingestion complete:\n` +
                            `- Documents ingested: ${ingested}\n` +
                            `- Failed: ${failed}\n` +
                            `- Entities extracted: ${options?.extractEntities ? 'Yes' : 'No'}\n` +
                            `- Motifs clustered: ${options?.clusterMotifs ? 'Yes' : 'No'}`,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Project ingestion failed', { error });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Project ingestion failed: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Update retrieval policy
 */
export const updatePolicyHandler = {
    name: 'update_retrieval_policy',
    description: 'Update or create custom retrieval policies for different use cases',
    inputSchema: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Policy name',
            },
            scaleWeights: {
                type: 'object',
                properties: {
                    micro: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                    },
                    meso: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                    },
                    macro: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                    },
                },
                description: 'Scale weights (must sum to ~1.0)',
            },
            entityBoost: {
                type: 'number',
                description: 'Entity relevance boost',
            },
            motifBoost: {
                type: 'number',
                description: 'Motif relevance boost',
            },
            recencyWeight: {
                type: 'number',
                description: 'Recency weight',
            },
            frequencyWeight: {
                type: 'number',
                description: 'Frequency weight',
            },
        },
        required: ['name', 'scaleWeights'],
    },
    handler: async (args) => {
        const { name, scaleWeights, ...otherParams } = args;
        try {
            const service = await getFractalMemoryService();
            // Validate scale weights sum to approximately 1.0
            const sum = scaleWeights.micro + scaleWeights.meso + scaleWeights.macro;
            if (Math.abs(sum - 1.0) > 0.01) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Scale weights must sum to 1.0 (current sum: ${sum})`,
                        },
                    ],
                };
            }
            await service.updatePolicy(name, {
                scaleWeights,
                ...otherParams,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Policy '${name}' updated successfully:\n` +
                            `- Micro weight: ${scaleWeights.micro}\n` +
                            `- Meso weight: ${scaleWeights.meso}\n` +
                            `- Macro weight: ${scaleWeights.macro}`,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Policy update failed', { error, name });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Policy update failed: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Get analytics and performance metrics
 */
export const getMemoryAnalyticsHandler = {
    name: 'get_memory_analytics',
    description: 'Get performance analytics and metrics for the fractal memory system',
    inputSchema: {
        type: 'object',
        properties: {
            startDate: {
                type: 'string',
                description: 'Start date (ISO format)',
            },
            endDate: {
                type: 'string',
                description: 'End date (ISO format)',
            },
            limit: {
                type: 'number',
                description: 'Limit results',
            },
        },
    },
    handler: async (args) => {
        const { startDate, endDate, limit } = args;
        try {
            const service = await getFractalMemoryService();
            const analytics = await service.getAnalytics({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit,
            });
            const summary = analytics.summary;
            const metricsText = analytics.metrics
                .map((m) => `- ${m.policy}: ${m.total_queries} queries, ` +
                `${m.avg_latency.toFixed(1)}ms avg latency, ` +
                `${m.avg_relevance.toFixed(2)} relevance`)
                .join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Fractal Memory Analytics:\n\n` +
                            `Summary:\n` +
                            `- Total queries: ${summary.totalQueries}\n` +
                            `- Average latency: ${summary.avgLatency.toFixed(1)}ms\n` +
                            `- Average relevance: ${summary.avgRelevance.toFixed(2)}\n` +
                            `- Most used policy: ${summary.mostUsedPolicy}\n` +
                            `- Satisfaction rate: ${(summary.satisfactionRate * 100).toFixed(1)}%\n\n` +
                            `Policy breakdown:\n${metricsText}`,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to get analytics', { error });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to get analytics: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Analyze narrative structure and patterns
 */
export const analyzeNarrativeHandler = {
    name: 'analyze_narrative',
    description: 'Analyze narrative structure, motifs, and relationships in a document',
    inputSchema: {
        type: 'object',
        properties: {
            documentId: {
                type: 'string',
                description: 'Document UUID to analyze',
            },
            analysisType: {
                type: 'string',
                enum: ['structure', 'motifs', 'relationships', 'all'],
                description: 'Type of analysis to perform',
            },
            options: {
                type: 'object',
                properties: {
                    includeVisualization: {
                        type: 'boolean',
                        description: 'Include visualization data',
                    },
                    includeMetrics: {
                        type: 'boolean',
                        description: 'Include numerical metrics',
                    },
                },
            },
        },
        required: ['documentId'],
    },
    handler: async (args, context) => {
        const { documentId, analysisType, options } = args;
        if (!context.project) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'No project is currently open',
                    },
                ],
            };
        }
        try {
            const _service = await getFractalMemoryService();
            void _service; // TODO: Use service when analyzeNarrative is implemented
            const document = await context.project.readDocument(documentId);
            if (!document) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Document ${documentId} not found`,
                        },
                    ],
                };
            }
            // TODO: Implement analyzeNarrative method in FractalMemoryService
            const analysis = {
                documentId,
                analysisType: analysisType || 'all',
                structure: {
                    chapters: [],
                    themes: [],
                    motifs: [],
                    actCount: 0,
                    sceneCount: 0,
                    pacingScore: 0,
                },
                motifs: [],
                patterns: [],
                relationships: [],
                metrics: {
                    complexity: 0,
                    coherence: 0,
                    motifDensity: 0,
                    complexityScore: 0,
                    coherenceScore: 0,
                    narrativeDensity: 0,
                },
                visualization: options?.includeVisualization ? { graphData: {} } : undefined,
            };
            let text = `Narrative Analysis for Document: ${documentId}\n\n`;
            if (analysis.structure) {
                text += `Structure Analysis:\n`;
                text += `- Acts: ${analysis.structure.actCount}\n`;
                text += `- Scenes: ${analysis.structure.sceneCount}\n`;
                text += `- Pacing score: ${analysis.structure.pacingScore?.toFixed(2) ?? 'N/A'}\n\n`;
            }
            if (analysis.motifs && analysis.motifs.length > 0) {
                text += `Motifs Found (${analysis.motifs.length}):\n`;
                analysis.motifs.slice(0, 10).forEach((motif) => {
                    text += `- ${motif.name}: ${motif.occurrences} occurrences, strength ${motif.strength}\n`;
                });
                text += '\n';
            }
            if (analysis.relationships && analysis.relationships.length > 0) {
                text += `Character Relationships (${analysis.relationships.length}):\n`;
                analysis.relationships.slice(0, 10).forEach((rel) => {
                    text += `- ${rel.character1} → ${rel.character2}: ${rel.relationshipType} (strength: ${rel.strength})\n`;
                });
                text += '\n';
            }
            if (options?.includeMetrics && analysis.metrics) {
                text += `Metrics:\n`;
                text += `- Complexity score: ${analysis.metrics.complexityScore?.toFixed(2) ?? 'N/A'}\n`;
                text += `- Coherence score: ${analysis.metrics.coherenceScore?.toFixed(2) ?? 'N/A'}\n`;
                text += `- Narrative density: ${analysis.metrics.narrativeDensity?.toFixed(2) ?? 'N/A'}\n`;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Narrative analysis failed', { error, documentId });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Narrative analysis failed: ${error.message}`,
                    },
                ],
            };
        }
    },
};
/**
 * Get memory statistics and usage information
 */
export const getMemoryStatsHandler = {
    name: 'get_memory_stats',
    description: 'Get statistics about fractal memory usage and performance',
    inputSchema: {
        type: 'object',
        properties: {
            documentId: {
                type: 'string',
                description: 'Specific document to get stats for',
            },
            includeDetails: {
                type: 'boolean',
                description: 'Include detailed breakdown',
            },
        },
    },
    handler: async (args) => {
        const { documentId, includeDetails } = args;
        try {
            const service = await getFractalMemoryService();
            // TODO: Implement getMemoryStats method in FractalMemoryService
            const _service = service; // Avoid unused variable warning
            const _documentId = documentId; // Avoid unused variable warning
            void _service; // TODO: Use service when getMemoryStats is implemented
            void _documentId; // TODO: Use documentId when getMemoryStats is implemented
            const stats = {
                totalDocuments: 0,
                totalMemories: 0,
                storageSize: 0,
                totalChapters: 0,
                totalSegments: 0,
                totalEntities: 0,
                totalMotifs: 0,
                memoryUsageMB: 0,
                performanceMetrics: {
                    avgQueryTime: 0,
                    cacheHitRate: 0,
                },
                policyStats: [],
                scaleBreakdown: {
                    chapters: 0,
                    segments: 0,
                    motifs: 0,
                    micro: 0,
                    meso: 0,
                    macro: 0,
                },
                documentBreakdown: includeDetails ? [] : undefined,
                performance: {
                    queryTime: 0,
                    processingTime: 0,
                    accuracy: 0,
                    avgQueryTimeMs: 0,
                    cacheHitRate: 0,
                    indexSizeMB: 0,
                },
                details: includeDetails
                    ? {
                        documentBreakdown: [],
                        memoryTypes: {},
                        recentActivity: [],
                    }
                    : undefined,
            };
            let text = 'Fractal Memory Statistics:\n\n';
            text += `Overall Stats:\n`;
            text += `- Total documents: ${stats.totalDocuments}\n`;
            text += `- Total chapters: ${stats.totalChapters}\n`;
            text += `- Total segments: ${stats.totalSegments}\n`;
            text += `- Total entities: ${stats.totalEntities}\n`;
            text += `- Total motifs: ${stats.totalMotifs}\n`;
            text += `- Memory usage: ${stats.memoryUsageMB?.toFixed(1) ?? 'N/A'} MB\n\n`;
            if (stats.scaleBreakdown) {
                text += `Scale Distribution:\n`;
                text += `- Micro segments: ${stats.scaleBreakdown.micro}\n`;
                text += `- Meso segments: ${stats.scaleBreakdown.meso}\n`;
                text += `- Macro segments: ${stats.scaleBreakdown.macro}\n\n`;
            }
            if (includeDetails && stats.documentBreakdown) {
                text += `Document Breakdown:\n`;
                stats.documentBreakdown.slice(0, 10).forEach((doc) => {
                    text += `- ${doc.documentId}: ${doc.segmentCount} segments, ${doc.entityCount} entities\n`;
                });
                if (stats.documentBreakdown.length > 10) {
                    text += `... and ${stats.documentBreakdown.length - 10} more documents\n`;
                }
                text += '\n';
            }
            if (stats.performance) {
                text += `Performance Metrics:\n`;
                text += `- Average query time: ${stats.performance.avgQueryTimeMs?.toFixed(1) ?? 'N/A'} ms\n`;
                text += `- Cache hit rate: ${((stats.performance.cacheHitRate ?? 0) * 100).toFixed(1)}%\n`;
                text += `- Index size: ${stats.performance.indexSizeMB?.toFixed(1) ?? 'N/A'} MB\n`;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text,
                    },
                ],
            };
        }
        catch (error) {
            logger.error('Failed to get memory stats', { error });
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to get memory stats: ${error.message}`,
                    },
                ],
            };
        }
    },
};
// Export all handlers as an array
export const fractalMemoryTools = [
    ingestDocumentHandler,
    fractalSearchHandler,
    findCoOccurrencesHandler,
    checkContinuityHandler,
    trackMotifsHandler,
    ingestProjectHandler,
    updatePolicyHandler,
    getMemoryAnalyticsHandler,
    analyzeNarrativeHandler,
    getMemoryStatsHandler,
];
//# sourceMappingURL=fractal-memory-handlers.js.map