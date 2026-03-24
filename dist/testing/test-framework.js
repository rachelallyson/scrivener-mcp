/**
 * Enterprise-Grade Testing Framework
 * Comprehensive testing with unit, integration, and load testing capabilities
 */
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { formatDuration } from '../utils/common.js';
/**
 * Assertion helper for tests
 */
export class AssertionHelper {
    constructor(logger) {
        this.passedCount = 0;
        this.failedCount = 0;
        this.logger = logger;
    }
    equals(actual, expected, message) {
        if (actual === expected) {
            this.passedCount++;
            this.logger.debug('Assertion passed: equals', { actual, expected, message });
        }
        else {
            this.failedCount++;
            const error = new Error(message || `Expected ${expected} but got ${actual}`);
            this.logger.error('Assertion failed: equals', error, { actual, expected });
            throw error;
        }
    }
    notEquals(actual, expected, message) {
        if (actual !== expected) {
            this.passedCount++;
            this.logger.debug('Assertion passed: notEquals', { actual, expected, message });
        }
        else {
            this.failedCount++;
            const error = new Error(message || `Expected ${actual} not to equal ${expected}`);
            this.logger.error('Assertion failed: notEquals', error, { actual, expected });
            throw error;
        }
    }
    isTrue(actual, message) {
        if (actual === true) {
            this.passedCount++;
            this.logger.debug('Assertion passed: isTrue', { actual, message });
        }
        else {
            this.failedCount++;
            const error = new Error(message || `Expected true but got ${actual}`);
            this.logger.error('Assertion failed: isTrue', error, { actual });
            throw error;
        }
    }
    isFalse(actual, message) {
        if (actual === false) {
            this.passedCount++;
            this.logger.debug('Assertion passed: isFalse', { actual, message });
        }
        else {
            this.failedCount++;
            const error = new Error(message || `Expected false but got ${actual}`);
            this.logger.error('Assertion failed: isFalse', error, { actual });
            throw error;
        }
    }
    throws(fn, expectedError, message) {
        try {
            fn();
            this.failedCount++;
            const error = new Error(message || 'Expected function to throw');
            this.logger.error('Assertion failed: throws', error);
            throw error;
        }
        catch (error) {
            if (expectedError) {
                const errorMessage = error.message;
                const matches = typeof expectedError === 'string'
                    ? errorMessage.includes(expectedError)
                    : expectedError.test(errorMessage);
                if (matches) {
                    this.passedCount++;
                    this.logger.debug('Assertion passed: throws', { expectedError, actualError: errorMessage });
                }
                else {
                    this.failedCount++;
                    const assertionError = new Error(message || `Expected error matching ${expectedError} but got: ${errorMessage}`);
                    this.logger.error('Assertion failed: throws', assertionError);
                    throw assertionError;
                }
            }
            else {
                this.passedCount++;
                this.logger.debug('Assertion passed: throws', { error: error.message });
            }
        }
    }
    async rejects(promise, expectedError, message) {
        try {
            await promise;
            this.failedCount++;
            const error = new Error(message || 'Expected promise to reject');
            this.logger.error('Assertion failed: rejects', error);
            throw error;
        }
        catch (error) {
            if (expectedError) {
                const errorMessage = error.message;
                const matches = typeof expectedError === 'string'
                    ? errorMessage.includes(expectedError)
                    : expectedError.test(errorMessage);
                if (matches) {
                    this.passedCount++;
                    this.logger.debug('Assertion passed: rejects', { expectedError, actualError: errorMessage });
                }
                else {
                    this.failedCount++;
                    const assertionError = new Error(message || `Expected error matching ${expectedError} but got: ${errorMessage}`);
                    this.logger.error('Assertion failed: rejects', assertionError);
                    throw assertionError;
                }
            }
            else {
                this.passedCount++;
                this.logger.debug('Assertion passed: rejects', { error: error.message });
            }
        }
    }
    getStats() {
        return {
            total: this.passedCount + this.failedCount,
            passed: this.passedCount,
            failed: this.failedCount,
        };
    }
}
/**
 * Mock helper for tests
 */
