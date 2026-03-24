/**
 * AI Configuration Wizard for LangChain setup
 * Handles API key management and model configuration
 */
export interface AIConfig {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    cohereApiKey?: string;
    huggingfaceApiKey?: string;
    defaultModel?: string;
    defaultEmbeddingModel?: string;
    temperature?: number;
    maxTokens?: number;
    enableLocalModels?: boolean;
    ollamaUrl?: string;
}
export declare class AIConfigWizard {
    private configDir;
    private configPath;
    private envPath;
    private rl;
    constructor();
    /**
     * Load existing configuration
     */
    loadConfig(): AIConfig;
    /**
     * Save configuration
     */
    saveConfig(config: AIConfig): Promise<void>;
    /**
     * Update .env file with API keys
     */
    private updateEnvFile;
    /**
     * Prompt user for input
     */
    private prompt;
    /**
     * Validate OpenAI API key
     */
    validateOpenAIKey(apiKey: string): Promise<boolean>;
    /**
     * Validate Anthropic API key
     */
    validateAnthropicKey(apiKey: string): Promise<boolean>;
    /**
     * Check if Ollama is installed and running
     */
    checkOllama(): Promise<boolean>;
    /**
     * Install Ollama for local models
     */
    installOllama(): Promise<void>;
    /**
     * Interactive configuration wizard
     */
    runWizard(): Promise<AIConfig>;
    /**
     * Quick setup with defaults
     */
    quickSetup(apiKey?: string): Promise<AIConfig>;
    /**
     * Get active configuration
     */
    getActiveConfig(): AIConfig;
}
//# sourceMappingURL=ai-config-wizard.d.ts.map