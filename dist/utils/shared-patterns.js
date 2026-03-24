/**
 * Shared Patterns and Common Utilities
 * Consolidates repeated patterns across utils files to eliminate duplication
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { getLogger } from '../core/logger.js';
import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);
const logger = getLogger('shared-patterns');
// ============================================================================
// File System Patterns
// ============================================================================
/**
 * Check if file exists (consolidated from multiple files)
 */
export async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Check file exists with content search (used in env-config, condition-waiter)
 */
export async function fileExistsWithContent(filePath, searchContent) {
    try {
        if (!searchContent) {
            return await fileExists(filePath);
        }
        const content = await fs.readFile(filePath, 'utf-8');
        return content.includes(searchContent);
    }
    catch {
        return false;
    }
}
/**
 * Safe file write with lock protection (used in project-utils)
 */
export async function safeFileWrite(filePath, content, options = {}) {
    const { atomic = true, mode = 0o644 } = options;
    if (atomic) {
        const tempPath = `${filePath}.tmp.${Date.now()}`;
        const lockPath = `${filePath}.lock`;
        try {
            // Acquire lock
            await fs.writeFile(lockPath, '', { flag: 'wx' });
            // Write to temp file
            await fs.writeFile(tempPath, content, { mode });
            // Atomic rename
            await fs.rename(tempPath, filePath);
        }
        finally {
            // Release lock
            await fs.unlink(lockPath).catch(() => { });
            await fs.unlink(tempPath).catch(() => { });
        }
    }
    else {
        await fs.writeFile(filePath, content, { mode });
    }
}
/**
 * Ensure directory exists with proper permissions (consolidates ensureDir patterns)
 */
export async function ensureDirectory(dirPath, mode = 0o755) {
    try {
        await fs.mkdir(dirPath, { recursive: true, mode });
    }
    catch (error) {
        // Check if directory already exists
        try {
            const stats = await fs.stat(dirPath);
            if (!stats.isDirectory()) {
                throw new Error(`Path exists but is not a directory: ${dirPath}`);
            }
        }
        catch {
            throw error;
        }
    }
}
// ============================================================================
// Process and Command Patterns
// ============================================================================
/**
 * Safe command execution with timeout (used across multiple files)
 */
export async function safeExec(command, options = {}) {
    const { timeout = 10000, env } = options;
    try {
        const result = await execAsync(command, {
            timeout,
            env: { ...process.env, ...env },
        });
        return result;
    }
    catch (error) {
        logger.debug(`Command failed: ${command}`, { error });
        throw error;
    }
}
/**
 * Check if command/binary exists (used in env-config, permission-manager)
 */
export async function commandExists(command) {
    try {
        await safeExec(`which ${command}`, { timeout: 2000 });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get process ID by name (used in condition-waiter, adaptive-timeout)
 */
export async function getProcessByName(processName) {
    try {
        const { stdout } = await safeExec(`pgrep -f "${processName}"`, { timeout: 2000 });
        return stdout
            .trim()
            .split('\n')
            .filter((pid) => pid.length > 0);
    }
    catch {
        return [];
    }
}
// ============================================================================
// Path Validation Patterns
// ============================================================================
/**
 * Validate and sanitize paths (used in scrivener-utils, project-utils-fixed)
 */
export function validatePath(inputPath) {
    const resolved = path.resolve(inputPath);
    const normalized = path.normalize(resolved);
    // Check for path traversal attempts
    if (resolved !== normalized || resolved.includes('..')) {
        throw new Error(`Invalid path: potential path traversal attack in ${inputPath}`);
    }
    // Ensure path doesn't contain null bytes
    if (resolved.includes('\0')) {
        throw new Error(`Invalid path: contains null bytes in ${inputPath}`);
    }
    return resolved;
}
/**
 * Build safe paths (consolidates buildPath from common.ts)
 */
export function buildPath(...segments) {
    const joined = path.join(...segments);
    return validatePath(joined);
}
// ============================================================================
// Async Utility Patterns
// ============================================================================
/**
 * Simple sleep with validation (used across multiple files)
 */
export function sleep(ms) {
    if (ms < 0 || !Number.isFinite(ms)) {
        throw new Error(`Invalid sleep duration: ${ms}`);
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Timeout wrapper for promises (used in network-resilience, adaptive-timeout)
 */
export function withTimeout(promise, timeoutMs, errorMessage) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`)), timeoutMs)),
    ]);
}
/**
 * Retry with exponential backoff (consolidated from multiple implementations)
 */
export async function retryWithBackoff(operation, options = {}) {
    const { maxAttempts = 3, initialDelay = 1000, maxDelay = 30000, factor = 2, jitter = true, } = options;
    let lastError;
    let delay = initialDelay;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                throw lastError;
            }
            // Add jitter if enabled
            const actualDelay = jitter ? delay * (0.5 + Math.random() * 0.5) : delay;
            await sleep(actualDelay);
            // Exponential backoff
            delay = Math.min(delay * factor, maxDelay);
        }
    }
    throw lastError;
}
// ============================================================================
// Validation Patterns
// ============================================================================
/**
 * UUID validation (consolidates various UUID checks)
 */
export function isValidUUID(value, options = {}) {
    const { allowNumeric = false } = options;
    // Standard UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(value)) {
        return true;
    }
    // Allow numeric IDs if specified (for legacy Scrivener documents)
    if (allowNumeric && /^\d+$/.test(value)) {
        return true;
    }
    return false;
}
/**
 * URL validation (used in env-config)
 */
export function validateUrl(url, allowedProtocols = ['http:', 'https:']) {
    try {
        const parsed = new URL(url);
        return allowedProtocols.includes(parsed.protocol);
    }
    catch {
        return false;
    }
}
// ============================================================================
// String Utilities
// ============================================================================
/**
 * Format bytes for human reading (used across multiple files)
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
/**
 * Safe string truncation with ellipsis
 */
export function truncateString(str, maxLength, suffix = '...') {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
}
// ============================================================================
// Cache Patterns
// ============================================================================
/**
 * Simple memory cache with TTL (consolidates caching patterns)
 */
export class MemoryCache {
    constructor(defaultTTL = 300000) {
        this.defaultTTL = defaultTTL;
        this.cache = new Map();
    } // 5 minutes default
    set(key, value, ttl) {
        const expires = Date.now() + (ttl ?? this.defaultTTL);
        this.cache.set(key, { value, expires });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return undefined;
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value;
    }
    clear() {
        this.cache.clear();
    }
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expires) {
                this.cache.delete(key);
            }
        }
    }
}
// ============================================================================
// Export consolidated utilities
// ============================================================================
export const FileUtils = {
    exists: fileExists,
    existsWithContent: fileExistsWithContent,
    safeWrite: safeFileWrite,
    ensureDir: ensureDirectory,
};
export const ProcessUtils = {
    safeExec,
    commandExists,
    getProcessByName,
};
export const PathUtils = {
    validate: validatePath,
    build: buildPath,
};
export const AsyncUtils = {
    sleep,
    withTimeout,
    retryWithBackoff,
};
export const ValidationUtils = {
    isValidUUID,
    validateUrl,
};
export const StringUtils = {
    formatBytes,
    truncate: truncateString,
};
//# sourceMappingURL=shared-patterns.js.map