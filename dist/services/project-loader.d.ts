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
    private rawXml?;
    constructor(projectPath: string, options?: ProjectLoaderOptions);
    /**
     * Load the project structure from disk
     */
    loadProject(): Promise<ProjectStructure>;
    /**
     * Save the project structure to disk using targeted XML edits.
     * We do NOT do a full xml2js roundtrip because that converts XML attributes
     * to child elements, which Scrivener cannot read.
     * Instead, we modify the raw XML string directly for metadata changes.
     */
    saveProject(_structure?: ProjectStructure): Promise<void>;
    /**
     * Update metadata for a specific document in the raw XML.
     * This does targeted string replacement to preserve Scrivener's attribute format.
     */
    updateRawXmlMetadata(documentId: string, updates: {
        labelId?: string;
        statusId?: string;
    }): void;
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