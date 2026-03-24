/**
 * Enterprise-Grade Testing Framework
 * Comprehensive testing with unit, integration, and load testing capabilities
 */
import { EventEmitter } from 'events';
import { EnhancedLogger } from '../core/enhanced-logger.js';
export interface TestCase {
    id: string;
    name: string;
    description: string;
    category: 'unit' | 'integration' | 'load' | 'end-to-end';
    tags: string[];
    timeout: number;
    retries: number;
    dependencies: string[];
    setup?: () => Promise<void> | void;
    teardown?: () => Promise<void> | void;
    execute: (context: TestContext) => Promise<TestResult> | TestResult;
    skip?: boolean;
    skipReason?: string;
}
export interface TestContext {
    testId: string;
    runId: string;
    config: Record<string, unknown>;
    data: Record<string, unknown>;
    logger: EnhancedLogger;
    performance: {
        mark: (name: string) => void;
        measure: (name: string, startMark: string, endMark?: string) => number;
    };
    assertions: AssertionHelper;
    mocks: MockHelper;
    fixtures: FixtureHelper;
}
export interface TestResult {
    id: string;
    name: string;
    status: 'passed' | 'failed' | 'skipped' | 'timeout';
    duration: number;
    error?: Error;
    assertions: {
        total: number;
        passed: number;
        failed: number;
    };
    metrics: {
        memory: NodeJS.MemoryUsage;
        performance: Record<string, number>;
        custom: Record<string, unknown>;
    };
    artifacts: {
        logs: string[];
        screenshots?: string[];
        reports?: string[];
    };
}
export interface TestSuite {
    id: string;
    name: string;
    description: string;
    tests: TestCase[];
    beforeAll?: () => Promise<void> | void;
    afterAll?: () => Promise<void> | void;
    beforeEach?: () => Promise<void> | void;
    afterEach?: () => Promise<void> | void;
}
export interface LoadTestConfig {
    name: string;
    target: string;
    phases: Array<{
        duration: number;
        arrivalRate: number;
        rampTo?: number;
    }>;
    scenarios: Array<{
        name: string;
        weight: number;
        engine: 'http' | 'websocket' | 'grpc';
        flow: Array<{
            action: string;
            url?: string;
            method?: string;
            headers?: Record<string, string>;
            body?: any;
            think?: number;
        }>;
    }>;
    thresholds: {
        http_req_duration: number;
        http_req_failed: number;
        checks: number;
    };
}
export interface LoadTestMetrics {
    timestamp: Date;
    vus: number;
    rps: number;
    responseTime: {
        min: number;
        max: number;
        avg: number;
        p50: number;
        p90: number;
        p95: number;
        p99: number;
    };
    throughput: number;
    errorRate: number;
    errors: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    dataTransferred: number;
    checks: {
        passed: number;
        failed: number;
        rate: number;
    };
}
export interface TestReport {
    runId: string;
    timestamp: Date;
    duration: number;
    summary: {
        total: number;
        passed: number;
        failed: number;
        skipped: number;
        successRate: number;
    };
    suites: Array<{
        id: string;
        name: string;
        tests: TestResult[];
        duration: number;
    }>;
    coverage?: {
        lines: number;
        functions: number;
        branches: number;
        statements: number;
    };
    performance: {
        totalMemory: number;
        peakMemory: number;
        averageExecutionTime: number;
        slowestTests: TestResult[];
    };
    artifacts: string[];
}
/**
 * Assertion helper for tests
 */
export declare class AssertionHelper {
    private passedCount;
    private failedCount;
    private logger;
    constructor(logger: EnhancedLogger);
    equals<T>(actual: T, expected: T, message?: string): void;
    notEquals<T>(actual: T, expected: T, message?: string): void;
    isTrue(actual: boolean, message?: string): void;
    isFalse(actual: boolean, message?: string): void;
    throws(fn: () => void, expectedError?: string | RegExp, message?: string): void;
    rejects(promise: Promise<any>, expectedError?: string | RegExp, message?: string): Promise<void>;
    getStats(): {
        total: number;
        passed: number;
        failed: number;
    };
}
/**
 * Mock helper for tests
 */
export declare class MockHelper {
    private mocks;
    private spies;
    mock<T>(target: any, property: string, mockValue: T): void;
    spy(target: any, property: string): void;
    getCalls(target: any, property: string): any[][];
    restore(): void;
}
/**
 * Fixture helper for tests
 */
export declare class FixtureHelper {
    private fixturesPath;
    private cache;
    constructor(fixturesPath?: string);
    load<T>(name: string): Promise<T>;
    create(name: string, data: any): Promise<void>;
    clear(): void;
}
/**
 * Enterprise testing framework
 */
export declare class TestFramework extends EventEmitter {
    private logger;
    private suites;
    private results;
    private config;
    private currentRunId?;
    constructor(logger: EnhancedLogger, config?: Partial<TestFramework['config']>);
    /**
     * Add test suite
     */
    addSuite(suite: TestSuite): void;
    /**
     * Add individual test
     */
    addTest(suiteId: string, test: TestCase): void;
    /**
     * Run all tests
     */
    runAll(filter?: {
        suites?: string[];
        categories?: TestCase['category'][];
        tags?: string[];
    }): Promise<TestReport>;
    /**
     * Run specific suite
     */
    runSuite(suite: TestSuite, filter?: {
        categories?: TestCase['category'][];
        tags?: string[];
    }): Promise<TestReport['suites'][0]>;
    /**
     * Run individual test
     */
    runTest(test: TestCase, suite: TestSuite): Promise<TestResult>;
    /**
     * Run load test
     */
    runLoadTest(config: LoadTestConfig): Promise<LoadTestMetrics[]>;
    private filterSuites;
    private filterTests;
    private testMatchesFilter;
    private createBatches;
    private generateReport;
    private saveReport;
    private generateHtmlReport;
    private selectScenario;
    private executeScenario;
    private simulateHttpRequest;
}
//# sourceMappingURL=test-framework.d.ts.map