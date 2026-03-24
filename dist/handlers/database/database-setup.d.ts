/**
 * Database Setup and Configuration Helper
 * Handles database installation detection and configuration
 */
export interface DatabaseSetupOptions {
    projectPath: string;
    interactive?: boolean;
    useEnvironmentVars?: boolean;
}
export interface DatabaseCredentials {
    neo4j: {
        uri: string;
        user: string;
        password: string;
        database: string;
    };
}
export declare class DatabaseSetup {
    /**
     * Check if Neo4j is installed and running
     */
    static checkNeo4jAvailability(): Promise<{
        installed: boolean;
        running: boolean;
        version?: string;
        dockerAvailable?: boolean;
    }>;
    /**
     * Get database credentials from environment or config
     */
    static getCredentials(options: DatabaseSetupOptions): Promise<DatabaseCredentials>;
    /**
     * Setup Neo4j using Docker if not installed
     */
    static setupNeo4jWithDocker(): Promise<boolean>;
    /**
     * Wait for Neo4j to become available
     */
    private static waitForNeo4j;
    /**
     * Generate setup instructions for manual installation
     */
    static getSetupInstructions(): string;
    /**
     * Parse .env file content
     */
    private static parseEnvFile;
    /**
     * Save credentials securely
     */
    static saveCredentials(projectPath: string, credentials: Partial<DatabaseCredentials>): Promise<void>;
}
//# sourceMappingURL=database-setup.d.ts.map