/**
 * Database-specific utility functions
 * Helpers for SQLite, Neo4j, and general database operations
 */
import { ApplicationError as AppError } from '../core/errors.js';
import type { QueryResult, Record as Neo4jRecord } from 'neo4j-driver';
import type Database from 'better-sqlite3';
/**
 * Database error types
 */
export declare enum DatabaseErrorType {
    CONNECTION = "CONNECTION",
    TRANSACTION = "TRANSACTION",
    CONSTRAINT = "CONSTRAINT",
    TIMEOUT = "TIMEOUT",
    LOCK = "LOCK",
    SYNTAX = "SYNTAX",
    UNKNOWN = "UNKNOWN"
}
/**
 * Classify database error
 */
export declare function classifyDatabaseError(error: unknown): DatabaseErrorType;
/**
 * Check if error is transient and should be retried
 */
export declare function isTransientDatabaseError(error: unknown): boolean;
/**
 * Convert database error to AppError
 */
export declare function toDatabaseError(error: unknown, context?: string): AppError;
/**
 * Extract single value from Neo4j result
 */
export declare function extractSingleValue<T = unknown>(result: QueryResult, key: string): T | null;
/**
 * Extract values from Neo4j result
 */
export declare function extractValues<T = unknown>(result: QueryResult, key: string): T[];
/**
 * Map Neo4j records to objects
 */
export declare function mapNeo4jRecords<T>(result: QueryResult, mapper: (record: Neo4jRecord) => T): T[];
/**
 * Convert Neo4j node to plain object
 */
export declare function nodeToObject(node: unknown): Record<string, unknown>;
/**
 * Build Cypher parameter object with null handling
 */
export declare function buildCypherParams(params: Record<string, unknown>): Record<string, unknown>;
/**
 * Build parameterized SQL query
 */
export interface SqlQuery {
    sql: string;
    params: unknown[];
}
/**
 * Build INSERT query
 */
export declare function buildInsertQuery(table: string, data: Record<string, unknown>, onConflict?: 'REPLACE' | 'IGNORE' | 'UPDATE'): SqlQuery;
/**
 * Build UPDATE query
 */
export declare function buildUpdateQuery(table: string, data: Record<string, unknown>, where: Record<string, unknown>): SqlQuery;
/**
 * Build SELECT query with filters
 */
export declare function buildSelectQuery(table: string, filters?: Record<string, unknown>, options?: {
    columns?: string[];
    orderBy?: string;
    limit?: number;
    offset?: number;
}): SqlQuery;
/**
 * Escape SQL identifier (table/column name)
 */
export declare function escapeIdentifier(identifier: string): string;
/**
 * Transaction wrapper for SQLite
 */
export declare function withSqliteTransaction<T>(db: Database.Database, fn: () => Promise<T>): Promise<T>;
/**
 * Batch insert for SQLite
 */
export declare function batchInsert(db: Database.Database, table: string, items: Record<string, unknown>[], batchSize?: number): void;
/**
 * Parse database connection string
 */
export declare function parseConnectionString(connectionString: string): {
    protocol: string;
    host: string;
    port: number;
    database?: string;
    username?: string;
    password?: string;
};
/**
 * Build connection string from parts
 */
export declare function buildConnectionString(parts: {
    protocol: string;
    host: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
}): string;
/**
 * Paginate results
 */
export declare function paginate<T>(items: T[], page: number, pageSize: number): {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
/**
 * Convert database rows to nested structure
 */
export declare function rowsToNested<T extends Record<string, unknown>>(rows: T[], parentKey: string, childKey: string, childrenProp?: string): T[];
declare const _default: {
    DatabaseErrorType: typeof DatabaseErrorType;
    classifyDatabaseError: typeof classifyDatabaseError;
    isTransientDatabaseError: typeof isTransientDatabaseError;
    toDatabaseError: typeof toDatabaseError;
    extractSingleValue: typeof extractSingleValue;
    extractValues: typeof extractValues;
    mapNeo4jRecords: typeof mapNeo4jRecords;
    nodeToObject: typeof nodeToObject;
    buildCypherParams: typeof buildCypherParams;
    buildInsertQuery: typeof buildInsertQuery;
    buildUpdateQuery: typeof buildUpdateQuery;
    buildSelectQuery: typeof buildSelectQuery;
    escapeIdentifier: typeof escapeIdentifier;
    withSqliteTransaction: typeof withSqliteTransaction;
    batchInsert: typeof batchInsert;
    parseConnectionString: typeof parseConnectionString;
    buildConnectionString: typeof buildConnectionString;
    paginate: typeof paginate;
    rowsToNested: typeof rowsToNested;
};
export default _default;
//# sourceMappingURL=database.d.ts.map