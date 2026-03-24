export interface DatabaseConfig {
    sqlite: {
        path: string;
        enabled: boolean;
    };
    neo4j: {
        uri: string;
        user: string;
        password: string;
        enabled: boolean;
        database?: string;
        autoInstall?: boolean;
    };
}
export interface ProjectDatabasePaths {
    databaseDir: string;
    sqliteDb: string;
    neo4jData: string;
    configFile: string;
}
export declare const DEFAULT_DATABASE_CONFIG: Omit<DatabaseConfig, 'sqlite' | 'neo4j'> & {
    sqlite: Omit<DatabaseConfig['sqlite'], 'path'>;
    neo4j: Omit<DatabaseConfig['neo4j'], 'uri'>;
};
/**
 * Generate database paths within a Scrivener project
 */
export declare function generateDatabasePaths(projectPath: string): ProjectDatabasePaths;
//# sourceMappingURL=config.d.ts.map