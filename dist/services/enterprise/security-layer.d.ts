/**
 * Enterprise Security Layer - Advanced security patterns for production systems
 * Implements comprehensive input validation, sanitization, authentication, and threat detection
 */
import { EventEmitter } from 'events';
import type { TraceContext } from './observability.js';
import type { RateLimitConfig } from './service-foundation.js';
export interface SecurityContext extends Record<string, unknown> {
    userId?: string;
    sessionId?: string;
    ipAddress: string;
    userAgent: string;
    timestamp: number;
    permissions: string[];
    riskScore: number;
}
export interface ThreatEvent {
    id: string;
    type: 'sql_injection' | 'xss' | 'brute_force' | 'anomalous_access' | 'rate_limit_exceeded' | 'suspicious_payload';
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    description: string;
    timestamp: number;
    context: SecurityContext;
    blocked: boolean;
    evidence: Record<string, unknown>;
}
export interface ValidationRule {
    field: string;
    type: 'string' | 'number' | 'email' | 'uuid' | 'custom';
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    sanitize?: boolean;
    customValidator?: (value: unknown) => {
        valid: boolean;
        error?: string;
    };
}
export interface SecurityPolicy {
    name: string;
    description: string;
    rules: ValidationRule[];
    rateLimits: RateLimitConfig[];
    allowedOrigins: string[];
    blockedIPs: string[];
    requireAuthentication: boolean;
    maxRequestSize: number;
    allowedFileTypes: string[];
}
export declare class SecurityValidator {
    private threatPatterns;
    private blockedIPs;
    private suspiciousPatterns;
    constructor();
    validate(data: Record<string, unknown>, rules: ValidationRule[], context: SecurityContext): Promise<{
        valid: boolean;
        sanitized?: Record<string, unknown>;
        threats?: ThreatEvent[];
    }>;
    private validateField;
    private validateType;
    private detectStringThreats;
    private detectInjectionAttacks;
    private detectAnomalies;
    private sanitizeString;
    private createThreatEvent;
    private getThreatDescription;
    private initializeThreatPatterns;
    private initializeSuspiciousPatterns;
    blockIP(ip: string): void;
    unblockIP(ip: string): void;
    isIPBlocked(ip: string): boolean;
}
export declare class SecurityRateLimiter extends EventEmitter {
    private windows;
    private policies;
    private tempBlocks;
    constructor();
    addPolicy(name: string, config: RateLimitConfig): void;
    checkLimit(policyName: string, context: SecurityContext, _traceContext?: TraceContext): Promise<{
        allowed: boolean;
        resetTime?: number;
        remaining?: number;
        threats?: ThreatEvent[];
    }>;
    private setupCleanup;
    getStats(): {
        activeWindows: number;
        tempBlocks: number;
        policies: number;
    };
}
export declare class SecurityContextManager {
    private sessions;
    createSecurityContext(request: {
        sessionId?: string;
        userId?: string;
        ipAddress: string;
        userAgent: string;
    }): SecurityContext;
    private calculateRiskScore;
    private isHighRiskIP;
    private isSuspiciousUserAgent;
    updateSession(sessionId: string, updates: Partial<{
        riskScore: number;
        permissions: string[];
    }>): void;
    cleanupExpiredSessions(): number;
}
//# sourceMappingURL=security-layer.d.ts.map