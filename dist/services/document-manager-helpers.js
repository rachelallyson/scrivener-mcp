/**
 * Helper functions for DocumentManager to reduce code repetition
 */
import { createError, ErrorCode } from '../core/errors.js';
import { validateInput } from '../utils/common.js';
/**
 * Validate that the project structure is loaded and has a binder
 */
export function validateProjectStructure(projectStructure) {
    if (!projectStructure?.ScrivenerProject?.Binder) {
        throw createError(ErrorCode.INVALID_STATE, undefined, 'Project not loaded');
    }
}
/**
 * Validate document operation inputs
 */
export function validateDocumentOperation(operation, params) {
    const schemas = {
        createDocument: {
            title: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 255,
            },
            content: {
                type: 'string',
                required: false,
            },
            parentId: {
                type: 'string',
                required: false,
                pattern: /^[A-Za-z0-9-]+$/,
            },
            type: {
                type: 'string',
                required: false,
                enum: ['Text', 'Folder'],
            },
        },
        renameDocument: {
            documentId: {
                type: 'string',
                required: true,
                pattern: /^[A-Za-z0-9-]+$/,
            },
            newTitle: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 255,
            },
        },
        deleteDocument: {
            documentId: {
                type: 'string',
                required: true,
                pattern: /^[A-Za-z0-9-]+$/,
            },
        },
        moveDocument: {
            documentId: {
                type: 'string',
                required: true,
                pattern: /^[A-Za-z0-9-]+$/,
            },
            newParentId: {
                type: 'string',
                required: false,
                pattern: /^[A-Za-z0-9-]+$/,
            },
        },
    };
    const schema = schemas[operation];
    if (schema) {
        validateInput(params, schema);
    }
}
/**
 * Iterate through binder items safely
 */
export function* iterateBinderItems(container) {
    if (!container.BinderItem)
        return;
    const items = Array.isArray(container.BinderItem)
        ? container.BinderItem
        : [container.BinderItem];
    for (const item of items) {
        yield item;
    }
}
/**
 * Recursively iterate through all binder items including children
 */
export function* iterateAllBinderItems(container) {
    for (const item of iterateBinderItems(container)) {
        yield item;
        if (item.Children) {
            yield* iterateAllBinderItems(item.Children);
        }
    }
}
/**
 * Find a binder item by ID
 */
export function findBinderItemById(container, id) {
    for (const item of iterateAllBinderItems(container)) {
        // Check both UUID and ID fields (tests use ID)
        if (item.UUID === id || item.ID === id) {
            return item;
        }
    }
    return undefined;
}
/**
 * Find parent of a binder item
 */
export function findParentOfBinderItem(container, childId) {
    // Check if it's a root item
    for (const item of iterateBinderItems(container)) {
        if (item.UUID === childId || item.ID === childId) {
            return { parent: null, container };
        }
    }
    // Search in children
    for (const item of iterateBinderItems(container)) {
        if (item.Children) {
            const found = findBinderItemById(item.Children, childId);
            if (found) {
                return { parent: item, container: item.Children };
            }
        }
    }
    return { parent: null, container };
}
/**
 * Remove a binder item from container
 */
export function removeBinderItem(container, id) {
    if (!container.BinderItem)
        return undefined;
    const items = Array.isArray(container.BinderItem)
        ? container.BinderItem
        : [container.BinderItem];
    // Find and remove from current level
    const index = items.findIndex((item) => item.UUID === id || item.ID === id);
    if (index >= 0) {
        const [removed] = items.splice(index, 1);
        // Update container
        if (Array.isArray(container.BinderItem)) {
            container.BinderItem = items;
        }
        else {
            container.BinderItem = items[0] || null;
        }
        return removed;
    }
    // Search in children
    for (const item of items) {
        if (item.Children) {
            const removed = removeBinderItem(item.Children, id);
            if (removed)
                return removed;
        }
    }
    return undefined;
}
/**
 * Add a binder item to container
 */
export function addBinderItem(container, item, position) {
    if (!container.BinderItem) {
        container.BinderItem = item;
        return;
    }
    if (Array.isArray(container.BinderItem)) {
        if (position !== undefined && position >= 0 && position <= container.BinderItem.length) {
            container.BinderItem.splice(position, 0, item);
        }
        else {
            container.BinderItem.push(item);
        }
    }
    else {
        // Convert to array
        container.BinderItem = [container.BinderItem, item];
    }
}
/**
 * Count all items in container recursively
 */
export function countBinderItems(container) {
    let count = 0;
    for (const _item of iterateAllBinderItems(container)) {
        count++;
    }
    return count;
}
/**
 * Get all items of a specific type
 */
export function getBinderItemsByType(container, type) {
    const items = [];
    for (const item of iterateAllBinderItems(container)) {
        if (item.Type === type) {
            items.push(item);
        }
    }
    return items;
}
/**
 * Validate binder item has required fields
 */
export function validateBinderItem(item) {
    if (!item || typeof item !== 'object') {
        throw createError(ErrorCode.INVALID_INPUT, undefined, 'Invalid binder item');
    }
    const binderItem = item;
    if (!binderItem.UUID || typeof binderItem.UUID !== 'string') {
        throw createError(ErrorCode.INVALID_INPUT, undefined, 'Binder item missing UUID');
    }
    if (!binderItem.Type || (binderItem.Type !== 'Text' && binderItem.Type !== 'Folder')) {
        throw createError(ErrorCode.INVALID_INPUT, undefined, 'Invalid binder item type');
    }
    if (binderItem.Title !== undefined && typeof binderItem.Title !== 'string') {
        throw createError(ErrorCode.INVALID_INPUT, undefined, 'Invalid binder item title');
    }
}
//# sourceMappingURL=document-manager-helpers.js.map