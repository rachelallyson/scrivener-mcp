/**
 * Centralized validation system - utilizes utils/common.ts
 */
import { ErrorCode, createError, validateInput, sanitizePath, truncate } from '../utils/common.js';
/**
 * Validate object against schema - re-export from utils/common.ts
 */
export const validate = validateInput;
/**
 * Common validation schemas
 */
export const CommonSchemas = {
    documentId: {
        documentId: {
            type: 'string',
            required: true,
            pattern: /^[A-F0-9-]+$/i,
        },
    },
    title: {
        title: {
            type: 'string',
            required: true,
            minLength: 1,
            maxLength: 255,
        },
    },
    content: {
        content: {
            type: 'string',
            required: true,
            maxLength: 10000000, // 10MB limit
        },
    },
    path: {
        path: {
            type: 'string',
            required: true,
            pattern: /^[^<>:"|?*]+$/,
            custom: (value) => {
                if (typeof value !== 'string')
                    return false;
                // Prevent path traversal
                if (value.includes('..'))
                    return 'Path traversal not allowed';
                return true;
            },
        },
    },
    pagination: {
        page: {
            type: 'number',
            required: false,
            min: 1,
        },
        pageSize: {
            type: 'number',
            required: false,
            min: 1,
            max: 100,
        },
    },
};
/**
 * Sanitize string input - utilizes truncate from utils
 */
export function sanitizeString(input, maxLength = 1000) {
    return truncate(input, maxLength)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // eslint-disable-line no-control-regex
        .trim();
}
/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html) {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/on\w+\s*=\s*'[^']*'/gi, '')
        .replace(/javascript:/gi, '');
}
/**
 * Validate and sanitize file path - re-export from utils/common.ts
 */
export const validatePath = sanitizePath;
/**
 * Type guards
 */
export function isString(value) {
    return typeof value === 'string';
}
export function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
export function isBoolean(value) {
    return typeof value === 'boolean';
}
export function isArray(value) {
    return Array.isArray(value);
}
export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * Assert type with error
 */
export function assertType(value, guard, field) {
    if (!guard(value)) {
        throw createError(ErrorCode.TYPE_MISMATCH, { field, value }, `Invalid type for ${field}`);
    }
    return value;
}
//# sourceMappingURL=validation.js.map