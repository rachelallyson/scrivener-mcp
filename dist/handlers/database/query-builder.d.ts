/**
 * SQL and Cypher query builders
 */
import type { PaginationParams, QueryParameters } from '../../types/database.js';
/**
 * SQL Query Builder
 */
export declare class SQLQueryBuilder {
    private selectClause;
    private fromClause;
    private joinClauses;
    private whereConditions;
    private groupByClause;
    private havingClause;
    private orderByClause;
    private limitClause;
    private params;
    select(columns: string | string[]): this;
    from(table: string): this;
    join(table: string, on: string): this;
    leftJoin(table: string, on: string): this;
    where(condition: string, value?: unknown): this;
    whereIn(column: string, values: unknown[]): this;
    whereNull(column: string): this;
    whereNotNull(column: string): this;
    groupBy(columns: string | string[]): this;
    having(condition: string): this;
    orderBy(column: string, direction?: 'ASC' | 'DESC'): this;
    limit(limit: number, offset?: number): this;
    paginate(params: PaginationParams): this;
    build(): {
        sql: string;
        params: unknown[];
    };
    static insert(table: string, data: Record<string, unknown>): {
        sql: string;
        params: unknown[];
    };
    static update(table: string, data: Record<string, unknown>, where: Record<string, unknown>): {
        sql: string;
        params: unknown[];
    };
    static delete(table: string, where: Record<string, unknown>): {
        sql: string;
        params: unknown[];
    };
}
/**
 * Cypher Query Builder
 */
export declare class CypherQueryBuilder {
    private matchClauses;
    private whereClauses;
    private createClauses;
    private mergeClauses;
    private setClauses;
    private deleteClauses;
    private returnClause;
    private orderByClause;
    private limitClause;
    private queryParams;
    match(pattern: string): this;
    optionalMatch(pattern: string): this;
    where(condition: string): this;
    create(pattern: string): this;
    merge(pattern: string): this;
    set(assignments: string | string[]): this;
    delete(variables: string | string[]): this;
    return(expression: string): this;
    orderBy(expression: string, direction?: 'ASC' | 'DESC'): this;
    limit(limit: number, skip?: number): this;
    param(name: string, value: string | number | boolean | null | string[] | number[]): this;
    params(params: QueryParameters): this;
    build(): {
        cypher: string;
        params: QueryParameters;
    };
    static findNode(label: string, props: QueryParameters): {
        cypher: string;
        params: QueryParameters;
    };
    static createRelationship(fromLabel: string, fromId: string, toLabel: string, toId: string, relType: string, relProps?: Record<string, unknown>): {
        cypher: string;
        params: QueryParameters;
    };
}
//# sourceMappingURL=query-builder.d.ts.map