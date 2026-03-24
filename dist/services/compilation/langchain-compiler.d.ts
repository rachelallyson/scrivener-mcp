import type { ProjectStatistics } from '../../types/index.js';
import type { CompilationOptions } from '../compilation-service.js';
import { CompilationService } from '../compilation-service.js';
import type { RTFContent } from '../parsers/rtf-handler.js';
export interface LangChainCompilationOptions extends CompilationOptions {
    target?: 'agent-query' | 'submission' | 'beta-readers' | 'publication' | 'pitch-packet' | 'synopsis';
    audience?: 'agents' | 'editors' | 'readers' | 'publishers' | 'writing-group';
    genre?: string;
    materialType?: string;
    length?: number;
    targetAudience?: string;
    includeGenreAnalysis?: boolean;
    generateDynamicElements?: boolean;
    optimizeForTarget?: boolean;
    enhanceContent?: boolean;
    autoGenerateMetadata?: boolean;
    targetOptimization?: string;
    intelligentFormatting?: boolean;
    generateMarketingMaterials?: boolean;
}
export interface CompiledDocument {
    content: string | object;
    metadata: {
        format: string;
        wordCount: number;
        generatedElements: GeneratedElements;
        optimizations: string[];
        targetAudience: string;
        compiledAt: string;
        processingTime?: number;
    };
    dynamicElements: GeneratedElements;
    quality: {
        score: number;
        suggestions: string[];
        issues: string[];
    };
    optimization?: string;
}
export interface GeneratedElements {
    synopsis?: string;
    hooks?: string[];
    blurb?: string;
    queryLetter?: string;
    tagline?: string;
    characterList?: string;
    settings?: string[];
    themes?: string[];
    marketingCopy?: string;
    pitchParagraph?: string;
    comparisons?: string[];
    processingTime?: number;
    content?: string;
}
export interface ContentOptimization {
    originalLength: number;
    optimizedLength: number;
    changes: {
        type: string;
        description: string;
        impact: string;
    }[];
    qualityImprovement: number;
}
export declare class LangChainCompilationService extends CompilationService {
    private langchain;
    private advanced;
    private logger;
    private targetOptimizations;
    private compilationCache;
    private elementCache;
    private qualityCache;
    private activeCompilations;
    constructor();
    initialize(): Promise<void>;
    generateMarketingMaterials(documents: Array<{
        id: string;
        content: RTFContent | string;
        title: string;
    }>, options?: LangChainCompilationOptions): Promise<GeneratedElements>;
    private initializeTargetOptimizations;
    compileWithAI(documents: Array<{
        id: string;
        content: RTFContent | string;
        title: string;
    }>, options?: LangChainCompilationOptions, projectStats?: ProjectStatistics): Promise<CompiledDocument>;
    private optimizeForTarget;
    private optimizeForQueryLetter;
    private optimizeForSubmission;
    private optimizeForPitch;
    private optimizeForSynopsis;
    private condenseToLength;
    private enhanceContentWithAI;
    private generateDynamicElements;
    private generateSynopsis;
    private generateHooks;
    private generateBlurb;
    private generateMetadata;
    private generateQueryLetter;
    private generatePitchParagraph;
    private generateComparisons;
    private assessQuality;
    batchCompile(batches: Array<{
        documents: Array<{
            id: string;
            content: RTFContent | string;
            title: string;
        }>;
        options: LangChainCompilationOptions;
        projectStats?: ProjectStatistics;
    }>): Promise<CompiledDocument[]>;
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Get cache statistics for monitoring
     */
    getCacheStats(): {
        compilation: {
            size: number;
            hitRate?: number;
        };
        elements: {
            size: number;
            hitRate?: number;
        };
        quality: {
            size: number;
            hitRate?: number;
        };
        activeCompilations: number;
    };
}
//# sourceMappingURL=langchain-compiler.d.ts.map