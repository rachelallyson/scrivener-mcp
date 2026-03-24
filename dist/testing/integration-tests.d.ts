/**
 * Integration Test Suite for Scrivener MCP
 * Comprehensive integration tests for all major components
 */
import { TestFramework } from './test-framework.js';
import { EnhancedLogger } from '../core/enhanced-logger.js';
/**
 * Integration test suite factory
 */
export declare class IntegrationTestSuite {
    private framework;
    private logger;
    constructor(framework: TestFramework, logger: EnhancedLogger);
    /**
     * Create all integration test suites
     */
    createTestSuites(): void;
    private createDatabaseIntegrationSuite;
    private createCacheIntegrationSuite;
    private createMonitoringIntegrationSuite;
    private createConfigurationIntegrationSuite;
    private createErrorHandlingIntegrationSuite;
    private createScrivenerProjectIntegrationSuite;
    private createEndToEndSuite;
}
//# sourceMappingURL=integration-tests.d.ts.map