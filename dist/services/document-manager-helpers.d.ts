/**
 * Helper functions for DocumentManager to reduce code repetition
 */
import type { BinderItem, BinderContainer, ProjectStructure } from '../types/internal.js';
/**
 * Validate that the project structure is loaded and has a binder
 */
export declare function validateProjectStructure(projectStructure?: ProjectStructure): asserts projectStructure is ProjectStructure & {
    ScrivenerProject: {
        Binder: BinderContainer;
    };
};
/**
 * Validate document operation inputs
 */
export declare function validateDocumentOperation(operation: string, params: Record<string, unknown>): void;
/**
 * Iterate through binder items safely
 */
export declare function iterateBinderItems(container: BinderContainer): Generator<BinderItem>;
/**
 * Recursively iterate through all binder items including children
 */
export declare function iterateAllBinderItems(container: BinderContainer): Generator<BinderItem>;
/**
 * Find a binder item by ID
 */
export declare function findBinderItemById(container: BinderContainer, id: string): BinderItem | undefined;
/**
 * Find parent of a binder item
 */
export declare function findParentOfBinderItem(container: BinderContainer, childId: string): {
    parent: BinderItem | null;
    container: BinderContainer;
};
/**
 * Remove a binder item from container
 */
export declare function removeBinderItem(container: BinderContainer, id: string): BinderItem | undefined;
/**
 * Add a binder item to container
 */
export declare function addBinderItem(container: BinderContainer, item: BinderItem, position?: number): void;
/**
 * Count all items in container recursively
 */
export declare function countBinderItems(container: BinderContainer): number;
/**
 * Get all items of a specific type
 */
export declare function getBinderItemsByType(container: BinderContainer, type: 'Text' | 'Folder'): BinderItem[];
/**
 * Validate binder item has required fields
 */
export declare function validateBinderItem(item: unknown): asserts item is BinderItem;
//# sourceMappingURL=document-manager-helpers.d.ts.map