/**
 * SQL and Cypher query builders
 */
import { createError, ErrorCode } from '../../core/errors.js';
/**
 * SQL Query Builder
 */
export class SQLQueryBuilder {
    constructor() {
        this.selectClause = '*';
        this.fromClause = '';
        this.joinClauses = [];
        this.whereConditions = [];
        this.groupByClause = '';
        this.havingClause = '';
        this.orderByClause = '';
        this.limitClause = '';
        this.params = [];
    }
    select(columns) {
        this.selectClause = Array.isArray(columns) ? columns.join(', ') : columns;
        return this;
    }
    from(table) {
        this.fromClause = table;
        return this;
    }
    join(table, on) {
        this.joinClauses.push(`JOIN ${table} ON ${on}`);
        return this;
    }
    leftJoin(table, on) {
        this.joinClauses.push(`LEFT JOIN ${table} ON ${on}`);
        return this;
    }
    where(condition, value) {
        if (value !== undefined) {
            this.whereConditions.push(condition);
            this.params.push(value);
        }
        else {
            this.whereConditions.push(condition);
        }
        return this;
    }
    whereIn(column, values) {
        if (values.length === 0)
            return this;
        const placeholders = values.map(() => '?').join(', ');
        this.whereConditions.push(`${column} IN (${placeholders})`);
        this.params.push(...values);
        return this;
    }
    whereNull(column) {
        this.whereConditions.push(`${column} IS NULL`);
        return this;
    }
    whereNotNull(column) {
        this.whereConditions.push(`${column} IS NOT NULL`);
        return this;
    }
    groupBy(columns) {
        this.groupByClause = Array.isArray(columns) ? columns.join(', ') : columns;
        return this;
    }
    having(condition) {
        this.havingClause = condition;
        return this;
    }
    orderBy(column, direction = 'ASC') {
        this.orderByClause = `${column} ${direction}`;
        return this;
    }
    limit(limit, offset) {
        this.limitClause = `LIMIT ${limit}`;
        if (offset !== undefined) {
            this.limitClause += ` OFFSET ${offset}`;
        }
        return this;
    }
    paginate(params) {
        if (params.orderBy) {
            this.orderBy(params.orderBy, params.orderDirection || 'ASC');
        }
        if (params.page && params.pageSize) {
            const offset = (params.page - 1) * params.pageSize;
            this.limit(params.pageSize, offset);
        }
        return this;
    }
    build() {
        if (!this.fromClause) {
            throw createError(ErrorCode.INVALID_INPUT, null, 'FROM clause is required');
        }
        let sql = `SELECT ${this.selectClause} FROM ${this.fromClause}`;
        if (this.joinClauses.length > 0) {
            sql += ` ${this.joinClauses.join(' ')}`;
        }
        if (this.whereConditions.length > 0) {
            sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
        }
        if (this.groupByClause) {
            sql += ` GROUP BY ${this.groupByClause}`;
        }
        if (this.havingClause) {
            sql += ` HAVING ${this.havingClause}`;
        }
        if (this.orderByClause) {
            sql += ` ORDER BY ${this.orderByClause}`;
        }
        if (this.limitClause) {
            sql += ` ${this.limitClause}`;
        }
        return { sql, params: this.params };
    }
    // Convenience methods
    static insert(table, data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        return { sql, params: values };
    }
    static update(table, data, where) {
        const setClauses = Object.keys(data).map((key) => `${key} = ?`);
        const whereClauses = Object.keys(where).map((key) => `${key} = ?`);
        const sql = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`;
        const params = [...Object.values(data), ...Object.values(where)];
        return { sql, params };
    }
    static delete(table, where) {
        const whereClauses = Object.keys(where).map((key) => `${key} = ?`);
        const sql = `DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')}`;
        const params = Object.values(where);
        return { sql, params };
    }
}
/**
 * Cypher Query Builder
 */
