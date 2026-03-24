/**
 * Centralized logging system - ZERO external imports to prevent circular dependencies.
 * This module must be fully self-contained since it's imported by nearly every other module.
 */
export interface LogContext {
    timestamp?: string;
    code?: string;
    source?: string;
    [key: string]: unknown;
}
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
declare class Logger {
    private level;
    private readonly name;
    private readonly outputs;
    constructor(name: string, level?: LogLevel);
    setLevel(level: LogLevel): void;
    addOutput(output: (level: LogLevel, message: string, context?: LogContext) => void): void;
    private log;
    debug(message: string, context?: LogContext | Record<string, unknown>): void;
    info(message: string, context?: LogContext | Record<string, unknown>): void;
    warn(message: string, context?: LogContext | Record<string, unknown>): void;
    error(message: string, context?: LogContext | Record<string, unknown>): void;
    fatal(message: string, context?: LogContext | Record<string, unknown>): void;
    child(name: string): Logger;
}
export declare function getLogger(name: string): Logger;
export declare function setGlobalLogLevel(level: LogLevel): void;
export declare const Loggers: {
    readonly main: Logger;
    readonly database: Logger;
    readonly cache: Logger;
    readonly handlers: Logger;
    readonly analysis: Logger;
    readonly enhancement: Logger;
};
export {};
//# sourceMappingURL=logger.d.ts.map