import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
// ============================================================================
// Error Handling
// ============================================================================
/** Error codes for standardized error handling */
export var ErrorCode;
(function (ErrorCode) {
    // File & Resource Errors
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ErrorCode["IO_ERROR"] = "IO_ERROR";
    ErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    ErrorCode["FILE_ACCESS_DENIED"] = "FILE_ACCESS_DENIED";
    ErrorCode["FILE_WRITE_ERROR"] = "FILE_WRITE_ERROR";
    ErrorCode["PATH_INVALID"] = "PATH_INVALID";
    ErrorCode["INVALID_FORMAT"] = "INVALID_FORMAT";
    // Project & Document Errors
    ErrorCode["PROJECT_NOT_FOUND"] = "PROJECT_NOT_FOUND";
    ErrorCode["PROJECT_NOT_OPEN"] = "PROJECT_NOT_OPEN";
    ErrorCode["PROJECT_INVALID"] = "PROJECT_INVALID";
    ErrorCode["PROJECT_LOCKED"] = "PROJECT_LOCKED";
    ErrorCode["PROJECT_ERROR"] = "PROJECT_ERROR";
    ErrorCode["DOCUMENT_NOT_FOUND"] = "DOCUMENT_NOT_FOUND";
    ErrorCode["DOCUMENT_INVALID"] = "DOCUMENT_INVALID";
    ErrorCode["DOCUMENT_LOCKED"] = "DOCUMENT_LOCKED";
    ErrorCode["DOCUMENT_TOO_LARGE"] = "DOCUMENT_TOO_LARGE";
    // Validation & Input Errors
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    ErrorCode["MISSING_REQUIRED"] = "MISSING_REQUIRED";
    ErrorCode["TYPE_MISMATCH"] = "TYPE_MISMATCH";
    // System & Runtime Errors
    ErrorCode["INITIALIZATION_ERROR"] = "INITIALIZATION_ERROR";
    ErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    ErrorCode["INVALID_CONFIG"] = "INVALID_CONFIG";
    ErrorCode["RUNTIME_ERROR"] = "RUNTIME_ERROR";
    ErrorCode["INVALID_STATE"] = "INVALID_STATE";
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    // Database & Sync Errors
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["SYNC_ERROR"] = "SYNC_ERROR";
    ErrorCode["CONNECTION_ERROR"] = "CONNECTION_ERROR";
    ErrorCode["TRANSACTION_ERROR"] = "TRANSACTION_ERROR";
    ErrorCode["QUERY_ERROR"] = "QUERY_ERROR";
    // API & Network Errors
    ErrorCode["API_ERROR"] = "API_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorCode["OPERATION_CANCELLED"] = "OPERATION_CANCELLED";
    ErrorCode["RATE_LIMIT_ERROR"] = "RATE_LIMIT_ERROR";
    ErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    // Cache & Memory Errors
    ErrorCode["CACHE_ERROR"] = "CACHE_ERROR";
    ErrorCode["MEMORY_ERROR"] = "MEMORY_ERROR";
    ErrorCode["CACHE_FULL"] = "CACHE_FULL";
    ErrorCode["CACHE_MISS"] = "CACHE_MISS";
    ErrorCode["RESOURCE_EXHAUSTED"] = "RESOURCE_EXHAUSTED";
    // Authentication & Authorization
    ErrorCode["AUTH_ERROR"] = "AUTH_ERROR";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    // Analysis & AI Errors
    ErrorCode["ANALYSIS_ERROR"] = "ANALYSIS_ERROR";
    ErrorCode["ENHANCEMENT_ERROR"] = "ENHANCEMENT_ERROR";
    ErrorCode["AI_SERVICE_ERROR"] = "AI_SERVICE_ERROR";
    ErrorCode["PROCESSING_ERROR"] = "PROCESSING_ERROR";
    // Service Errors
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCode["OPERATION_FAILED"] = "OPERATION_FAILED";
    ErrorCode["DEPENDENCY_ERROR"] = "DEPENDENCY_ERROR";
    ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ErrorCode || (ErrorCode = {}));
/** Standard application error */
export class AppError extends Error {
    constructor(message, code, details, statusCode = 500) {
        super(message);
        this.code = code;
        this.details = details;
        this.statusCode = statusCode;
        this.name = 'AppError';
        Error.captureStackTrace?.(this, this.constructor);
    }
}
/** Create a new AppError */
export function createError(code, details, message) {
    return new AppError(message || `Error: ${code}`, code, details);
}
/** Wrap unknown errors into AppError */
export function handleError(error, context) {
    if (error instanceof AppError)
        return error;
    if (error instanceof Error) {
        const { code, message, stack } = error;
        switch (code) {
            case 'ENOENT':
                return new AppError(`Not found${context ? ` in ${context}` : ''}`, ErrorCode.NOT_FOUND, { originalError: message }, 404);
            case 'EACCES':
            case 'EPERM':
                return new AppError(`Permission denied${context ? ` for ${context}` : ''}`, ErrorCode.PERMISSION_DENIED, { originalError: message }, 403);
            case 'EEXIST':
                return new AppError(`Already exists${context ? ` in ${context}` : ''}`, ErrorCode.IO_ERROR, { originalError: message }, 409);
            default:
                return new AppError(message || 'Unknown error', ErrorCode.PROJECT_ERROR, { context, stack }, 500);
        }
    }
    return new AppError('Unexpected error', ErrorCode.PROJECT_ERROR, { error: String(error), context }, 500);
}
/** Higher-order async error wrapper */
export function withErrorHandling(fn, context) {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (e) {
            throw handleError(e, context);
        }
    });
}
/** Validate input against schema */
export function validateInput(input, schema, throwOnError = true) {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
        const value = input[field];
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
            continue;
        }
        if (value === undefined || value === null)
            continue;
        const type = Array.isArray(value) ? 'array' : typeof value;
        if (rules.type && type !== rules.type) {
            errors.push(`${field} must be ${rules.type}, got ${type}`);
            continue;
        }
        if (typeof value === 'string') {
            if (rules.minLength && value.length < rules.minLength)
                errors.push(`${field} min length ${rules.minLength}`);
            if (rules.maxLength && value.length > rules.maxLength)
                errors.push(`${field} max length ${rules.maxLength}`);
            if (rules.pattern && !rules.pattern.test(value))
                errors.push(`${field} pattern mismatch`);
        }
        if (typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min)
                errors.push(`${field} >= ${rules.min}`);
            if (rules.max !== undefined && value > rules.max)
                errors.push(`${field} <= ${rules.max}`);
        }
        if (Array.isArray(value)) {
            if (rules.minLength && value.length < rules.minLength)
                errors.push(`${field} requires ${rules.minLength}+ items`);
            if (rules.maxLength && value.length > rules.maxLength)
                errors.push(`${field} max ${rules.maxLength} items`);
        }
        if (rules.enum && !rules.enum.includes(value))
            errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        if (rules.custom) {
            const result = rules.custom(value);
            if (result !== true)
                errors.push(typeof result === 'string' ? result : `${field} invalid`);
        }
    }
    if (throwOnError && errors.length)
        throw new AppError('Validation failed', ErrorCode.VALIDATION_ERROR, { errors }, 400);
    return { valid: errors.length === 0, errors };
}
/** Sanitize and normalize a filesystem path */
export function sanitizePath(inputPath) {
    return path
        .normalize(inputPath.replace(/\0/g, ''))
        .split(path.sep)
        .filter((p) => p && p !== '.' && p !== '..')
        .join(path.sep);
}
/** Build a path from base and segments */
export function buildPath(base, ...segments) {
    return path.join(base, ...segments);
}
/**
 * Validate UUID v4 with options for case sensitivity and numeric IDs
 */
