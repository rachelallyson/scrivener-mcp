/**
 * Real-time Performance Dashboard Server
 * WebSocket-based dashboard for monitoring system performance and alerts
 */
import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import { EnhancedLogger } from '../core/enhanced-logger.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { AlertManager } from './alert-manager.js';
export interface DashboardClient {
    id: string;
    ws: WebSocket;
    subscriptions: Set<string>;
    connectedAt: Date;
    lastSeen: Date;
    metadata: {
        userAgent?: string;
        ip?: string;
        userId?: string;
        permissions?: string[];
    };
}
export interface DashboardMessage {
    type: 'subscribe' | 'unsubscribe' | 'request' | 'acknowledge' | 'command';
    id?: string;
    data?: any;
    timestamp: Date;
}
export interface DashboardResponse {
    type: 'data' | 'error' | 'ack' | 'notification';
    id?: string;
    data?: any;
    error?: string;
    timestamp: Date;
}
export interface DashboardConfig {
    port: number;
    host: string;
    updateInterval: number;
    maxClients: number;
    enableCompression: boolean;
    corsOrigins: string[];
    authRequired: boolean;
    apiKeys?: string[];
}
/**
 * Real-time dashboard server with WebSocket communication
 */
export declare class DashboardServer extends EventEmitter {
    private logger;
    private performanceMonitor;
    private alertManager;
    private config;
    private server?;
    private wss?;
    private clients;
    private updateTimer?;
    private isRunning;
    constructor(logger: EnhancedLogger, performanceMonitor: PerformanceMonitor, alertManager: AlertManager, config?: Partial<DashboardConfig>);
    /**
     * Start the dashboard server
     */
    start(): Promise<void>;
    /**
     * Stop the dashboard server
     */
    stop(): Promise<void>;
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: DashboardResponse, subscription?: string): void;
    /**
     * Send message to specific client
     */
    sendToClient(clientId: string, message: DashboardResponse): void;
    /**
     * Get connected clients statistics
     */
    getClientStats(): {
        totalClients: number;
        clientsBySubscription: Record<string, number>;
        connections: Array<{
            id: string;
            connectedAt: Date;
            subscriptions: string[];
            metadata: DashboardClient['metadata'];
        }>;
    };
    private handleHttpRequest;
    private handleApiRequest;
    private serveDashboardHtml;
    private handleWebSocketConnection;
    private handleWebSocketMessage;
    private handleSubscribe;
    private handleUnsubscribe;
    private handleRequest;
    private handleAcknowledge;
    private handleCommand;
    private setupEventListeners;
    private startPeriodicUpdates;
    private generateClientId;
}
//# sourceMappingURL=dashboard-server.d.ts.map