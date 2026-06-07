import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ItemsFilterManager } from '../ground/branches/items/_items/managers/ItemsFilterManager';
import { ItemsStateManager, FilterState } from '../ground/branches/items/_items/managers/ItemsStateManager';
import { ItemsIconService } from '../ground/branches/items/_items/services/ItemsIconService';

// Мок данных для тестов
const mockItems: any[] = [
    {
        id: 'item1',
        name: 'Wooden Sword',
        rarity: 'Common',
        itemTypes: ['Melee Weapon'],
        connectedHero: 'Shared',
        unlockSource: 'Starter',
        purchasable: true,
        tooltips: ['A simple sword', 'Buff: Strength'],
        allStats: { attack: 5 },
        combatStats: { damageMin: 1, damageMax: 3 }
    },
    {
        id: 'item2',
        name: 'Golden Bow',
        rarity: 'Legendary',
        itemTypes: ['Ranged Weapon'],
        connectedHero: 'Chana',
        unlockSource: 'Quest',
        purchasable: false,
        tooltips: ['Shiny bow', 'Debuff: Heavy'],
        allStats: { accuracy: 10 },
        combatStats: { damageMin: 10, damageMax: 15 }
    },
    {
        id: 'item3',
        name: 'Special Plan',
        rarity: 'Special',
        itemTypes: ['Accessory'],
        connectedHero: 'Shared',
        unlockSource: 'Heist',
        purchasable: true,
        tooltips: ['Step IV: The Plan'],
        allStats: {},
        combatStats: {}
    }
];

describe('ItemsFilterManager', () => {
    let manager: ItemsFilterManager;
    let defaultFilters: FilterState;

    beforeEach(() => {
        manager = new ItemsFilterManager();
        manager.initFuse(mockItems);
        defaultFilters = {
            searchQuery: '',
            selectedTypes: new Set(),
            selectedRarities: new Set(),
            selectedHeroes: new Set(),
            selectedUnlockSources: new Set(),
            selectedBuffs: new Set(),
            selectedDebuffs: new Set(),
            selectedStats: new Set(),
            purchasableOnly: null
        };
    });

    it('should filter by search query (Fuse.js)', () => {
        const filters = { ...defaultFilters, searchQuery: 'Golden' };
        const result = manager.applyFilters(mockItems, filters);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.some(item => item.name === 'Golden Bow')).toBe(true);
    });

    it('should filter by rarity', () => {
        const filters = { ...defaultFilters, selectedRarities: new Set(['Legendary']) };
        const result = manager.applyFilters(mockItems, filters);
        expect(result.length).toBe(1);
        expect(result[0].rarity).toBe('Legendary');
    });

    it('should filter by hero', () => {
        const filters = { ...defaultFilters, selectedHeroes: new Set(['Chana']) };
        const result = manager.applyFilters(mockItems, filters);
        expect(result.length).toBe(1);
        expect(result[0].connectedHero).toBe('Chana');
    });

    it('should filter by buff keywords in tooltips', () => {
        const filters = { ...defaultFilters, selectedBuffs: new Set(['Buff']) };
        const result = manager.applyFilters(mockItems, filters);
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Wooden Sword');
    });

    it('should sort by rarity weights', () => {
        const sorted = manager.sortItems(mockItems, 'rarity');
        // Legendary (80) > Common (50) > Special (20)
        expect(sorted[0].rarity).toBe('Legendary');
        expect(sorted[1].rarity).toBe('Common');
        expect(sorted[2].rarity).toBe('Special');
    });

    it('should calculate unique filter options correctly', () => {
        const options = manager.calculateFilterOptions(mockItems);
        expect(options.sortedRarities).toContain('Common');
        expect(options.sortedRarities).toContain('Legendary');
        expect(options.sortedRarities).toContain('Special');
        expect(options.sortedHeroes).toContain('Shared');
        expect(options.sortedHeroes).toContain('Chana');
    });
});

describe('ItemsStateManager', () => {
    let manager: ItemsStateManager;

    beforeEach(() => {
        manager = new ItemsStateManager();
        sessionStorage.clear();
    });

    it('should save and restore filter state', () => {
        const filters: FilterState = {
            searchQuery: 'test search',
            selectedTypes: new Set(['Armor']),
            selectedRarities: new Set(['Epic']),
            selectedHeroes: new Set(['Ronan']),
            selectedUnlockSources: new Set(['Shop']),
            selectedBuffs: new Set(['Haste']),
            selectedDebuffs: new Set(['Burn']),
            selectedStats: new Set(['Health']),
            purchasableOnly: true
        };

        manager.saveState(filters, 'name', true);
        
        const restored = manager.restoreState();
        expect(restored.filters.searchQuery).toBe('test search');
        expect(restored.filters.selectedTypes.has('Armor')).toBe(true);
        expect(restored.filters.purchasableOnly).toBe(true);
        expect(restored.currentSort).toBe('name');
        expect(restored.advancedFiltersVisible).toBe(true);
    });
});

describe('ItemsIconService', () => {
    it('should generate correct slug for normal items', () => {
        const item = { name: 'Wooden Sword', rarity: 'Common', tooltips: [] } as any;
        expect(ItemsIconService.getItemImagePath(item)).toBe('wooden-sword');
    });

    it('should handle Roman numerals for Special items', () => {
        const item = { 
            name: 'Heist Plan', 
            rarity: 'Special', 
            tooltips: ['Step IV: The Plan'] 
        } as any;
        expect(ItemsIconService.getItemImagePath(item)).toBe('heist-plan-4');
    });

    it('should fallback to slug if Special item has no roman numeral', () => {
        const item = { 
            name: 'Special Item', 
            rarity: 'Special', 
            tooltips: ['Just a plan'] 
        } as any;
        expect(ItemsIconService.getItemImagePath(item)).toBe('special-item');
    });
});