export function isValidUUID(uuid, options) {
    const opts = { caseSensitive: false, allowNumeric: false, ...options };
    // Handle numeric IDs if allowed (Scrivener sometimes uses numeric IDs)
    if (opts.allowNumeric && /^\d+$/.test(uuid))
        return true;
    // UUID v4 pattern with case handling
    const pattern = opts.caseSensitive
        ? /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        : /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return pattern.test(uuid);
}
export function createApiResponse(data, metadata) {
    return { success: true, data, metadata: { timestamp: Date.now(), ...metadata } };
}
export function createErrorResponse(error, metadata) {
    const appError = error instanceof AppError ? error : handleError(error);
    return {
        success: false,
        error: { code: appError.code, message: appError.message, details: appError.details },
        metadata: { timestamp: Date.now(), ...metadata },
    };
}
export function validateApiResponse(resp) {
    if (!resp || typeof resp !== 'object')
        return false;
    const r = resp;
    return typeof r.success === 'boolean' && (r.success || !!r.error);
}
// ============================================================================
// File System Utilities
// ============================================================================
export async function ensureDir(dirPath) {
    try {
        await fs.promises.mkdir(dirPath, { recursive: true });
    }
    catch (e) {
        throw handleError(e, `ensureDir ${dirPath}`);
    }
}
export async function safeReadFile(filePath, encoding = 'utf-8') {
    try {
        return await fs.promises.readFile(filePath, encoding);
    }
    catch (e) {
        throw handleError(e, `readFile ${filePath}`);
    }
}
export async function safeWriteFile(filePath, data, options) {
    try {
        await ensureDir(path.dirname(filePath));
        await fs.promises.writeFile(filePath, data, options);
    }
    catch (e) {
        throw handleError(e, `writeFile ${filePath}`);
    }
}
export async function pathExists(filePath) {
    try {
        await fs.promises.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Read and parse a JSON file using existing utilities
 */
export async function readJSON(filePath, fallback) {
    try {
        const content = await safeReadFile(filePath, 'utf-8');
        return safeParse(content, fallback);
    }
    catch (e) {
        if (fallback !== undefined) {
            return fallback;
        }
        throw handleError(e, `readJSON ${filePath}`);
    }
}
/**
 * Write data as JSON to a file using existing utilities
 */
export async function writeJSON(filePath, data, pretty = true) {
    try {
        // For pretty printing, try native JSON.stringify first, fall back to safeStringify
        let output;
        if (pretty) {
            try {
                output = JSON.stringify(data, null, 2);
            }
            catch {
                // Handle circular references or other JSON.stringify errors
                output = safeStringify(data);
            }
        }
        else {
            output = safeStringify(data);
        }
        await safeWriteFile(filePath, output);
    }
    catch (e) {
        throw handleError(e, `writeJSON ${filePath}`);
    }
}
// ============================================================================
// Cleanup Utilities
// ============================================================================
export class CleanupManager {
    constructor() {
        this.cleanupTasks = [];
        this.isCleaningUp = false;
    }
    /** Register a cleanup task */
    register(task) {
        this.cleanupTasks.push(task);
    }
    /** Execute all registered cleanup tasks */
    async cleanup() {
        if (this.isCleaningUp)
            return;
        this.isCleaningUp = true;
        const errors = [];
        for (const task of this.cleanupTasks) {
            try {
                await task();
            }
            catch (err) {
                errors.push(err);
            }
        }
        this.cleanupTasks = [];
        this.isCleaningUp = false;
        if (errors.length > 0) {
            throw new AppError('Cleanup failed with errors', ErrorCode.IO_ERROR, {
                errors: errors.map((e) => e.message),
            });
        }
    }
    /** Setup process signal handlers */
    setupProcessHandlers() {
        const handler = async () => {
            await this.cleanup();
            process.exit(0);
        };
        process.on('SIGINT', handler);
        process.on('SIGTERM', handler);
        process.on('beforeExit', handler);
    }
}
// ============================================================================
// String Utilities
// ============================================================================
export const truncate = (s, max) => s.length <= max ? s : `${s.slice(0, max - 3)}...`;
export const generateHash = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const toSlug = (s) => s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
// ============================================================================
// Async Utilities
// ============================================================================
export async function retry(fn, { maxAttempts = 3, initialDelay = 1000, maxDelay = 10000, factor = 2, jitter = false, attemptTimeout, onRetry, shouldRetry, } = {}) {
    // Validate parameters
    if (maxAttempts <= 0) {
        throw new Error('maxAttempts must be positive');
    }
    if (initialDelay < 0 || maxDelay < 0) {
        throw new Error('Delays must be non-negative');
    }
    if (factor <= 0) {
        throw new Error('factor must be positive');
    }
    let last;
    for (let i = 1; i <= maxAttempts; i++) {
        try {
            if (attemptTimeout) {
                // Add timeout per attempt
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Attempt ${i} timed out after ${attemptTimeout}ms`)), attemptTimeout);
                });
                return await Promise.race([fn(), timeoutPromise]);
            }
            else {
                return await fn();
            }
        }
        catch (e) {
            last = e;
            // Check if error is retryable
            if (shouldRetry && !shouldRetry(last)) {
                throw last; // Don't retry unrecoverable errors
            }
            if (i === maxAttempts)
                break;
            onRetry?.(i, last);
            // Calculate delay with optional jitter
            let currentDelay = Math.min(initialDelay * Math.pow(factor, i - 1), maxDelay);
            if (jitter) {
                currentDelay = currentDelay * (0.5 + Math.random() * 0.5); // 50-100% of calculated delay
            }
            await sleep(Math.floor(currentDelay));
        }
    }
    throw last;
}
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
export function debounce(fn, delay) {
    let id;
    return (...args) => {
        clearTimeout(id);
        id = setTimeout(() => fn(...args), delay);
    };
}
export function throttle(fn, limit) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
// ============================================================================
// Batch Processing Utilities
// ============================================================================
export async function processBatch(items, processor, size = 10) {
    const results = [];
    for (let i = 0; i < items.length; i += size) {
        results.push(...(await processor(items.slice(i, i + size))));
    }
    return results;
}
export async function processParallel(items, processor, concurrency = 5) {
    const results = [];
    const executing = [];
    for (const item of items) {
        const p = processor(item).then((r) => {
            results.push(r);
        });
        executing.push(p);
        if (executing.length >= concurrency) {
            await Promise.race(executing);
            executing.splice(0, executing.length - concurrency + 1);
        }
    }
    await Promise.all(executing);
    return results;
}
// ============================================================================
// JSON & Object Utilities
// ============================================================================
/** Safe JSON parse */
export const safeParse = (s, fallback) => {
    try {
        return JSON.parse(s);
    }
    catch {
        return fallback;
    }
};
/** Safe JSON stringify */
export const safeStringify = (v) => {
    try {
        return JSON.stringify(v);
    }
    catch (error) {
        // Handle circular references by using a replacer function
        if (error instanceof TypeError && error.message.includes('circular')) {
            try {
                const seen = new WeakSet();
                return JSON.stringify(v, (_key, value) => {
                    if (typeof value === 'object' && value !== null) {
                        if (seen.has(value)) {
                            return '[Circular]';
                        }
                        seen.add(value);
                    }
                    return value;
                });
            }
            catch {
                return '{}'; // Fallback to empty object
            }
        }
        return '';
    }
};
/** Deep clone object */
export const deepClone = (obj) => structuredClone(obj);
/** Deep merge objects */
export function deepMerge(a, b) {
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) {
        const aValue = a[k];
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            const mergeTarget = aValue && typeof aValue === 'object' && !Array.isArray(aValue)
                ? aValue
                : {};
            out[k] = deepMerge(mergeTarget, v);
        }
        else {
            out[k] = v;
        }
    }
    return out;
}
/** Get nested property safely */
export function getNested(obj, path, def) {
    return path.split('.').reduce((o, k) => {
        if (o && typeof o === 'object' && o !== null && k in o) {
            return o[k];
        }
        return def;
    }, obj);
}
/** Set nested property safely */
export function setNested(obj, path, value) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in cur) || typeof cur[key] !== 'object' || cur[key] === null) {
            cur[key] = {};
        }
        cur = cur[key];
    }
    cur[keys.at(-1)] = value;
}
/** Check if object is empty */
export const isEmpty = (obj) => {
    if (obj == null)
        return true;
    if (Array.isArray(obj) || typeof obj === 'string')
        return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set)
        return obj.size === 0;
    return Object.keys(obj).length === 0;
};
/** Pick specific keys from object */
export const pick = (obj, keys) => {
    const result = {};
    for (const key of keys) {
        if (key in obj)
            result[key] = obj[key];
    }
    return result;
};
/** Omit specific keys from object */
export const omit = (obj, keys) => {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
};
// ============================================================================
// Array Utilities
// ============================================================================
/** Remove duplicates from array */
export const unique = (arr) => [...new Set(arr)];
/** Chunk array into smaller arrays */
export const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};
/** Group array by key */
export const groupBy = (arr, key) => {
    return arr.reduce((acc, item) => {
        const group = String(item[key]);
        (acc[group] = acc[group] || []).push(item);
        return acc;
    }, {});
};
// ============================================================================
// Performance & Environment Utilities
// ============================================================================
/** Measure execution time */
export async function measureExecution(fn) {
    const start = Date.now();
    const result = await fn();
    return { result, ms: Date.now() - start };
}
/** Simple token-bucket rate limiter */
export class RateLimiter {
    constructor(rate, perMs) {
        this.rate = rate;
        this.perMs = perMs;
        this.last = Date.now();
        this.tokens = rate;
    }
    tryRemove() {
        const now = Date.now();
        const delta = ((now - this.last) / this.perMs) * this.rate;
        this.tokens = Math.min(this.rate, this.tokens + delta);
        this.last = now;
        if (this.tokens >= 1) {
            this.tokens--;
            return true;
        }
        return false;
    }
}
/** Require environment variable */
export const requireEnv = (key) => {
    const val = process.env[key];
    if (!val)
        throw new AppError(`Missing env ${key}`, ErrorCode.CONFIGURATION_ERROR);
    return val;
};
/** Get environment variable with fallback */
export const getEnv = (key, defaultValue) => {
    return process.env[key] || defaultValue;
};
/** Is production env */
export const isProduction = () => process.env.NODE_ENV === 'production';
/** Is development env */
export const isDevelopment = () => process.env.NODE_ENV === 'development';
// ============================================================================
// Text Processing Utilities
// ============================================================================
// Re-export accurate text metrics functions from dedicated module
export { getAccurateParagraphCount, getAccurateSentenceCount, getAccurateWordCount, getCharacterCount, getTextMetrics, getWordFrequency, splitIntoSentences, splitIntoWords, getWordPairs, } from './text-metrics.js';
// Text processing functions moved to text-metrics.js and re-exported above
// ============================================================================
// Date & Time Utilities
// ============================================================================
/** Format duration in ms to human-readable string */
export const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}d ${hours % 24}h`;
    if (hours > 0)
        return `${hours}h ${minutes % 60}m`;
    if (minutes > 0)
        return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};
/** Format bytes to human-readable size */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
// ============================================================================
// Export all utilities
// ============================================================================
export default {
    // Error handling
    ErrorCode,
    AppError,
    handleError,
    withErrorHandling,
    // Validation
    validateInput,
    sanitizePath,
    buildPath,
    isValidUUID,
    // API
    createApiResponse,
    createErrorResponse,
    validateApiResponse,
    // File system
    ensureDir,
    safeReadFile,
    safeWriteFile,
    pathExists,
    // Cleanup
    CleanupManager,
    // String
    truncate,
    generateHash,
    toSlug,
    // Async
    retry,
    sleep,
    debounce,
    throttle,
    // Batch
    processBatch,
    processParallel,
    // JSON & Objects
    safeParse,
    safeStringify,
    deepClone,
    deepMerge,
    getNested,
    setNested,
    isEmpty,
    pick,
    omit,
    // Arrays
    unique,
    chunk,
    groupBy,
    // Performance & Environment
    measureExecution,
    RateLimiter,
    requireEnv,
    getEnv,
    isProduction,
    isDevelopment,
    // Date & Time
    formatDuration,
    formatBytes,
};
//# sourceMappingURL=common.js.map