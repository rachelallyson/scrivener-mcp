/**
 * Main auto-setup orchestrator for AI services
 * Coordinates configuration of AI components (LangChain, etc.)
 * Note: Queue system now uses embedded storage, no Redis setup needed
 */
export interface SetupOptions {
    interactive?: boolean;
    skipAI?: boolean;
    quickSetup?: boolean;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    force?: boolean;
}
export interface SetupResult {
    success: boolean;
    aiConfigured?: boolean;
    warnings?: string[];
    errors?: string[];
}
export declare class AutoSetup {
    private aiWizard;
    private setupPath;
    constructor();
    /**
     * Check if setup has been completed before
     */
    isSetupComplete(): Promise<boolean>;
    /**
     * Save setup status
     */
    private saveSetupStatus;
    /**
     * Run health checks
     */
    runHealthChecks(): Promise<{
        queue: boolean;
        ai: boolean;
        overall: boolean;
        details: string[];
    }>;
    /**
     * Run the auto-setup process
     */
    run(options?: SetupOptions): Promise<SetupResult>;
    /**
     * CLI entry point
     */
    static cli(args?: string[]): Promise<void>;
}
//# sourceMappingURL=auto-setup.d.ts.map