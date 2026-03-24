import type { DatabaseConfig, ProjectDatabasePaths } from './config.js';
import { GraphAnalytics } from './graph-analytics.js';
import { MigrationManager } from './migrations.js';
import { Neo4jManager } from './neo4j-manager.js';
import { SearchService } from './search-service.js';
import { SQLiteManager } from './sqlite-manager.js';
import type { CharacterArcIssue, PacingIssue, PlotHole, StoryRecommendation, TimelineEvent } from './story-intelligence.js';
import { StoryIntelligence } from './story-intelligence.js';
import type { ProductivityTrend, WritingPattern } from './writing-analytics.js';
import { WritingAnalytics } from './writing-analytics.js';
export declare class DatabaseService {
    private sqliteManager;
    private neo4jManager;
    private config;
    private paths;
    private transactionLog;
    private initialized;
    private graphAnalytics;
    private migrationManager;
    private searchService;
    private writingAnalytics;
    private storyIntelligence;
    constructor(projectPath: string, config?: Partial<DatabaseConfig>);
    /**
     * Initialize both databases
     */
    initialize(): Promise<void>;
    /**
     * Check if database service is initialized
     */
    isInitialized(): boolean;
    /**
     * Save database configuration
     */
    private saveConfig;
    /**
     * Load database configuration
     */
    static loadConfig(projectPath: string): Promise<DatabaseConfig | null>;
    /**
     * Get SQLite manager
     */
    getSQLite(): SQLiteManager;
    /**
     * Get Neo4j manager
     */
    getNeo4j(): Neo4jManager | null;
    /**
     * Begin a two-phase commit transaction
     */
    beginTransaction(): Promise<string>;
    /**
     * Prepare phase of two-phase commit
     */
    prepareTransaction(transactionId: string): Promise<boolean>;
    /**
     * Commit phase of two-phase commit
     */
    commitTransaction(transactionId: string): Promise<void>;
    /**
     * Rollback a transaction
     */
    rollbackTransaction(transactionId: string): Promise<void>;
    /**
     * Sync document data with two-phase commit
     */
    syncDocumentData(documentData: {
        id: string;
        title: string;
        type: string;
        synopsis?: string;
        notes?: string;
        wordCount?: number;
        characterCount?: number;
    }): Promise<void>;
    /**
     * Sync character data between databases
     */
    syncCharacterData(characterData: {
        id: string;
        name: string;
        role?: string;
        description?: string;
        traits?: string[];
        notes?: string;
    }): Promise<void>;
    /**
     * Create relationships between entities
     */
    createRelationship(fromId: string, fromType: string, toId: string, toType: string, relationshipType: string, properties?: Record<string, unknown>): Promise<void>;
    /**
     * Store content analysis
     */
    storeContentAnalysis(documentId: string, analysisType: string, analysisData: unknown): Promise<void>;
    /**
     * Get content analysis history
     */
    getContentAnalysisHistory(documentId: string, analysisType?: string): Promise<Array<{
        id: number;
        analysisType: string;
        analysisData: unknown;
        analyzedAt: string;
    }>>;
    /**
     * Record writing session
     */
    recordWritingSession(sessionData: {
        date: string;
        wordsWritten: number;
        durationMinutes: number;
        documentsWorkedOn: string[];
        notes?: string;
    }): Promise<void>;
    /**
     * Get writing statistics
     */
    getWritingStatistics(days?: number): Promise<{
        totalWords: number;
        totalSessions: number;
        averageWordsPerSession: number;
        dailyStats: Array<{
            date: string;
            words: number;
            sessions: number;
            duration: number;
        }>;
    }>;
    /**
     * Get database status
     */
    getStatus(): {
        sqlite: {
            enabled: boolean;
            connected: boolean;
            size?: number;
        };
        neo4j: {
            enabled: boolean;
            connected: boolean;
            uri?: string;
        };
        paths: ProjectDatabasePaths;
    };
    /**
     * Helper to get Neo4j node label from type
     */
    private getNodeLabel;
    /**
     * Close database connections
     */
    close(): Promise<void>;
    /**
     * Backup databases
     */
    backup(backupDir: string): Promise<void>;
    /**
     * Get graph analytics service
     */
    getGraphAnalytics(): GraphAnalytics | null;
    /**
     * Get search service
     */
    getSearchService(): SearchService | null;
    /**
     * Get migration manager
     */
    getMigrationManager(): MigrationManager | null;
    /**
     * Run relationship auto-discovery
     */
    discoverRelationships(): Promise<unknown>;
    /**
     * Analyze story structure
     */
    analyzeStoryStructure(): Promise<{
        characterNetwork: unknown;
        plotComplexity: unknown;
        storyFlow: unknown;
        narrative: unknown;
    }>;
    /**
     * Perform full-text search
     */
    search(query: string, options?: Record<string, unknown>): Promise<unknown>;
    /**
     * Get writing analytics
     */
    getWritingAnalytics(): WritingAnalytics | null;
    /**
     * Get story intelligence
     */
    getStoryIntelligence(): StoryIntelligence | null;
    /**
     * Get comprehensive writing insights
     */
    getWritingInsights(): Promise<{
        patterns: WritingPattern;
        productivity: ProductivityTrend[];
        recommendations: {
            immediate: string[];
            shortTerm: string[];
            longTerm: string[];
            exercises: Array<{
                title: string;
                description: string;
                benefit: string;
            }>;
        };
        completion: {
            currentWords: number;
            targetWords: number;
            percentComplete: number;
            estimatedCompletionDate: string;
            recommendedDailyWords: number;
            onTrack: boolean;
        };
    }>;
    /**
     * Get story analysis and recommendations
     */
    getStoryAnalysis(): Promise<{
        plotHoles: PlotHole[];
        characterArcs: CharacterArcIssue[];
        pacing: PacingIssue[];
        recommendations: StoryRecommendation[];
        timeline: TimelineEvent[];
    }>;
    /**
     * Track writing session
     */
    trackWritingSession(wordsWritten: number, duration: number): Promise<void>;
    /**
     * Create document version/snapshot
     */
    createDocumentVersion(documentId: string, content: string, summary?: string): Promise<void>;
    /**
     * Clean up old transaction logs
     */
    private cleanupTransactionLogs;
}
//# sourceMappingURL=database-service.d.ts.map