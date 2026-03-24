import type { StyleGuide } from '../../../memory-manager.js';
import type { ScrivenerDocument } from '../../../types/index.js';
import { SpecializedAgent, type AgentAnalysis } from './base-agent.js';
import { EnhancedLangChainService } from '../../ai/langchain-service-enhanced.js';
import { AdvancedLangChainFeatures } from '../../ai/langchain-advanced-features.js';
export declare class WriterAgent extends SpecializedAgent {
    constructor(langchain: EnhancedLangChainService, advanced: AdvancedLangChainFeatures);
    analyze(document: ScrivenerDocument, styleGuide?: StyleGuide): Promise<AgentAnalysis>;
    providePerspective(document: ScrivenerDocument, question: string, context?: string, styleGuide?: StyleGuide): Promise<string>;
    critique(analysis: AgentAnalysis, document: ScrivenerDocument): Promise<string>;
}
//# sourceMappingURL=writer-agent.d.ts.map