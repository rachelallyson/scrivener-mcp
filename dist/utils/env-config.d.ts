/**
 * Environment Configuration Utilities
 * Robust parsing and validation of environment variables
 */
export interface EnvConfig {
    keydbUrl?: string;
    redisUrl?: string;
    redisHost: string;
    redisPort: number;
    openaiApiKey?: string;
    scrivenerQuiet: boolean;
    scrivenerSkipSetup: boolean;
}
/**
 * Safely parse integer environment variable
 */
export declare function parseEnvInt(value: string | undefined, defaultValue: number, name: string): number;
/**
 * Safely parse boolean environment variable
 */
export declare function parseEnvBool(value: string | undefined, defaultValue: boolean): boolean;
/**
 * Validate URL format
 */
export declare function validateUrl(url: string | undefined, name: string): string | undefined;
/**
 * Get validated environment configuration
 */
export declare function getEnvConfig(): EnvConfig;
/**
 * Platform detection with container and architecture support
 */
export interface PlatformInfo {
    platform: NodeJS.Platform;
    isContainer: boolean;
    isWsl: boolean;
    architecture: string;
    packageManagers: string[];
    sudoRequired: boolean;
    [key: string]: unknown;
}
export declare function detectPlatform(): Promise<PlatformInfo>;
//# sourceMappingURL=env-config.d.ts.map