/**
 * First-run detection and initialization
 * Automatically prompts for setup on first use if not configured
 */
export interface FirstRunConfig {
    skipSetup?: boolean;
    quietMode?: boolean;
    useDefaults?: boolean;
}
export declare class FirstRunManager {
    private configDir;
    private setupPath;
    private firstRunPath;
    /**
     * Check if this is the first run
     */
    isFirstRun(): boolean;
    /**
     * Check if setup has been completed
     */
    isSetupComplete(): Promise<boolean>;
    /**
     * Get current feature status
     */
    getFeatureStatus(): {
        basic: boolean;
        neo4j: boolean;
        redis: boolean;
        ai: boolean;
    };
    /**
     * Initialize on first run
     */
    initialize(config?: FirstRunConfig): Promise<void>;
    /**
     * Minimal setup for non-interactive environments
     */
    private minimalSetup;
    /**
     * Mark first run as complete
     */
    private markFirstRunComplete;
    /**
     * Reset first run status (for testing)
     */
    resetFirstRun(): void;
}
//# sourceMappingURL=first-run.d.ts.map