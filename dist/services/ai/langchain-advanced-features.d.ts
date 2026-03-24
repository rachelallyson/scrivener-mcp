/**
 * Advanced LangChain features and integrations
 * Demonstrates cutting-edge capabilities for manuscript analysis
 */
import { RunnableSequence } from '@langchain/core/runnables';
import { BufferWindowMemory } from 'langchain/memory';
import { z } from 'zod';
import type { ScrivenerDocument } from '../../types/index.js';
interface Entity {
    name: string;
    type: 'character' | 'location' | 'organization' | 'event' | 'object';
    context: string;
    mentions: number;
}
interface Relationship {
    entity1: string;
    entity2: string;
    relationship: string;
    strength: number;
    type: 'character' | 'location' | 'object' | 'event';
}
interface WritingStyleAnalysis {
    voice: {
        tone: string;
        perspective: string;
        consistency: number;
    };
    structure: {
        sentenceVariety: number;
        averageLength: number;
        complexity: string;
    };
    vocabulary: {
        level: string;
        variety: number;
        distinctiveness: number;
    };
    pacing: {
        rhythm: string;
        flow: number;
        tension: number;
    };
    literaryDevices: string[];
    strengths: string[];
    weaknesses: string[];
    overallScore: number;
}
declare const CharacterAnalysisSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodEnum<["protagonist", "antagonist", "supporting", "minor"]>;
    arc: z.ZodString;
    traits: z.ZodArray<z.ZodString, "many">;
    relationships: z.ZodArray<z.ZodObject<{
        character: z.ZodString;
        relationship: z.ZodString;
        dynamic: z.ZodEnum<["static", "evolving", "deteriorating", "improving"]>;
    }, "strip", z.ZodTypeAny, {
        character: string;
        relationship: string;
        dynamic: "improving" | "static" | "evolving" | "deteriorating";
    }, {
        character: string;
        relationship: string;
        dynamic: "improving" | "static" | "evolving" | "deteriorating";
    }>, "many">;
    motivations: z.ZodArray<z.ZodString, "many">;
    conflicts: z.ZodArray<z.ZodString, "many">;
    symbolism: z.ZodOptional<z.ZodString>;
    development: z.ZodObject<{
        beginning: z.ZodString;
        middle: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        middle: string;
        end: string;
        beginning: string;
    }, {
        middle: string;
        end: string;
        beginning: string;
    }>;
}, "strip", z.ZodTypeAny, {
    development: {
        middle: string;
        end: string;
        beginning: string;
    };
    name: string;
    role: "minor" | "protagonist" | "antagonist" | "supporting";
    traits: string[];
    relationships: {
        character: string;
        relationship: string;
        dynamic: "improving" | "static" | "evolving" | "deteriorating";
    }[];
    arc: string;
    motivations: string[];
    conflicts: string[];
    symbolism?: string | undefined;
}, {
    development: {
        middle: string;
        end: string;
        beginning: string;
    };
    name: string;
    role: "minor" | "protagonist" | "antagonist" | "supporting";
    traits: string[];
    relationships: {
        character: string;
        relationship: string;
        dynamic: "improving" | "static" | "evolving" | "deteriorating";
    }[];
    arc: string;
    motivations: string[];
    conflicts: string[];
    symbolism?: string | undefined;
}>;
declare const PlotStructureSchema: z.ZodObject<{
    acts: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        title: z.ZodString;
        summary: z.ZodString;
        keyEvents: z.ZodArray<z.ZodString, "many">;
        turningPoint: z.ZodOptional<z.ZodString>;
        tension: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        number: number;
        tension: number;
        summary: string;
        title: string;
        keyEvents: string[];
        turningPoint?: string | undefined;
    }, {
        number: number;
        tension: number;
        summary: string;
        title: string;
        keyEvents: string[];
        turningPoint?: string | undefined;
    }>, "many">;
    incitingIncident: z.ZodString;
    climax: z.ZodString;
    resolution: z.ZodString;
    subplots: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        summary: z.ZodString;
        resolution: z.ZodOptional<z.ZodString>;
        connection: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        title: string;
        connection: string;
        resolution?: string | undefined;
    }, {
        summary: string;
        title: string;
        connection: string;
        resolution?: string | undefined;
    }>, "many">;
    themes: z.ZodArray<z.ZodString, "many">;
    pacing: z.ZodObject<{
        overall: z.ZodEnum<["too slow", "slow", "balanced", "fast", "too fast"]>;
        recommendations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        overall: "slow" | "fast" | "balanced" | "too slow" | "too fast";
        recommendations: string[];
    }, {
        overall: "slow" | "fast" | "balanced" | "too slow" | "too fast";
        recommendations: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    pacing: {
        overall: "slow" | "fast" | "balanced" | "too slow" | "too fast";
        recommendations: string[];
    };
    climax: string;
    themes: string[];
    resolution: string;
    acts: {
        number: number;
        tension: number;
        summary: string;
        title: string;
        keyEvents: string[];
        turningPoint?: string | undefined;
    }[];
    incitingIncident: string;
    subplots: {
        summary: string;
        title: string;
        connection: string;
        resolution?: string | undefined;
    }[];
}, {
    pacing: {
        overall: "slow" | "fast" | "balanced" | "too slow" | "too fast";
        recommendations: string[];
    };
    climax: string;
    themes: string[];
    resolution: string;
    acts: {
        number: number;
        tension: number;
        summary: string;
        title: string;
        keyEvents: string[];
        turningPoint?: string | undefined;
    }[];
    incitingIncident: string;
    subplots: {
        summary: string;
        title: string;
        connection: string;
        resolution?: string | undefined;
    }[];
}>;
declare const WritingStyleSchema: z.ZodObject<{
    voice: z.ZodObject<{
        perspective: z.ZodEnum<["first-person", "second-person", "third-person-limited", "third-person-omniscient"]>;
        tone: z.ZodArray<z.ZodString, "many">;
        consistency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tone: string[];
        perspective: "first-person" | "second-person" | "third-person-limited" | "third-person-omniscient";
        consistency: number;
    }, {
        tone: string[];
        perspective: "first-person" | "second-person" | "third-person-limited" | "third-person-omniscient";
        consistency: number;
    }>;
    prose: z.ZodObject<{
        sentenceVariety: z.ZodEnum<["poor", "fair", "good", "excellent"]>;
        averageSentenceLength: z.ZodNumber;
        vocabularyLevel: z.ZodEnum<["simple", "moderate", "advanced", "academic"]>;
        descriptiveness: z.ZodEnum<["sparse", "balanced", "rich", "excessive"]>;
    }, "strip", z.ZodTypeAny, {
        averageSentenceLength: number;
        sentenceVariety: "excellent" | "good" | "fair" | "poor";
        vocabularyLevel: "moderate" | "simple" | "academic" | "advanced";
        descriptiveness: "balanced" | "rich" | "excessive" | "sparse";
    }, {
        averageSentenceLength: number;
        sentenceVariety: "excellent" | "good" | "fair" | "poor";
        vocabularyLevel: "moderate" | "simple" | "academic" | "advanced";
        descriptiveness: "balanced" | "rich" | "excessive" | "sparse";
    }>;
    dialogue: z.ZodObject<{
        naturalness: z.ZodNumber;
        characterDistinction: z.ZodNumber;
        tagVariety: z.ZodEnum<["repetitive", "limited", "good", "excellent"]>;
        balanceWithNarration: z.ZodEnum<["too little", "balanced", "too much"]>;
    }, "strip", z.ZodTypeAny, {
        naturalness: number;
        characterDistinction: number;
        tagVariety: "repetitive" | "excellent" | "good" | "limited";
        balanceWithNarration: "balanced" | "too little" | "too much";
    }, {
        naturalness: number;
        characterDistinction: number;
        tagVariety: "repetitive" | "excellent" | "good" | "limited";
        balanceWithNarration: "balanced" | "too little" | "too much";
    }>;
    techniques: z.ZodArray<z.ZodString, "many">;
    strengths: z.ZodArray<z.ZodString, "many">;
    weaknesses: z.ZodArray<z.ZodString, "many">;
    comparisons: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    dialogue: {
        naturalness: number;
        characterDistinction: number;
        tagVariety: "repetitive" | "excellent" | "good" | "limited";
        balanceWithNarration: "balanced" | "too little" | "too much";
    };
    voice: {
        tone: string[];
        perspective: "first-person" | "second-person" | "third-person-limited" | "third-person-omniscient";
        consistency: number;
    };
    strengths: string[];
    weaknesses: string[];
    prose: {
        averageSentenceLength: number;
        sentenceVariety: "excellent" | "good" | "fair" | "poor";
        vocabularyLevel: "moderate" | "simple" | "academic" | "advanced";
        descriptiveness: "balanced" | "rich" | "excessive" | "sparse";
    };
    techniques: string[];
    comparisons: string[];
}, {
    dialogue: {
        naturalness: number;
        characterDistinction: number;
        tagVariety: "repetitive" | "excellent" | "good" | "limited";
        balanceWithNarration: "balanced" | "too little" | "too much";
    };
    voice: {
        tone: string[];
        perspective: "first-person" | "second-person" | "third-person-limited" | "third-person-omniscient";
        consistency: number;
    };
    strengths: string[];
    weaknesses: string[];
    prose: {
        averageSentenceLength: number;
        sentenceVariety: "excellent" | "good" | "fair" | "poor";
        vocabularyLevel: "moderate" | "simple" | "academic" | "advanced";
        descriptiveness: "balanced" | "rich" | "excessive" | "sparse";
    };
    techniques: string[];
    comparisons: string[];
}>;
export declare class AdvancedLangChainFeatures {
    private llm;
    private embeddings;
    private vectorStore;
    private logger;
    private characterParser;
    private plotParser;
    private styleParser;
    constructor(apiKey?: string);
    /**
     * Advanced character analysis with structured output
     */
    analyzeCharacterStructured(characterName: string, documents: ScrivenerDocument[]): Promise<z.infer<typeof CharacterAnalysisSchema>>;
    /**
     * Advanced plot structure analysis
     */
    analyzePlotStructure(documents: ScrivenerDocument[]): Promise<z.infer<typeof PlotStructureSchema>>;
    /**
     * Advanced writing style analysis
     */
    analyzeWritingStyleStructured(documents: ScrivenerDocument[]): Promise<z.infer<typeof WritingStyleSchema>>;
    /**
     * Create a custom writing coach chain
     */
    createWritingCoachChain(focusArea: 'dialogue' | 'description' | 'pacing' | 'character'): Promise<{
        chain: RunnableSequence<{
            text: string;
        }, string>;
        memory: BufferWindowMemory;
        invoke: (text: string) => Promise<string>;
    }>;
    /**
     * Generate alternative versions of a passage
     */
    generateAlternatives(passage: string, styles: Array<'literary' | 'commercial' | 'minimalist' | 'ornate' | 'noir' | 'comedic'>): Promise<Record<string, string>>;
    /**
     * Advanced semantic similarity search with context
     */
    findSimilarScenes(sceneDescription: string, documents: ScrivenerDocument[], options?: {
        minSimilarity?: number;
        maxResults?: number;
        includeContext?: boolean;
    }): Promise<Array<{
        document: ScrivenerDocument;
        similarity: number;
        excerpt: string;
        analysis: string;
    }>>;
    /**
     * Create a developmental editor AI
     */
    createDevelopmentalEditor(): Promise<{
        analyze: (section: string, question: string) => Promise<string>;
        compareVersions: (original: string, revised: string) => Promise<string>;
    }>;
    /**
     * Generate a story bible from manuscript
     */
    generateStoryBible(documents: ScrivenerDocument[]): Promise<{
        characters: Record<string, unknown>;
        worldbuilding: Record<string, unknown>;
        timeline: Array<{
            event: string;
            chapter: string;
            significance: string;
        }>;
        themes: string[];
        symbols: Array<{
            symbol: string;
            meaning: string;
            appearances: string[];
        }>;
        styleGuide: Record<string, string>;
    }>;
    private extractCharacters;
    private extractWorldbuilding;
    private extractTimeline;
    private extractThemes;
    private extractSymbols;
    private extractStyleGuide;
    /**
     * Create a beta reader simulation
     */
    simulateBetaReader(document: ScrivenerDocument, readerProfile: {
        genre_preference: string;
        reading_level: 'casual' | 'avid' | 'professional';
        focus: 'plot' | 'character' | 'prose' | 'general';
    }): Promise<{
        overall_impression: string;
        strengths: string[];
        concerns: string[];
        questions: string[];
        emotional_response: string;
        would_continue_reading: boolean;
        rating: number;
        specific_feedback: Record<string, string>;
    }>;
    /**
     * Extract entities from text
     */
    extractEntities(text: string): Promise<Entity[]>;
    /**
     * Analyze relationships between entities
     */
    analyzeRelationships(entities: Entity[]): Promise<Relationship[]>;
    /**
     * Analyze writing style
     */
    analyzeWritingStyle(text: string): Promise<WritingStyleAnalysis>;
}
export default AdvancedLangChainFeatures;
//# sourceMappingURL=langchain-advanced-features.d.ts.map