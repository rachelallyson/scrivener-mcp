import type { ScrivenerDocument } from '../../types/index.js';
import type { StyleGuide } from '../../memory-manager.js';
import { EventEmitter } from 'events';
export interface WritingContext {
    document: ScrivenerDocument;
    currentPosition: number;
    selectedText: string;
    surroundingText: string;
    recentChanges: string[];
    writingGoals?: {
        wordCountTarget?: number;
        tone?: string;
        style?: string;
    };
}
export interface DocumentContext {
    document: ScrivenerDocument;
    relatedDocuments: Array<{
        id: string;
        content: string;
        title: string;
    }>;
    characterVoices: string[];
    themes: string[];
    writingStyle: Record<string, unknown>;
}
export interface WritingSuggestion {
    id: string;
    type: 'completion' | 'improvement' | 'correction' | 'alternative' | 'expansion';
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    suggestion: string;
    explanation: string;
    preview: string;
    position: {
        start: number;
        end: number;
    };
    metadata: {
        wordCount: number;
        impact: string;
        category: string;
    };
}
export interface WritingIssue {
    id: string;
    type: 'grammar' | 'style' | 'clarity' | 'consistency' | 'flow' | 'character_voice';
    severity: 'error' | 'warning' | 'suggestion';
    message: string;
    position: {
        start: number;
        end: number;
    };
    suggestions: string[];
    autoFix?: string;
}
export interface StyleConsistency {
    score: number;
    issues: Array<{
        type: string;
        description: string;
        examples: string[];
        severity: 'high' | 'medium' | 'low';
    }>;
    trends: Array<{
        aspect: string;
        direction: 'improving' | 'declining' | 'stable';
        confidence: number;
    }>;
}
export interface PredictiveText {
    completions: Array<{
        text: string;
        confidence: number;
        type: 'word' | 'phrase' | 'sentence';
    }>;
    alternatives: Array<{
        original: string;
        suggestion: string;
        improvement: string;
    }>;
    nextSentence: string;
}
export interface WritingStream {
    onWrite: (text: string, position: number) => Promise<void>;
    onPause: (context: WritingContext) => Promise<void>;
    onDelete: (deletedText: string, position: number) => Promise<void>;
    onSelect: (selectedText: string, position: {
        start: number;
        end: number;
    }) => Promise<void>;
}
export declare class RealtimeWritingAssistant extends EventEmitter {
    private langchain;
    private advanced;
    private cache;
    private logger;
    private activeStreams;
    private activeSessions;
    private debounceTimers;
    private analysisQueue;
    constructor();
    initialize(): Promise<void>;
    startSession(document: ScrivenerDocument, options?: {
        styleGuide?: StyleGuide;
        realTimeAnalysis?: boolean;
        suggestionLevel?: 'minimal' | 'balanced' | 'comprehensive';
        debounceMs?: number;
        assistanceType?: string;
        streamingEnabled?: boolean;
        contextWindow?: number;
    }): Promise<string>;
    private createWritingStream;
    private handleWrite;
    private handlePause;
    private handleDelete;
    private handleSelect;
    private debouncedSuggestions;
    private detectIssues;
    private predictNext;
    private generateSuggestions;
    private generateSelectionSuggestions;
    checkStyleConsistency(sessionId: string, text: string): Promise<StyleConsistency>;
    applySuggestion(sessionId: string, suggestionId: string): Promise<{
        success: boolean;
        appliedText: string;
        newPosition: number;
    }>;
    getSession(sessionId: string): WritingSession | null;
    getSessionStatistics(sessionId: string): WritingSession['statistics'] | null;
    endSession(sessionId: string): Promise<{
        statistics: WritingSession['statistics'];
        summary: string;
    }>;
    private buildDocumentContext;
    private analyzeWritingStyle;
    private buildTextContext;
    private getCurrentWord;
    private getSuggestionCount;
    private priorityScore;
    private hashText;
    private generateSessionSummary;
}
interface WritingSession {
    id: string;
    documentId: string;
    document: ScrivenerDocument;
    context: DocumentContext;
    style: Record<string, unknown>;
    styleGuide?: StyleGuide;
    settings: {
        realTimeAnalysis: boolean;
        suggestionLevel: 'minimal' | 'balanced' | 'comprehensive';
        debounceMs: number;
    };
    statistics: {
        wordsWritten: number;
        suggestionsGenerated: number;
        suggestionsAccepted: number;
        issuesDetected: number;
        startTime: number;
    };
}
export {};
//# sourceMappingURL=langchain-writing-assistant.d.ts.map