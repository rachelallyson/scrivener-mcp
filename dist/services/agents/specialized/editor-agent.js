import { SpecializedAgent } from './base-agent.js';
export class EditorAgent extends SpecializedAgent {
    constructor(langchain, advanced) {
        const persona = {
            name: 'Editor',
            role: 'Professional Editor and Proofreader',
            perspective: 'I focus on clarity, coherence, grammar, style consistency, and overall readability. I evaluate content for publication readiness and audience accessibility.',
            expertise: ['grammar and syntax', 'style consistency', 'clarity and coherence', 'proofreading', 'publication standards', 'audience considerations'],
            personality: 'Meticulous, detail-oriented, focused on precision and clarity',
            focusAreas: ['grammar and punctuation', 'sentence structure', 'consistency', 'clarity', 'readability', 'style adherence'],
            communicationStyle: 'Precise and constructive, focuses on concrete improvements',
            biases: ['may prioritize correctness over creativity', 'might be overly focused on minor details'],
            strengths: ['excellent attention to detail', 'strong grasp of language mechanics', 'clarity enhancement'],
            limitations: ['may miss creative opportunities', 'could be too rigid about rules'],
        };
        super(langchain, advanced, persona);
    }
    async analyze(document, styleGuide) {
        const prompt = `
Analyze this document from a professional editing perspective. Focus on:

1. **Grammar and Syntax**: Are there grammatical errors, awkward constructions, or syntax issues?
2. **Style Consistency**: Is the writing style consistent throughout? Does it follow any style guide?
3. **Clarity and Coherence**: Are ideas clearly expressed and logically connected?
4. **Readability**: Is the text accessible to the intended audience?
5. **Structure and Organization**: Is the content well-organized and easy to follow?
6. **Publication Readiness**: What needs to be addressed before publication?

Identify specific errors, inconsistencies, and areas needing improvement with examples.
		`;
        return this.generateAnalysis(document, prompt, styleGuide);
    }
    async providePerspective(document, question, context, styleGuide) {
        const prompt = `
As a professional editor, please address this question about the document:

**Question**: ${question}
${context ? `**Additional Context**: ${context}` : ''}

Consider the document from an editorial perspective:
- How does this affect clarity and readability?
- What are the implications for consistency and style?
- How might this impact the reader's experience?
- What editorial standards should be applied?

Provide specific, actionable editing guidance that improves the text's quality and accessibility.
		`;
        const response = await this.langchain.generateWithFallback(prompt);
        return response;
    }
    async critique(analysis, document) {
        const prompt = `
Review this analysis from a professional editing perspective:

**Original Analysis**:
Agent: ${analysis.agentId}
Overall Score: ${analysis.overallScore}
Priority: ${analysis.priority}
Findings: ${analysis.findings.map(f => `${f.aspect}: ${f.assessment}`).join('; ')}

**Document Context**: ${document.title} (${(document.content || '').split(' ').length} words)

As a professional editor, provide constructive critique:
1. Does this analysis adequately address grammar, style, and clarity issues?
2. Are there important editing concerns that were overlooked?
3. Are the suggestions practical and implementable?
4. How could this analysis better serve publication readiness?

Focus on editorial quality and reader accessibility.
		`;
        const response = await this.langchain.generateWithFallback(prompt);
        return response;
    }
}
//# sourceMappingURL=editor-agent.js.map