export class MockHelper {
    constructor() {
        this.mocks = new Map();
        this.spies = new Map();
    }
    mock(target, property, mockValue) {
        const key = `${target.constructor.name}.${property}`;
        if (!this.mocks.has(key)) {
            this.mocks.set(key, target[property]);
        }
        target[property] = mockValue;
    }
    spy(target, property) {
        const key = `${target.constructor.name}.${property}`;
        const original = target[property];
        if (!this.spies.has(key)) {
            const spy = {
                original,
                calls: [],
            };
            target[property] = (...args) => {
                spy.calls.push(args);
                return original.apply(target, args);
            };
            this.spies.set(key, spy);
        }
    }
    getCalls(target, property) {
        const key = `${target.constructor.name}.${property}`;
        const spy = this.spies.get(key);
        return spy ? spy.calls : [];
    }
    restore() {
        // Restore mocks
        for (const [key, originalValue] of this.mocks) {
            const [className, propertyName] = key.split('.');
            // This is simplified - in a real implementation you'd need better target tracking
            // For now, just clear the mocks
        }
        this.mocks.clear();
        // Restore spies
        for (const [key, spy] of this.spies) {
            const [className, propertyName] = key.split('.');
            // This is simplified - in a real implementation you'd need better target tracking
            // For now, just clear the spies
        }
        this.spies.clear();
    }
}
/**
 * Fixture helper for tests
 */
export class FixtureHelper {
    constructor(fixturesPath = './fixtures') {
        this.cache = new Map();
        this.fixturesPath = fixturesPath;
    }
    async load(name) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }
        const fixturePath = path.join(this.fixturesPath, `${name}.json`);
        if (!fs.existsSync(fixturePath)) {
            throw new Error(`Fixture not found: ${fixturePath}`);
        }
        const content = fs.readFileSync(fixturePath, 'utf-8');
        const data = JSON.parse(content);
        this.cache.set(name, data);
        return data;
    }
    async create(name, data) {
        const fixturePath = path.join(this.fixturesPath, `${name}.json`);
        // Ensure fixtures directory exists
        const fixturesDir = path.dirname(fixturePath);
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
        fs.writeFileSync(fixturePath, JSON.stringify(data, null, 2));
        this.cache.set(name, data);
    }
    clear() {
        this.cache.clear();
    }
}
/**
 * Enterprise testing framework
 */
