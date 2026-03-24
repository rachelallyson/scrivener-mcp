import { EventEmitter } from 'events';
import type { StyleGuide } from '../../memory-manager.js';
import type { ScrivenerDocument } from '../../types/index.js';
import { AdvancedLangChainFeatures } from '../ai/langchain-advanced-features.js';
import { EnhancedLangChainService } from '../ai/langchain-service-enhanced.js';
import { type AgentAnalysis, type DiscussionRound } from './specialized/index.js';
export interface CollaborativeResult {
    consensus: {
        agreements: string[];
        sharedInsights: string[];
        recommendedActions: string[];
    };
    individualPerspectives: {
        [agentId: string]: {
            uniqueInsights: string[];
            specializedRecommendations: string[];
            confidenceLevel: number;
        };
    };
    conflictResolution: {
        disagreements: string[];
        proposedResolutions: string[];
        requiresHumanInput: boolean;
    };
    synthesizedAnalysis: AgentAnalysis;
    discussionRounds: DiscussionRound[];
    metadata: {
        totalDiscussionTime: number;
        participatingAgents: string[];
        consensusLevel: number;
        complexityScore: number;
    };
}
export interface MultiAgentConfig {
    enabledAgents: string[];
    maxDiscussionRounds: number;
    consensusThreshold: number;
    enableCritique: boolean;
    enableSynthesis: boolean;
    timeoutMs: number;
}
export declare class MultiAgentLangChainOrchestrator extends EventEmitter {
    private agents;
    private logger;
    private langchain;
    private advanced;
    private coordinator;
    constructor(langchain: EnhancedLangChainService, advanced: AdvancedLangChainFeatures);
    private initializeAgents;
    collaborateOnDocument(document: ScrivenerDocument, config?: Partial<MultiAgentConfig>, styleGuide?: StyleGuide): Promise<CollaborativeResult>;
    private conductIndividualAnalysis;
    private conductCritique;
    private facilitateDiscussion;
    private buildCollaborativeResult;
    getAvailableAgents(): Array<{
        name: string;
        role: string;
        expertise: string[];
    }>;
    getAgentPerformanceMetrics(): Record<string, Record<string, {
        avgTime: number;
        callCount: number;
        totalTime: number;
    }>>;
}
//# sourceMappingURL=langchain-multi-agent.d.ts.map