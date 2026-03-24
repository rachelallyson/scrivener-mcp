/**
 * Multi-Modal Encoder for HHM
 * Maps different data types (text, images, audio) to hypervectors
 */
import { HyperVector } from './hypervector.js';
import { getLogger } from '../../../core/logger.js';
const logger = getLogger('hhm-multimodal-encoder');
export class ModalityEncoder {
    constructor(dimensions = 10000) {
        this.dimensions = dimensions;
    }
}
/**
 * Text encoder using character n-grams and semantic hashing
 */
export class TextEncoder extends ModalityEncoder {
    constructor(dimensions = 10000, ngramSize = 3) {
        super(dimensions);
        this.wordVectors = new Map();
        this.ngramSize = ngramSize;
    }
    async encode(text) {
        const words = this.tokenize(text);
        const wordVectors = [];
        for (const word of words) {
            let wordVector = this.wordVectors.get(word);
            if (!wordVector) {
                // Create new vector for unknown word using n-gram encoding
                wordVector = this.encodeWordWithNgrams(word);
                this.wordVectors.set(word, wordVector);
            }
            wordVectors.push(wordVector);
        }
        // Combine word vectors with positional encoding
        const textVector = this.combineWithPosition(wordVectors);
        return {
            vector: textVector,
            modality: 'text',
            metadata: {
                wordCount: words.length,
                uniqueWords: new Set(words).size,
                textLength: text.length,
            },
        };
    }
    tokenize(text) {
        // Simple tokenization - can be replaced with more sophisticated methods
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length > 0);
    }
    encodeWordWithNgrams(word) {
        const ngrams = this.extractNgrams(word);
        const ngramVectors = [];
        for (const ngram of ngrams) {
            // Create deterministic vector for each n-gram
            const seed = this.hashString(ngram);
            ngramVectors.push(this.createSeededVector(seed));
        }
        // Bundle n-gram vectors to create word vector
        return HyperVector.bundle(ngramVectors);
    }
    extractNgrams(word) {
        const ngrams = [];
        const paddedWord = `#${word}#`; // Add boundary markers
        for (let i = 0; i <= paddedWord.length - this.ngramSize; i++) {
            ngrams.push(paddedWord.substring(i, i + this.ngramSize));
        }
        return ngrams;
    }
    combineWithPosition(vectors) {
        if (vectors.length === 0) {
            return new HyperVector(this.dimensions);
        }
        // Apply positional encoding through permutation
        const positionEncoded = vectors.map((vector, index) => {
            // Each position gets a unique permutation
            return vector.permute(index);
        });
        // Bundle all position-encoded vectors
        return HyperVector.bundle(positionEncoded);
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    createSeededVector(seed) {
        const components = new Int8Array(this.dimensions);
        let rand = seed;
        for (let i = 0; i < this.dimensions; i++) {
            rand = (rand * 1664525 + 1013904223) & 0xffffffff;
            components[i] = rand & 1 ? 1 : -1;
        }
        return new HyperVector(this.dimensions, components);
    }
    getModality() {
        return 'text';
    }
}
/**
 * Document structure encoder for Scrivener documents
 */
