/**
 * Project utilities with proper error handling and security
 * Consolidated from project-utils and project-utils-fixed
 */
/**
 * Ensure the .scrivener-mcp directory exists with proper structure and security
 */
export declare function ensureProjectDataDirectory(projectPath: string): Promise<string>;
/**
 * Get the path to the queue state file for a project
 */
export declare function getQueueStatePath(projectPath: string): string;
/**
 * Get the path to the cache directory for a project
 */
export declare function getCacheDirectory(projectPath: string): string;
/**
 * Get the path to the vectors directory for a project
 */
export declare function getVectorsDirectory(projectPath: string): string;
/**
 * Clean up old cache files
 */
export declare function cleanupCache(projectPath: string, maxAgeMs?: number): Promise<void>;
//# sourceMappingURL=project-utils.d.ts.map