/**
 * Enterprise Configuration Manager
 * Handles environment-specific configurations, secrets, and feature flags
 */
import { EventEmitter } from 'events';
export interface ConfigSchema {
    [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        required?: boolean;
        default?: unknown;
        validation?: (value: unknown) => boolean;
        sensitive?: boolean;
        description?: string;
        deprecated?: boolean;
    };
}
export interface EnvironmentConfig {
    [key: string]: unknown;
    name: string;
    description: string;
    database: {
        sqlite: {
            path: string;
            poolSize: number;
            pragmas: Record<string, string | number>;
        };
        neo4j: {
            uri: string;
            username: string;
            password: string;
            database: string;
            poolSize: number;
            healthCheckInterval: number;
        };
        redis: {
            nodes: Array<{
                host: string;
                port: number;
            }>;
            password?: string;
            maxRetriesPerRequest: number;
            retryDelayOnFailover: number;
            enableReadyCheck: boolean;
            scaleReads: 'master' | 'slave' | 'all';
        };
    };
    cache: {
        defaultTTL: number;
        maxMemoryPolicy: string;
        compressionThreshold: number;
        evictionStrategy: string;
    };
    logging: {
        level: string;
        format: string;
        enableConsole: boolean;
        enableFile: boolean;
        filePath?: string;
        maxFiles: number;
        maxSize: string;
        enableStructured: boolean;
        enableCorrelationId: boolean;
    };
    monitoring: {
        enabled: boolean;
        metricsInterval: number;
        healthCheckInterval: number;
        alertThresholds: {
            errorRate: number;
            responseTime: number;
            memoryUsage: number;
            diskUsage: number;
        };
    };
    security: {
        encryption: {
            algorithm: string;
            keyLength: number;
            ivLength: number;
        };
        cors: {
            enabled: boolean;
            origins: string[];
            methods: string[];
            allowedHeaders: string[];
        };
        rateLimit: {
            enabled: boolean;
            windowMs: number;
            maxRequests: number;
        };
    };
    features: Record<string, boolean>;
    ai: {
        openai: {
            apiKey: string;
            model: string;
            maxTokens: number;
            temperature: number;
        };
        langchain: {
            enabled: boolean;
            vectorStore: {
                provider: string;
                dimensions: number;
                similarity: string;
            };
            llm: {
                provider: string;
                model: string;
                maxTokens: number;
            };
        };
    };
}
export interface FeatureFlag {
    name: string;
    description: string;
    enabled: boolean;
    rolloutPercentage: number;
    conditions: {
        environments?: string[];
        userGroups?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
    };
    metadata: Record<string, unknown>;
}
export interface ConfigValidationResult {
    valid: boolean;
    errors: Array<{
        path: string;
        message: string;
        value?: unknown;
    }>;
    warnings: Array<{
        path: string;
        message: string;
        value?: unknown;
    }>;
}
/**
 * Enterprise-grade configuration manager
 */
export declare class ConfigManager extends EventEmitter {
    private config;
    private schema;
    private featureFlags;
    private environment;
    private configPaths;
    private encryptionKey;
    private watcherIntervals;
    private isInitialized;
    constructor(environment?: string);
    /**
     * Initialize configuration manager
     */
    initialize(): Promise<void>;
    /**
     * Get configuration value by path
     */
    get<T = unknown>(path: string, defaultValue?: T): T;
    /**
     * Set configuration value (runtime only)
     */
    set(path: string, value: unknown): void;
    /**
     * Get feature flag status
     */
    isFeatureEnabled(flagName: string, context?: {
        userId?: string;
        userGroup?: string;
    }): boolean;
    /**
     * Get all feature flags
     */
    getFeatureFlags(): Map<string, FeatureFlag>;
    /**
     * Update feature flag at runtime
     */
    updateFeatureFlag(name: string, updates: Partial<FeatureFlag>): void;
    /**
     * Get environment name
     */
    getEnvironment(): string;
    /**
     * Get full configuration (excluding sensitive values)
     */
    getConfig(includeSensitive?: boolean): EnvironmentConfig | null;
    /**
     * Validate configuration against schema
     */
    validateConfiguration(): ConfigValidationResult;
    /**
     * Reload configuration from disk
     */
    reloadConfiguration(): Promise<void>;
    /**
     * Export configuration for backup or migration
     */
    exportConfiguration(includeSensitive?: boolean): {
        config: EnvironmentConfig | null;
        featureFlags: Array<[string, FeatureFlag]>;
        environment: string;
        timestamp: Date;
    };
    /**
     * Close configuration manager
     */
    close(): Promise<void>;
    private setupConfigPaths;
    private loadEncryptionKey;
    private loadSchema;
    private loadConfiguration;
    private loadFeatureFlags;
    private parseEnvFile;
    private loadFromEnvironment;
    private parseValue;
    private mergeConfigs;
    private getNestedValue;
    private setNestedValue;
    private isSensitiveValue;
    private encryptValue;
    private decryptValue;
    private getSchemaDefault;
    private maskSensitiveValues;
    private validateObject;
    private validateType;
    private getDefaultSchema;
    private startConfigWatchers;
    private checkConfigFiles;
}
//# sourceMappingURL=config-manager.d.ts.map