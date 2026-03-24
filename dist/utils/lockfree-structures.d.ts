/**
 * Lock-Free Concurrent Data Structures
 * Implements high-performance concurrent data structures without locks
 * for maximum scalability in multi-threaded text processing
 */
/**
 * Lock-free queue using Compare-And-Swap (CAS) operations
 * Provides O(1) enqueue and dequeue with atomic operations
 */
export declare class LockFreeQueue<T> {
    private head;
    private tail;
    private size;
    constructor();
    /**
     * Lock-free enqueue operation
     */
    enqueue(value: T): void;
    /**
     * Lock-free dequeue operation
     */
    dequeue(): T | null;
    /**
     * Get current size (approximate due to concurrent access)
     */
    getSize(): number;
    /**
     * Check if queue is empty
     */
    isEmpty(): boolean;
    /**
     * Atomic compare-and-swap operation simulation for node references
     */
    private compareAndSwapNode;
    /**
     * Atomic compare-and-swap operation simulation for queue fields
     */
    private compareAndSwapField;
    /**
     * Atomic increment operation
     */
    private atomicIncrement;
    /**
     * Atomic decrement operation
     */
    private atomicDecrement;
}
/**
 * Lock-free stack for LIFO operations
 * Uses atomic pointer manipulation for thread safety
 */
export declare class LockFreeStack<T> {
    private top;
    private size;
    /**
     * Lock-free push operation
     */
    push(value: T): void;
    /**
     * Lock-free pop operation
     */
    pop(): T | null;
    /**
     * Peek at top element without removing it
     */
    peek(): T | null;
    /**
     * Get current size (approximate)
     */
    getSize(): number;
    /**
     * Check if stack is empty
     */
    isEmpty(): boolean;
    private compareAndSwapTop;
    private atomicIncrement;
    private atomicDecrement;
}
/**
 * Lock-free hash map using linear probing and atomic operations
 * Provides concurrent read/write access without locks
 */
export declare class LockFreeHashMap<K, V> {
    private buckets;
    private capacity;
    private size;
    private readonly loadFactorThreshold;
    constructor(initialCapacity?: number);
    /**
     * Lock-free get operation
     */
    get(key: K): V | undefined;
    /**
     * Lock-free set operation
     */
    set(key: K, value: V): boolean;
    /**
     * Lock-free delete operation
     */
    delete(key: K): boolean;
    /**
     * Get current size
     */
    getSize(): number;
    /**
     * Check if map is empty
     */
    isEmpty(): boolean;
    /**
     * Get all keys (snapshot)
     */
    keys(): K[];
    /**
     * Get all values (snapshot)
     */
    values(): V[];
    private hash;
    private nextPowerOfTwo;
    private resize;
    private compareAndSwap;
    private atomicIncrement;
    private atomicDecrement;
}
/**
 * Lock-free circular buffer for high-throughput streaming data
 * Uses atomic indices for concurrent producer/consumer access
 */
export declare class LockFreeRingBuffer<T> {
    private buffer;
    private capacity;
    private readIndex;
    private writeIndex;
    constructor(capacity: number);
    /**
     * Lock-free write operation
     */
    write(value: T): boolean;
    /**
     * Lock-free read operation
     */
    read(): T | null;
    /**
     * Check available space for writing
     */
    availableForWrite(): number;
    /**
     * Check available items for reading
     */
    availableForRead(): number;
    /**
     * Check if buffer is empty
     */
    isEmpty(): boolean;
    /**
     * Check if buffer is full
     */
    isFull(): boolean;
    /**
     * Get buffer capacity
     */
    getCapacity(): number;
    private nextPowerOfTwo;
    private memoryBarrier;
}
/**
 * Performance monitoring for lock-free structures
 */
export declare class LockFreePerformanceMonitor {
    private operations;
    private contentions;
    private startTime;
    /**
     * Record successful operation
     */
    recordOperation(operation: string): void;
    /**
     * Record contention event
     */
    recordContention(operation: string): void;
    /**
     * Get performance statistics
     */
    getStats(): {
        operations: Record<string, number>;
        contentions: Record<string, number>;
        throughput: Record<string, number>;
        uptime: number;
    };
    /**
     * Reset all statistics
     */
    reset(): void;
}
export declare const lockFreeMonitor: LockFreePerformanceMonitor;
/**
 * Utility function to create optimized data structures based on use case
 */
export declare class LockFreeFactory {
    /**
     * Create optimal queue for producer-consumer pattern
     */
    static createQueue<T>(expectedThroughput?: 'low' | 'medium' | 'high'): LockFreeQueue<T>;
    /**
     * Create optimal stack for LIFO operations
     */
    static createStack<T>(): LockFreeStack<T>;
    /**
     * Create optimal hash map for concurrent key-value operations
     */
    static createHashMap<K, V>(initialCapacity?: number, concurrencyLevel?: 'low' | 'medium' | 'high'): LockFreeHashMap<K, V>;
    /**
     * Create optimal ring buffer for streaming data
     */
    static createRingBuffer<T>(capacity: number, usage?: 'single-producer' | 'multi-producer'): LockFreeRingBuffer<T>;
}
//# sourceMappingURL=lockfree-structures.d.ts.map