export class DocumentStructureEncoder extends ModalityEncoder {
    constructor(dimensions = 10000) {
        super(dimensions);
        this.textEncoder = new TextEncoder(dimensions);
    }
    async encode(document) {
        const components = [];
        // Encode title
        if (document.title) {
            const titleResult = await this.textEncoder.encode(document.title);
            // Give title special weight
            components.push(titleResult.vector);
            components.push(titleResult.vector); // Double weight
        }
        // Encode synopsis
        if (document.synopsis) {
            const synopsisResult = await this.textEncoder.encode(document.synopsis);
            components.push(synopsisResult.vector);
        }
        // Encode content
        if (document.content) {
            const contentResult = await this.textEncoder.encode(document.content);
            components.push(contentResult.vector);
        }
        // Encode notes
        if (document.notes) {
            const notesResult = await this.textEncoder.encode(document.notes);
            components.push(notesResult.vector);
        }
        // Encode document type as semantic vector
        const typeVector = this.encodeDocumentType(document.type);
        components.push(typeVector);
        // Bundle all components
        const documentVector = HyperVector.bundle(components);
        return {
            vector: documentVector,
            modality: 'document',
            metadata: {
                documentId: document.id,
                documentType: document.type,
                wordCount: document.wordCount,
                hasChildren: document.children && document.children.length > 0,
            },
        };
    }
    encodeDocumentType(type) {
        // Create consistent vectors for document types
        const seed = this.hashString(`DOCTYPE_${type}`);
        return this.createSeededVector(seed);
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    createSeededVector(seed) {
        const components = new Int8Array(this.dimensions);
        let rand = seed;
        for (let i = 0; i < this.dimensions; i++) {
            rand = (rand * 1664525 + 1013904223) & 0xffffffff;
            components[i] = rand & 1 ? 1 : -1;
        }
        return new HyperVector(this.dimensions, components);
    }
    getModality() {
        return 'document';
    }
}
/**
 * Concept encoder for abstract ideas and relationships
 */
export class ConceptEncoder extends ModalityEncoder {
    constructor() {
        super(...arguments);
        this.conceptVectors = new Map();
    }
    async encode(concept) {
        let baseVector = this.conceptVectors.get(concept.name);
        if (!baseVector) {
            // Create new vector for concept
            const seed = this.hashString(concept.name);
            baseVector = this.createSeededVector(seed);
            this.conceptVectors.set(concept.name, baseVector);
        }
        // If attributes provided, bind them to the base vector
        let conceptVector = baseVector;
        if (concept.attributes) {
            for (const [key, value] of Object.entries(concept.attributes)) {
                const attrVector = this.createAttributeVector(key, value);
                conceptVector = conceptVector.bind(attrVector);
            }
        }
        return {
            vector: conceptVector,
            modality: 'concept',
            metadata: {
                conceptName: concept.name,
                attributeCount: Object.keys(concept.attributes || {}).length,
            },
        };
    }
    createAttributeVector(key, value) {
        const keySeed = this.hashString(`ATTR_KEY_${key}`);
        const valueSeed = this.hashString(`ATTR_VAL_${value}`);
        const keyVector = this.createSeededVector(keySeed);
        const valueVector = this.createSeededVector(valueSeed);
        // Bind key and value
        return keyVector.bind(valueVector);
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    createSeededVector(seed) {
        const components = new Int8Array(this.dimensions);
        let rand = seed;
        for (let i = 0; i < this.dimensions; i++) {
            rand = (rand * 1664525 + 1013904223) & 0xffffffff;
            components[i] = rand & 1 ? 1 : -1;
        }
        return new HyperVector(this.dimensions, components);
    }
    getModality() {
        return 'concept';
    }
}
/**
 * Multi-modal encoder manager
 */
export class MultiModalEncoder {
    constructor(dimensions = 10000) {
        this.encoders = new Map();
        this.dimensions = dimensions;
        // Register default encoders
        this.registerEncoder('text', new TextEncoder(dimensions));
        this.registerEncoder('document', new DocumentStructureEncoder(dimensions));
        this.registerEncoder('concept', new ConceptEncoder(dimensions));
    }
    registerEncoder(modality, encoder) {
        this.encoders.set(modality, encoder);
        logger.info('Encoder registered', { modality });
    }
    async encode(input, modality) {
        const encoder = this.encoders.get(modality);
        if (!encoder) {
            throw new Error(`No encoder registered for modality: ${modality}`);
        }
        return encoder.encode(input);
    }
    /**
     * Encode multiple inputs and bind them into a composite memory
     */
    async encodeComposite(inputs) {
        const vectors = [];
        for (const input of inputs) {
            const result = await this.encode(input.data, input.modality);
            vectors.push(result.vector);
        }
        // Bundle all modality vectors into composite memory
        return HyperVector.bundle(vectors);
    }
    /**
     * Encode temporal sequence of inputs
     */
    async encodeSequence(inputs) {
        // Sort by timestamp if provided
        const sorted = inputs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        const vectors = [];
        for (let i = 0; i < sorted.length; i++) {
            const result = await this.encode(sorted[i].data, sorted[i].modality);
            // Apply temporal encoding through permutation
            const temporalVector = result.vector.permute(i * 100);
            vectors.push(temporalVector);
        }
        return HyperVector.bundle(vectors);
    }
    getRegisteredModalities() {
        return Array.from(this.encoders.keys());
    }
}
//# sourceMappingURL=multimodal-encoder.js.map