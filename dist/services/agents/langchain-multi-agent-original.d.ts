import { EventEmitter } from 'events';
import { getLogger } from '../../core/logger.js';
import type { StyleGuide } from '../../memory-manager.js';
import type { ScrivenerDocument } from '../../types/index.js';
import { AdvancedLangChainFeatures } from '../ai/langchain-advanced-features.js';
import { EnhancedLangChainService } from '../ai/langchain-service-enhanced.js';
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
export interface CollaborativeResult {
    consensus: {
        agreements: Array<{
            aspect: string;
            confidence: number;
            agents: string[];
        }>;
        disagreements: Array<{
            aspect: string;
            positions: Array<{
                agent: string;
                position: string;
                confidence: number;
            }>;
        }>;
        unresolved: string[];
    };
    synthesis: {
        combinedScore: number;
        keyFindings: string[];
        actionPriorities: Array<{
            action: string;
            urgency: number;
            complexity: string;
        }>;
        tradeoffs: Array<{
            decision: string;
            benefits: string[];
            costs: string[];
        }>;
    };
    recommendations: Array<{
        recommendation: string;
        supportingAgents: string[];
        dissenting: Array<{
            agent: string;
            concerns: string[];
        }>;
        confidence: number;
        implementation: {
            effort: 'low' | 'medium' | 'high' | 'very-high';
            timeframe: string;
            dependencies: string[];
        };
    }>;
    individualPerspectives: AgentAnalysis[];
}
export interface AgentDiscussion {
    id: string;
    topic: string;
    participants: string[];
    rounds: Array<{
        round: number;
        contributions: Array<{
            agentId: string;
            message: string;
            references: string[];
            questions: string[];
        }>;
        agreements: string[];
        newInsights: string[];
    }>;
    finalConsensus: string[];
    unresolved: string[];
}
export interface DiscussionRound {
    round: number;
    contributions: Array<{
        agentId: string;
        message: string;
        references: string[];
        questions: string[];
    }>;
    agreements: string[];
    newInsights: string[];
}
export interface AgentAnalysisResult {
    perspective: string;
    findings: string[];
    overallScore: number;
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
}
export interface WorkshopPhaseOutput {
    agentId: string;
    type: 'analysis' | 'suggestion' | 'question' | 'insight';
    content: string;
    confidence: number;
    timestamp: string;
}
export interface WorkshopSession {
    id: string;
    document: ScrivenerDocument;
    focus: string[];
    agents: SpecializedAgent[];
    phases: Array<{
        name: string;
        duration: number;
        activities: string[];
        outputs: WorkshopPhaseOutput[];
    }>;
    results: CollaborativeResult;
    insights: string[];
    followUpActions: string[];
}
declare abstract class SpecializedAgent {
    protected langchain: EnhancedLangChainService;
    protected advanced: AdvancedLangChainFeatures;
    protected logger: ReturnType<typeof getLogger>;
    persona: AgentPersona;
    private operationMetrics;
    constructor(persona: AgentPersona);
    /**
     * Track operation performance metrics
     */
    private updateOperationMetrics;
    /**
     * Get performance metrics for monitoring
     */
    getOperationMetrics(): Record<string, {
        averageTime: number;
        callCount: number;
    }>;
    abstract analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    abstract providePerspective(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<string>;
    abstract critique(document: ScrivenerDocument, otherAnalysis?: AgentAnalysis, styleGuide?: StyleGuide): Promise<string>;
    protected generateAnalysis(document: ScrivenerDocument, focusPrompt: string, specificQuestions: string[], styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    discussWith(otherAgent: SpecializedAgent, topic: string, rounds?: number): Promise<AgentDiscussion>;
    private generateDiscussionContribution;
    private findAgreements;
    private extractNewInsights;
    private buildConsensus;
    private identifyUnresolved;
}
export declare class EditorAgent extends SpecializedAgent {
    constructor();
    analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    providePerspective(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<string>;
    critique(document: ScrivenerDocument, otherAnalysis?: AgentAnalysis, styleGuide?: StyleGuide): Promise<string>;
}
export declare class CriticAgent extends SpecializedAgent {
    constructor();
    analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    providePerspective(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<string>;
    critique(document: ScrivenerDocument, otherAnalysis?: AgentAnalysis, styleGuide?: StyleGuide): Promise<string>;
}
export declare class ResearcherAgent extends SpecializedAgent {
    constructor();
    analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    providePerspective(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<string>;
    critique(document: ScrivenerDocument, otherAnalysis?: AgentAnalysis, styleGuide?: StyleGuide): Promise<string>;
}
export declare class StylistAgent extends SpecializedAgent {
    constructor();
    analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    providePerspective(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<string>;
    critique(document: ScrivenerDocument, otherAnalysis?: AgentAnalysis, styleGuide?: StyleGuide): Promise<string>;
}
export declare class PlotterAgent extends SpecializedAgent {
    constructor();
    analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    providePerspective(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<string>;
    critique(document: ScrivenerDocument, otherAnalysis?: AgentAnalysis, styleGuide?: StyleGuide): Promise<string>;
}
export declare class LangChainMultiAgentSystem extends EventEmitter {
    private agents;
    private logger;
    private activeWorkshops;
    private systemMetrics;
    constructor();
    /**
     * Track system-level operation metrics
     */
    private updateSystemMetrics;
    /**
     * Get comprehensive system metrics including all agents
     */
    getSystemMetrics(): {
        systemOperations: Record<string, {
            averageTime: number;
            callCount: number;
            successRate: number;
        }>;
        agentMetrics: Record<string, Record<string, {
            averageTime: number;
            callCount: number;
        }>>;
        activeWorkshops: number;
    };
    initialize(): Promise<void>;
    collaborativeEdit(document: ScrivenerDocument, options?: {
        agents?: string[];
        rounds?: number;
        focusAreas?: string[];
    }): Promise<CollaborativeResult>;
    interactiveWorkshop(document: ScrivenerDocument, options?: {
        duration?: number;
        focusAreas?: string[];
        includeCritique?: boolean;
        agents?: string[];
        rounds?: number;
    }): Promise<WorkshopSession>;
    private runAnalysisPhase;
    private runDiscussionPhase;
    private runSynthesisPhase;
    private generateCollaborativeCritique;
    private buildConsensus;
    private groupFindingsByAspect;
    private synthesizeAnalyses;
    private extractActionPriorities;
    private assessComplexity;
    private identifyTradeoffs;
    private generateCollaborativeRecommendations;
    private estimateTimeframe;
    private consolidateWorkshopResults;
    private extractWorkshopInsights;
    private generateFollowUpActions;
    getAgent(agentId: string): SpecializedAgent | undefined;
    getAvailableAgents(): string[];
    getActiveWorkshops(): string[];
    getWorkshopSession(sessionId: string): WorkshopSession | undefined;
}
export {};
//# sourceMappingURL=langchain-multi-agent-original.d.ts.map