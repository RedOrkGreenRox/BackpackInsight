import { FilterState } from '../ItemsStateManager';

export type SortKey = 'relevance' | 'rarity' | 'alphabet';
export type SortDirection = 'down' | 'up';
export interface SortPriority { key: SortKey; direction: SortDirection }
export type SortMode = 'relevance' | 'rarity' | 'rarity-up' | 'name' | 'alphabet-down';
export type SortInput = SortMode | SortPriority[];
export type ListenerRegistrar = (element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: any) => void;

export interface ItemsViewCallbacks {
    getFilters(): FilterState;
    setFilters(filters: FilterState): void;
    getCurrentSort(): SortInput;
    setCurrentSort(sort: SortInput): void;
    saveState(): void;
    applyFilters(): void;
    syncChips(): void;
}

export const HERO_LIST = [
    'chana', 'ronan', 'harkon', 'nymphedora', 'tink', 'buzz', 'morrow', 'enoch',
    'celeste', 'dorf', 'hob', 'pepper', 'sage', 'kragg', 'fern', 'zahir', 'shared', 'crashtestducky',
];
export const RARITY_LIST = ['common', 'rare', 'epic', 'legendary', 'mythic', 'unique', 'relic', 'boon', 'special'];
export const TYPE_LIST = [
    'bag', 'meleeweapon', 'rangedweapon', 'pet', 'food', 'accessory', 'armor',
    'mineral', 'plant', 'potion', 'rat', 'fish', 'dragon', 'skull', 'cheese',
    'chocolate', 'melee weapon', 'ranged weapon',
];

export function defaultFilters(): FilterState {
    return {
        searchQuery: '', selectedTypes: new Set(), selectedRarities: new Set(), selectedHeroes: new Set(),
        selectedUnlockSources: new Set(), selectedBuffs: new Set(), selectedDebuffs: new Set(), selectedStats: new Set(),
        excludedTypes: new Set(), excludedRarities: new Set(), excludedHeroes: new Set(), excludedUnlockSources: new Set(),
        excludedBuffs: new Set(), excludedDebuffs: new Set(), excludedStats: new Set(), purchasableOnly: null,
    };
}

export function defaultSortPriorities(): SortPriority[] { return [{ key: 'rarity', direction: 'down' }]; }
