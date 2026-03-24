/**
 * Project loading and saving service
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseStringPromise, Builder } from 'xml2js';
import { getLogger } from '../core/logger.js';
import { createError, ErrorCode } from '../core/errors.js';
import { ensureDir, safeParse, safeStringify, safeReadFile, safeWriteFile, buildPath, } from '../utils/common.js';
import { FileUtils, PathUtils } from '../utils/shared-patterns.js';
const logger = getLogger('project-loader');
export class ProjectLoader {
    constructor(projectPath, options = {}) {
        this.projectPath = path.resolve(projectPath);
        const projectName = path.basename(projectPath, path.extname(projectPath));
        this.scrivxPath = PathUtils.build(this.projectPath, `${projectName}.scrivx`);
        this.options = {
            autoBackup: false,
            backupInterval: 3600000, // 1 hour
            maxBackups: 5,
            ...options,
        };
    }
    /**
     * Load the project structure from disk
     */
    async loadProject() {
        logger.info(`Loading project from ${this.scrivxPath}`);
        try {
            if (!(await FileUtils.exists(this.scrivxPath))) {
                throw createError(ErrorCode.NOT_FOUND, `Scrivener project file not found at "${this.scrivxPath}"`);
            }
            const scrivxContent = await safeReadFile(this.scrivxPath, 'utf-8');
            this.projectStructure = await parseStringPromise(scrivxContent, {
                explicitArray: false,
                mergeAttrs: true,
            });
            if (!this.projectStructure?.ScrivenerProject) {
                throw createError(ErrorCode.INVALID_FORMAT, 'Invalid Scrivener project structure: Missing ScrivenerProject element');
            }
            // Handle empty Binder element
            if (this.projectStructure.ScrivenerProject.Binder === '') {
                this.projectStructure.ScrivenerProject.Binder = {};
            }
            if (!this.projectStructure.ScrivenerProject.Binder) {
                this.projectStructure.ScrivenerProject.Binder = {};
            }
            // Initialize internal tracking
            this.lastLoadTime = Date.now();
            this.projectStructure._loadTime = this.lastLoadTime;
            logger.info('Project loaded successfully');
            return this.projectStructure;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw createError(ErrorCode.NOT_FOUND, `Scrivener project file not found at "${this.scrivxPath}"`);
            }
            else if (error.code === 'EACCES') {
                throw createError(ErrorCode.PERMISSION_DENIED, `Permission denied reading project file at "${this.scrivxPath}"`);
            }
            else if (error.message?.includes('XML')) {
                throw createError(ErrorCode.INVALID_FORMAT, `Invalid XML in project file: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Save the project structure to disk
     */
    async saveProject(structure) {
        const projectToSave = structure || this.projectStructure;
        if (!projectToSave) {
            throw createError(ErrorCode.INVALID_STATE, 'No project loaded to save');
        }
        logger.info(`Saving project to ${this.scrivxPath}`);
        // Create backup if enabled
        if (this.options.autoBackup) {
            await this.createBackup();
        }
        // Clean structure for saving (remove internal properties)
        const cleanStructure = this.cleanForSaving(projectToSave);
        const builder = new Builder({
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true, indent: '    ' },
        });
        try {
            const xml = builder.buildObject(cleanStructure);
            await safeWriteFile(this.scrivxPath, xml);
            logger.info('Project saved successfully');
        }
        catch (error) {
            if (error.code === 'EACCES') {
                throw createError(ErrorCode.PERMISSION_DENIED, `Permission denied writing to ${this.scrivxPath}`);
            }
            else if (error.code === 'ENOSPC') {
                throw createError(ErrorCode.IO_ERROR, 'No space left on device');
            }
            throw createError(ErrorCode.IO_ERROR, `Failed to save project: ${error.message}`);
        }
    }
    /**
     * Reload the project from disk
     */
    async reloadProject() {
        logger.info('Reloading project from disk');
        this.projectStructure = undefined;
        return await this.loadProject();
    }
    /**
     * Check if the project has been modified externally
     */
    async isProjectModified() {
        if (!this.lastLoadTime) {
            return false;
        }
        try {
            const stats = await fs.stat(this.scrivxPath);
            return stats.mtime.getTime() > this.lastLoadTime;
        }
        catch {
            return false;
        }
    }
    /**
     * Get the current project structure
     */
    getProjectStructure() {
        return this.projectStructure;
    }
    /**
     * Update the project structure in memory
     */
    updateProjectStructure(structure) {
        this.projectStructure = structure;
    }
    /**
     * Create a backup of the project file
     */
    async createBackup() {
        const backupDir = buildPath(this.projectPath, '.backups');
        await ensureDir(backupDir);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup-${timestamp}.scrivx`;
        const backupPath = buildPath(backupDir, backupName);
        try {
            const content = await safeReadFile(this.scrivxPath, 'utf-8');
            await safeWriteFile(backupPath, content);
            logger.info(`Backup created at ${backupPath}`);
            // Clean up old backups
            await this.cleanupOldBackups(backupDir);
            return backupPath;
        }
        catch (error) {
            logger.warn(`Failed to create backup: ${error.message}`);
            throw createError(ErrorCode.IO_ERROR, `Backup failed: ${error.message}`);
        }
    }
    /**
     * Restore from a backup
     */
    async restoreFromBackup(backupPath) {
        logger.info(`Restoring from backup: ${backupPath}`);
        try {
            // Create a safety backup of current state
            const _safetyBackup = await this.createBackup();
            // Restore from backup
            const backupContent = await safeReadFile(backupPath, 'utf-8');
            await safeWriteFile(this.scrivxPath, backupContent);
            // Reload the project
            await this.reloadProject();
            logger.info('Project restored successfully');
        }
        catch (error) {
            throw createError(ErrorCode.IO_ERROR, `Failed to restore from backup: ${error.message}`);
        }
    }
    /**
     * List available backups
     */
    async listBackups() {
        const backupDir = path.join(this.projectPath, '.backups');
        try {
            const files = await fs.readdir(backupDir);
            const backups = [];
            for (const file of files) {
                if (file.endsWith('.scrivx')) {
                    const filePath = path.join(backupDir, file);
                    const stats = await fs.stat(filePath);
                    backups.push({
                        path: filePath,
                        date: stats.mtime,
                        size: stats.size,
                    });
                }
            }
            // Sort by date, newest first
            backups.sort((a, b) => b.date.getTime() - a.date.getTime());
            return backups;
        }
        catch {
            return [];
        }
    }
    /**
     * Validate project structure
     */
    validateProjectStructure(structure) {
        if (!structure?.ScrivenerProject) {
            logger.error('Invalid structure: Missing ScrivenerProject');
            return false;
        }
        const project = structure.ScrivenerProject;
        // Check for required elements
        const projectAny = project;
        if (!project.Binder && !projectAny.Collections && !projectAny.Research) {
            logger.warn('Project has no content (no Binder, Collections, or Research)');
        }
        // Validate Binder structure if present
        if (project.Binder) {
            if (!this.validateBinder(project.Binder)) {
                return false;
            }
        }
        return true;
    }
    // Private helper methods
    cleanForSaving(structure) {
        const clean = safeParse(safeStringify(structure), {});
        // Remove internal tracking properties
        delete clean._loadTime;
        delete clean._modified;
        // Ensure ScrivenerProject is at root
        if (clean.ScrivenerProject) {
            return { ScrivenerProject: clean.ScrivenerProject };
        }
        return clean;
    }
    async cleanupOldBackups(_backupDir) {
        if (!this.options.maxBackups || this.options.maxBackups <= 0) {
            return;
        }
        try {
            const backups = await this.listBackups();
            if (backups.length > this.options.maxBackups) {
                // Delete oldest backups
                const toDelete = backups.slice(this.options.maxBackups);
                for (const backup of toDelete) {
                    await fs.unlink(backup.path);
                    logger.info(`Deleted old backup: ${backup.path}`);
                }
            }
        }
        catch (error) {
            logger.warn('Failed to cleanup old backups:', { error });
        }
    }
    validateBinder(binder) {
        if (!binder)
            return true;
        const binderObj = binder;
        // Handle both object and array forms
        const items = Array.isArray(binderObj.BinderItem)
            ? binderObj.BinderItem
            : binderObj.BinderItem
                ? [binderObj.BinderItem]
                : [];
        for (const item of items) {
            if (!this.validateBinderItem(item)) {
                return false;
            }
        }
        return true;
    }
    validateBinderItem(item) {
        if (!item)
            return true;
        // Check required fields
        if (!item.UUID) {
            logger.error('BinderItem missing UUID');
            return false;
        }
        if (!item.Type) {
            logger.error(`BinderItem ${item.UUID} missing Type`);
            return false;
        }
        // Validate children recursively
        if (item.Children?.BinderItem) {
            const children = Array.isArray(item.Children.BinderItem)
                ? item.Children.BinderItem
                : [item.Children.BinderItem];
            for (const child of children) {
                if (!this.validateBinderItem(child)) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Export project structure as JSON
     */
    async exportAsJson(prettyPrint = true) {
        if (!this.projectStructure) {
            throw createError(ErrorCode.INVALID_STATE, 'No project loaded');
        }
        const clean = this.cleanForSaving(this.projectStructure);
        return prettyPrint ? JSON.stringify(clean, null, 2) : safeStringify(clean);
    }
    /**
     * Import project structure from JSON
     */
    async importFromJson(jsonString) {
        try {
            const structure = safeParse(jsonString, {});
            if (!this.validateProjectStructure(structure)) {
                throw createError(ErrorCode.INVALID_FORMAT, 'Invalid project structure in JSON');
            }
            this.projectStructure = structure;
            await this.saveProject();
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw createError(ErrorCode.INVALID_FORMAT, 'Invalid JSON format');
            }
            throw error;
        }
    }
    /**
     * Get project metadata
     */
    getProjectMetadata() {
        if (!this.projectStructure?.ScrivenerProject) {
            return {};
        }
        const project = this.projectStructure.ScrivenerProject;
        return {
            title: project.ProjectSettings?.ProjectTitle,
            author: project.ProjectSettings?.FullName || project.ProjectSettings?.Author,
            created: project.ProjectSettings?.Created,
            modified: project.ProjectSettings?.Modified,
            version: project.Version,
            identifier: project.Identifier,
        };
    }
}
//# sourceMappingURL=project-loader.js.map