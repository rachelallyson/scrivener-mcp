/**
 * Centralized constants for the application
 * Re-exports common constants from utils/common.ts for consistency
 */
export { ErrorCode } from '../utils/common.js';
export declare const ERROR_MESSAGES: {
    readonly NO_PROJECT: "No project is currently open";
    readonly NO_MEMORY_MANAGER: "Memory manager not initialized";
    readonly INVALID_INPUT: "Invalid input provided";
    readonly DATABASE_ERROR: "Database operation failed";
    readonly FILE_NOT_FOUND: "File not found";
    readonly ACCESS_DENIED: "Access denied";
    readonly NETWORK_ERROR: "Network error occurred";
    readonly TIMEOUT: "Operation timed out";
    readonly NOT_IMPLEMENTED: "Feature not implemented";
    readonly UNKNOWN_ERROR: "An unknown error occurred";
    readonly INVALID_DOCUMENT_ID: "Invalid document ID";
    readonly DOCUMENT_NOT_FOUND: "Document not found";
    readonly INVALID_PROJECT_PATH: "Invalid Scrivener project path";
    readonly PROJECT_LOAD_FAILED: "Failed to load Scrivener project";
    readonly TRANSACTION_FAILED: "Transaction failed";
    readonly CONNECTION_FAILED: "Database connection failed";
    readonly CONSTRAINT_VIOLATION: "Database constraint violation";
    readonly PROJECT_ALREADY_OPEN: "A project is already open";
    readonly MISSING_REQUIRED: "Required field missing";
};
export declare const SUCCESS_MESSAGES: {
    readonly PROJECT_LOADED: "Project loaded successfully";
    readonly PROJECT_CLOSED: "Project closed";
    readonly DOCUMENT_CREATED: "Document created successfully";
    readonly DOCUMENT_UPDATED: "Document updated successfully";
    readonly DOCUMENT_DELETED: "Document deleted successfully";
    readonly SAVED: "Changes saved";
    readonly DB_CONNECTED: "Database connected";
    readonly DB_DISCONNECTED: "Database disconnected";
    readonly SUCCESS: "Operation completed successfully";
};
export declare const FILE_EXTENSIONS: {
    readonly SCRIVENER: ".scriv";
    readonly SCRIVENER_PROJECT: ".scrivx";
    readonly RTF: ".rtf";
    readonly TXT: ".txt";
    readonly MD: ".md";
    readonly HTML: ".html";
    readonly PDF: ".pdf";
    readonly DOCX: ".docx";
    readonly SQLITE: ".db";
    readonly JSON: ".json";
    readonly XML: ".xml";
};
export declare const DATABASE: {
    readonly SQLITE_DEFAULT_PATH: "scrivener.db";
    readonly NEO4J_DEFAULT_URI: "bolt://localhost:7687";
    readonly NEO4J_DEFAULT_USER: "neo4j";
    readonly NEO4J_DEFAULT_DATABASE: "scrivener";
    readonly MAX_POOL_SIZE: 50;
    readonly CONNECTION_TIMEOUT: 30000;
    readonly QUERY_TIMEOUT: 10000;
    readonly RETRY_COUNT: 3;
    readonly RETRY_DELAY: 1000;
    readonly BATCH_SIZE: 100;
};
export declare const DOCUMENT_TYPES: {
    readonly TEXT: "Text";
    readonly FOLDER: "Folder";
    readonly RESEARCH: "Research";
    readonly TRASH: "Trash";
    readonly OTHER: "Other";
};
export declare const COMPILATION_FORMATS: {
    readonly PLAIN_TEXT: "txt";
    readonly MARKDOWN: "md";
    readonly HTML: "html";
    readonly RTF: "rtf";
    readonly DOCX: "docx";
};
export declare const ANALYSIS_TYPES: {
    readonly SCENE: "scene";
    readonly CHARACTER: "character";
    readonly THEME: "theme";
    readonly PLOT: "plot";
    readonly STYLE: "style";
    readonly READABILITY: "readability";
    readonly SENTIMENT: "sentiment";
    readonly CONSISTENCY: "consistency";
};
export declare const LIMITS: {
    readonly MAX_CACHE_SIZE: number;
    readonly MAX_FILE_SIZE: number;
    readonly MAX_BATCH_SIZE: 1000;
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly DEFAULT_TIMEOUT: 30000;
    readonly MAX_SEARCH_RESULTS: 100;
    readonly MAX_CONTENT_LENGTH: 1000000;
    readonly MAX_SYNOPSIS_LENGTH: 5000;
    readonly MAX_NOTES_LENGTH: 100000;
    readonly MAX_TITLE_LENGTH: 255;
    readonly DATABASE_TIMEOUT: 10000;
    readonly AI_SERVICE_TIMEOUT: 60000;
    readonly CACHE_TTL: 300000;
};
export declare const PATTERNS: {
    readonly SCRIVENER_UUID: RegExp;
    readonly EMAIL: RegExp;
    readonly URL: RegExp;
    readonly ISBN: RegExp;
    readonly SAFE_PATH: RegExp;
};
export declare const DEFAULTS: {
    readonly SYNOPSIS: "No synopsis available";
    readonly AUTHOR: "Unknown Author";
    readonly TITLE: "Untitled";
    readonly LABEL: "No Label";
    readonly STATUS: "No Status";
    readonly CATEGORY: "General";
    readonly LANGUAGE: "en";
    readonly ENCODING: "utf-8";
};
export declare const API_ENDPOINTS: {
    readonly OPENAI: "https://api.openai.com/v1";
    readonly ANTHROPIC: "https://api.anthropic.com/v1";
};
export declare const CACHE_KEYS: {
    readonly DOCUMENT_PREFIX: "doc:";
    readonly ANALYSIS_PREFIX: "analysis:";
    readonly METADATA_PREFIX: "meta:";
    readonly SEARCH_PREFIX: "search:";
    readonly COMPILATION_PREFIX: "compile:";
};
export declare const MIME_TYPES: {
    readonly RTF: "application/rtf";
    readonly TEXT: "text/plain";
    readonly HTML: "text/html";
    readonly XML: "application/xml";
    readonly JSON: "application/json";
    readonly PDF: "application/pdf";
    readonly DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
};
export declare const NODE_LABELS: {
    readonly DOCUMENT: "Document";
    readonly CHARACTER: "Character";
    readonly THEME: "Theme";
    readonly PLOT_THREAD: "PlotThread";
    readonly ENTITY: "Entity";
};
export declare const RELATIONSHIP_TYPES: {
    readonly FOLLOWS: "FOLLOWS";
    readonly APPEARS_IN: "APPEARS_IN";
    readonly RELATES_TO: "RELATES_TO";
    readonly PRESENT_IN: "PRESENT_IN";
    readonly CONTAINS: "CONTAINS";
};
export declare const Messages: {
    readonly NO_PROJECT: "No project is currently open";
    readonly NO_MEMORY_MANAGER: "Memory manager not initialized";
    readonly INVALID_INPUT: "Invalid input provided";
    readonly DATABASE_ERROR: "Database operation failed";
    readonly FILE_NOT_FOUND: "File not found";
    readonly ACCESS_DENIED: "Access denied";
    readonly NETWORK_ERROR: "Network error occurred";
    readonly TIMEOUT: "Operation timed out";
    readonly NOT_IMPLEMENTED: "Feature not implemented";
    readonly UNKNOWN_ERROR: "An unknown error occurred";
    readonly INVALID_DOCUMENT_ID: "Invalid document ID";
    readonly DOCUMENT_NOT_FOUND: "Document not found";
    readonly INVALID_PROJECT_PATH: "Invalid Scrivener project path";
    readonly PROJECT_LOAD_FAILED: "Failed to load Scrivener project";
    readonly TRANSACTION_FAILED: "Transaction failed";
    readonly CONNECTION_FAILED: "Database connection failed";
    readonly CONSTRAINT_VIOLATION: "Database constraint violation";
    readonly PROJECT_ALREADY_OPEN: "A project is already open";
    readonly MISSING_REQUIRED: "Required field missing";
};
export declare const Limits: {
    readonly MAX_CACHE_SIZE: number;
    readonly MAX_FILE_SIZE: number;
    readonly MAX_BATCH_SIZE: 1000;
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly DEFAULT_TIMEOUT: 30000;
    readonly MAX_SEARCH_RESULTS: 100;
    readonly MAX_CONTENT_LENGTH: 1000000;
    readonly MAX_SYNOPSIS_LENGTH: 5000;
    readonly MAX_NOTES_LENGTH: 100000;
    readonly MAX_TITLE_LENGTH: 255;
    readonly DATABASE_TIMEOUT: 10000;
    readonly AI_SERVICE_TIMEOUT: 60000;
    readonly CACHE_TTL: 300000;
};
export declare const Timeouts: {
    DEFAULT: 30000;
    DATABASE: 10000;
    AI_SERVICE: 60000;
    CACHE_TTL: 300000;
};
export declare const Patterns: {
    readonly SCRIVENER_UUID: RegExp;
    readonly EMAIL: RegExp;
    readonly URL: RegExp;
    readonly ISBN: RegExp;
    readonly SAFE_PATH: RegExp;
};
export declare const Extensions: {
    readonly SCRIVENER: ".scriv";
    readonly SCRIVENER_PROJECT: ".scrivx";
    readonly RTF: ".rtf";
    readonly TXT: ".txt";
    readonly MD: ".md";
    readonly HTML: ".html";
    readonly PDF: ".pdf";
    readonly DOCX: ".docx";
    readonly SQLITE: ".db";
    readonly JSON: ".json";
    readonly XML: ".xml";
};
export declare const MimeTypes: {
    readonly RTF: "application/rtf";
    readonly TEXT: "text/plain";
    readonly HTML: "text/html";
    readonly XML: "application/xml";
    readonly JSON: "application/json";
    readonly PDF: "application/pdf";
    readonly DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
};
//# sourceMappingURL=constants.d.ts.map