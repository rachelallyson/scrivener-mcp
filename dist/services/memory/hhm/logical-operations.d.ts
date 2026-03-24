/**
 * Logical Operations for HHM
 * Implements reasoning through vector arithmetic
 */
import { HyperVector } from './hypervector.js';
export interface LogicalResult {
    vector: HyperVector;
    operation: string;
    confidence: number;
    metadata?: Record<string, unknown>;
}
export declare class LogicalOperations {
    private dimensions;
    private similarityThreshold;
    constructor(dimensions?: number, similarityThreshold?: number);
    /**
     * Negation: NOT A
     */
    negate(concept: HyperVector): LogicalResult;
    /**
     * Conjunction: A AND B
     */
    and(concepts: HyperVector[]): LogicalResult;
    /**
     * Disjunction: A OR B
     * Implemented as a weighted bundle with lower threshold
     */
    or(concepts: HyperVector[]): LogicalResult;
    /**
     * Implication: A → B (If A then B)
     */
    implies(antecedent: HyperVector, consequent: HyperVector): LogicalResult;
    /**
     * Causality: A causes B
     */
    causes(cause: HyperVector, effect: HyperVector): LogicalResult;
    /**
     * Extract effect from causal relationship
     */
    extractEffect(causalVector: HyperVector, cause: HyperVector): LogicalResult;
    /**
     * Temporal before: A before B
     */
    before(first: HyperVector, second: HyperVector): LogicalResult;
    /**
     * Temporal after: A after B
     */
    after(first: HyperVector, second: HyperVector): LogicalResult;
    /**
     * Location: A at B
     */
    at(entity: HyperVector, location: HyperVector): LogicalResult;
    /**
     * Extract location from spatial relationship
     */
    extractLocation(spatialVector: HyperVector, entity: HyperVector): LogicalResult;
    /**
     * Possession: A has B
     */
    has(owner: HyperVector, object: HyperVector): LogicalResult;
    /**
     * Identity: A is B
     */
    is(subject: HyperVector, predicate: HyperVector): LogicalResult;
    /**
     * Similarity: A like B
     */
    like(first: HyperVector, second: HyperVector): LogicalResult;
    /**
     * Check if a vector satisfies a logical condition
     */
    satisfies(vector: HyperVector, condition: HyperVector): boolean;
    /**
     * Perform logical inference
     * Given premises, derive conclusion
     */
    infer(premises: HyperVector[], rules: HyperVector[]): LogicalResult;
    /**
     * Analogical reasoning: A is to B as C is to ?
     */
    analogy(a: HyperVector, b: HyperVector, c: HyperVector): LogicalResult;
    /**
     * Compose multiple logical operations
     */
    compose(operations: Array<{
        op: string;
        args: HyperVector[];
    }>): LogicalResult;
    /**
     * Test logical consistency of a set of statements
     */
    checkConsistency(statements: HyperVector[]): {
        consistent: boolean;
        confidence: number;
        conflicts?: Array<{
            i: number;
            j: number;
            similarity: number;
        }>;
    };
}
//# sourceMappingURL=logical-operations.d.ts.map