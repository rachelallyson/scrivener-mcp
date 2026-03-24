import { EventEmitter } from 'events';
import { getLogger } from '../../core/logger.js';
import { AppError, ErrorCode, formatDuration, handleError, unique, validateInput, } from '../../utils/common.js';
// Import the specialized agents
import { WriterAgent, EditorAgent, ResearcherAgent, CriticAgent, CoordinatorAgent, } from './specialized/index.js';
const Logger = getLogger;
export class MultiAgentLangChainOrchestrator extends EventEmitter {
    constructor(langchain, advanced) {
        super();
        this.langchain = langchain;
        this.advanced = advanced;
        this.logger = Logger('multi-agent-orchestrator');
        this.agents = new Map();
        // Initialize coordinator
        this.coordinator = new CoordinatorAgent(langchain, advanced);
        // Initialize all specialized agents
        this.initializeAgents();
        // Set up error handling
        this.on('error', (error) => {
            this.logger.error('Multi-agent orchestrator error:', error);
        });
    }
    initializeAgents() {
        const agentClasses = [
            WriterAgent,
            EditorAgent,
            ResearcherAgent,
            CriticAgent,
        ];
        for (const AgentClass of agentClasses) {
            const agent = new AgentClass(this.langchain, this.advanced);
            this.agents.set(agent.persona.name, agent);
            // Forward agent events
            agent.on('error', (error) => {
                this.emit('agentError', agent.persona.name, error);
            });
        }
        this.logger.info('Initialized multi-agent system', {
            agentCount: this.agents.size,
            agentNames: Array.from(this.agents.keys()),
        });
    }
    async collaborateOnDocument(document, config = {}, styleGuide) {
        const startTime = performance.now();
        try {
            validateInput({ document }, {
                document: { type: 'object', required: true },
            });
            const finalConfig = {
                enabledAgents: config.enabledAgents || Array.from(this.agents.keys()),
                maxDiscussionRounds: config.maxDiscussionRounds || 3,
                consensusThreshold: config.consensusThreshold || 0.7,
                enableCritique: config.enableCritique ?? true,
                enableSynthesis: config.enableSynthesis ?? true,
                timeoutMs: config.timeoutMs || 300000, // 5 minutes
            };
            this.logger.info('Starting collaborative document analysis', {
                documentTitle: document.title,
                enabledAgents: finalConfig.enabledAgents,
                config: finalConfig,
            });
            // Phase 1: Individual Analysis
            const individualAnalyses = await this.conductIndividualAnalysis(document, finalConfig.enabledAgents, styleGuide);
            // Phase 2: Cross-Critique (if enabled)
            let critiqueRounds = [];
            if (finalConfig.enableCritique) {
                critiqueRounds = await this.conductCritique(individualAnalyses, document, finalConfig.maxDiscussionRounds);
            }
            // Phase 3: Collaborative Discussion
            const discussionRounds = await this.facilitateDiscussion(individualAnalyses, document, finalConfig.maxDiscussionRounds);
            // Phase 4: Synthesis (if enabled)
            let synthesizedAnalysis;
            if (finalConfig.enableSynthesis) {
                synthesizedAnalysis = await this.coordinator.synthesizeAnalyses(individualAnalyses);
            }
            else {
                // Use the highest-scoring analysis as fallback
                synthesizedAnalysis = individualAnalyses.reduce((best, current) => current.overallScore > best.overallScore ? current : best);
            }
            // Phase 5: Build Final Result
            const result = await this.buildCollaborativeResult(individualAnalyses, [...critiqueRounds, ...discussionRounds], synthesizedAnalysis, finalConfig);
            const totalDuration = performance.now() - startTime;
            this.logger.info('Collaborative analysis completed', {
                documentTitle: document.title,
                participatingAgents: finalConfig.enabledAgents,
                totalRounds: result.discussionRounds.length,
                consensusLevel: result.metadata.consensusLevel,
                duration: formatDuration(totalDuration),
            });
            return result;
        }
        catch (error) {
            const duration = performance.now() - startTime;
            throw handleError(error, 'MultiAgentLangChainOrchestrator.collaborateOnDocument');
        }
    }
    async conductIndividualAnalysis(document, enabledAgentNames, styleGuide) {
        const startTime = performance.now();
        const activeAgents = enabledAgentNames
            .map(name => this.agents.get(name))
            .filter((agent) => agent !== undefined);
        if (activeAgents.length === 0) {
            throw new AppError('No valid agents enabled for analysis', ErrorCode.VALIDATION_ERROR);
        }
        this.logger.debug('Starting individual analysis phase', {
            agentCount: activeAgents.length,
            agentNames: activeAgents.map(a => a.persona.name),
        });
        const analysisPromises = activeAgents.map(async (agent) => {
            try {
                return await agent.analyze(document, styleGuide);
            }
            catch (error) {
                this.logger.warn(`Agent ${agent.persona.name} analysis failed`, { error });
                // Return minimal analysis to prevent total failure
                return {
                    agentId: agent.persona.name,
                    perspective: `Analysis failed: ${error.message}`,
                    findings: [],
                    overallScore: 0,
                    priority: 'low',
                    reasoning: 'Analysis could not be completed due to error',
                };
            }
        });
        const analyses = await Promise.all(analysisPromises);
        const duration = performance.now() - startTime;
        this.logger.debug('Individual analysis phase completed', {
            analysisCount: analyses.length,
            avgScore: analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length,
            duration: formatDuration(duration),
        });
        return analyses;
    }
    async conductCritique(analyses, document, maxRounds) {
        const startTime = performance.now();
        const critiqueRounds = [];
        this.logger.debug('Starting critique phase', {
            analysisCount: analyses.length,
            maxRounds,
        });
        // Each agent critiques others' analyses
        const agents = Array.from(this.agents.values());
        for (let round = 1; round <= Math.min(maxRounds, 2); round++) {
            const roundContributions = [];
            for (const agent of agents) {
                for (const analysis of analyses) {
                    // Don't critique your own analysis
                    if (analysis.agentId === agent.persona.name)
                        continue;
                    try {
                        const critique = await agent.critique(analysis, document);
                        roundContributions.push({
                            agentId: agent.persona.name,
                            message: `Critique of ${analysis.agentId}: ${critique}`,
                            confidence: 0.8,
                            references: [analysis.agentId],
                            timestamp: Date.now(),
                        });
                    }
                    catch (error) {
                        this.logger.warn(`Critique failed for ${agent.persona.name} on ${analysis.agentId}`, { error });
                    }
                }
            }
            if (roundContributions.length > 0) {
                critiqueRounds.push({
                    roundNumber: round,
                    contributions: roundContributions,
                    agreements: [], // Critiques don't focus on agreements
                    disagreements: [], // Would need analysis to extract disagreements
                    newInsights: [], // Would need analysis to extract insights
                    timestamp: Date.now(),
                });
            }
        }
        const duration = performance.now() - startTime;
        this.logger.debug('Critique phase completed', {
            rounds: critiqueRounds.length,
            totalCritiques: critiqueRounds.reduce((sum, r) => sum + r.contributions.length, 0),
            duration: formatDuration(duration),
        });
        return critiqueRounds;
    }
    async facilitateDiscussion(analyses, document, maxRounds) {
        const startTime = performance.now();
        const agents = Array.from(this.agents.values());
        if (agents.length < 2) {
            this.logger.warn('Not enough agents for discussion', { agentCount: agents.length });
            return [];
        }
        this.logger.debug('Starting collaborative discussion', {
            agentCount: agents.length,
            maxRounds,
        });
        // Create context from individual analyses
        const context = `
Document: ${document.title}
Initial Analyses Summary:
${analyses.map(a => `${a.agentId}: Score ${a.overallScore}/100, Priority: ${a.priority}, Key findings: ${a.findings.slice(0, 2).map(f => f.aspect).join(', ')}`).join('\n')}
		`.trim();
        // Facilitate discussion between pairs of agents
        const discussionPromises = [];
        for (let i = 0; i < agents.length - 1; i++) {
            for (let j = i + 1; j < Math.min(agents.length, i + 3); j++) { // Limit pairs to prevent explosion
                const agent1 = agents[i];
                const agent2 = agents[j];
                const topic = `Document analysis and improvement recommendations for "${document.title}"`;
                discussionPromises.push(agent1.discussWith(agent2, topic, context, maxRounds));
            }
        }
        const allDiscussionRounds = await Promise.all(discussionPromises);
        const flattenedRounds = allDiscussionRounds.flat();
        const duration = performance.now() - startTime;
        this.logger.debug('Collaborative discussion completed', {
            totalRounds: flattenedRounds.length,
            agentPairs: discussionPromises.length,
            duration: formatDuration(duration),
        });
        return flattenedRounds;
    }
    async buildCollaborativeResult(individualAnalyses, discussionRounds, synthesizedAnalysis, config) {
        const startTime = performance.now();
        // Build consensus using coordinator
        const consensus = await this.coordinator.buildConsensus(discussionRounds);
        const unresolved = await this.coordinator.identifyUnresolved(discussionRounds);
        // Extract individual perspectives
        const individualPerspectives = {};
        for (const analysis of individualAnalyses) {
            individualPerspectives[analysis.agentId] = {
                uniqueInsights: analysis.findings.map(f => f.aspect),
                specializedRecommendations: analysis.findings.flatMap(f => f.suggestions),
                confidenceLevel: analysis.findings.reduce((sum, f) => sum + f.confidence, 0) / analysis.findings.length,
            };
        }
        // Calculate metadata
        const participatingAgents = unique([
            ...individualAnalyses.map(a => a.agentId),
            ...discussionRounds.flatMap(r => r.contributions.map(c => c.agentId))
        ]);
        const allAgreements = unique(discussionRounds.flatMap(r => r.agreements));
        const consensusLevel = Math.min(allAgreements.length / Math.max(participatingAgents.length, 1), 1);
        const complexityScore = Math.min((individualAnalyses.length * 20 + discussionRounds.length * 15) / 100 * 100, 100);
        const result = {
            consensus: {
                agreements: consensus,
                sharedInsights: unique(discussionRounds.flatMap(r => r.newInsights)),
                recommendedActions: synthesizedAnalysis.findings.flatMap(f => f.suggestions).slice(0, 10),
            },
            individualPerspectives,
            conflictResolution: {
                disagreements: unresolved,
                proposedResolutions: [], // Would need additional analysis
                requiresHumanInput: unresolved.length > 3,
            },
            synthesizedAnalysis,
            discussionRounds,
            metadata: {
                totalDiscussionTime: performance.now() - startTime,
                participatingAgents,
                consensusLevel,
                complexityScore,
            },
        };
        const duration = performance.now() - startTime;
        this.logger.debug('Collaborative result built', {
            consensusPoints: result.consensus.agreements.length,
            individualPerspectives: Object.keys(result.individualPerspectives).length,
            unresolved: result.conflictResolution.disagreements.length,
            duration: formatDuration(duration),
        });
        return result;
    }
    getAvailableAgents() {
        return Array.from(this.agents.values()).map(agent => ({
            name: agent.persona.name,
            role: agent.persona.role,
            expertise: agent.persona.expertise,
        }));
    }
    getAgentPerformanceMetrics() {
        const metrics = {};
        for (const [name, agent] of this.agents) {
            metrics[name] = agent.getPerformanceMetrics();
        }
        return metrics;
    }
}
//# sourceMappingURL=langchain-multi-agent.js.map