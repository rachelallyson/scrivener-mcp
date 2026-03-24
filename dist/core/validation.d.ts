/**
 * Centralized validation system - utilizes utils/common.ts
 */
import { validateInput, sanitizePath } from '../utils/common.js';
/**
 * Validate object against schema - re-export from utils/common.ts
 */
export declare const validate: typeof validateInput;
/**
 * Common validation schemas
 */
export declare const CommonSchemas: {
    documentId: {
        documentId: {
            type: "string";
            required: boolean;
            pattern: RegExp;
        };
    };
    title: {
        title: {
            type: "string";
            required: boolean;
            minLength: number;
            maxLength: number;
        };
    };
    content: {
        content: {
            type: "string";
            required: boolean;
            maxLength: number;
        };
    };
    path: {
        path: {
            type: "string";
            required: boolean;
            pattern: RegExp;
            custom: (value: unknown) => boolean | "Path traversal not allowed";
        };
    };
    pagination: {
        page: {
            type: "number";
            required: boolean;
            min: number;
        };
        pageSize: {
            type: "number";
            required: boolean;
            min: number;
            max: number;
        };
    };
};
/**
 * Sanitize string input - utilizes truncate from utils
 */
export declare function sanitizeString(input: string, maxLength?: number): string;
/**
 * Sanitize HTML content
 */
export declare function sanitizeHtml(html: string): string;
/**
 * Validate and sanitize file path - re-export from utils/common.ts
 */
export declare const validatePath: typeof sanitizePath;
/**
 * Type guards
 */
export declare function isString(value: unknown): value is string;
export declare function isNumber(value: unknown): value is number;
export declare function isBoolean(value: unknown): value is boolean;
export declare function isArray<T = unknown>(value: unknown): value is T[];
export declare function isObject(value: unknown): value is Record<string, unknown>;
export declare function isDefined<T>(value: T | undefined | null): value is T;
/**
 * Assert type with error
 */
export declare function assertType<T>(value: unknown, guard: (value: unknown) => value is T, field: string): T;
//# sourceMappingURL=validation.d.ts.map