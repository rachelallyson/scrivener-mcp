/**
 * KeyDB Auto-Installer
 * Automatically detects and installs KeyDB based on the operating system
 */
export interface InstallationResult {
    success: boolean;
    message: string;
    method?: 'homebrew' | 'docker' | 'apt' | 'yum' | 'manual' | 'existing';
    version?: string;
    port?: number;
}
export declare class KeyDBInstaller {
    private static instance;
    private static instancePromise;
    private installationPromise;
    private platformInfo;
    static getInstance(): Promise<KeyDBInstaller>;
    /**
     * Check if KeyDB is already available
     */
    checkAvailability(): Promise<{
        installed: boolean;
        running: boolean;
        version?: string;
        port?: number;
    }>;
    /**
     * Auto-install KeyDB based on the operating system
     */
    autoInstall(options?: {
        method?: 'auto' | 'homebrew' | 'docker' | 'apt' | 'yum';
        startService?: boolean;
    }): Promise<InstallationResult>;
    private _performInstallation;
    /**
     * Start KeyDB service with retry logic
     */
    startKeyDB(): Promise<boolean>;
    /**
     * Detect the best installation method for the current system
     */
    private detectBestInstallMethod;
    /**
     * Install KeyDB via Homebrew (macOS)
     */
    private installViaHomebrew;
    /**
     * Install KeyDB via Docker
     */
    private installViaDocker;
    /**
     * Install KeyDB via APT (Debian/Ubuntu)
     */
    private installViaApt;
    private _performAptInstallation;
    /**
     * Install KeyDB via YUM (RHEL/CentOS/Fedora)
     */
    private installViaYum;
    private _performYumInstallation;
    /**
     * Check if KeyDB is installed
     */
    private isKeyDBInstalled;
    /**
     * Get installed KeyDB version
     */
    private getInstalledVersion;
    /**
     * Execute command with adaptive timeout
     */
    private executeWithAdaptiveTimeout;
    /**
     * Execute command while capturing output for progress monitoring
     */
    private executeWithProgressCapture;
    /**
     * Check if a command exists
     */
    private commandExists;
    /**
     * Get installation instructions for manual setup
     */
    getManualInstructions(): string;
}
//# sourceMappingURL=keydb-installer.d.ts.map