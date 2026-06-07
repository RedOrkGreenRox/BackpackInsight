export interface ItemDefinition {
    id: string;
    name: string;
    rarity: string;
    coinValue: number | null;
    itemTypes: string[];
    connectedHero: string;
    unlockSource: string;
    itemShape: { x: number, y: number }[];
    itemStars: { x: number, y: number }[];
    purchasable: boolean;
    recipes: any[];
    combatStats: any;
    tooltips: string[];
    allStats: Record<string, any>;
    levels: any;
}

export interface FilterState {

    searchQuery: string;
    selectedTypes: Set<string>;
    selectedRarities: Set<string>;
    selectedHeroes: Set<string>;
    selectedUnlockSources: Set<string>;
    selectedBuffs: Set<string>;
    selectedDebuffs: Set<string>;
    selectedStats: Set<string>;
    purchasableOnly: boolean | null;
}

export class ItemsStateManager {
    private readonly STORAGE_KEYS = {
        SEARCH_QUERY: 'items_search_query',
        SELECTED_TYPES: 'items_selected_types',
        SELECTED_RARITIES: 'items_selected_rarities',
        SELECTED_HEROES: 'items_selected_heroes',
        SELECTED_UNLOCK_SOURCES: 'items_selected_unlock_sources',
        SELECTED_BUFFS: 'items_selected_buffs',
        SELECTED_DEBUFFS: 'items_selected_debuffs',
        SELECTED_STATS: 'items_selected_stats',
        PURCHASABLE_ONLY: 'items_purchasable_only',
        CURRENT_SORT: 'items_current_sort',
        ADVANCED_FILTERS_VISIBLE: 'items_advanced_filters_visible'
    };

    public saveState(filters: FilterState, currentSort: string, advancedFiltersVisible: boolean): void {
        try {
            sessionStorage.setItem(this.STORAGE_KEYS.SEARCH_QUERY, filters.searchQuery);
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_TYPES, JSON.stringify([...filters.selectedTypes]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_RARITIES, JSON.stringify([...filters.selectedRarities]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_HEROES, JSON.stringify([...filters.selectedHeroes]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_UNLOCK_SOURCES, JSON.stringify([...filters.selectedUnlockSources]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_BUFFS, JSON.stringify([...filters.selectedBuffs]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_DEBUFFS, JSON.stringify([...filters.selectedDebuffs]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_STATS, JSON.stringify([...filters.selectedStats]));
            sessionStorage.setItem(this.STORAGE_KEYS.PURCHASABLE_ONLY, JSON.stringify(filters.purchasableOnly));
            sessionStorage.setItem(this.STORAGE_KEYS.CURRENT_SORT, currentSort);
            sessionStorage.setItem(this.STORAGE_KEYS.ADVANCED_FILTERS_VISIBLE, JSON.stringify(advancedFiltersVisible));
        } catch (e) {
            console.warn('[ItemsStateManager] Failed to save state to sessionStorage:', e);
        }
    }

    public restoreState(): { 
        filters: FilterState, 
        currentSort: 'rarity' | 'name', 
        advancedFiltersVisible: boolean 
    } {
        const filters: FilterState = {
            searchQuery: sessionStorage.getItem(this.STORAGE_KEYS.SEARCH_QUERY) || '',
            selectedTypes: new Set(JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_TYPES) || '[]')),
            selectedRarities: new Set(JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_RARITIES) || '[]')),
            selectedHeroes: new Set(JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_HEROES) || '[]')),
            selectedUnlockSources: new Set(JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_UNLOCK_SOURCES) || '[]')),
            selectedBuffs: new Set(JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_BUFFS) || '[]')),
            selectedDebuffs: new Set(JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_DEBUFFS) || '[]')),
            selectedStats: new Set(JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_STATS) || '[]')),
            purchasableOnly: sessionStorage.getItem(this.STORAGE_KEYS.PURCHASABLE_ONLY) 
                ? JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.PURCHASABLE_ONLY)!) 
                : null,
        };

        const currentSort = (sessionStorage.getItem(this.STORAGE_KEYS.CURRENT_SORT) as 'rarity' | 'name') || 'rarity';
        const advancedFiltersVisible = sessionStorage.getItem(this.STORAGE_KEYS.ADVANCED_FILTERS_VISIBLE) 
            ? JSON.parse(sessionStorage.getItem(this.STORAGE_KEYS.ADVANCED_FILTERS_VISIBLE)!) 
            : false;

        return { filters, currentSort, advancedFiltersVisible };
    }
}
