/**
 * KeyDB/Redis connection detector and manager
 */
import { Redis } from 'ioredis';
export interface ConnectionInfo {
    type: 'keydb' | 'redis' | 'none';
    url: string | null;
    isAvailable: boolean;
    version?: string;
}
/**
 * Detect available KeyDB/Redis connection.
 *
 * Redis/KeyDB probing is disabled: the server runs without a Redis dependency
 * and uses the embedded in-memory queue instead. Attempting to connect to
 * localhost:6379 (or any other URL) when no Redis is present causes BullMQ
 * workers to spam "Command timed out" errors every ~2 seconds.
 */
export declare function detectConnection(): Promise<ConnectionInfo>;
/**
 * Create optimized connection for BullMQ
 */
export declare function createBullMQConnection(url: string): Redis;
//# sourceMappingURL=keydb-detector.d.ts.map