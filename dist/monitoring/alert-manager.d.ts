/**
 * Alert Management System with Multiple Notification Channels
 */
import { EventEmitter } from 'events';
import { EnhancedLogger } from '../core/enhanced-logger.js';
import type { Alert } from './performance-monitor.js';
export interface NotificationChannel {
    name: string;
    type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
    config: Record<string, unknown>;
    enabled: boolean;
    failureCount: number;
    lastFailure?: Date;
    rateLimitMs?: number;
    lastSent?: Date;
}
export interface AlertTemplate {
    id: string;
    name: string;
    severity: Alert['severity'];
    subject: string;
    body: string;
    variables: string[];
}
export interface NotificationResult {
    channel: string;
    success: boolean;
    error?: string;
    sentAt: Date;
    messageId?: string;
}
export interface EscalationRule {
    id: string;
    name: string;
    conditions: {
        severity: Alert['severity'][];
        unacknowledgedDuration: number;
        tags?: string[];
    };
    actions: {
        channels: string[];
        escalateAfter: number;
        maxEscalations: number;
    };
    enabled: boolean;
}
/**
 * Comprehensive alert management with multiple notification channels
 */
export declare class AlertManager extends EventEmitter {
    private logger;
    private channels;
    private templates;
    private escalationRules;
    private pendingNotifications;
    private notificationHistory;
    private processingTimer?;
    constructor(logger: EnhancedLogger);
    /**
     * Add notification channel
     */
    addChannel(channel: NotificationChannel): void;
    /**
     * Remove notification channel
     */
    removeChannel(channelName: string): void;
    /**
     * Add alert template
     */
    addTemplate(template: AlertTemplate): void;
    /**
     * Add escalation rule
     */
    addEscalationRule(rule: EscalationRule): void;
    /**
     * Send alert notification
     */
    sendAlert(alert: Alert, channels?: string[], template?: string): Promise<NotificationResult[]>;
    /**
     * Test notification channel
     */
    testChannel(channelName: string): Promise<NotificationResult>;
    /**
     * Get notification history
     */
    getNotificationHistory(limit?: number): Array<{
        alertId: string;
        channel: string;
        result: NotificationResult;
    }>;
    /**
     * Get channel statistics
     */
    getChannelStats(): Record<string, {
        enabled: boolean;
        totalSent: number;
        failures: number;
        successRate: number;
        lastSent?: Date;
        lastFailure?: Date;
    }>;
    /**
     * Process escalation rules
     */
    processEscalations(alerts: Alert[]): void;
    /**
     * Close alert manager
     */
    close(): Promise<void>;
    private sendToChannel;
    private sendEmail;
    private sendSlack;
    private sendWebhook;
    private sendSms;
    private sendPagerDuty;
    private renderTemplate;
    private setupDefaultTemplates;
    private getDefaultChannelsForSeverity;
    private getDefaultTemplateForSeverity;
    private getSeverityColor;
    private isRateLimited;
    private queueForRetry;
    private shouldEscalate;
    private escalateAlert;
    private startNotificationProcessor;
    private processRetries;
}
//# sourceMappingURL=alert-manager.d.ts.map