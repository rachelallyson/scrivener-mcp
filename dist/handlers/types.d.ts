/**
 * Handler types and interfaces - utilizes common utilities for error handling
 */
import type { ContentAnalyzer } from '../analysis/base-analyzer.js';
import type { MemoryManager } from '../memory-manager.js';
import type { ScrivenerProject } from '../scrivener-project.js';
import type { ContentEnhancer } from '../services/enhancements/content-enhancer.js';
import type { LangChainContinuousLearningHandler } from './langchain-continuous-learning-handler.js';
import type { DatabaseService } from './database/database-service.js';
import type { JSONValue } from '../types/index.js';
export interface HandlerContext {
    project: ScrivenerProject | null;
    memoryManager: MemoryManager | null;
    contentAnalyzer: ContentAnalyzer;
    contentEnhancer: ContentEnhancer;
    learningHandler?: LangChainContinuousLearningHandler;
    databaseService?: DatabaseService;
}
export interface HandlerResult {
    content: Array<{
        type: string;
        text?: string;
        data?: unknown;
    }>;
    isError?: boolean;
}
export type ToolHandler = (args: Record<string, unknown>, context: HandlerContext) => Promise<HandlerResult>;
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, JSONValue>;
        required?: string[];
    };
    handler: ToolHandler;
}
export declare class HandlerError extends Error {
    code: string;
    details?: unknown | undefined;
    constructor(message: string, code?: string, details?: unknown | undefined);
}
export declare function requireProject(context: HandlerContext): ScrivenerProject;
export declare function requireMemoryManager(context: HandlerContext): MemoryManager;
export declare function getLearningHandler(context: HandlerContext): LangChainContinuousLearningHandler | null;
export declare function getStringArg(args: Record<string, unknown>, key: string): string;
export declare function getOptionalStringArg(args: Record<string, unknown>, key: string): string | undefined;
export declare function getNumberArg(args: Record<string, unknown>, key: string): number;
export declare function getOptionalNumberArg(args: Record<string, unknown>, key: string): number | undefined;
export declare function getBooleanArg(args: Record<string, unknown>, key: string): boolean;
export declare function getOptionalBooleanArg(args: Record<string, unknown>, key: string): boolean | undefined;
export declare function getArrayArg<T>(args: Record<string, unknown>, key: string): T[];
export declare function getObjectArg<T>(args: Record<string, unknown>, key: string): T;
export declare function getOptionalObjectArg<T>(args: Record<string, unknown>, key: string): T | undefined;
//# sourceMappingURL=types.d.ts.map