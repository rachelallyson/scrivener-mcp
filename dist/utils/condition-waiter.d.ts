/**
 * Condition-based Waiting Utilities
 * Replaces static sleep calls with intelligent condition polling
 */
export interface WaitConditionOptions {
    condition: () => Promise<boolean>;
    description: string;
    timeout?: number;
    pollInterval?: number;
    exponentialBackoff?: boolean;
    maxPollInterval?: number;
}
export interface WaitResult {
    success: boolean;
    elapsedTime: number;
    attempts: number;
}
/**
 * Wait for a condition to be true instead of using static sleep
 */
export declare function waitForCondition({ condition, description, timeout, pollInterval, exponentialBackoff, maxPollInterval, }: WaitConditionOptions): Promise<WaitResult>;
/**
 * Wait for service to be ready on specific port
 */
export declare function waitForServiceReady(host: string, port: number, timeout?: number): Promise<WaitResult>;
/**
 * Wait for HTTP endpoint to be ready
 */
export declare function waitForHttpReady(url: string, timeout?: number, expectedStatusCode?: number): Promise<WaitResult>;
/**
 * Wait for file system condition
 */
export declare function waitForFileCondition(filePath: string, condition: 'exists' | 'readable' | 'writable', timeout?: number): Promise<WaitResult>;
/**
 * Wait for process to be running
 */
export declare function waitForProcess(processName: string, timeout?: number): Promise<WaitResult>;
/**
 * Wait for Docker container to be ready
 */
export declare function waitForDockerContainer(containerName: string, timeout?: number): Promise<WaitResult>;
/**
 * Simple sleep function for cases where timed delay is actually needed
 */
export declare const sleep: (ms: number) => Promise<void>;
//# sourceMappingURL=condition-waiter.d.ts.map