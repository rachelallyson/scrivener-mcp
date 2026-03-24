/**
 * Internal type definitions for Scrivener project handling
 */
export function isErrorWithCode(error) {
    return error instanceof Error && 'code' in error;
}
//# sourceMappingURL=internal.js.map