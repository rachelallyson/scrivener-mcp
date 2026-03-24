/**
 * Fixed Project Loader with atomic operations and data integrity
 * Prevents corruption, data loss, and handles concurrent access
 */
import type { ProjectStructure } from '../types/internal.js';
export interface ProjectLoaderOptions {
    autoBackup?: boolean;
    maxBackups?: number;
    validateOnLoad?: boolean;
    lockTimeout?: number;
}
export declare class ProjectLoader {
    private projectPath;
    private scrivxPath;
    private lastLoadTime;
    private projectStructure;
    private options;
    private visitedNodes;
    constructor(projectPath: string, options?: ProjectLoaderOptions);
    /**
     * Acquire file lock for safe operations
     */
    private acquireLock;
    /**
     * Load project with validation and locking
     */
    loadProject(): Promise<ProjectStructure>;
    /**
     * Save project with atomic write and backup
     */
    saveProject(structure?: ProjectStructure): Promise<void>;
    /**
     * Atomic write with automatic backup and rollback
     */
    private atomicWrite;
    /**
     * Sanitize structure to prevent XML injection
     */
    private sanitizeStructure;
    /**
     * Validate project structure with circular reference detection
     */
    private validateStructure;
    /**
     * Validate binder item with circular reference protection
     */
    private validateBinderItem;
    /**
     * Create timestamped backup
     */
    createBackup(): Promise<string>;
    /**
     * Clean up old backups safely
     */
    private cleanupOldBackups;
    /**
     * List backups with iterator for memory efficiency
     */
    listBackupsIterator(limit?: number): AsyncGenerator<{
        path: string;
        date: Date;
        size: number;
    }>;
    /**
     * Check if project has been modified
     */
    isProjectModified(): Promise<boolean>;
    /**
     * Get project metadata
     */
    getProjectMetadata(): Record<string, unknown> | null;
}
//# sourceMappingURL=project-loader-fixed.d.ts.map