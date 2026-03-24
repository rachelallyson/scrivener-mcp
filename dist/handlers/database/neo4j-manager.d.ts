import type { ManagedTransaction, QueryResult } from 'neo4j-driver';
import type { QueryParameters } from '../../types/database.js';
export declare class Neo4jManager {
    private driver;
    private uri;
    private user;
    private password;
    private database;
    private connectionRetries;
    private retryDelay;
    private isConnected;
    private lastHealthCheck;
    private healthCheckInterval;
    constructor(uri: string, user: string, password: string, database?: string);
    /**
     * Initialize the Neo4j connection with retry logic
     */
    initialize(): Promise<void>;
    /**
     * Create database constraints
     */
    private createConstraints;
    /**
     * Create database indexes
     */
    private createIndexes;
    /**
     * Execute a Cypher query
     */
    query(cypher: string, parameters?: QueryParameters): Promise<QueryResult>;
    /**
     * Execute a read transaction
     */
    readTransaction<T>(work: (tx: ManagedTransaction) => Promise<T>): Promise<T>;
    /**
     * Execute a write transaction
     */
    writeTransaction<T>(work: (tx: ManagedTransaction) => Promise<T>): Promise<T>;
    /**
     * Create or update a document node
     */
    upsertDocument(documentData: {
        id: string;
        title: string;
        type: string;
        synopsis?: string;
        notes?: string;
        wordCount?: number;
    }): Promise<void>;
    /**
     * Create or update a generic node
     */
    upsertNode(label: string, id: string, properties: Record<string, unknown>): Promise<void>;
    /**
     * Create or update a character node
     */
    upsertCharacter(characterData: {
        id: string;
        name: string;
        role?: string;
        description?: string;
        traits?: string[];
    }): Promise<void>;
    /**
     * Create relationship between nodes
     */
    createRelationship(fromId: string, fromLabel: string, toId: string, toLabel: string, relationshipType: string, properties?: Record<string, unknown>): Promise<void>;
    /**
     * Find character relationships
     */
    findCharacterRelationships(characterId: string): Promise<Array<{
        character: Record<string, unknown>;
        relationship: {
            type: string;
            properties: Record<string, unknown>;
        };
        other: Record<string, unknown>;
        otherLabels: string[];
    }>>;
    /**
     * Find documents connected to a character
     */
    findDocumentsForCharacter(characterId: string): Promise<Array<Record<string, unknown>>>;
    /**
     * Find story structure and relationships
     */
    analyzeStoryStructure(): Promise<{
        documentFlow: Array<{
            from: Record<string, unknown>;
            to: Record<string, unknown>;
            relationship: Record<string, unknown>;
        }>;
        characterArcs: Array<{
            character: Record<string, unknown>;
            documents: Array<Record<string, unknown>>;
        }>;
        themeProgression: Array<{
            theme: Record<string, unknown>;
            documents: Array<Record<string, unknown>>;
        }>;
    }>;
    /**
     * Check if Neo4j is available
     */
    isAvailable(): boolean;
    /**
     * Check database health
     */
    checkHealth(): Promise<{
        healthy: boolean;
        details: Record<string, unknown>;
    }>;
    /**
     * Execute query with retry logic
     */
    queryWithRetry(cypher: string, params?: QueryParameters, retries?: number): Promise<QueryResult>;
    /**
     * Check if error is connection-related
     */
    private isConnectionError;
    /**
     * Try to reconnect to Neo4j
     */
    private reconnect;
    /**
     * Get connection info
     */
    getConnectionInfo(): {
        uri: string;
        database: string;
        connected: boolean;
    };
    /**
     * Close the connection
     */
    close(): Promise<void>;
}
//# sourceMappingURL=neo4j-manager.d.ts.map