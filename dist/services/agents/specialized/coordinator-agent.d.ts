import type { StyleGuide } from '../../../memory-manager.js';
import type { ScrivenerDocument } from '../../../types/index.js';
import { SpecializedAgent, type AgentAnalysis, type DiscussionRound } from './base-agent.js';
import { EnhancedLangChainService } from '../../ai/langchain-service-enhanced.js';
import { AdvancedLangChainFeatures } from '../../ai/langchain-advanced-features.js';
export declare class CoordinatorAgent extends SpecializedAgent {
    constructor(langchain: EnhancedLangChainService, advanced: AdvancedLangChainFeatures);
    analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    providePerspective(document: ScrivenerDocument, question: string, context?: string, styleGuide?: StyleGuide): Promise<string>;
    critique(analysis: AgentAnalysis, document: ScrivenerDocument): Promise<string>;
    buildConsensus(rounds: DiscussionRound[]): Promise<string[]>;
    identifyUnresolved(rounds: DiscussionRound[]): Promise<string[]>;
    synthesizeAnalyses(analyses: AgentAnalysis[]): Promise<AgentAnalysis>;
}
//# sourceMappingURL=coordinator-agent.d.ts.map