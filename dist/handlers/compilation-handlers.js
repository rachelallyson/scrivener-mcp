import { LangChainCompilationService } from '../services/compilation/langchain-compiler.js';
import { validateInput } from '../utils/common.js';
import { LangChainContinuousLearningHandler } from './langchain-continuous-learning-handler.js';
import { getOptionalObjectArg, getOptionalStringArg, getStringArg, requireProject, } from './types.js';
import { compileSchema, exportSchema } from './validation-schemas.js';
export const compileDocumentsHandler = {
    name: 'compile_documents',
    description: 'Compile documents in reading order',
    inputSchema: {
        type: 'object',
        properties: {
            format: {
                type: 'string',
                enum: ['text', 'markdown', 'html'],
                description: 'Output format',
            },
            rootFolderId: {
                type: 'string',
                description: 'Root folder to compile from',
            },
            includeSynopsis: {
                type: 'boolean',
                description: 'Include document synopsis',
            },
            includeNotes: {
                type: 'boolean',
                description: 'Include document notes',
            },
            separator: {
                type: 'string',
                description: 'Separator between documents',
            },
            hierarchical: {
                type: 'boolean',
                description: 'Maintain folder hierarchy in output',
            },
        },
    },
    handler: async (args, context) => {
        const project = requireProject(context);
        validateInput(args, compileSchema);
        // Get documents to compile
        const documents = await project.getAllDocuments();
        let documentsToCompile;
        const rootFolderId = getOptionalStringArg(args, 'rootFolderId');
        if (rootFolderId) {
            // Filter documents under the specified folder
            documentsToCompile = documents
                .filter((doc) => doc.path && doc.path.startsWith(rootFolderId))
                .map((doc) => ({ id: doc.id, content: doc.content || '', title: doc.title || '' }));
        }
        else {
            // Use all text documents
            documentsToCompile = documents
                .filter((doc) => doc.type === 'Text')
                .map((doc) => ({ id: doc.id, content: doc.content || '', title: doc.title || '' }));
        }
        const format = getOptionalStringArg(args, 'format') || 'text';
        const includeSynopsis = args.includeSynopsis || false;
        const includeNotes = args.includeNotes || false;
        const hierarchical = args.hierarchical || false;
        try {
            // Use LangChain compilation service for enhanced compilation
            const langChainCompiler = new LangChainCompilationService();
            await langChainCompiler.initialize();
            // Initialize continuous learning for feedback collection
            const learningHandler = new LangChainContinuousLearningHandler();
            await learningHandler.initialize();
            const sessionId = `compile_${Date.now()}`;
            await learningHandler.startFeedbackSession(sessionId);
            // Perform intelligent compilation using LangChain
            const compiled = await langChainCompiler.compileWithAI(documentsToCompile, {
                outputFormat: format,
                targetOptimization: 'general',
                includeSynopsis,
                includeNotes,
                hierarchical,
                intelligentFormatting: true,
                enhanceContent: true,
            });
            // Collect implicit feedback based on compilation success
            await learningHandler.collectImplicitFeedback(sessionId, 'compile_documents', {
                timeSpent: compiled.metadata?.processingTime || 0,
                userActions: ['compile_documents'],
                documentsCount: documentsToCompile.length,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: typeof compiled.content === 'string'
                            ? compiled.content
                            : JSON.stringify(compiled.content),
                    },
                ],
            };
        }
        catch (error) {
            // Fallback to basic compilation if LangChain fails
            const separator = getOptionalStringArg(args, 'separator') || '\n\n---\n\n';
            const documentIds = documentsToCompile.map((doc) => doc.id);
            const compiled = await project.compileDocuments(documentIds, separator, format);
            const compiledText = typeof compiled === 'string' ? compiled : JSON.stringify(compiled);
            return {
                content: [
                    {
                        type: 'text',
                        text: compiledText || `Compilation returned empty. Fallback reason: ${error.message}`,
                    },
                ],
            };
        }
    },
};
export const exportProjectHandler = {
    name: 'export_project',
    description: 'Export project in various formats',
    inputSchema: {
        type: 'object',
        properties: {
            format: {
                type: 'string',
                enum: ['markdown', 'html', 'json', 'epub'],
                description: 'Export format',
            },
            outputPath: {
                type: 'string',
                description: 'Output file path',
            },
            options: {
                type: 'object',
                description: 'Format-specific options',
            },
        },
        required: ['format'],
    },
    handler: async (args, context) => {
        const project = requireProject(context);
        validateInput(args, exportSchema);
        // Export project
        const format = getStringArg(args, 'format');
        const outputPath = getOptionalStringArg(args, 'outputPath');
        const options = getOptionalObjectArg(args, 'options');
        const result = await project.exportProject(format, outputPath, options);
        const resultStr = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        return {
            content: [
                {
                    type: 'text',
                    text: `Project exported as ${args.format}:\n${resultStr}`,
                },
            ],
        };
    },
};
export const getStatisticsHandler = {
    name: 'get_statistics',
    description: 'Get project statistics',
    inputSchema: {
        type: 'object',
        properties: {
            detailed: {
                type: 'boolean',
                description: 'Include detailed breakdown',
            },
        },
    },
    handler: async (_args, context) => {
        const project = requireProject(context);
        const metadata = await project.getProjectMetadata();
        const stats = await project.getStatistics();
        const fullStats = {
            ...stats,
            title: metadata.title || 'Untitled',
            author: metadata.author,
            lastModified: new Date().toISOString(),
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(fullStats, null, 2),
                },
            ],
        };
    },
};
// Advanced LangChain compilation handlers
export const intelligentCompilationHandler = {
    name: 'intelligent_compilation',
    description: 'AI-powered compilation with target optimization',
    inputSchema: {
        type: 'object',
        properties: {
            documentsIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Document IDs to compile',
            },
            targetOptimization: {
                type: 'string',
                enum: [
                    'agent',
                    'submission',
                    'pitch_packet',
                    'synopsis',
                    'query_letter',
                    'general',
                ],
                description: 'Target optimization for compilation',
            },
            outputFormat: {
                type: 'string',
                enum: ['text', 'markdown', 'html', 'rtf'],
                description: 'Output format',
            },
            contentOptimization: {
                description: 'Enable AI content optimization',
            },
        },
        required: ['documentsIds', 'targetOptimization'],
    },
    handler: async (args, context) => {
        const project = requireProject(context);
        const documentIds = args.documentsIds;
        const targetOptimization = getStringArg(args, 'targetOptimization');
        const outputFormat = args.outputFormat || 'text';
        const contentOptimization = args.contentOptimization || true;
        // Map targetOptimization to LangChain target types
        const getTargetType = (optimization) => {
            const targetMap = {
                'agent-query': 'agent-query',
                submission: 'submission',
                'beta-readers': 'beta-readers',
                publication: 'publication',
                'pitch-packet': 'pitch-packet',
                synopsis: 'synopsis',
                general: 'general', // No specific target optimization
            };
            return targetMap[optimization];
        };
        const target = getTargetType(targetOptimization);
        try {
            // Get documents for compilation
            const documents = await Promise.all(documentIds.map(async (id) => {
                const doc = await project.getDocument(id);
                return doc
                    ? { id: doc.id, content: doc.content || '', title: doc.title || '' }
                    : null;
            }));
            const validDocuments = documents.filter((doc) => doc !== null);
            if (validDocuments.length === 0) {
                throw new Error('No valid documents found for compilation');
            }
            // Initialize LangChain compilation service
            const langChainCompiler = new LangChainCompilationService();
            await langChainCompiler.initialize();
            // Initialize continuous learning for feedback collection
            const learningHandler = new LangChainContinuousLearningHandler();
            await learningHandler.initialize();
            const sessionId = `intelligent_compile_${Date.now()}`;
            await learningHandler.startFeedbackSession(sessionId);
            // Perform intelligent compilation using LangChain
            const compiled = await langChainCompiler.compileWithAI(validDocuments, {
                outputFormat,
                targetOptimization,
                target: target,
                intelligentFormatting: true,
                generateMarketingMaterials: targetOptimization !== 'general',
                enhanceContent: contentOptimization,
                optimizeForTarget: contentOptimization && !!target,
            });
            // Collect implicit feedback
            await learningHandler.collectImplicitFeedback(sessionId, 'intelligent_compilation', {
                timeSpent: compiled.metadata?.processingTime || 0,
                userActions: ['intelligent_compilation'],
                targetOptimization,
                documentsCount: validDocuments.length,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: typeof compiled.content === 'string'
                            ? compiled.content
                            : JSON.stringify(compiled.content),
                        data: {
                            ...compiled,
                            enhanced: true,
                            targetOptimization,
                            sessionId,
                            documentCount: validDocuments.length,
                            optimization: compiled.optimization,
                        },
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Intelligent compilation failed: ${error.message}`,
                        data: { error: true, enhanced: false },
                    },
                ],
            };
        }
    },
};
export const generateMarketingMaterialsHandler = {
    name: 'generate_marketing_materials',
    description: 'Generate marketing materials (synopsis, query letter, etc.) from project',
    inputSchema: {
        type: 'object',
        properties: {
            materialType: {
                type: 'string',
                enum: ['synopsis', 'query_letter', 'pitch_packet', 'elevator_pitch', 'book_blurb'],
                description: 'Type of marketing material to generate',
            },
            length: {
                type: 'string',
                enum: ['short', 'medium', 'long'],
                description: 'Length of the generated material',
            },
            targetAudience: {
                type: 'string',
                description: 'Target audience or market',
            },
        },
        required: ['materialType'],
    },
    handler: async (args, context) => {
        const project = requireProject(context);
        const materialType = getStringArg(args, 'materialType');
        const lengthStr = args.length || 'medium';
        const length = lengthStr === 'short' ? 500 : lengthStr === 'long' ? 2000 : 1000; // medium = 1000
        const targetAudience = args.targetAudience;
        try {
            // Get all project documents for context
            const documents = await project.getAllDocuments();
            const textDocuments = documents
                .filter((doc) => doc.type === 'Text' && doc.content)
                .map((doc) => ({ id: doc.id, content: doc.content || '', title: doc.title || '' }));
            if (textDocuments.length === 0) {
                throw new Error('No text documents found in project');
            }
            // Initialize LangChain compilation service
            const langChainCompiler = new LangChainCompilationService();
            await langChainCompiler.initialize();
            // Initialize continuous learning for feedback collection
            const learningHandler = new LangChainContinuousLearningHandler();
            await learningHandler.initialize();
            const sessionId = `marketing_${materialType}_${Date.now()}`;
            await learningHandler.startFeedbackSession(sessionId);
            // Generate marketing materials
            const result = await langChainCompiler.generateMarketingMaterials(textDocuments, {
                materialType,
                length,
                targetAudience,
                includeGenreAnalysis: true,
            });
            // Collect implicit feedback
            await learningHandler.collectImplicitFeedback(sessionId, 'generate_marketing_materials', {
                timeSpent: result.processingTime || 0,
                userActions: ['generate_marketing_materials'],
                materialType,
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: result.content,
                        data: {
                            ...result,
                            enhanced: true,
                            materialType,
                            length,
                            targetAudience,
                            sessionId,
                        },
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Marketing material generation failed: ${error.message}`,
                        data: { error: true, enhanced: false },
                    },
                ],
            };
        }
    },
};
export const buildVectorStoreHandler = {
    name: 'build_vector_store',
    description: 'Build semantic search index for project documents',
    inputSchema: {
        type: 'object',
        properties: {
            rebuild: {
                type: 'boolean',
                description: 'Rebuild index from scratch',
            },
        },
    },
    handler: async (args, context) => {
        const project = requireProject(context);
        const rebuild = args.rebuild || false;
        try {
            // Get all project documents
            const documents = await project.getAllDocuments();
            const vectorDocuments = documents
                .filter((doc) => doc.content)
                .map((doc) => ({
                id: doc.id,
                content: doc.content || '',
                metadata: {
                    title: doc.title,
                    type: doc.type,
                    wordCount: doc.content ? doc.content.split(' ').length : 0,
                    synopsis: doc.synopsis,
                },
            }));
            if (vectorDocuments.length === 0) {
                throw new Error('No documents with content found for indexing');
            }
            // Initialize vector store
            const { VectorStore } = await import('../services/ai/vector-store.js');
            const vectorStore = new VectorStore();
            await vectorStore.initialize();
            if (rebuild) {
                await vectorStore.clear();
            }
            // Add documents to vector store
            await vectorStore.addDocuments(vectorDocuments);
            const stats = vectorStore.getStats();
            return {
                content: [
                    {
                        type: 'text',
                        text: `Vector store ${rebuild ? 'rebuilt' : 'updated'} successfully`,
                        data: {
                            ...stats,
                            enhanced: true,
                            vectorIndexed: true,
                            documentsIndexed: vectorDocuments.length,
                        },
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Vector store build failed: ${error.message}`,
                        data: { error: true, enhanced: false },
                    },
                ],
            };
        }
    },
};
export const compilationHandlers = [
    compileDocumentsHandler,
    exportProjectHandler,
    getStatisticsHandler,
    // Advanced LangChain compilation handlers
    intelligentCompilationHandler,
    generateMarketingMaterialsHandler,
    buildVectorStoreHandler,
];
//# sourceMappingURL=compilation-handlers.js.map