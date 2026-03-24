/**
 * Permission Management Utilities
 * Handles sudo requirements and permission checks gracefully
 */
export interface PermissionCheckResult {
    hasPermission: boolean;
    needsSudo: boolean;
    method: 'root' | 'sudo' | 'user' | 'none';
    error?: string;
}
export interface PermissionManagerOptions {
    operation: string;
    interactive?: boolean;
    timeout?: number;
}
export declare class PermissionManager {
    /**
     * Check if current user can perform system operations
     */
    static checkSystemPermissions(): Promise<PermissionCheckResult>;
    /**
     * Check sudo availability and permissions
     */
    private static checkSudo;
    /**
     * Check user permissions for package management
     */
    private static checkUserPermissions;
    /**
     * Execute command with appropriate permissions
     */
    static executeWithPermissions(command: string, options: PermissionManagerOptions): Promise<{
        stdout: string;
        stderr: string;
    }>;
    /**
     * Get installation alternatives when permissions are insufficient
     */
    static getAlternatives(_operation: string, platformInfo: {
        platform?: string;
        packageManagers?: string[];
    }): string[];
}
/**
 * Higher-order function to wrap installation methods with permission handling
 */
export declare function withPermissionHandling<T extends unknown[], R>(fn: (...args: T) => Promise<R>, operation: string): (...args: T) => Promise<R>;
//# sourceMappingURL=permission-manager.d.ts.map