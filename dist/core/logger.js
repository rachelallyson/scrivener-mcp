/* eslint-disable no-console */
/**
 * Centralized logging system - ZERO external imports to prevent circular dependencies.
 * This module must be fully self-contained since it's imported by nearly every other module.
 */
function toLogContext(obj) {
    return obj;
}
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor(name, level = LogLevel.INFO) {
        this.outputs = [];
        this.name = name;
        this.level = level;
        // Default console output (inline isDevelopment check instead of importing)
        this.addOutput((level, message, context) => {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${LogLevel[level]}] [${this.name}]`;
            switch (level) {
                case LogLevel.DEBUG:
                    if (process.env.NODE_ENV === 'development') {
                        console.debug(prefix, message, context || '');
                    }
                    break;
                case LogLevel.INFO:
                    console.info(prefix, message, context || '');
                    break;
                case LogLevel.WARN:
                    console.warn(prefix, message, context || '');
                    break;
                case LogLevel.ERROR:
                case LogLevel.FATAL:
                    console.error(prefix, message, context || '');
                    break;
            }
        });
    }
    setLevel(level) {
        this.level = level;
    }
    addOutput(output) {
        this.outputs.push(output);
    }
    log(level, message, context) {
        if (level >= this.level) {
            for (const output of this.outputs) {
                output(level, message, context);
            }
        }
    }
    debug(message, context) {
        const safeContext = context && typeof context === 'object' && !Array.isArray(context)
            ? ('timestamp' in context || 'code' in context || 'source' in context ? context : toLogContext(context))
            : context;
        this.log(LogLevel.DEBUG, message, safeContext);
    }
    info(message, context) {
        const safeContext = context && typeof context === 'object' && !Array.isArray(context)
            ? ('timestamp' in context || 'code' in context || 'source' in context ? context : toLogContext(context))
            : context;
        this.log(LogLevel.INFO, message, safeContext);
    }
    warn(message, context) {
        const safeContext = context && typeof context === 'object' && !Array.isArray(context)
            ? ('timestamp' in context || 'code' in context || 'source' in context ? context : toLogContext(context))
            : context;
        this.log(LogLevel.WARN, message, safeContext);
    }
    error(message, context) {
        const safeContext = context && typeof context === 'object' && !Array.isArray(context)
            ? ('timestamp' in context || 'code' in context || 'source' in context ? context : toLogContext(context))
            : context;
        this.log(LogLevel.ERROR, message, safeContext);
    }
    fatal(message, context) {
        const safeContext = context && typeof context === 'object' && !Array.isArray(context)
            ? ('timestamp' in context || 'code' in context || 'source' in context ? context : toLogContext(context))
            : context;
        this.log(LogLevel.FATAL, message, safeContext);
    }
    child(name) {
        return new Logger(`${this.name}:${name}`, this.level);
    }
}
// Logger factory
class LoggerFactory {
    constructor() {
        this.loggers = new Map();
        this.defaultLevel = LogLevel.INFO;
        // Inline getEnv instead of importing from common.js
        const envLevel = process.env['LOG_LEVEL']?.toUpperCase();
        if (envLevel && envLevel in LogLevel) {
            this.defaultLevel = LogLevel[envLevel];
        }
    }
    getLogger(name) {
        if (!this.loggers.has(name)) {
            this.loggers.set(name, new Logger(name, this.defaultLevel));
        }
        return this.loggers.get(name);
    }
    setGlobalLevel(level) {
        this.defaultLevel = level;
        for (const logger of this.loggers.values()) {
            logger.setLevel(level);
        }
    }
}
// Global factory instance - safe because this module has no imports that could cause cycles
const factory = new LoggerFactory();
// Export convenience functions
export function getLogger(name) {
    return factory.getLogger(name);
}
export function setGlobalLogLevel(level) {
    factory.setGlobalLevel(level);
}
// Pre-configured loggers
export const Loggers = {
    main: getLogger('main'),
    database: getLogger('database'),
    cache: getLogger('cache'),
    handlers: getLogger('handlers'),
    analysis: getLogger('analysis'),
    enhancement: getLogger('enhancement'),
};
//# sourceMappingURL=logger.js.map