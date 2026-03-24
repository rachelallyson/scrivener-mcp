/**
 * Shared Patterns and Common Utilities
 * Consolidates repeated patterns across utils files to eliminate duplication
 */
/**
 * Check if file exists (consolidated from multiple files)
 */
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Check file exists with content search (used in env-config, condition-waiter)
 */
export declare function fileExistsWithContent(filePath: string, searchContent?: string): Promise<boolean>;
/**
 * Safe file write with lock protection (used in project-utils)
 */
export declare function safeFileWrite(filePath: string, content: string, options?: {
    atomic?: boolean;
    mode?: number;
}): Promise<void>;
/**
 * Ensure directory exists with proper permissions (consolidates ensureDir patterns)
 */
export declare function ensureDirectory(dirPath: string, mode?: number): Promise<void>;
/**
 * Safe command execution with timeout (used across multiple files)
 */
export declare function safeExec(command: string, options?: {
    timeout?: number;
    env?: Record<string, string>;
}): Promise<{
    stdout: string;
    stderr: string;
}>;
/**
 * Check if command/binary exists (used in env-config, permission-manager)
 */
export declare function commandExists(command: string): Promise<boolean>;
/**
 * Get process ID by name (used in condition-waiter, adaptive-timeout)
 */
export declare function getProcessByName(processName: string): Promise<string[]>;
/**
 * Validate and sanitize paths (used in scrivener-utils, project-utils-fixed)
 */
export declare function validatePath(inputPath: string): string;
/**
 * Build safe paths (consolidates buildPath from common.ts)
 */
export declare function buildPath(...segments: string[]): string;
/**
 * Simple sleep with validation (used across multiple files)
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Timeout wrapper for promises (used in network-resilience, adaptive-timeout)
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
/**
 * Retry with exponential backoff (consolidated from multiple implementations)
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, options?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    jitter?: boolean;
}): Promise<T>;
/**
 * UUID validation (consolidates various UUID checks)
 */
export declare function isValidUUID(value: string, options?: {
    allowNumeric?: boolean;
}): boolean;
/**
 * URL validation (used in env-config)
 */
export declare function validateUrl(url: string, allowedProtocols?: string[]): boolean;
/**
 * Format bytes for human reading (used across multiple files)
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Safe string truncation with ellipsis
 */
export declare function truncateString(str: string, maxLength: number, suffix?: string): string;
/**
 * Simple memory cache with TTL (consolidates caching patterns)
 */
export declare class MemoryCache<T> {
    private defaultTTL;
    private cache;
    constructor(defaultTTL?: number);
    set(key: string, value: T, ttl?: number): void;
    get(key: string): T | undefined;
    clear(): void;
    cleanup(): void;
}
export declare const FileUtils: {
    exists: typeof fileExists;
    existsWithContent: typeof fileExistsWithContent;
    safeWrite: typeof safeFileWrite;
    ensureDir: typeof ensureDirectory;
};
export declare const ProcessUtils: {
    safeExec: typeof safeExec;
    commandExists: typeof commandExists;
    getProcessByName: typeof getProcessByName;
};
export declare const PathUtils: {
    validate: typeof validatePath;
    build: typeof buildPath;
};
export declare const AsyncUtils: {
    sleep: typeof sleep;
    withTimeout: typeof withTimeout;
    retryWithBackoff: typeof retryWithBackoff;
};
export declare const ValidationUtils: {
    isValidUUID: typeof isValidUUID;
    validateUrl: typeof validateUrl;
};
export declare const StringUtils: {
    formatBytes: typeof formatBytes;
    truncate: typeof truncateString;
};
//# sourceMappingURL=shared-patterns.d.ts.map