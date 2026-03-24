import { EventEmitter } from 'events';
import { getLogger } from '../../../core/logger.js';
import type { StyleGuide } from '../../../memory-manager.js';
import type { ScrivenerDocument } from '../../../types/index.js';
import { AdvancedLangChainFeatures } from '../../ai/langchain-advanced-features.js';
import { EnhancedLangChainService } from '../../ai/langchain-service-enhanced.js';
export interface AgentPersona {
    name: string;
    role: string;
    perspective: string;
    expertise: string[];
    personality: string;
    focusAreas: string[];
    communicationStyle: string;
    biases: string[];
    strengths: string[];
    limitations: string[];
}
export interface AgentAnalysis {
    agentId: string;
    perspective: string;
    findings: Array<{
        aspect: string;
        assessment: string;
        confidence: number;
        evidence: string[];
        suggestions: string[];
    }>;
    overallScore: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string;
}
export interface DiscussionContribution {
    agentId: string;
    message: string;
    confidence: number;
    references: string[];
    timestamp: number;
}
export interface DiscussionRound {
    roundNumber: number;
    contributions: DiscussionContribution[];
    agreements: string[];
    disagreements: string[];
    newInsights: string[];
    timestamp: number;
}
export declare abstract class SpecializedAgent extends EventEmitter {
    protected langchain: EnhancedLangChainService;
    protected advanced: AdvancedLangChainFeatures;
    protected logger: ReturnType<typeof getLogger>;
    persona: AgentPersona;
    private operationMetrics;
    constructor(langchain: EnhancedLangChainService, advanced: AdvancedLangChainFeatures, persona: AgentPersona);
    private updateOperationMetrics;
    getPerformanceMetrics(): Record<string, {
        avgTime: number;
        callCount: number;
        totalTime: number;
    }>;
    protected generateAnalysis(document: ScrivenerDocument, prompt: string, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    discussWith(otherAgent: SpecializedAgent, topic: string, initialContext: string, maxRounds?: number): Promise<DiscussionRound[]>;
    private generateDiscussionContribution;
    private findAgreements;
    private findDisagreements;
    private extractNewInsights;
    abstract analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    abstract providePerspective(document: ScrivenerDocument, question: string, context?: string, styleGuide?: StyleGuide): Promise<string>;
    abstract critique(analysis: AgentAnalysis, document: ScrivenerDocument): Promise<string>;
}
//# sourceMappingURL=base-agent.d.ts.map