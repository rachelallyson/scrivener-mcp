/**
 * Async handlers for job queue operations - utilizes comprehensive utils for better performance
 * Provides MCP handlers for async processing with BullMQ
 */
import { JobType } from '../services/queue/job-queue.js';
import type { ScrivenerDocument } from '../types/index.js';
/**
 * Initialize async services
 */
export declare function initializeAsyncServices(options?: {
    redisUrl?: string;
    openaiApiKey?: string;
    databasePath?: string;
    neo4jUri?: string;
    projectPath?: string;
}): Promise<void>;
/**
 * Queue document analysis job
 */
export declare function queueDocumentAnalysis(params: {
    documentId: string;
    content: string;
    options?: {
        includeReadability?: boolean;
        includeEntities?: boolean;
        includeSentiment?: boolean;
        priority?: number;
    };
}): Promise<{
    jobId: string;
    message: string;
}>;
/**
 * Queue project analysis job
 */
export declare function queueProjectAnalysis(params: {
    projectId: string;
    documents: ScrivenerDocument[];
    options?: {
        parallel?: boolean;
        batchSize?: number;
        priority?: number;
    };
}): Promise<{
    jobId: string;
    message: string;
    estimatedTime?: number;
}>;
/**
 * Build vector store for semantic search
 */
export declare function buildVectorStore(params: {
    documents: ScrivenerDocument[];
    rebuild?: boolean;
}): Promise<{
    jobId?: string;
    message: string;
}>;
/**
 * Perform semantic search
 */
export declare function semanticSearch(params: {
    query: string;
    topK?: number;
}): Promise<{
    results: Array<{
        content: string;
        metadata: Record<string, unknown>;
        score?: number;
    }>;
}>;
/**
 * Generate AI suggestions with context
 */
export declare function generateSuggestions(params: {
    prompt: string;
    documentId?: string;
    useContext?: boolean;
    async?: boolean;
}): Promise<{
    jobId?: string;
    suggestions?: string;
    message?: string;
}>;
/**
 * Analyze writing style
 */
export declare function analyzeWritingStyle(params: {
    samples: string[];
}): Promise<{
    analysis: Record<string, unknown>;
}>;
/**
 * Check plot consistency
 */
export declare function checkPlotConsistency(params: {
    documents: ScrivenerDocument[];
    async?: boolean;
}): Promise<{
    jobId?: string;
    issues?: Array<{
        issue: string;
        severity: 'low' | 'medium' | 'high';
        locations: string[];
        suggestion: string;
    }>;
    message?: string;
}>;
/**
 * Get job status
 */
export declare function getJobStatus(params: {
    jobType: JobType;
    jobId: string;
}): Promise<{
    state: string;
    progress: number;
    result?: unknown;
    error?: string;
}>;
/**
 * Cancel a job
 */
export declare function cancelJob(params: {
    jobType: JobType;
    jobId: string;
}): Promise<{
    message: string;
}>;
/**
 * Get queue statistics
 */
export declare function getQueueStats(params: {
    jobType?: JobType;
}): Promise<{
    queues: Array<{
        type: JobType;
        stats: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            delayed: number;
        };
    }>;
}>;
/**
 * Shutdown async services
 */
export declare function shutdownAsyncServices(): Promise<void>;
//# sourceMappingURL=async-handlers.d.ts.map