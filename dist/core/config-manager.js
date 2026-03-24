/**
 * Enterprise Configuration Manager
 * Handles environment-specific configurations, secrets, and feature flags
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { getLogger } from './logger.js';
import { AppError, ErrorCode } from '../utils/common.js';
const logger = getLogger('config-manager');
/**
 * Enterprise-grade configuration manager
 */
export class ConfigManager extends EventEmitter {
    constructor(environment = 'development') {
        super();
        this.config = null;
        this.schema = null;
        this.featureFlags = new Map();
        this.configPaths = [];
        this.encryptionKey = null;
        this.watcherIntervals = [];
        this.isInitialized = false;
        this.environment = environment;
        this.setupConfigPaths();
    }
    /**
     * Initialize configuration manager
     */
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            // Load encryption key for sensitive data
            await this.loadEncryptionKey();
            // Load configuration schema
            await this.loadSchema();
            // Load environment-specific configuration
            await this.loadConfiguration();
            // Load feature flags
            await this.loadFeatureFlags();
            // Validate loaded configuration
            const validation = this.validateConfiguration();
            if (!validation.valid) {
                throw new AppError(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`, ErrorCode.INVALID_CONFIG);
            }
            // Log warnings if any
            if (validation.warnings.length > 0) {
                for (const warning of validation.warnings) {
                    logger.warn(`Config warning: ${warning.path} - ${warning.message}`);
                }
            }
            // Start configuration file watchers
            this.startConfigWatchers();
            this.isInitialized = true;
            this.emit('initialized', this.config);
            logger.info('Configuration manager initialized', {
                environment: this.environment,
                configPaths: this.configPaths.length,
                featureFlags: this.featureFlags.size,
                hasEncryption: this.encryptionKey !== null,
            });
        }
        catch (error) {
            logger.error('Failed to initialize configuration manager', { error });
            throw error;
        }
    }
    /**
     * Get configuration value by path
     */
    get(path, defaultValue) {
        if (!this.config) {
            if (defaultValue !== undefined)
                return defaultValue;
            throw new AppError('Configuration not loaded', ErrorCode.INVALID_STATE);
        }
        const value = this.getNestedValue(this.config, path);
        if (value === undefined) {
            if (defaultValue !== undefined)
                return defaultValue;
            // Check if there's a default in schema
            const schemaDefault = this.getSchemaDefault(path);
            if (schemaDefault !== undefined)
                return schemaDefault;
            throw new AppError(`Configuration value not found: ${path}`, ErrorCode.INVALID_CONFIG);
        }
        // Decrypt sensitive values
        if (this.isSensitiveValue(path) && typeof value === 'string') {
            return this.decryptValue(value);
        }
        return value;
    }
    /**
     * Set configuration value (runtime only)
     */
    set(path, value) {
        if (!this.config) {
            throw new AppError('Configuration not loaded', ErrorCode.INVALID_STATE);
        }
        this.setNestedValue(this.config, path, value);
        this.emit('configChanged', { path, value });
        logger.debug('Configuration value updated', { path, hasValue: value !== undefined });
    }
    /**
     * Get feature flag status
     */
    isFeatureEnabled(flagName, context) {
        const flag = this.featureFlags.get(flagName);
        if (!flag) {
            logger.warn(`Unknown feature flag: ${flagName}`);
            return false;
        }
        if (!flag.enabled)
            return false;
        // Check environment conditions
        if (flag.conditions.environments && !flag.conditions.environments.includes(this.environment)) {
            return false;
        }
        // Check user group conditions
        if (context?.userGroup && flag.conditions.userGroups) {
            if (!flag.conditions.userGroups.includes(context.userGroup)) {
                return false;
            }
        }
        // Check date range conditions
        if (flag.conditions.dateRange) {
            const now = new Date();
            if (now < flag.conditions.dateRange.start || now > flag.conditions.dateRange.end) {
                return false;
            }
        }
        // Check rollout percentage
        if (flag.rolloutPercentage < 100) {
            // Use consistent hashing based on user ID or flag name
            const hashInput = context?.userId || flagName;
            const hash = crypto.createHash('md5').update(hashInput).digest('hex');
            const percentage = parseInt(hash.slice(0, 2), 16) / 255 * 100;
            if (percentage > flag.rolloutPercentage) {
                return false;
            }
        }
        return true;
    }
    /**
     * Get all feature flags
     */
    getFeatureFlags() {
        return new Map(this.featureFlags);
    }
    /**
     * Update feature flag at runtime
     */
    updateFeatureFlag(name, updates) {
        const existing = this.featureFlags.get(name);
        if (!existing) {
            throw new AppError(`Feature flag not found: ${name}`, ErrorCode.INVALID_CONFIG);
        }
        const updated = { ...existing, ...updates };
        this.featureFlags.set(name, updated);
        this.emit('featureFlagChanged', { name, flag: updated });
        logger.info('Feature flag updated', { name, enabled: updated.enabled });
    }
    /**
     * Get environment name
     */
    getEnvironment() {
        return this.environment;
    }
    /**
     * Get full configuration (excluding sensitive values)
     */
    getConfig(includeSensitive = false) {
        if (!this.config)
            return null;
        if (includeSensitive) {
            return JSON.parse(JSON.stringify(this.config));
        }
        // Return config with sensitive values masked
        return this.maskSensitiveValues(this.config);
    }
    /**
     * Validate configuration against schema
     */
    validateConfiguration() {
        if (!this.config || !this.schema) {
            return {
                valid: false,
                errors: [{ path: 'root', message: 'Configuration or schema not loaded' }],
                warnings: [],
            };
        }
        const result = {
            valid: true,
            errors: [],
            warnings: [],
        };
        this.validateObject(this.config, this.schema, '', result);
        result.valid = result.errors.length === 0;
        return result;
    }
    /**
     * Reload configuration from disk
     */
    async reloadConfiguration() {
        logger.info('Reloading configuration');
        try {
            await this.loadConfiguration();
            await this.loadFeatureFlags();
            const validation = this.validateConfiguration();
            if (!validation.valid) {
                logger.error('Configuration reload failed validation', { errors: validation.errors });
                return;
            }
            this.emit('configReloaded', this.config);
            logger.info('Configuration reloaded successfully');
        }
        catch (error) {
            logger.error('Failed to reload configuration', { error });
            this.emit('configReloadError', error);
        }
    }
    /**
     * Export configuration for backup or migration
     */
    exportConfiguration(includeSensitive = false) {
        return {
            config: this.getConfig(includeSensitive),
            featureFlags: Array.from(this.featureFlags.entries()),
            environment: this.environment,
            timestamp: new Date(),
        };
    }
    /**
     * Close configuration manager
     */
    async close() {
        // Clear all watchers
        for (const interval of this.watcherIntervals) {
            clearInterval(interval);
        }
        this.watcherIntervals = [];
        this.removeAllListeners();
        this.isInitialized = false;
        logger.info('Configuration manager closed');
    }
    // Private methods
    setupConfigPaths() {
        const baseDir = process.cwd();
        this.configPaths = [
            path.join(baseDir, 'config', `${this.environment}.json`),
            path.join(baseDir, 'config', 'default.json'),
            path.join(baseDir, `.env.${this.environment}`),
            path.join(baseDir, '.env'),
        ];
    }
    async loadEncryptionKey() {
        const keyPath = path.join(process.cwd(), 'config', '.encryption-key');
        try {
            if (fs.existsSync(keyPath)) {
                this.encryptionKey = fs.readFileSync(keyPath);
            }
            else {
                // Generate new key if none exists
                this.encryptionKey = crypto.randomBytes(32);
                fs.writeFileSync(keyPath, this.encryptionKey, { mode: 0o600 });
                logger.info('Generated new encryption key');
            }
        }
        catch (error) {
            logger.warn('Failed to load/generate encryption key', { error });
            this.encryptionKey = null;
        }
    }
    async loadSchema() {
        const schemaPath = path.join(process.cwd(), 'config', 'schema.json');
        try {
            if (fs.existsSync(schemaPath)) {
                const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
                this.schema = JSON.parse(schemaContent);
            }
            else {
                // Use default schema
                this.schema = this.getDefaultSchema();
                logger.info('Using default configuration schema');
            }
        }
        catch (error) {
            logger.warn('Failed to load configuration schema', { error });
            this.schema = this.getDefaultSchema();
        }
    }
    async loadConfiguration() {
        let loadedConfig = {};
        // Load from JSON files
        for (const configPath of this.configPaths) {
            if (fs.existsSync(configPath)) {
                try {
                    const content = fs.readFileSync(configPath, 'utf-8');
                    if (configPath.endsWith('.json')) {
                        const config = JSON.parse(content);
                        loadedConfig = this.mergeConfigs(loadedConfig, config);
                    }
                    else if (configPath.includes('.env')) {
                        const envConfig = this.parseEnvFile(content);
                        loadedConfig = this.mergeConfigs(loadedConfig, envConfig);
                    }
                    logger.debug('Loaded configuration from', { path: configPath });
                }
                catch (error) {
                    logger.warn('Failed to load configuration file', { path: configPath, error });
                }
            }
        }
        // Override with environment variables
        const envConfig = this.loadFromEnvironment();
        loadedConfig = this.mergeConfigs(loadedConfig, envConfig);
        this.config = loadedConfig;
    }
    async loadFeatureFlags() {
        const flagsPath = path.join(process.cwd(), 'config', 'feature-flags.json');
        try {
            if (fs.existsSync(flagsPath)) {
                const content = fs.readFileSync(flagsPath, 'utf-8');
                const flags = JSON.parse(content);
                for (const [name, flag] of Object.entries(flags)) {
                    this.featureFlags.set(name, flag);
                }
                logger.debug('Loaded feature flags', { count: this.featureFlags.size });
            }
        }
        catch (error) {
            logger.warn('Failed to load feature flags', { error });
        }
    }
    parseEnvFile(content) {
        const config = {};
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                // Convert to nested object structure
                const keys = key.split('_');
                let current = config;
                for (let i = 0; i < keys.length - 1; i++) {
                    const k = keys[i].toLowerCase();
                    if (!(k in current)) {
                        current[k] = {};
                    }
                    current = current[k];
                }
                current[keys[keys.length - 1].toLowerCase()] = this.parseValue(value);
            }
        }
        return config;
    }
    loadFromEnvironment() {
        const config = {};
        // Map specific environment variables to config paths
        const envMappings = {
            'NODE_ENV': 'name',
            'DATABASE_URL': 'database.sqlite.path',
            'NEO4J_URI': 'database.neo4j.uri',
            'NEO4J_USER': 'database.neo4j.username',
            'NEO4J_PASSWORD': 'database.neo4j.password',
            'REDIS_URL': 'database.redis.nodes.0.host',
            'OPENAI_API_KEY': 'ai.openai.apiKey',
            'LOG_LEVEL': 'logging.level',
        };
        for (const [envVar, configPath] of Object.entries(envMappings)) {
            const value = process.env[envVar];
            if (value) {
                this.setNestedValue(config, configPath, this.parseValue(value));
            }
        }
        return config;
    }
    parseValue(value) {
        // Try to parse as JSON first
        try {
            return JSON.parse(value);
        }
        catch {
            // Return as string if JSON parsing fails
            return value;
        }
    }
    mergeConfigs(target, source) {
        const result = { ...target };
        for (const [key, value] of Object.entries(source)) {
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = this.mergeConfigs(result[key] || {}, value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = current[key];
        }
        return current;
    }
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
    }
    isSensitiveValue(path) {
        const sensitivePatterns = [
            'password', 'secret', 'key', 'token', 'credential',
            'database.neo4j.password',
            'database.redis.password',
            'ai.openai.apiKey',
        ];
        return sensitivePatterns.some(pattern => path.toLowerCase().includes(pattern) || path === pattern);
    }
    encryptValue(value) {
        if (!this.encryptionKey)
            return value;
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
            let encrypted = cipher.update(value, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return `enc:${iv.toString('hex')}:${encrypted}`;
        }
        catch (error) {
            logger.warn('Failed to encrypt sensitive value', { error });
            return value;
        }
    }
    decryptValue(encryptedValue) {
        if (!encryptedValue.startsWith('enc:') || !this.encryptionKey) {
            return encryptedValue;
        }
        try {
            const [, ivHex, encrypted] = encryptedValue.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            logger.warn('Failed to decrypt sensitive value', { error });
            return encryptedValue;
        }
    }
    getSchemaDefault(path) {
        if (!this.schema)
            return undefined;
        const schemaEntry = this.getNestedValue(this.schema, path);
        return schemaEntry && typeof schemaEntry === 'object'
            ? schemaEntry.default
            : undefined;
    }
    maskSensitiveValues(config) {
        const masked = JSON.parse(JSON.stringify(config));
        // Mask sensitive fields
        if (masked.database?.neo4j?.password) {
            masked.database.neo4j.password = '***';
        }
        if (masked.database?.redis?.password) {
            masked.database.redis.password = '***';
        }
        if (masked.ai?.openai?.apiKey) {
            masked.ai.openai.apiKey = '***';
        }
        return masked;
    }
    validateObject(obj, schema, path, result) {
        if (typeof obj !== 'object' || obj === null) {
            result.errors.push({
                path,
                message: 'Expected object',
                value: obj,
            });
            return;
        }
        const objRecord = obj;
        // Check required fields and validate types
        for (const [key, schemaEntry] of Object.entries(schema)) {
            const fullPath = path ? `${path}.${key}` : key;
            const value = objRecord[key];
            if (schemaEntry.required && (value === undefined || value === null)) {
                result.errors.push({
                    path: fullPath,
                    message: 'Required field is missing',
                });
                continue;
            }
            if (value !== undefined) {
                // Type validation
                if (!this.validateType(value, schemaEntry.type)) {
                    result.errors.push({
                        path: fullPath,
                        message: `Expected type ${schemaEntry.type}, got ${typeof value}`,
                        value,
                    });
                }
                // Custom validation
                if (schemaEntry.validation && !schemaEntry.validation(value)) {
                    result.errors.push({
                        path: fullPath,
                        message: 'Custom validation failed',
                        value,
                    });
                }
                // Deprecation warning
                if (schemaEntry.deprecated) {
                    result.warnings.push({
                        path: fullPath,
                        message: 'This configuration option is deprecated',
                        value,
                    });
                }
            }
        }
    }
    validateType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'array':
                return Array.isArray(value);
            default:
                return true;
        }
    }
    getDefaultSchema() {
        return {
            'database.sqlite.path': { type: 'string', required: true },
            'database.neo4j.uri': { type: 'string', required: true },
            'database.neo4j.password': { type: 'string', sensitive: true },
            'ai.openai.apiKey': { type: 'string', required: true, sensitive: true },
            'logging.level': { type: 'string', default: 'info' },
            'features': { type: 'object' },
        };
    }
    startConfigWatchers() {
        // Watch configuration files for changes
        const watchInterval = 30000; // 30 seconds
        const watcher = setInterval(() => {
            this.checkConfigFiles();
        }, watchInterval);
        this.watcherIntervals.push(watcher);
    }
    checkConfigFiles() {
        // Simple file modification check
        // In production, you'd use fs.watchFile or chokidar for better performance
        for (const configPath of this.configPaths) {
            if (fs.existsSync(configPath)) {
                try {
                    const stats = fs.statSync(configPath);
                    // Store and compare modification times
                    // This is simplified - you'd want to track actual modification times
                }
                catch (error) {
                    logger.debug('Error checking config file', { path: configPath, error });
                }
            }
        }
    }
}
//# sourceMappingURL=config-manager.js.map