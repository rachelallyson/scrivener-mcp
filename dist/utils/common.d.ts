import * as fs from 'fs';
/** Error codes for standardized error handling */
export declare enum ErrorCode {
    NOT_FOUND = "NOT_FOUND",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    IO_ERROR = "IO_ERROR",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    FILE_ACCESS_DENIED = "FILE_ACCESS_DENIED",
    FILE_WRITE_ERROR = "FILE_WRITE_ERROR",
    PATH_INVALID = "PATH_INVALID",
    INVALID_FORMAT = "INVALID_FORMAT",
    PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND",
    PROJECT_NOT_OPEN = "PROJECT_NOT_OPEN",
    PROJECT_INVALID = "PROJECT_INVALID",
    PROJECT_LOCKED = "PROJECT_LOCKED",
    PROJECT_ERROR = "PROJECT_ERROR",
    DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",
    DOCUMENT_INVALID = "DOCUMENT_INVALID",
    DOCUMENT_LOCKED = "DOCUMENT_LOCKED",
    DOCUMENT_TOO_LARGE = "DOCUMENT_TOO_LARGE",
    INVALID_INPUT = "INVALID_INPUT",
    INVALID_REQUEST = "INVALID_REQUEST",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    MISSING_REQUIRED = "MISSING_REQUIRED",
    TYPE_MISMATCH = "TYPE_MISMATCH",
    INITIALIZATION_ERROR = "INITIALIZATION_ERROR",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    INVALID_CONFIG = "INVALID_CONFIG",
    RUNTIME_ERROR = "RUNTIME_ERROR",
    INVALID_STATE = "INVALID_STATE",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
    DATABASE_ERROR = "DATABASE_ERROR",
    SYNC_ERROR = "SYNC_ERROR",
    CONNECTION_ERROR = "CONNECTION_ERROR",
    TRANSACTION_ERROR = "TRANSACTION_ERROR",
    QUERY_ERROR = "QUERY_ERROR",
    API_ERROR = "API_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT = "TIMEOUT",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    OPERATION_CANCELLED = "OPERATION_CANCELLED",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    CACHE_ERROR = "CACHE_ERROR",
    MEMORY_ERROR = "MEMORY_ERROR",
    CACHE_FULL = "CACHE_FULL",
    CACHE_MISS = "CACHE_MISS",
    RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED",
    AUTH_ERROR = "AUTH_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    ANALYSIS_ERROR = "ANALYSIS_ERROR",
    ENHANCEMENT_ERROR = "ENHANCEMENT_ERROR",
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
    PROCESSING_ERROR = "PROCESSING_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    OPERATION_FAILED = "OPERATION_FAILED",
    DEPENDENCY_ERROR = "DEPENDENCY_ERROR",
    UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
/** Standard application error */
export declare class AppError extends Error {
    code: ErrorCode;
    details?: unknown | undefined;
    statusCode: number;
    constructor(message: string, code: ErrorCode, details?: unknown | undefined, statusCode?: number);
}
/** Create a new AppError */
export declare function createError(code: ErrorCode, details?: unknown, message?: string): AppError;
/** Wrap unknown errors into AppError */
export declare function handleError(error: unknown, context?: string): AppError;
/** Higher-order async error wrapper */
export declare function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, context?: string): T;
/** Validation rule schema */
export interface ValidationRule {
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: ReadonlyArray<unknown>;
    custom?: (value: unknown) => boolean | string;
}
export type ValidationSchema = Record<string, ValidationRule>;
/** Validate input against schema */
export declare function validateInput(input: Record<string, unknown>, schema: ValidationSchema, throwOnError?: boolean): {
    valid: boolean;
    errors: string[];
};
/** Sanitize and normalize a filesystem path */
export declare function sanitizePath(inputPath: string): string;
/** Build a path from base and segments */
export declare function buildPath(base: string, ...segments: string[]): string;
/**
 * Validate UUID v4 with options for case sensitivity and numeric IDs
 */
export declare function isValidUUID(uuid: string, options?: {
    caseSensitive?: boolean;
    allowNumeric?: boolean;
}): boolean;
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    metadata?: {
        timestamp: number;
        duration?: number;
        [k: string]: unknown;
    };
}
export declare function createApiResponse<T>(data?: T, metadata?: Record<string, unknown>): ApiResponse<T>;
export declare function createErrorResponse(error: Error | AppError, metadata?: Record<string, unknown>): ApiResponse;
export declare function validateApiResponse(resp: unknown): resp is ApiResponse;
export declare function ensureDir(dirPath: string): Promise<void>;
export declare function safeReadFile(filePath: string, encoding?: BufferEncoding): Promise<string>;
export declare function safeWriteFile(filePath: string, data: string | Buffer, options?: fs.WriteFileOptions): Promise<void>;
export declare function pathExists(filePath: string): Promise<boolean>;
/**
 * Read and parse a JSON file using existing utilities
 */
export declare function readJSON<T>(filePath: string, fallback?: T): Promise<T>;
/**
 * Write data as JSON to a file using existing utilities
 */
