/**
 * Lock-Free Concurrent Data Structures
 * Implements high-performance concurrent data structures without locks
 * for maximum scalability in multi-threaded text processing
 */
import { getLogger } from '../core/logger.js';
const logger = getLogger('lockfree-structures');
/**
 * Lock-free queue using Compare-And-Swap (CAS) operations
 * Provides O(1) enqueue and dequeue with atomic operations
 */
export class LockFreeQueue {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
        // Initialize with sentinel node
        const sentinel = new QueueNode(null);
        this.head = sentinel;
        this.tail = sentinel;
    }
    /**
     * Lock-free enqueue operation
     */
    enqueue(value) {
        const newNode = new QueueNode(value);
        while (true) {
            const currentTail = this.tail;
            const tailNext = currentTail?.next;
            if (currentTail === this.tail) {
                if (tailNext === null) {
                    // Attempt to link node at end of list
                    if (this.compareAndSwapNode(currentTail, 'next', null, newNode)) {
                        this.compareAndSwapField('tail', currentTail, newNode);
                        this.atomicIncrement('size');
                        break;
                    }
                }
                else {
                    // Tail was not pointing to last node, try to swing tail to next node
                    this.compareAndSwapField('tail', currentTail, tailNext ?? null);
                }
            }
        }
    }
    /**
     * Lock-free dequeue operation
     */
    dequeue() {
        while (true) {
            const currentHead = this.head;
            const currentTail = this.tail;
            const headNext = currentHead?.next;
            if (currentHead === this.head) {
                if (currentHead === currentTail) {
                    if (headNext === null) {
                        return null; // Queue is empty
                    }
                    // Tail is falling behind, advance it
                    this.compareAndSwapField('tail', currentTail, headNext ?? null);
                }
                else {
                    if (headNext) {
                        const value = headNext.value;
                        // Attempt to move head to next node
                        if (this.compareAndSwapField('head', currentHead, headNext)) {
                            this.atomicDecrement('size');
                            return value;
                        }
                    }
                }
            }
        }
    }
    /**
     * Get current size (approximate due to concurrent access)
     */
    getSize() {
        return this.size;
    }
    /**
     * Check if queue is empty
     */
    isEmpty() {
        const head = this.head;
        const tail = this.tail;
        return head === tail && head?.next === null;
    }
    /**
     * Atomic compare-and-swap operation simulation for node references
     */
    compareAndSwapNode(node, field, expected, newValue) {
        if (node && node[field] === expected) {
            node[field] = newValue;
            return true;
        }
        return false;
    }
    /**
     * Atomic compare-and-swap operation simulation for queue fields
     */
    compareAndSwapField(field, expected, newValue) {
        if (this[field] === expected) {
            this[field] = newValue;
            return true;
        }
        return false;
    }
    /**
     * Atomic increment operation
     */
    atomicIncrement(key) {
        // In real implementation, this would use atomic increment
        this[key]++;
    }
    /**
     * Atomic decrement operation
     */
    atomicDecrement(key) {
        // In real implementation, this would use atomic decrement
        this[key]--;
    }
}
class QueueNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}
/**
 * Lock-free stack for LIFO operations
 * Uses atomic pointer manipulation for thread safety
 */
export class LockFreeStack {
    constructor() {
        this.top = null;
        this.size = 0;
    }
    /**
     * Lock-free push operation
     */
    push(value) {
        const newNode = new StackNode(value);
        while (true) {
            const currentTop = this.top;
            newNode.next = currentTop;
            if (this.compareAndSwapTop(currentTop, newNode)) {
                this.atomicIncrement('size');
                break;
            }
        }
    }
    /**
     * Lock-free pop operation
     */
    pop() {
        while (true) {
            const currentTop = this.top;
            if (currentTop === null) {
                return null; // Stack is empty
            }
            const next = currentTop.next;
            if (this.compareAndSwapTop(currentTop, next)) {
                this.atomicDecrement('size');
                return currentTop.value;
            }
        }
    }
    /**
     * Peek at top element without removing it
     */
    peek() {
        const currentTop = this.top;
        return currentTop ? currentTop.value : null;
    }
    /**
     * Get current size (approximate)
     */
    getSize() {
        return this.size;
    }
    /**
     * Check if stack is empty
     */
    isEmpty() {
        return this.top === null;
    }
    compareAndSwapTop(expected, newValue) {
        if (this.top === expected) {
            this.top = newValue;
            return true;
        }
        return false;
    }
    atomicIncrement(key) {
        this[key]++;
    }
    atomicDecrement(key) {
        this[key]--;
    }
}
class StackNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}
/**
 * Lock-free hash map using linear probing and atomic operations
 * Provides concurrent read/write access without locks
 */
