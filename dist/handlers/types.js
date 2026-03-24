/**
 * Handler types and interfaces - utilizes common utilities for error handling
 */
import { ErrorCode, createError } from '../utils/common.js';
export class HandlerError extends Error {
    constructor(message, code = 'HANDLER_ERROR', 
    // Note: Using 'unknown' here to accept Error objects and other complex details
    details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'HandlerError';
    }
}
export function requireProject(context) {
    if (!context.project) {
        throw createError(ErrorCode.PROJECT_NOT_OPEN, {}, 'No project is currently open');
    }
    return context.project;
}
export function requireMemoryManager(context) {
    if (!context.memoryManager) {
        throw createError(ErrorCode.INITIALIZATION_ERROR, {}, 'Memory manager not initialized');
    }
    return context.memoryManager;
}
export function getLearningHandler(context) {
    return context.learningHandler || null;
}
export function getStringArg(args, key) {
    const value = args[key];
    if (typeof value !== 'string') {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'string', actualType: typeof value }, `Expected string for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getOptionalStringArg(args, key) {
    const value = args[key];
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'string') {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'string', actualType: typeof value }, `Expected string for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getNumberArg(args, key) {
    const value = args[key];
    if (typeof value !== 'number') {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'number', actualType: typeof value }, `Expected number for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getOptionalNumberArg(args, key) {
    const value = args[key];
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'number') {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'number', actualType: typeof value }, `Expected number for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getBooleanArg(args, key) {
    const value = args[key];
    if (typeof value !== 'boolean') {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'boolean', actualType: typeof value }, `Expected boolean for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getOptionalBooleanArg(args, key) {
    const value = args[key];
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'boolean') {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'boolean', actualType: typeof value }, `Expected boolean for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getArrayArg(args, key) {
    const value = args[key];
    if (!Array.isArray(value)) {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'array', actualType: typeof value }, `Expected array for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getObjectArg(args, key) {
    const value = args[key];
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'object', actualType: typeof value }, `Expected object for ${key}, got ${typeof value}`);
    }
    return value;
}
export function getOptionalObjectArg(args, key) {
    const value = args[key];
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw createError(ErrorCode.TYPE_MISMATCH, { key, value, expectedType: 'object', actualType: typeof value }, `Expected object for ${key}, got ${typeof value}`);
    }
    return value;
}
//# sourceMappingURL=types.js.map