export declare function writeJSON(filePath: string, data: unknown, pretty?: boolean): Promise<void>;
export declare class CleanupManager {
    private cleanupTasks;
    private isCleaningUp;
    /** Register a cleanup task */
    register(task: () => Promise<void>): void;
    /** Execute all registered cleanup tasks */
    cleanup(): Promise<void>;
    /** Setup process signal handlers */
    setupProcessHandlers(): void;
}
export declare const truncate: (s: string, max: number) => string;
export declare const generateHash: (s: string) => string;
export declare const toSlug: (s: string) => string;
export declare function retry<T>(fn: () => Promise<T>, { maxAttempts, initialDelay, maxDelay, factor, jitter, attemptTimeout, onRetry, shouldRetry, }?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    jitter?: boolean;
    attemptTimeout?: number;
    onRetry?: (attempt: number, e: Error) => void;
    shouldRetry?: (error: Error) => boolean;
}): Promise<T>;
export declare const sleep: (ms: number) => Promise<void>;
export declare function debounce<T extends (...a: unknown[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...a: unknown[]) => void>(fn: T, limit: number): (...args: Parameters<T>) => void;
export declare function processBatch<T, R>(items: T[], processor: (batch: T[]) => Promise<R[]>, size?: number): Promise<R[]>;
export declare function processParallel<T, R>(items: T[], processor: (item: T) => Promise<R>, concurrency?: number): Promise<R[]>;
/** Safe JSON parse */
export declare const safeParse: <T>(s: string, fallback: T) => T;
/** Safe JSON stringify */
export declare const safeStringify: (v: unknown) => string;
/** Deep clone object */
export declare const deepClone: <T>(obj: T) => T;
/** Deep merge objects */
export declare function deepMerge<T extends Record<string, unknown>, U extends Record<string, unknown>>(a: T, b: U): T & U;
/** Get nested property safely */
export declare function getNested(obj: Record<string, unknown>, path: string, def?: unknown): unknown;
/** Set nested property safely */
export declare function setNested(obj: Record<string, unknown>, path: string, value: unknown): void;
/** Check if object is empty */
export declare const isEmpty: (obj: unknown) => boolean;
/** Pick specific keys from object */
export declare const pick: <T extends object, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
/** Omit specific keys from object */
export declare const omit: <T extends object, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
/** Remove duplicates from array */
export declare const unique: <T>(arr: T[]) => T[];
/** Chunk array into smaller arrays */
export declare const chunk: <T>(arr: T[], size: number) => T[][];
/** Group array by key */
export declare const groupBy: <T>(arr: T[], key: keyof T) => Record<string, T[]>;
/** Measure execution time */
export declare function measureExecution<T>(fn: () => Promise<T>): Promise<{
    result: T;
    ms: number;
}>;
/** Simple token-bucket rate limiter */
export declare class RateLimiter {
    private rate;
    private perMs;
    private tokens;
    private last;
    constructor(rate: number, perMs: number);
    tryRemove(): boolean;
}
/** Require environment variable */
export declare const requireEnv: (key: string) => string;
/** Get environment variable with fallback */
export declare const getEnv: (key: string, defaultValue?: string) => string | undefined;
/** Is production env */
export declare const isProduction: () => boolean;
/** Is development env */
export declare const isDevelopment: () => boolean;
export { getAccurateParagraphCount, getAccurateSentenceCount, getAccurateWordCount, getCharacterCount, getTextMetrics, getWordFrequency, splitIntoSentences, splitIntoWords, getWordPairs, } from './text-metrics.js';
/** Format duration in ms to human-readable string */
export declare const formatDuration: (ms: number) => string;
/** Format bytes to human-readable size */
export declare const formatBytes: (bytes: number, decimals?: number) => string;
declare const _default: {
    ErrorCode: typeof ErrorCode;
    AppError: typeof AppError;
    handleError: typeof handleError;
    withErrorHandling: typeof withErrorHandling;
    validateInput: typeof validateInput;
    sanitizePath: typeof sanitizePath;
    buildPath: typeof buildPath;
    isValidUUID: typeof isValidUUID;
    createApiResponse: typeof createApiResponse;
    createErrorResponse: typeof createErrorResponse;
    validateApiResponse: typeof validateApiResponse;
    ensureDir: typeof ensureDir;
    safeReadFile: typeof safeReadFile;
    safeWriteFile: typeof safeWriteFile;
    pathExists: typeof pathExists;
    CleanupManager: typeof CleanupManager;
    truncate: (s: string, max: number) => string;
    generateHash: (s: string) => string;
    toSlug: (s: string) => string;
    retry: typeof retry;
    sleep: (ms: number) => Promise<void>;
    debounce: typeof debounce;
    throttle: typeof throttle;
    processBatch: typeof processBatch;
    processParallel: typeof processParallel;
    safeParse: <T>(s: string, fallback: T) => T;
    safeStringify: (v: unknown) => string;
    deepClone: <T>(obj: T) => T;
    deepMerge: typeof deepMerge;
    getNested: typeof getNested;
    setNested: typeof setNested;
    isEmpty: (obj: unknown) => boolean;
    pick: <T extends object, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
    omit: <T extends object, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
    unique: <T>(arr: T[]) => T[];
    chunk: <T>(arr: T[], size: number) => T[][];
    groupBy: <T>(arr: T[], key: keyof T) => Record<string, T[]>;
    measureExecution: typeof measureExecution;
    RateLimiter: typeof RateLimiter;
    requireEnv: (key: string) => string;
    getEnv: (key: string, defaultValue?: string) => string | undefined;
    isProduction: () => boolean;
    isDevelopment: () => boolean;
    formatDuration: (ms: number) => string;
    formatBytes: (bytes: number, decimals?: number) => string;
};
export default _default;
//# sourceMappingURL=common.d.ts.map