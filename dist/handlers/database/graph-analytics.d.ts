/**
 * Neo4j Graph Analytics Module
 * Provides advanced graph analysis capabilities for story structure
 */
import type { Neo4jManager } from './neo4j-manager.js';
export interface CharacterNetwork {
    centralCharacters: Array<{
        id: string;
        name: string;
        centrality: number;
        connections: number;
    }>;
    clusters: Array<{
        id: string;
        members: string[];
        theme: string;
    }>;
    isolatedCharacters: string[];
}
export interface PlotComplexity {
    threadCount: number;
    intersectionPoints: number;
    averageThreadLength: number;
    complexityScore: number;
    criticalPaths: Array<{
        from: string;
        to: string;
        weight: number;
    }>;
}
export interface StoryFlow {
    chapters: Array<{
        id: string;
        intensity: number;
        charactersPresent: number;
        plotThreadsActive: number;
    }>;
    pacingScore: number;
    tensionCurve: number[];
    suggestedImprovements: string[];
}
export declare class GraphAnalytics {
    private neo4j;
    constructor(neo4j: Neo4jManager);
    /**
     * Analyze character network and relationships
     */
    analyzeCharacterNetwork(): Promise<CharacterNetwork>;
    /**
     * Analyze plot thread complexity
     */
    analyzePlotComplexity(): Promise<PlotComplexity>;
    /**
     * Analyze story flow and pacing
     */
    analyzeStoryFlow(): Promise<StoryFlow>;
    /**
     * Find potential character relationships based on co-occurrence
     */
    discoverRelationships(): Promise<Array<{
        character1: string;
        character2: string;
        strength: number;
        suggestedRelationType: string;
    }>>;
    /**
     * Analyze narrative structure patterns
     */
    analyzeNarrativeStructure(): Promise<{
        structure: 'linear' | 'branching' | 'circular' | 'episodic';
        keyMilestones: Array<{
            chapter: string;
            event: string;
            impact: number;
        }>;
        suggestions: string[];
    }>;
    /**
     * Helper methods
     */
    private inferClusterTheme;
    private suggestRelationType;
    private generateFlowSuggestions;
    private findFlatSections;
    private generateStructureSuggestions;
}
//# sourceMappingURL=graph-analytics.d.ts.map