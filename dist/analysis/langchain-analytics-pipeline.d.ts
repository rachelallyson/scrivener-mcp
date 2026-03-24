import type { Project } from '../types/index.js';
export interface AnalyticsReport {
    summary: AnalysisSynthesis;
    details: {
        narrative: NarrativeAnalysis;
        market: MarketAnalysis;
        technical: TechnicalAnalysis;
        emotional: EmotionalAnalysis;
    };
    recommendations: ActionableRecommendation[];
    confidenceScore: number;
    metadata: {
        analysisDate: string;
        processingTime: number;
        documentsAnalyzed: number;
        totalWordCount: number;
    };
}
export interface NarrativeAnalysis {
    plotStructure: {
        acts: Array<{
            name: string;
            startPercent: number;
            endPercent: number;
            keyEvents: string[];
            tension: number;
        }>;
        plotPoints: Array<{
            name: string;
            position: number;
            description: string;
            impact: number;
        }>;
        pacing: {
            overall: 'slow' | 'moderate' | 'fast' | 'varied';
            bySection: Array<{
                section: string;
                pace: number;
                description: string;
            }>;
        };
        structure: 'three-act' | 'hero-journey' | 'five-act' | 'nonlinear' | 'experimental';
    };
    characterArcs: Array<{
        character: string;
        arcType: 'growth' | 'fall' | 'flat' | 'corruption' | 'redemption';
        development: Array<{
            stage: string;
            position: number;
            description: string;
            significance: number;
        }>;
        relationships: Array<{
            with: string;
            type: string;
            evolution: string;
        }>;
        completion: number;
    }>;
    thematicElements: {
        primaryThemes: Array<{
            theme: string;
            prevalence: number;
            development: string;
        }>;
        motifs: Array<{
            motif: string;
            frequency: number;
            significance: string;
        }>;
        symbols: Array<{
            symbol: string;
            meaning: string;
            contexts: string[];
        }>;
        thematicCoherence: number;
    };
    narrativeTension: {
        overall: number;
        byChapter: number[];
        peaks: Array<{
            position: number;
            intensity: number;
            description: string;
        }>;
        valleys: Array<{
            position: number;
            reason: string;
            suggestion: string;
        }>;
    };
}
export interface MarketAnalysis {
    genre: {
        primary: string;
        secondary: string[];
        confidence: number;
        marketSize: string;
        trends: string[];
    };
    targetAudience: {
        primary: {
            demographic: string;
            description: string;
            marketShare: number;
        };
        secondary: Array<{
            demographic: string;
            appeal: string;
            potential: number;
        }>;
    };
    comparables: Array<{
        title: string;
        author: string;
        similarity: number;
        marketPerformance: string;
        relevance: string;
    }>;
    marketPosition: {
        uniqueness: number;
        competitiveness: string;
        opportunities: string[];
        challenges: string[];
    };
    trends: Array<{
        trend: string;
        relevance: number;
        impact: 'positive' | 'negative' | 'neutral';
        timeframe: string;
    }>;
    commercialViability: {
        score: number;
        factors: Array<{
            factor: string;
            impact: number;
            explanation: string;
        }>;
        projections: string[];
    };
}
export interface TechnicalAnalysis {
    readability: {
        fleschScore: number;
        gradeLevel: number;
        complexity: 'simple' | 'moderate' | 'complex' | 'academic';
        improvements: string[];
    };
    language: {
        vocabularyLevel: 'elementary' | 'intermediate' | 'advanced' | 'expert';
        uniqueWords: number;
        averageSentenceLength: number;
        passiveVoice: number;
        issues: Array<{
            type: string;
            count: number;
            examples: string[];
        }>;
    };
    structure: {
        consistency: number;
        formatting: Array<{
            aspect: string;
            score: number;
            issues: string[];
        }>;
        organizationScore: number;
        navigationEase: number;
    };
    style: {
        voice: {
            consistency: number;
            strength: number;
            distinctiveness: number;
        };
        tone: {
            primary: string;
            consistency: number;
            appropriateness: number;
        };
        pointOfView: {
            type: string;
            consistency: number;
            effectiveness: number;
        };
    };
}
export interface EmotionalAnalysis {
    emotionalArc: {
        overall: Array<{
            position: number;
            emotion: string;
            intensity: number;
        }>;
        byCharacter: Array<{
            character: string;
            arc: Array<{
                position: number;
                emotion: string;
                intensity: number;
            }>;
        }>;
    };
    sentiment: {
        overall: number;
        distribution: Array<{
            emotion: string;
            percentage: number;
        }>;
        volatility: number;
    };
    engagement: {
        score: number;
        factors: Array<{
            factor: string;
            contribution: number;
            explanation: string;
        }>;
        predictions: Array<{
            aspect: string;
            likelihood: number;
            impact: string;
        }>;
    };
    characterization: {
        depth: number;
        distinctiveness: number;
        authenticity: number;
        development: number;
    };
}
export interface AnalysisSynthesis {
    overallScore: number;
    strengths: Array<{
        area: string;
        score: number;
        explanation: string;
    }>;
    weaknesses: Array<{
        area: string;
        severity: number;
        explanation: string;
    }>;
    opportunities: Array<{
        opportunity: string;
        potential: number;
        effort: string;
    }>;
    risks: Array<{
        risk: string;
        probability: number;
        impact: string;
    }>;
    keyInsights: string[];
    executiveSummary: string;
}
export interface ActionableRecommendation {
    id: string;
    category: 'craft' | 'market' | 'structure' | 'character' | 'style';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    implementation: {
        effort: 'minimal' | 'moderate' | 'substantial' | 'major';
        timeframe: string;
        steps: string[];
        resources: string[];
    };
    expectedImpact: {
        areas: string[];
        magnitude: number;
        confidence: number;
    };
    examples: string[];
    relatedRecommendations: string[];
}
export declare class LangChainAnalyticsPipeline {
    private langchain;
    private advanced;
    private cache;
    private logger;
    constructor();
    initialize(): Promise<void>;
    analyzeDocument(content: string, _options?: {
        depth?: 'basic' | 'detailed';
        includeMetrics?: boolean;
    }): Promise<{
        structure: string;
        pacing: string;
        themes: string[];
        style: string;
        wordCount: number;
        readability: number;
    }>;
    analyzeNarrative(documents: Array<{
        content: string;
        id: string;
        title: string;
    }>): Promise<{
        structure: string;
        pacing: string;
        themes: string[];
        style: string;
        wordCount: number;
        readability: number;
    }>;
    comprehensiveAnalysis(project: Project): Promise<AnalyticsReport>;
    private narrativeAnalysis;
    private analyzePlotStructure;
    private analyzeCharacterArcs;
    private analyzeCharacterArc;
    private extractThemes;
    private analyzeTension;
    private marketAnalysis;
    private identifyGenre;
    private identifyAudience;
    private findComparables;
    private analyzeMarketFit;
    private matchCurrentTrends;
    private assessCommercialViability;
    private technicalAnalysis;
    private analyzeReadability;
    private countSyllables;
    private generateReadabilityImprovements;
    private analyzeLanguage;
    private assessVocabularyLevel;
    private analyzeStructure;
    private analyzeStyle;
    private emotionalAnalysis;
    private analyzeEmotionalArc;
    private analyzeSentiment;
    private assessEngagement;
    private assessCharacterization;
    private synthesizeFindings;
    private generateRecommendations;
    private getEmptyNarrativeAnalysis;
    private getEmptyMarketAnalysis;
    private getEmptyTechnicalAnalysis;
    private getEmptyEmotionalAnalysis;
    private extractDocuments;
    private calculateConfidence;
}
//# sourceMappingURL=langchain-analytics-pipeline.d.ts.map