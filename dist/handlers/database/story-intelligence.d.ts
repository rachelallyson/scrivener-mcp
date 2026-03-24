/**
 * Story Intelligence Service
 * AI-powered analysis and recommendations for story improvement
 */
import type { GraphAnalytics } from './graph-analytics.js';
import type { Neo4jManager } from './neo4j-manager.js';
import type { SQLiteManager } from './sqlite-manager.js';
export interface PlotHole {
    type: 'continuity' | 'logic' | 'character' | 'timeline';
    severity: 'minor' | 'major' | 'critical';
    description: string;
    location: {
        documentId: string;
        title: string;
    };
    suggestion: string;
}
export interface CharacterArcIssue {
    characterId: string;
    characterName: string;
    issue: string;
    affectedChapters: string[];
    recommendation: string;
}
export interface PacingIssue {
    chapters: string[];
    issue: 'too_slow' | 'too_fast' | 'uneven' | 'repetitive';
    description: string;
    suggestion: string;
}
export interface StoryRecommendation {
    category: 'plot' | 'character' | 'pacing' | 'structure' | 'theme';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    actionItems: string[];
    estimatedImpact: number;
}
export interface TimelineEvent {
    id: string;
    date: string;
    time?: string;
    event: string;
    documentId: string;
    characters: string[];
    location?: string;
    importance: 'minor' | 'moderate' | 'major';
}
export declare class StoryIntelligence {
    private sqliteManager;
    private neo4jManager;
    private graphAnalytics;
    constructor(sqliteManager: SQLiteManager | null, neo4jManager: Neo4jManager | null, graphAnalytics: GraphAnalytics | null);
    /**
     * Detect potential plot holes using pattern analysis
     */
    detectPlotHoles(): Promise<PlotHole[]>;
    /**
     * Analyze character arc progression
     */
    analyzeCharacterArcs(): Promise<CharacterArcIssue[]>;
    /**
     * Analyze story pacing
     */
    analyzePacing(): Promise<PacingIssue[]>;
    /**
     * Generate smart story recommendations
     */
    generateRecommendations(): Promise<StoryRecommendation[]>;
    /**
     * Build story timeline from content
     */
    buildTimeline(): Promise<TimelineEvent[]>;
    /**
     * Helper methods
     */
    private checkContinuity;
    private checkCharacterConsistency;
    private checkTimelineConsistency;
    private checkUnresolvedThreads;
    private analyzeCharacterProgression;
    private analyzeThemes;
    private extractTimelineEvents;
    private extractCharacterNames;
    private parseRelativeDate;
    private storeTimeline;
}
//# sourceMappingURL=story-intelligence.d.ts.map