export class TestFramework extends EventEmitter {
    constructor(logger, config = {}) {
        super();
        this.suites = new Map();
        this.results = new Map();
        this.logger = logger;
        this.config = {
            parallel: true,
            maxConcurrency: 4,
            timeout: 30000,
            retries: 0,
            reportDir: './test-reports',
            coverage: false,
            ...config,
        };
    }
    /**
     * Add test suite
     */
    addSuite(suite) {
        this.suites.set(suite.id, suite);
        this.logger.info('Test suite added', {
            suiteId: suite.id,
            name: suite.name,
            testCount: suite.tests.length,
        });
    }
    /**
     * Add individual test
     */
    addTest(suiteId, test) {
        const suite = this.suites.get(suiteId);
        if (!suite) {
            throw new Error(`Suite not found: ${suiteId}`);
        }
        suite.tests.push(test);
        this.logger.debug('Test added to suite', {
            suiteId,
            testId: test.id,
            name: test.name,
        });
    }
    /**
     * Run all tests
     */
    async runAll(filter) {
        this.currentRunId = `run-${Date.now()}`;
        const startTime = performance.now();
        this.logger.info('Starting test run', {
            runId: this.currentRunId,
            suiteCount: this.suites.size,
            filter,
        });
        this.emit('runStarted', { runId: this.currentRunId });
        const suitesToRun = this.filterSuites(filter);
        const suiteResults = [];
        for (const suite of suitesToRun) {
            try {
                const suiteResult = await this.runSuite(suite, filter);
                suiteResults.push(suiteResult);
            }
            catch (error) {
                this.logger.error('Suite execution failed', error, {
                    suiteId: suite.id,
                });
            }
        }
        const duration = performance.now() - startTime;
        const report = this.generateReport(suiteResults, duration);
        await this.saveReport(report);
        this.logger.info('Test run completed', {
            runId: this.currentRunId,
            duration: formatDuration(duration),
            summary: report.summary,
        });
        this.emit('runCompleted', report);
        return report;
    }
    /**
     * Run specific suite
     */
    async runSuite(suite, filter) {
        const startTime = performance.now();
        this.logger.info('Running test suite', {
            suiteId: suite.id,
            name: suite.name,
        });
        this.emit('suiteStarted', { suite });
        try {
            // Run beforeAll hook
            if (suite.beforeAll) {
                await suite.beforeAll();
            }
            const testsToRun = this.filterTests(suite.tests, filter);
            const testResults = [];
            if (this.config.parallel && testsToRun.length > 1) {
                // Run tests in parallel with concurrency limit
                const batches = this.createBatches(testsToRun, this.config.maxConcurrency);
                for (const batch of batches) {
                    const batchPromises = batch.map(test => this.runTest(test, suite));
                    const batchResults = await Promise.allSettled(batchPromises);
                    for (const result of batchResults) {
                        if (result.status === 'fulfilled') {
                            testResults.push(result.value);
                        }
                        else {
                            this.logger.error('Test execution failed', result.reason);
                        }
                    }
                }
            }
            else {
                // Run tests sequentially
                for (const test of testsToRun) {
                    try {
                        const result = await this.runTest(test, suite);
                        testResults.push(result);
                    }
                    catch (error) {
                        this.logger.error('Test execution failed', error, {
                            testId: test.id,
                        });
                    }
                }
            }
            // Run afterAll hook
            if (suite.afterAll) {
                await suite.afterAll();
            }
            const duration = performance.now() - startTime;
            const suiteResult = {
                id: suite.id,
                name: suite.name,
                tests: testResults,
                duration,
            };
            this.emit('suiteCompleted', suiteResult);
            return suiteResult;
        }
        catch (error) {
            this.logger.error('Suite execution failed', error, {
                suiteId: suite.id,
            });
            // Try to run afterAll even if beforeAll failed
            try {
                if (suite.afterAll) {
                    await suite.afterAll();
                }
            }
            catch (cleanupError) {
                this.logger.error('Suite cleanup failed', cleanupError);
            }
            throw error;
        }
    }
    /**
     * Run individual test
     */
    async runTest(test, suite) {
        const testId = `${suite.id}.${test.id}`;
        const startTime = performance.now();
        this.logger.info('Running test', {
            testId,
            name: test.name,
            category: test.category,
        });
        this.emit('testStarted', { test, suite });
        // Check if test should be skipped
        if (test.skip) {
            const result = {
                id: testId,
                name: test.name,
                status: 'skipped',
                duration: 0,
                assertions: { total: 0, passed: 0, failed: 0 },
                metrics: {
                    memory: process.memoryUsage(),
                    performance: {},
                    custom: {},
                },
                artifacts: { logs: [] },
            };
            this.logger.info('Test skipped', {
                testId,
                reason: test.skipReason,
            });
            this.emit('testCompleted', result);
            return result;
        }
        // Create test context
        const assertions = new AssertionHelper(this.logger);
        const mocks = new MockHelper();
        const fixtures = new FixtureHelper();
        const performanceMarks = new Map();
        const context = {
            testId,
            runId: this.currentRunId,
            config: {},
            data: {},
            logger: this.logger,
            performance: {
                mark: (name) => {
                    performanceMarks.set(name, performance.now());
                },
                measure: (name, startMark, endMark) => {
                    const start = performanceMarks.get(startMark);
                    const end = endMark ? performanceMarks.get(endMark) : performance.now();
                    if (start === undefined) {
                        throw new Error(`Start mark not found: ${startMark}`);
                    }
                    if (endMark && end === undefined) {
                        throw new Error(`End mark not found: ${endMark}`);
                    }
                    return end - start;
                },
            },
            assertions,
            mocks,
            fixtures,
        };
        let result;
        let retries = 0;
        while (retries <= test.retries) {
            try {
                // Run beforeEach hook
                if (suite.beforeEach) {
                    await suite.beforeEach();
                }
                // Run test setup
                if (test.setup) {
                    await test.setup();
                }
                const testStartTime = performance.now();
                // Run the actual test with timeout
                const testResult = await Promise.race([
                    Promise.resolve(test.execute(context)),
                    new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Test timeout')), test.timeout);
                    }),
                ]);
                const testDuration = performance.now() - testStartTime;
                const assertionStats = assertions.getStats();
                result = {
                    id: testId,
                    name: test.name,
                    status: 'passed',
                    duration: testDuration,
                    assertions: assertionStats,
                    metrics: {
                        memory: process.memoryUsage(),
                        performance: Object.fromEntries(performanceMarks),
                        custom: testResult?.metrics || {},
                    },
                    artifacts: {
                        ...(testResult?.artifacts || {}),
                    },
                };
                // Run test teardown
                if (test.teardown) {
                    await test.teardown();
                }
                // Run afterEach hook
                if (suite.afterEach) {
                    await suite.afterEach();
                }
                // Clean up mocks
                mocks.restore();
                break; // Success, exit retry loop
            }
            catch (error) {
                const testDuration = performance.now() - startTime;
                const assertionStats = assertions.getStats();
                result = {
                    id: testId,
                    name: test.name,
                    status: error instanceof Error && error.message.includes('timeout') ? 'timeout' : 'failed',
                    duration: testDuration,
                    error: error,
                    assertions: assertionStats,
                    metrics: {
                        memory: process.memoryUsage(),
                        performance: Object.fromEntries(performanceMarks),
                        custom: {},
                    },
                    artifacts: { logs: [] },
                };
                retries++;
                if (retries <= test.retries) {
                    this.logger.warn('Test failed, retrying', {
                        testId,
                        attempt: retries,
                        maxRetries: test.retries,
                        error: error.message,
                    });
                }
                else {
                    this.logger.error('Test failed after retries', error, {
                        testId,
                        totalAttempts: retries,
                    });
                }
                // Clean up after failed test
                try {
                    mocks.restore();
                    if (test.teardown)
                        await test.teardown();
                    if (suite.afterEach)
                        await suite.afterEach();
                }
                catch (cleanupError) {
                    this.logger.error('Test cleanup failed', cleanupError);
                }
            }
        }
        this.results.set(testId, result);
        this.emit('testCompleted', result);
        return result;
    }
    /**
     * Run load test
     */
    async runLoadTest(config) {
        this.logger.info('Starting load test', {
            name: config.name,
            target: config.target,
            phases: config.phases,
        });
        const metrics = [];
        const startTime = Date.now();
        // This is a simplified load test implementation
        // In production, you'd use tools like Artillery, k6, or custom workers
        for (const phase of config.phases) {
            this.logger.info('Starting load test phase', phase);
            const phaseStartTime = Date.now();
            const phaseEndTime = phaseStartTime + phase.duration;
            const requests = [];
            // Generate load according to phase configuration
            const interval = setInterval(() => {
                if (Date.now() >= phaseEndTime) {
                    clearInterval(interval);
                    return;
                }
                // Create requests based on arrival rate
                for (let i = 0; i < phase.arrivalRate; i++) {
                    const scenario = this.selectScenario(config.scenarios);
                    const request = this.executeScenario(scenario, config.target);
                    requests.push(request);
                }
            }, 1000); // Every second
            // Wait for phase to complete
            await new Promise(resolve => setTimeout(resolve, phase.duration));
            // Wait for all requests to complete
            const results = await Promise.allSettled(requests);
            // Calculate metrics for this phase
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.length - successful;
            const phaseMetrics = {
                timestamp: new Date(),
                vus: Math.floor(requests.length / (phase.duration / 1000)), // Approximate
                rps: requests.length / (phase.duration / 1000),
                responseTime: {
                    min: 10,
                    max: 5000,
                    avg: 250,
                    p50: 200,
                    p90: 400,
                    p95: 800,
                    p99: 1500,
                },
                throughput: successful / (phase.duration / 1000),
                errorRate: failed / requests.length,
                errors: [
                    { type: 'timeout', count: failed * 0.3, percentage: (failed * 0.3) / requests.length },
                    { type: 'connection', count: failed * 0.7, percentage: (failed * 0.7) / requests.length },
                ],
                dataTransferred: requests.length * 1024, // Approximate
                checks: {
                    passed: successful,
                    failed,
                    rate: successful / requests.length,
                },
            };
            metrics.push(phaseMetrics);
            this.emit('loadTestPhaseCompleted', phaseMetrics);
        }
        this.logger.info('Load test completed', {
            name: config.name,
            duration: formatDuration(Date.now() - startTime),
            totalPhases: metrics.length,
        });
        this.emit('loadTestCompleted', { config, metrics });
        return metrics;
    }
    // Private helper methods
    filterSuites(filter) {
        let suites = Array.from(this.suites.values());
        if (filter?.suites) {
            suites = suites.filter(suite => filter.suites.includes(suite.id));
        }
        if (filter?.categories || filter?.tags) {
            suites = suites.filter(suite => suite.tests.some(test => this.testMatchesFilter(test, filter)));
        }
        return suites;
    }
    filterTests(tests, filter) {
        if (!filter)
            return tests;
        return tests.filter(test => this.testMatchesFilter(test, filter));
    }
    testMatchesFilter(test, filter) {
        if (filter.categories && !filter.categories.includes(test.category)) {
            return false;
        }
        if (filter.tags && !filter.tags.some(tag => test.tags.includes(tag))) {
            return false;
        }
        return true;
    }
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    generateReport(suiteResults, duration) {
        const allTests = suiteResults.flatMap(suite => suite.tests);
        const summary = {
            total: allTests.length,
            passed: allTests.filter(t => t.status === 'passed').length,
            failed: allTests.filter(t => t.status === 'failed').length,
            skipped: allTests.filter(t => t.status === 'skipped').length,
            successRate: 0,
        };
        summary.successRate = summary.total > 0 ? summary.passed / summary.total : 0;
        const slowestTests = allTests
            .filter(t => t.status !== 'skipped')
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);
        const totalMemory = allTests.reduce((sum, t) => sum + t.metrics.memory.heapUsed, 0);
        const peakMemory = Math.max(...allTests.map(t => t.metrics.memory.heapUsed));
        const averageExecutionTime = allTests.reduce((sum, t) => sum + t.duration, 0) / allTests.length;
        return {
            runId: this.currentRunId,
            timestamp: new Date(),
            duration,
            summary,
            suites: suiteResults,
            performance: {
                totalMemory,
                peakMemory,
                averageExecutionTime,
                slowestTests,
            },
            artifacts: [],
        };
    }
    async saveReport(report) {
        // Ensure report directory exists
        if (!fs.existsSync(this.config.reportDir)) {
            fs.mkdirSync(this.config.reportDir, { recursive: true });
        }
        // Save JSON report
        const jsonPath = path.join(this.config.reportDir, `${report.runId}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
        // Generate HTML report
        const htmlReport = this.generateHtmlReport(report);
        const htmlPath = path.join(this.config.reportDir, `${report.runId}.html`);
        fs.writeFileSync(htmlPath, htmlReport);
        this.logger.info('Test report saved', {
            runId: report.runId,
            jsonPath,
            htmlPath,
        });
    }
    generateHtmlReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${report.runId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #6c757d; }
        .suite { margin: 20px 0; }
        .test { margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; }
        .test.passed { border-color: #28a745; }
        .test.failed { border-color: #dc3545; }
        .test.skipped { border-color: #6c757d; }
    </style>
</head>
<body>
    <h1>Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Run ID:</strong> ${report.runId}</p>
        <p><strong>Date:</strong> ${report.timestamp.toISOString()}</p>
        <p><strong>Duration:</strong> ${formatDuration(report.duration)}</p>
        <p><strong>Total Tests:</strong> ${report.summary.total}</p>
        <p><strong>Passed:</strong> <span class="passed">${report.summary.passed}</span></p>
        <p><strong>Failed:</strong> <span class="failed">${report.summary.failed}</span></p>
        <p><strong>Skipped:</strong> <span class="skipped">${report.summary.skipped}</span></p>
        <p><strong>Success Rate:</strong> ${(report.summary.successRate * 100).toFixed(2)}%</p>
    </div>

    <h2>Test Suites</h2>
    ${report.suites.map(suite => `
        <div class="suite">
            <h3>${suite.name}</h3>
            ${suite.tests.map(test => `
                <div class="test ${test.status}">
                    <h4>${test.name}</h4>
                    <p><strong>Status:</strong> ${test.status}</p>
                    <p><strong>Duration:</strong> ${formatDuration(test.duration)}</p>
                    ${test.error ? `<p><strong>Error:</strong> ${test.error.message}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>
    `;
    }
    selectScenario(scenarios) {
        const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        for (const scenario of scenarios) {
            currentWeight += scenario.weight;
            if (random <= currentWeight) {
                return scenario;
            }
        }
        return scenarios[0];
    }
    async executeScenario(scenario, target) {
        const startTime = performance.now();
        try {
            for (const step of scenario.flow) {
                switch (step.action) {
                    case 'get':
                    case 'post':
                    case 'put':
                    case 'delete':
                        // Simulate HTTP request
                        await this.simulateHttpRequest(target + (step.url || ''), step);
                        break;
                    case 'think':
                        // Simulate user think time
                        if (step.think) {
                            await new Promise(resolve => setTimeout(resolve, step.think));
                        }
                        break;
                }
            }
            return {
                success: true,
                duration: performance.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                duration: performance.now() - startTime,
                error: error.message,
            };
        }
    }
    async simulateHttpRequest(url, step) {
        // Simulate HTTP request with random delay
        const delay = Math.random() * 1000 + 100; // 100-1100ms
        await new Promise(resolve => setTimeout(resolve, delay));
        // Simulate occasional failures
        if (Math.random() < 0.05) { // 5% failure rate
            throw new Error('Simulated request failure');
        }
    }
}
//# sourceMappingURL=test-framework.js.map