export class CypherQueryBuilder {
    constructor() {
        this.matchClauses = [];
        this.whereClauses = [];
        this.createClauses = [];
        this.mergeClauses = [];
        this.setClauses = [];
        this.deleteClauses = [];
        this.returnClause = '';
        this.orderByClause = '';
        this.limitClause = '';
        this.queryParams = {};
    }
    match(pattern) {
        this.matchClauses.push(`MATCH ${pattern}`);
        return this;
    }
    optionalMatch(pattern) {
        this.matchClauses.push(`OPTIONAL MATCH ${pattern}`);
        return this;
    }
    where(condition) {
        this.whereClauses.push(condition);
        return this;
    }
    create(pattern) {
        this.createClauses.push(`CREATE ${pattern}`);
        return this;
    }
    merge(pattern) {
        this.mergeClauses.push(`MERGE ${pattern}`);
        return this;
    }
    set(assignments) {
        const items = Array.isArray(assignments) ? assignments : [assignments];
        this.setClauses.push(...items);
        return this;
    }
    delete(variables) {
        const items = Array.isArray(variables) ? variables : [variables];
        this.deleteClauses.push(...items);
        return this;
    }
    return(expression) {
        this.returnClause = expression;
        return this;
    }
    orderBy(expression, direction = 'ASC') {
        this.orderByClause = `${expression} ${direction}`;
        return this;
    }
    limit(limit, skip) {
        if (skip !== undefined) {
            this.limitClause = `SKIP ${skip} LIMIT ${limit}`;
        }
        else {
            this.limitClause = `LIMIT ${limit}`;
        }
        return this;
    }
    param(name, value) {
        this.queryParams[name] = value;
        return this;
    }
    params(params) {
        Object.assign(this.queryParams, params);
        return this;
    }
    build() {
        const clauses = [];
        if (this.matchClauses.length > 0) {
            clauses.push(...this.matchClauses);
        }
        if (this.whereClauses.length > 0) {
            clauses.push(`WHERE ${this.whereClauses.join(' AND ')}`);
        }
        if (this.createClauses.length > 0) {
            clauses.push(...this.createClauses);
        }
        if (this.mergeClauses.length > 0) {
            clauses.push(...this.mergeClauses);
        }
        if (this.setClauses.length > 0) {
            clauses.push(`SET ${this.setClauses.join(', ')}`);
        }
        if (this.deleteClauses.length > 0) {
            clauses.push(`DELETE ${this.deleteClauses.join(', ')}`);
        }
        if (this.returnClause) {
            clauses.push(`RETURN ${this.returnClause}`);
            if (this.orderByClause) {
                clauses.push(`ORDER BY ${this.orderByClause}`);
            }
            if (this.limitClause) {
                clauses.push(this.limitClause);
            }
        }
        const cypher = clauses.join('\n');
        return { cypher, params: this.queryParams };
    }
    // Convenience methods
    static findNode(label, props) {
        const builder = new CypherQueryBuilder();
        const propString = Object.keys(props)
            .map((key) => `${key}: $${key}`)
            .join(', ');
        return builder.match(`(n:${label} {${propString}})`).return('n').params(props).build();
    }
    static createRelationship(fromLabel, fromId, toLabel, toId, relType, relProps) {
        const builder = new CypherQueryBuilder();
        builder
            .match(`(from:${fromLabel} {id: $fromId})`)
            .match(`(to:${toLabel} {id: $toId})`)
            .param('fromId', fromId)
            .param('toId', toId);
        let relPattern = `(from)-[r:${relType}]->(to)`;
        if (relProps) {
            const propString = Object.keys(relProps)
                .map((key) => `${key}: $rel_${key}`)
                .join(', ');
            relPattern = `(from)-[r:${relType} {${propString}}]->(to)`;
            for (const [key, value] of Object.entries(relProps)) {
                builder.param(`rel_${key}`, value);
            }
        }
        return builder.merge(relPattern).return('r').build();
    }
}
//# sourceMappingURL=query-builder.js.map