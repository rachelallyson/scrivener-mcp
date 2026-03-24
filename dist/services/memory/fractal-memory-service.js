/**
 * Fractal Memory Service
 * Integrates Python fractal memory system with TypeScript MCP handlers
 */
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from '../../core/logger.js';
// Dynamic import for sqlite3 to avoid compilation issues
let sqlite3;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sqlite3 = require('sqlite3');
}
catch (error) {
    // Use logger after it's initialized
    getLogger('fractal-memory').warn('sqlite3 not available, some features will be limited', {
        error: error.message,
    });
}
const logger = getLogger('fractal-memory');
export class FractalMemoryService {
    constructor(dbPath) {
        this.db = null;
        this.pythonProcess = null;
        this.initialized = false;
        this.dbPath = dbPath || path.join(process.cwd(), 'narrative_memory.db');
        this.pythonScriptPath = path.join(process.cwd(), 'fractal_memory_advanced.py');
    }
    /**
     * Initialize the fractal memory service
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            // Initialize SQLite database
            await this.initializeDatabase();
            // Verify Python script exists
            const fs = await import('fs');
            if (!fs.existsSync(this.pythonScriptPath)) {
                logger.warn('Python fractal memory script not found, some features will be limited');
            }
            this.initialized = true;
            logger.info('Fractal memory service initialized');
        }
        catch (error) {
            logger.error('Failed to initialize fractal memory service', { error });
            throw error;
        }
    }
    /**
     * Initialize SQLite database
     */
    async initializeDatabase() {
        if (!sqlite3) {
            logger.warn('SQLite not available, database features disabled');
            return;
        }
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Read and execute schema
                // fs is already imported at the top
                const schemaPath = path.join(__dirname, 'schema.sql');
                if (fs.existsSync(schemaPath)) {
                    const schema = fs.readFileSync(schemaPath, 'utf-8');
                    this.db.exec(schema, (err) => {
                        if (err) {
                            logger.error('Failed to execute schema', { error: err });
                            reject(err);
                        }
                        else {
                            logger.info('Database schema initialized');
                            resolve();
                        }
                    });
                }
                else {
                    // Schema file not found, continue without it
                    logger.warn('Schema file not found, database may need manual setup');
                    resolve();
                }
            });
        });
    }
    /**
     * Ingest text into fractal memory system
     */
    async ingestText(text, chapterId, options) {
        try {
            // Call Python script for ingestion
            const result = await this.callPythonScript('ingest', {
                text,
                chapterId,
                ...options,
            });
            if (result.error) {
                throw new Error(`Ingestion failed: ${result.error}`);
            }
            logger.info('Text ingested successfully', {
                chapterId,
                segments: result.segmentCount,
                entities: result.entityCount,
                motifs: result.motifCount,
            });
        }
        catch (error) {
            logger.error('Failed to ingest text', { error });
            throw error;
        }
    }
    /**
     * Search using fractal retrieval
     */
    async search(query, options) {
        try {
            // Try Python implementation first
            const result = await this.callPythonScript('search', {
                query,
                ...options,
            });
            if (result.error) {
                // Fallback to TypeScript implementation
                return this.searchFallback(query, options);
            }
            return result.results;
        }
        catch (error) {
            logger.error('Search failed', { error });
            // Fallback to TypeScript implementation
            return this.searchFallback(query, options);
        }
    }
    /**
     * Fallback search implementation in TypeScript
     */
    async searchFallback(query, options) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const policy = options?.policy || 'scene-fix';
            const limit = options?.k || 10;
            // Simple text search as fallback
            const sql = `
                SELECT 
                    s.id, s.scale, s.text, s.chapter_id as chapterId,
                    s.start_pos as startPos, s.end_pos as endPos,
                    s.parent_id as parentId, s.sequence_num as sequenceNum
                FROM segments s
                WHERE s.text LIKE ?
                ${options?.chapterId ? 'AND s.chapter_id = ?' : ''}
                ORDER BY 
                    CASE s.scale 
                        WHEN 'micro' THEN ${policy === 'line-fix' ? 1 : 3}
                        WHEN 'meso' THEN 2
                        WHEN 'macro' THEN ${policy === 'thematic' ? 1 : 3}
                    END,
                    s.sequence_num
                LIMIT ?
            `;
            const params = [`%${query}%`];
            if (options?.chapterId) {
                params.push(options.chapterId);
            }
            params.push(limit.toString());
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const results = rows.map((row) => ({
                    segments: [row],
                    score: 1.0, // Simple scoring
                    metadata: { policy, fallback: true },
                }));
                resolve(results);
            });
        });
    }
    /**
     * Find co-occurrences of entities/motifs
     */
    async findCoOccurrences(items, options) {
        try {
            const result = await this.callPythonScript('cooccurrences', {
                items,
                ...options,
            });
            if (result.error) {
                throw new Error(`Co-occurrence search failed: ${result.error}`);
            }
            return result.cooccurrences;
        }
        catch (error) {
            logger.error('Failed to find co-occurrences', { error });
            throw error;
        }
    }
    /**
     * Check character continuity
     */
    async checkContinuity(characterName, options) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const sql = `
                SELECT 
                    character_name,
                    chapter_id,
                    scale,
                    appearance_count,
                    first_appearance_seq,
                    last_appearance_seq,
                    segment_ids
                FROM character_continuity
                WHERE character_name = ?
                ${options?.chapterId ? 'AND chapter_id = ?' : ''}
                ORDER BY chapter_id, scale
            `;
            const params = [characterName];
            if (options?.chapterId) {
                params.push(options.chapterId);
            }
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    character: characterName,
                    continuity: rows,
                    gaps: this.identifyContinuityGaps(rows),
                });
            });
        });
    }
    /**
     * Identify gaps in character continuity
     */
    identifyContinuityGaps(appearances) {
        const gaps = [];
        for (let i = 1; i < appearances.length; i++) {
            const prev = appearances[i - 1];
            const curr = appearances[i];
            if (curr.first_appearance_seq - prev.last_appearance_seq > 10) {
                gaps.push({
                    from: prev,
                    to: curr,
                    gapSize: curr.first_appearance_seq - prev.last_appearance_seq,
                });
            }
        }
        return gaps;
    }
    /**
     * Track motif patterns
     */
    async trackMotifs(options) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            let sql = `
                SELECT 
                    motif_name,
                    pattern_type,
                    chapter_id,
                    occurrence_count,
                    avg_strength,
                    segment_ids
                FROM motif_tracking
                WHERE 1=1
            `;
            const params = [];
            if (options?.chapterId) {
                sql += ' AND chapter_id = ?';
                params.push(options.chapterId);
            }
            if (options?.minStrength) {
                sql += ' AND avg_strength >= ?';
                params.push(options.minStrength);
            }
            if (options?.patternType) {
                sql += ' AND pattern_type = ?';
                params.push(options.patternType);
            }
            sql += ' ORDER BY avg_strength DESC, occurrence_count DESC';
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
    /**
     * Update retrieval policy
     */
    async updatePolicy(name, policy) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const sql = `
                UPDATE memory_policies
                SET 
                    scale_weights = ?,
                    entity_boost = ?,
                    motif_boost = ?,
                    recency_weight = ?,
                    frequency_weight = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE name = ?
            `;
            const params = [
                JSON.stringify(policy.scaleWeights),
                policy.entityBoost || 1.0,
                policy.motifBoost || 1.0,
                policy.recencyWeight || 0.1,
                policy.frequencyWeight || 0.1,
                name,
            ];
            this.db.run(sql, params, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    /**
     * Call Python script for advanced operations
     */
    async callPythonScript(operation, params) {
        return new Promise((resolve, reject) => {
            // fs is already imported at the top
            // Check if Python script exists
            if (!fs.existsSync(this.pythonScriptPath)) {
                resolve({ error: 'Python script not available' });
                return;
            }
            const args = [
                this.pythonScriptPath,
                '--operation',
                operation,
                '--params',
                JSON.stringify(params),
                '--db',
                this.dbPath,
            ];
            const python = spawn('python3', args);
            let output = '';
            let error = '';
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            python.stderr.on('data', (data) => {
                error += data.toString();
            });
            python.on('close', (code) => {
                if (code !== 0) {
                    logger.error('Python script failed', { code, error });
                    resolve({ error: error || 'Python script failed' });
                }
                else {
                    try {
                        const result = JSON.parse(output);
                        resolve(result);
                    }
                    catch (e) {
                        logger.error('Failed to parse Python output', { output, error: e });
                        resolve({ error: 'Invalid Python output' });
                    }
                }
            });
            python.on('error', (err) => {
                logger.error('Failed to spawn Python process', { error: err });
                resolve({ error: 'Failed to spawn Python process' });
            });
            // Set timeout
            setTimeout(() => {
                python.kill();
                resolve({ error: 'Python script timeout' });
            }, 30000); // 30 second timeout
        });
    }
    /**
     * Get analytics and performance metrics
     */
    async getAnalytics(options) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const sql = `
                SELECT 
                    COUNT(*) as total_queries,
                    AVG(latency_ms) as avg_latency,
                    AVG(results_count) as avg_results,
                    AVG(relevance_score) as avg_relevance,
                    policy,
                    COUNT(CASE WHEN user_feedback = 'positive' THEN 1 END) as positive_feedback,
                    COUNT(CASE WHEN user_feedback = 'negative' THEN 1 END) as negative_feedback
                FROM retrieval_analytics
                WHERE created_at BETWEEN ? AND ?
                GROUP BY policy
                ORDER BY total_queries DESC
                LIMIT ?
            `;
            const params = [
                options?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                options?.endDate || new Date(),
                options?.limit || 10,
            ];
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    metrics: rows,
                    summary: this.summarizeAnalytics(rows),
                });
            });
        });
    }
    /**
     * Summarize analytics
     */
    summarizeAnalytics(metrics) {
        const totalQueries = metrics.reduce((sum, m) => sum + Number(m.total_queries || 0), 0);
        const avgLatency = metrics.reduce((sum, m) => sum + Number(m.avg_latency || 0) * Number(m.total_queries || 0), 0) / totalQueries;
        const avgRelevance = metrics.reduce((sum, m) => sum + Number(m.avg_relevance || 0) * Number(m.total_queries || 0), 0) / totalQueries;
        return {
            totalQueries,
            avgLatency,
            avgRelevance,
            mostUsedPolicy: metrics[0]?.policy,
            satisfactionRate: metrics.reduce((sum, m) => sum +
                Number(m.positive_feedback || 0) /
                    (Number(m.positive_feedback || 0) + Number(m.negative_feedback || 0) ||
                        1), 0) / metrics.length,
        };
    }
    /**
     * Clean up resources
     */
    async cleanup() {
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
        }
        if (this.db) {
            await new Promise((resolve) => {
                this.db.close((err) => {
                    if (err) {
                        logger.error('Error closing database', { error: err });
                    }
                    resolve();
                });
            });
            this.db = null;
        }
        this.initialized = false;
    }
}
//# sourceMappingURL=fractal-memory-service.js.map