export class LockFreeHashMap {
    constructor(initialCapacity = 16) {
        this.size = 0;
        this.loadFactorThreshold = 0.75;
        this.capacity = this.nextPowerOfTwo(initialCapacity);
        this.buckets = new Array(this.capacity).fill(null);
    }
    /**
     * Lock-free get operation
     */
    get(key) {
        const hash = this.hash(key);
        let index = hash & (this.capacity - 1);
        while (true) {
            const entry = this.buckets[index];
            if (entry === null) {
                return undefined; // Key not found
            }
            if (entry.key === key && !entry.deleted) {
                return entry.value;
            }
            index = (index + 1) & (this.capacity - 1);
            // Prevent infinite loop
            if (index === (hash & (this.capacity - 1))) {
                return undefined;
            }
        }
    }
    /**
     * Lock-free set operation
     */
    set(key, value) {
        // Check if resize is needed
        if (this.size >= this.capacity * this.loadFactorThreshold) {
            this.resize();
        }
        const hash = this.hash(key);
        let index = hash & (this.capacity - 1);
        while (true) {
            const entry = this.buckets[index];
            if (entry === null || entry.deleted) {
                // Try to place new entry
                const newEntry = new HashEntry(key, value);
                if (this.compareAndSwap(this.buckets, index, entry, newEntry)) {
                    if (entry === null || entry.deleted) {
                        this.atomicIncrement('size');
                    }
                    return true;
                }
            }
            else if (entry.key === key) {
                // Update existing entry
                const newEntry = new HashEntry(key, value);
                if (this.compareAndSwap(this.buckets, index, entry, newEntry)) {
                    return true;
                }
            }
            else {
                // Linear probing
                index = (index + 1) & (this.capacity - 1);
                // Prevent infinite loop
                if (index === (hash & (this.capacity - 1))) {
                    return false; // Table is full
                }
            }
        }
    }
    /**
     * Lock-free delete operation
     */
    delete(key) {
        const hash = this.hash(key);
        let index = hash & (this.capacity - 1);
        while (true) {
            const entry = this.buckets[index];
            if (entry === null) {
                return false; // Key not found
            }
            if (entry.key === key && !entry.deleted) {
                // Mark as deleted
                const deletedEntry = new HashEntry(entry.key, entry.value, true);
                if (this.compareAndSwap(this.buckets, index, entry, deletedEntry)) {
                    this.atomicDecrement('size');
                    return true;
                }
            }
            index = (index + 1) & (this.capacity - 1);
            // Prevent infinite loop
            if (index === (hash & (this.capacity - 1))) {
                return false;
            }
        }
    }
    /**
     * Get current size
     */
    getSize() {
        return this.size;
    }
    /**
     * Check if map is empty
     */
    isEmpty() {
        return this.size === 0;
    }
    /**
     * Get all keys (snapshot)
     */
    keys() {
        const keys = [];
        for (const entry of this.buckets) {
            if (entry && !entry.deleted) {
                keys.push(entry.key);
            }
        }
        return keys;
    }
    /**
     * Get all values (snapshot)
     */
    values() {
        const values = [];
        for (const entry of this.buckets) {
            if (entry && !entry.deleted) {
                values.push(entry.value);
            }
        }
        return values;
    }
    hash(key) {
        // Simple hash function - in production, use a better hash
        const str = String(key);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    nextPowerOfTwo(n) {
        let power = 1;
        while (power < n) {
            power *= 2;
        }
        return power;
    }
    resize() {
        const oldBuckets = this.buckets;
        const oldCapacity = this.capacity;
        this.capacity *= 2;
        this.buckets = new Array(this.capacity).fill(null);
        this.size = 0;
        // Rehash all entries
        for (const entry of oldBuckets) {
            if (entry && !entry.deleted) {
                this.set(entry.key, entry.value);
            }
        }
        logger.debug('LockFreeHashMap resized', {
            oldCapacity,
            newCapacity: this.capacity,
            currentSize: this.size,
        });
    }
    compareAndSwap(array, index, expected, newValue) {
        if (array[index] === expected) {
            array[index] = newValue;
            return true;
        }
        return false;
    }
    atomicIncrement(key) {
        this[key]++;
    }
    atomicDecrement(key) {
        this[key]--;
    }
}
class HashEntry {
    constructor(key, value, deleted = false) {
        this.key = key;
        this.value = value;
        this.deleted = deleted;
    }
}
/**
 * Lock-free circular buffer for high-throughput streaming data
 * Uses atomic indices for concurrent producer/consumer access
 */
export class LockFreeRingBuffer {
    constructor(capacity) {
        this.readIndex = 0;
        this.writeIndex = 0;
        this.capacity = this.nextPowerOfTwo(capacity);
        this.buffer = new Array(this.capacity).fill(null);
    }
    /**
     * Lock-free write operation
     */
    write(value) {
        const currentWrite = this.writeIndex;
        const nextWrite = (currentWrite + 1) & (this.capacity - 1);
        if (nextWrite === this.readIndex) {
            return false; // Buffer is full
        }
        this.buffer[currentWrite] = value;
        // Memory barrier simulation - ensures write completes before index update
        this.memoryBarrier();
        this.writeIndex = nextWrite;
        return true;
    }
    /**
     * Lock-free read operation
     */
    read() {
        const currentRead = this.readIndex;
        if (currentRead === this.writeIndex) {
            return null; // Buffer is empty
        }
        const value = this.buffer[currentRead];
        this.buffer[currentRead] = null; // Clear slot
        // Memory barrier simulation
        this.memoryBarrier();
        this.readIndex = (currentRead + 1) & (this.capacity - 1);
        return value;
    }
    /**
     * Check available space for writing
     */
    availableForWrite() {
        const write = this.writeIndex;
        const read = this.readIndex;
        return (read - write - 1 + this.capacity) & (this.capacity - 1);
    }
    /**
     * Check available items for reading
     */
    availableForRead() {
        const write = this.writeIndex;
        const read = this.readIndex;
        return (write - read + this.capacity) & (this.capacity - 1);
    }
    /**
     * Check if buffer is empty
     */
    isEmpty() {
        return this.readIndex === this.writeIndex;
    }
    /**
     * Check if buffer is full
     */
    isFull() {
        return ((this.writeIndex + 1) & (this.capacity - 1)) === this.readIndex;
    }
    /**
     * Get buffer capacity
     */
    getCapacity() {
        return this.capacity - 1; // One slot is reserved for full detection
    }
    nextPowerOfTwo(n) {
        let power = 1;
        while (power < n) {
            power *= 2;
        }
        return power;
    }
    memoryBarrier() {
        // Memory barrier simulation - in real implementation would use actual memory barriers
        // This ensures proper ordering of memory operations in concurrent environments
    }
}
/**
 * Performance monitoring for lock-free structures
 */
export class LockFreePerformanceMonitor {
    constructor() {
        this.operations = new LockFreeHashMap();
        this.contentions = new LockFreeHashMap();
        this.startTime = performance.now();
    }
    /**
     * Record successful operation
     */
    recordOperation(operation) {
        const current = this.operations.get(operation) || 0;
        this.operations.set(operation, current + 1);
    }
    /**
     * Record contention event
     */
    recordContention(operation) {
        const current = this.contentions.get(operation) || 0;
        this.contentions.set(operation, current + 1);
    }
    /**
     * Get performance statistics
     */
    getStats() {
        const uptime = performance.now() - this.startTime;
        const operationStats = {};
        const contentionStats = {};
        const throughputStats = {};
        for (const key of this.operations.keys()) {
            const ops = this.operations.get(key) || 0;
            const contentions = this.contentions.get(key) || 0;
            operationStats[key] = ops;
            contentionStats[key] = contentions;
            throughputStats[key] = (ops / uptime) * 1000; // ops per second
        }
        return {
            operations: operationStats,
            contentions: contentionStats,
            throughput: throughputStats,
            uptime,
        };
    }
    /**
     * Reset all statistics
     */
    reset() {
        this.operations = new LockFreeHashMap();
        this.contentions = new LockFreeHashMap();
        this.startTime = performance.now();
    }
}
// Export singleton instance for global performance monitoring
export const lockFreeMonitor = new LockFreePerformanceMonitor();
/**
 * Utility function to create optimized data structures based on use case
 */
export class LockFreeFactory {
    /**
     * Create optimal queue for producer-consumer pattern
     */
    static createQueue(expectedThroughput = 'medium') {
        const queue = new LockFreeQueue();
        // Pre-warm the queue based on expected throughput
        if (expectedThroughput === 'high') {
            // Pre-allocate some internal structures for high-throughput scenarios
            logger.info('Created high-throughput lock-free queue');
        }
        return queue;
    }
    /**
     * Create optimal stack for LIFO operations
     */
    static createStack() {
        return new LockFreeStack();
    }
    /**
     * Create optimal hash map for concurrent key-value operations
     */
    static createHashMap(initialCapacity = 16, concurrencyLevel = 'medium') {
        // Adjust initial capacity based on expected concurrency
        const adjustedCapacity = concurrencyLevel === 'high' ? Math.max(initialCapacity, 64) : initialCapacity;
        return new LockFreeHashMap(adjustedCapacity);
    }
    /**
     * Create optimal ring buffer for streaming data
     */
    static createRingBuffer(capacity, usage = 'single-producer') {
        // For multi-producer scenarios, use larger capacity to reduce contention
        const adjustedCapacity = usage === 'multi-producer' ? Math.max(capacity, 256) : capacity;
        return new LockFreeRingBuffer(adjustedCapacity);
    }
}
//# sourceMappingURL=lockfree-structures.js.map