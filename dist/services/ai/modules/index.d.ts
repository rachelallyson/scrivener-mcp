export interface DocumentProcessor {
    chunkDocument(content: string, options?: any): Promise<any[]>;
    processDocuments(documents: any[]): Promise<any[]>;
}
export interface ConversationManager {
    maintainContext(conversationId: string): Promise<void>;
    getConversationHistory(conversationId: string): Promise<any[]>;
}
export interface EmbeddingService {
    generateEmbeddings(text: string): Promise<number[]>;
    similarity(embedding1: number[], embedding2: number[]): number;
}
//# sourceMappingURL=index.d.ts.map