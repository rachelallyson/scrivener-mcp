/**
 * Project loading and saving service
 */
import type { ProjectStructure } from '../types/internal.js';
export interface ProjectLoaderOptions {
    autoBackup?: boolean;
    backupInterval?: number;
    maxBackups?: number;
}
export declare class ProjectLoader {
    private projectPath;
    private scrivxPath;
    private projectStructure?;
    private lastLoadTime?;
    private options;
    constructor(projectPath: string, options?: ProjectLoaderOptions);
    /**
     * Load the project structure from disk
     */
    loadProject(): Promise<ProjectStructure>;
    /**
     * Save the project structure to disk
     */
    saveProject(structure?: ProjectStructure): Promise<void>;
    /**
     * Reload the project from disk
     */
    reloadProject(): Promise<ProjectStructure>;
    /**
     * Check if the project has been modified externally
     */
    isProjectModified(): Promise<boolean>;
    /**
     * Get the current project structure
     */
    getProjectStructure(): ProjectStructure | undefined;
    /**
     * Update the project structure in memory
     */
    updateProjectStructure(structure: ProjectStructure): void;
    /**
     * Create a backup of the project file
     */
    createBackup(): Promise<string>;
    /**
     * Restore from a backup
     */
    restoreFromBackup(backupPath: string): Promise<void>;
    /**
     * List available backups
     */
    listBackups(): Promise<Array<{
        path: string;
        date: Date;
        size: number;
    }>>;
    /**
     * Validate project structure
     */
    validateProjectStructure(structure: ProjectStructure): boolean;
    private cleanForSaving;
    private cleanupOldBackups;
    private validateBinder;
    private validateBinderItem;
    /**
     * Export project structure as JSON
     */
    exportAsJson(prettyPrint?: boolean): Promise<string>;
    /**
     * Import project structure from JSON
     */
    importFromJson(jsonString: string): Promise<void>;
    /**
     * Get project metadata
     */
    getProjectMetadata(): Record<string, unknown>;
}
//# sourceMappingURL=project-loader.d.ts.map