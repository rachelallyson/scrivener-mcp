/**
 * Handler registry and dispatcher
 */
import type { HandlerContext, HandlerResult } from './types.js';
/**
 * Get all tool definitions
 */
export declare function getAllTools(): {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, import("../types/index.js").JSONValue>;
        required?: string[];
    };
}[];
/**
 * Execute a tool handler
 */
export declare function executeHandler(toolName: string, args: Record<string, unknown>, context: HandlerContext): Promise<HandlerResult>;
/**
 * Validate handler arguments
 */
export declare function validateHandlerArgs(toolName: string, args: Record<string, unknown>): void;
export { HandlerContext, HandlerError, HandlerResult } from './types.js';
//# sourceMappingURL=index.d.ts.map