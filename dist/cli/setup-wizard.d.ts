#!/usr/bin/env node
/**
 * Interactive Setup Wizard
 * Guides users through database installation and configuration
 */
export declare class SetupWizard {
    private rl;
    private metricsTracker;
    constructor();
    /**
     * Run the setup wizard
     */
    run(): Promise<void>;
    /**
     * Run quick setup with all features
     */
    private runQuickSetup;
    /**
     * Run KeyDB-specific setup
     */
    private runKeyDBSetup;
    /**
     * Run basic Neo4j setup
     */
    private runBasicSetup;
    /**
     * Print welcome banner
     */
    private printBanner;
    /**
     * Ask a yes/no question
     */
    private askYesNo;
    /**
     * Ask a question with optional default and validation
     */
    private askQuestion;
    /**
     * Choose installation method
     */
    private chooseInstallMethod;
    /**
     * Run advanced setup with AI services
     */
    private runAdvancedSetup;
    /**
     * Check system health
     */
    private checkHealth;
    /**
     * Test Neo4j connection
     */
    private testConnection;
    /**
     * Show setup operation metrics summary
     */
    private showMetricsSummary;
}
//# sourceMappingURL=setup-wizard.d.ts.map