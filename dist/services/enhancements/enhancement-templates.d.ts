export interface EnhancementTemplate {
    name: string;
    description: string;
    systemPrompt: string;
    userPromptTemplate: string;
    parameters: string[];
    qualityChecks: string[];
}
export declare class EnhancementTemplates {
    private static templates;
    static getTemplate(name: string): EnhancementTemplate | undefined;
    static getAllTemplates(): Map<string, EnhancementTemplate>;
    static hasTemplate(name: string): boolean;
    static getTemplateNames(): string[];
    static formatTemplate(templateName: string, parameters: Record<string, string>): {
        systemPrompt: string;
        userPrompt: string;
    } | null;
    static validateParameters(templateName: string, parameters: Record<string, string>): {
        valid: boolean;
        missing: string[];
        extra: string[];
    };
}
//# sourceMappingURL=enhancement-templates.d.ts.map