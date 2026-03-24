export const DEFAULT_DATABASE_CONFIG = {
    sqlite: {
        enabled: true,
    },
    neo4j: {
        user: 'neo4j',
        password: 'scrivener-mcp',
        enabled: true,
        database: 'scrivener',
    },
};
/**
 * Generate database paths within a Scrivener project
 */
export function generateDatabasePaths(projectPath) {
    const databaseDir = `${projectPath}/.scrivener-databases`;
    return {
        databaseDir,
        sqliteDb: `${databaseDir}/scrivener.db`,
        neo4jData: `${databaseDir}/neo4j-data`,
        configFile: `${databaseDir}/config.json`,
    };
}
//# sourceMappingURL=config.js.map