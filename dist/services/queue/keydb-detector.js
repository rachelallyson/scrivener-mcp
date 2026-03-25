/**
 * KeyDB/Redis connection detector and manager
 */
import { Redis } from 'ioredis';
import { getLogger } from '../../core/logger.js';
const logger = getLogger('keydb-detector');
/**
 * Detect available KeyDB/Redis connection.
 *
 * Redis/KeyDB probing is disabled: the server runs without a Redis dependency
 * and uses the embedded in-memory queue instead. Attempting to connect to
 * localhost:6379 (or any other URL) when no Redis is present causes BullMQ
 * workers to spam "Command timed out" errors every ~2 seconds.
 */
export async function detectConnection() {
    logger.debug('Redis/KeyDB detection disabled — using embedded queue');
    return {
        type: 'none',
        url: null,
        isAvailable: false,
    };
}
/**
 * Create optimized connection for BullMQ
 */
export function createBullMQConnection(url) {
    const client = new Redis(url, {
        maxRetriesPerRequest: null, // Required for BullMQ
        enableReadyCheck: false,
        // KeyDB optimizations
        enableOfflineQueue: true,
        connectTimeout: 5000,
        disconnectTimeout: 2000,
        commandTimeout: 5000,
        keepAlive: 30000,
    });
    client.on('connect', () => {
        logger.debug('Connected to KeyDB/Redis for job queue');
    });
    client.on('error', (error) => {
        logger.error('KeyDB/Redis connection error', { error });
    });
    return client;
}
//# sourceMappingURL=keydb-detector.js.map