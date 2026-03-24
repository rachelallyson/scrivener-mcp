/**
 * Common validation schemas for handlers
 */
// Document-related schemas
export const documentIdSchema = {
    documentId: {
        type: 'string',
        required: true,
        pattern: /^[A-F0-9-]+$/i,
    },
};
export const titleSchema = {
    title: { type: 'string', required: true, minLength: 1 },
};
export const contentSchema = {
    content: { type: 'string', required: true },
};
export const querySchema = {
    query: { type: 'string', required: true, minLength: 1 },
};
// Complex schemas
export const documentContentSchema = {
    documentId: { type: 'string', required: true },
    content: { type: 'string', required: true },
};
export const documentTitleSchema = {
    documentId: { type: 'string', required: true },
    newTitle: { type: 'string', required: true, minLength: 1 },
};
export const documentMoveSchema = {
    documentId: { type: 'string', required: true },
    targetFolderId: { type: 'string', required: true },
    position: { type: 'number', required: false },
};
export const analysisSchema = {
    documentId: { type: 'string', required: true },
    analysisTypes: { type: 'array', required: false },
};
export const enhancementSchema = {
    documentId: { type: 'string', required: true },
    enhancementType: { type: 'string', required: true },
    options: { type: 'object', required: false },
};
export const promptSchema = {
    prompt: { type: 'string', required: true, minLength: 1 },
    context: { type: 'object', required: false },
    length: { type: 'number', required: false },
};
export const memorySchema = {
    memoryType: { type: 'string', required: true },
    data: { type: 'object', required: true },
};
export const searchSchema = {
    documentId: { type: 'string', required: true },
    includeComments: { type: 'boolean', required: false },
};
export const moveDocumentSchema = {
    documentId: { type: 'string', required: true },
    targetFolderId: { type: 'string', required: false },
};
export const searchContentSchema = {
    query: { type: 'string', required: true, minLength: 1 },
    caseSensitive: { type: 'boolean', required: false },
    regex: { type: 'boolean', required: false },
    includeTrash: { type: 'boolean', required: false },
    searchIn: { type: 'array', required: false },
};
export const searchTrashSchema = {
    query: { type: 'string', required: true, minLength: 1 },
    searchType: { type: 'string', required: false },
};
export const documentDetailsSchema = {
    documentId: { type: 'string', required: true },
    includeComments: { type: 'boolean', required: false },
    includeFootnotes: { type: 'boolean', required: false },
};
export const compileSchema = {
    format: { type: 'string', required: false },
    rootFolderId: { type: 'string', required: false },
    includeSynopsis: { type: 'boolean', required: false },
    includeNotes: { type: 'boolean', required: false },
    separator: { type: 'string', required: false },
    hierarchical: { type: 'boolean', required: false },
};
export const exportSchema = {
    format: { type: 'string', required: true },
    outputPath: { type: 'string', required: false },
    options: { type: 'object', required: false },
};
//# sourceMappingURL=validation-schemas.js.map