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

    public restoreState(): { filters: FilterState; currentSort: string; advancedFiltersVisible: boolean } {
        const filters: FilterState = {
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
        let currentSort = 'rarity';
        let advancedFiltersVisible = false;

        try {
            const savedSearch = sessionStorage.getItem(this.STORAGE_KEYS.SEARCH_QUERY);
            if (savedSearch !== null) {
                filters.searchQuery = savedSearch;
            }

            const restoreSet = (key: string, set: Set<string>) => {
                const saved = sessionStorage.getItem(key);
                if (saved) {
                    const arr = JSON.parse(saved);
                    arr.forEach((item: string) => set.add(item));
                }
            };

            restoreSet(this.STORAGE_KEYS.SELECTED_TYPES, filters.selectedTypes);
            restoreSet(this.STORAGE_KEYS.SELECTED_RARITIES, filters.selectedRarities);
            restoreSet(this.STORAGE_KEYS.SELECTED_HEROES, filters.selectedHeroes);
            restoreSet(this.STORAGE_KEYS.SELECTED_UNLOCK_SOURCES, filters.selectedUnlockSources);
            restoreSet(this.STORAGE_KEYS.SELECTED_BUFFS, filters.selectedBuffs);
            restoreSet(this.STORAGE_KEYS.SELECTED_DEBUFFS, filters.selectedDebuffs);
            restoreSet(this.STORAGE_KEYS.SELECTED_STATS, filters.selectedStats);

            const savedPurchasable = sessionStorage.getItem(this.STORAGE_KEYS.PURCHASABLE_ONLY);
            if (savedPurchasable !== null) {
                filters.purchasableOnly = JSON.parse(savedPurchasable);
            }

            const savedSort = sessionStorage.getItem(this.STORAGE_KEYS.CURRENT_SORT);
            if (savedSort === 'rarity' || savedSort === 'name') {
                currentSort = savedSort;
            }

            const savedAdvancedVisible = sessionStorage.getItem(this.STORAGE_KEYS.ADVANCED_FILTERS_VISIBLE);
            if (savedAdvancedVisible !== null) {
                advancedFiltersVisible = JSON.parse(savedAdvancedVisible);
            }
        } catch (e) {
            console.warn('[ItemsStateManager] Failed to restore state from sessionStorage:', e);
        }

        return { filters, currentSort, advancedFiltersVisible };
    }
}
