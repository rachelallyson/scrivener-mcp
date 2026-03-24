/**
 * Database Migration System
 * Manages schema versions and migrations for SQLite and Neo4j
 */
import type { Neo4jManager } from './neo4j-manager.js';
import type { SQLiteManager } from './sqlite-manager.js';
export interface Migration {
    version: number;
    name: string;
    sql?: string;
    cypher?: string;
    up: (sqlite?: SQLiteManager, neo4j?: Neo4jManager) => Promise<void>;
    down?: (sqlite?: SQLiteManager, neo4j?: Neo4jManager) => Promise<void>;
}
export declare class MigrationManager {
    private sqliteManager;
    private neo4jManager;
    private migrations;
    private currentVersion;
    constructor(sqliteManager: SQLiteManager | null, neo4jManager: Neo4jManager | null);
    /**
     * Define all migrations
     */
    private initializeMigrations;
    /**
     * Initialize migration tracking
     */
    initialize(): Promise<void>;
    /**
     * Run pending migrations
     */
    migrate(): Promise<void>;
    /**
     * Run a single migration
     */
    private runMigration;
    /**
     * Rollback to a specific version
     */
    rollbackTo(targetVersion: number): Promise<void>;
    /**
     * Get migration status
     */
    getStatus(): {
        currentVersion: number;
        latestVersion: number;
        pendingMigrations: number;
        appliedMigrations: string[];
    };
    /**
     * Export schema for backup
     */
    exportSchema(): Promise<{
        sql: string;
        cypher: string;
    }>;
}
//# sourceMappingURL=migrations.d.ts.map