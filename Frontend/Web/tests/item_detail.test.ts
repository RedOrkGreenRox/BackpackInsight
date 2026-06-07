import { describe, it, expect, vi } from 'vitest';
import { ItemDetailBranch } from '../ground/branches/itemDetail/ItemDetailBranch';
import { ItemNavigationManager } from '../ground/branches/itemDetail/_itemDetail/managers/ItemNavigationManager';
import { ItemSEOManager } from '../ground/branches/itemDetail/_itemDetail/managers/ItemSEOManager';

vi.mock('../ground/localization/i18n', () => ({
    t: (key: string, params?: any) => {
        if (params) return `${key}_${JSON.stringify(params)}`;
        return key;
    }
}));

describe('ItemDetail Managers', () => {
    describe('ItemNavigationManager', () => {
        it('should calculate navigation correctly for wiki items', () => {
            const manager = new ItemNavigationManager();
            sessionStorage.setItem('filteredItemsOrder', JSON.stringify(['Item A', 'Item B', 'Item C']));
            
            const nav = manager.calculateNavigation('Item B');
            
            expect(nav.prev).toBe('Item A');
            expect(nav.next).toBe('Item C');
        });

        it('should calculate navigation correctly for profile items', () => {
            const manager = new ItemNavigationManager();
            const mockPlayerItem = { name: 'Item B' };
            sessionStorage.setItem('profileItemsList', JSON.stringify([
                { name: 'Item A' },
                { name: 'Item B' },
                { name: 'Item C' }
            ]));
            
            const nav = manager.calculateNavigation('Item B', mockPlayerItem);
            
            expect(nav.prev).toBe('Item A');
            expect(nav.next).toBe('Item C');
        });

        it('should return nulls if item not found', () => {
            const manager = new ItemNavigationManager();
            sessionStorage.setItem('filteredItemsOrder', JSON.stringify(['Item A']));
            
            const nav = manager.calculateNavigation('Item B');
            
            expect(nav.prev).toBeNull();
            expect(nav.next).toBeNull();
        });
    });

    describe('ItemDetailBranch SEO', () => {
        it('should generate correct SEO metadata', () => {
            const branch = new ItemDetailBranch();
            const mockItem = {
                name: 'Test Item',
                rarity: 'Epic',
                tooltips: ['A great item'],
            };
            
            const meta = branch.getMeta(mockItem as any);
            
            expect(meta.title).toContain('Test Item');
            expect(meta.description).toBeDefined();
        });

        it('should use fallback metadata when no data provided', () => {
            const branch = new ItemDetailBranch();
            const meta = branch.getMeta(null);
            
            expect(meta.title).toBeDefined();
        });
    });
});
