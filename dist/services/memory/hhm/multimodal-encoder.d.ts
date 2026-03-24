/**
 * Multi-Modal Encoder for HHM
 * Maps different data types (text, images, audio) to hypervectors
 */
import { HyperVector } from './hypervector.js';
import type { ScrivenerDocument } from '../../../types/index.js';
export interface EncodingResult {
    vector: HyperVector;
    modality: string;
    metadata: Record<string, unknown>;
}
export declare abstract class ModalityEncoder {
    protected dimensions: number;
    constructor(dimensions?: number);
    abstract encode(input: unknown): Promise<EncodingResult>;
    abstract getModality(): string;
}
/**
 * Text encoder using character n-grams and semantic hashing
 */
export declare class TextEncoder extends ModalityEncoder {
    private wordVectors;
    private ngramSize;
    constructor(dimensions?: number, ngramSize?: number);
    encode(text: string): Promise<EncodingResult>;
    private tokenize;
    private encodeWordWithNgrams;
    private extractNgrams;
    private combineWithPosition;
    private hashString;
    private createSeededVector;
    getModality(): string;
}
/**
 * Document structure encoder for Scrivener documents
 */
export declare class DocumentStructureEncoder extends ModalityEncoder {
    private textEncoder;
    constructor(dimensions?: number);
    encode(document: ScrivenerDocument): Promise<EncodingResult>;
    private encodeDocumentType;
    private hashString;
    private createSeededVector;
    getModality(): string;
}
/**
 * Concept encoder for abstract ideas and relationships
 */
export declare class ConceptEncoder extends ModalityEncoder {
    private conceptVectors;
    encode(concept: {
        name: string;
        attributes?: Record<string, string>;
    }): Promise<EncodingResult>;
    private createAttributeVector;
    private hashString;
    private createSeededVector;
    getModality(): string;
}
/**
 * Multi-modal encoder manager
 */
export declare class MultiModalEncoder {
    private encoders;
    private dimensions;
    constructor(dimensions?: number);
    registerEncoder(modality: string, encoder: ModalityEncoder): void;
    encode(input: unknown, modality: string): Promise<EncodingResult>;
    /**
     * Encode multiple inputs and bind them into a composite memory
     */
    encodeComposite(inputs: Array<{
        data: unknown;
        modality: string;
    }>): Promise<HyperVector>;
    /**
     * Encode temporal sequence of inputs
     */
    encodeSequence(inputs: Array<{
        data: unknown;
        modality: string;
        timestamp?: number;
    }>): Promise<HyperVector>;
    getRegisteredModalities(): string[];
}
//# sourceMappingURL=multimodal-encoder.d.ts.map