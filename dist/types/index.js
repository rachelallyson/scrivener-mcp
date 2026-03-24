/**
 * Core type definitions
 */
// Re-export ScrivenerProject as Project for compatibility
export { ScrivenerProject as Project } from '../scrivener-project.js';
// Utility function to safely convert objects to LogContext
export function toLogContext(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === null ||
            value === undefined ||
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean') {
            result[key] = value;
        }
        else if (value instanceof Error) {
            result[key] = value;
        }
        else if (Array.isArray(value)) {
            try {
                result[key] = value;
            }
            catch {
                result[key] = '[Complex Array]';
            }
        }
        else if (typeof value === 'object') {
            try {
                result[key] = value;
            }
            catch {
                result[key] = '[Complex Object]';
            }
        }
        else {
            result[key] = String(value);
        }
    }
    return result;
}
//# sourceMappingURL=index.js.map