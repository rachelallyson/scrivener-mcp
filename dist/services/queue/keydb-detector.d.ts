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
 * Detect available KeyDB/Redis connection
 */
export declare function detectConnection(): Promise<ConnectionInfo>;
/**
 * Create optimized connection for BullMQ
 */
export declare function createBullMQConnection(url: string): Redis;
//# sourceMappingURL=keydb-detector.d.ts.map