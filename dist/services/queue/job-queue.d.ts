/**
 * Optimized BullMQ job queue with automatic KeyDB/Redis detection
 */
import type { Job } from 'bullmq';
export declare enum JobType {
    ANALYZE_DOCUMENT = "analyze_document",
    ANALYZE_PROJECT = "analyze_project",
    GENERATE_SUGGESTIONS = "generate_suggestions",
    BUILD_VECTOR_STORE = "build_vector_store",
    CHECK_CONSISTENCY = "check_consistency",
    SYNC_DATABASE = "sync_database",
    EXPORT_PROJECT = "export_project",
    BATCH_ANALYSIS = "batch_analysis"
}
export interface AnalyzeDocumentJob {
    documentId: string;
    content: string;
    options?: {
        includeReadability?: boolean;
        includeEntities?: boolean;
        includeSentiment?: boolean;
    };
}
export interface AnalyzeProjectJob {
    projectId: string;
    documents: Array<{
        id: string;
        content: string;
    }>;
}
export interface GenerateSuggestionsJob {
    documentId: string;
    content: string;
    prompt: string;
    analysisResults: Record<string, unknown>;
}
export interface BuildVectorStoreJob {
    documents: Array<{
        id: string;
        content: string;
        metadata?: Record<string, unknown>;
    }>;
    rebuild?: boolean;
}
export interface CheckConsistencyJob {
    documents: Array<{
        id: string;
        content: string;
    }>;
    checkTypes?: string[];
}
export interface SyncDatabaseJob {
    documents: Array<{
        id: string;
        content: string;
        metadata?: Record<string, unknown>;
    }>;
}
export interface ExportProjectJob {
    projectId: string;
    format: 'json' | 'markdown' | 'html';
    outputPath: string;
}
export interface BatchAnalysisJob {
    documents: Array<{
        id: string;
        content: string;
    }>;
    options?: Record<string, unknown>;
}
/**
 * Optimized Job Queue Service
 */
export declare class JobQueueService {
    private queues;
    private workers;
    private events;
    private connection;
    private logger;
    private contentAnalyzer;
    private langchainService;
    private databaseService;
    private isInitialized;
    private connectionType;
    private projectPath;
    constructor(projectPath?: string);
    /**
     * Initialize with automatic KeyDB/Redis detection
     */
    initialize(options?: {
        langchainApiKey?: string;
        databasePath?: string;
        neo4jUri?: string;
    }): Promise<void>;
    /**
     * Create a queue for a job type
     */
    private createQueue;
    /**
     * Create a worker for processing jobs
     */
    private createWorker;
    /**
     * Setup event listeners for a queue
     */
    private setupEventListeners;
    /**
     * Get concurrency for job type
     */
    private getConcurrency;
    /**
     * Process a job based on its type
     */
    private processJob;
    private processAnalyzeDocument;
    private processAnalyzeProject;
    private processGenerateSuggestions;
    private processBuildVectorStore;
    private processCheckConsistency;
    private checkCharacterConsistency;
    private checkTimelineConsistency;
    private checkLocationConsistency;
    private checkPlotConsistency;
    private processSyncDatabase;
    /**
     * Add a job to the queue
     */
    addJob(jobType: JobType, data: Record<string, unknown>, options?: {
        priority?: number;
        delay?: number;
    }): Promise<string>;
    /**
     * Get job status
     */
    getJobStatus(jobType: JobType, jobId: string): Promise<Job | null>;
    /**
     * Cancel a job
     */
    cancelJob(jobType: JobType, jobId: string): Promise<void>;
    /**
     * Get queue statistics
     */
    getQueueStats(jobType: JobType): Promise<Record<string, unknown>>;
    /**
     * Get connection info
     */
    getConnectionInfo(): {
        type: string;
        isConnected: boolean;
    };
    /**
     * Shutdown gracefully
     */
    shutdown(): Promise<void>;
    private memoryRedis;
}
//# sourceMappingURL=job-queue.d.ts.map