/**
 * Automated Database Installation System
 * Handles automatic installation and configuration of Neo4j
 */
interface Neo4jCredentials {
    uri: string;
    user: string;
    password: string;
    database: string;
}
export interface InstallOptions {
    method: 'docker' | 'native' | 'homebrew' | 'auto';
    interactive: boolean;
    projectPath: string;
    autoStart: boolean;
    version?: string;
}
export interface InstallResult {
    success: boolean;
    method: string;
    credentials?: Neo4jCredentials;
    message: string;
}
export declare class Neo4jAutoInstaller {
    private static readonly DEFAULT_PASSWORD;
    private static readonly NEO4J_VERSION;
    /**
     * Main installation entry point
     */
    static install(options: InstallOptions): Promise<InstallResult>;
    /**
     * Check system capabilities
     */
    private static checkSystemCapabilities;
    /**
     * Determine optimal installation method
     */
    private static determineOptimalMethod;
    /**
     * Get user confirmation for installation
     */
    private static getUserConfirmation;
    /**
     * Install Neo4j via Docker
     */
    private static installViaDocker;
    /**
     * Install Neo4j via Homebrew (macOS/Linux)
     */
    private static installViaHomebrew;
    /**
     * Native installation (download and extract)
     */
    private static installNative;
    /**
     * Check if Java is installed
     */
    private static checkJava;
    /**
     * Install Java
     */
    private static installJava;
    /**
     * Get Neo4j download URL for platform
     */
    private static getNeo4jDownloadUrl;
    /**
     * Download file from URL
     */
    private static downloadFile;
    /**
     * Extract archive
     */
    private static extractArchive;
    /**
     * Configure Neo4j
     */
    private static configureNeo4j;
    /**
     * Create start script
     */
    private static createStartScript;
    /**
     * Start Neo4j
     */
    private static startNeo4j;
    /**
     * Wait for Docker to be ready with adaptive timeout
     */
    private static waitForDocker;
    /**
     * Wait for Neo4j to be ready with adaptive timeout
     */
    private static waitForNeo4j;
    /**
     * Save credentials to project
     */
    private static saveCredentials;
}
export {};
//# sourceMappingURL=auto-installer.d.ts.map