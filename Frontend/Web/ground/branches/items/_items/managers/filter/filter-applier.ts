import { FilterState } from '../ItemsStateManager';
import { parseQueryToAST } from './query-parser';
import { ItemMatcher } from './item-matcher';

export function applyFilters(items: any[], filters: FilterState, matcher: ItemMatcher): any[] {
    let filtered = [...items];
    const cleanQuery = (filters.searchQuery || '').replace(/\{[^}]+\}/g, '').trim();
    if (cleanQuery) {
        const ast = parseQueryToAST(cleanQuery);
        filtered = filtered.filter(item => matcher.matchAST(item, ast));
    }

    if (filters.selectedTypes?.size) {
        filtered = filtered.filter(item => (item.itemTypes || []).some((type: string) => filters.selectedTypes.has(type)));
    }
    if (filters.selectedRarities?.size) filtered = filtered.filter(item => filters.selectedRarities.has(item.rarity));
    if (filters.selectedHeroes?.size) {
        filtered = filtered.filter(item => filters.selectedHeroes.has(normalizeHero(item.connectedHero || 'Shared')));
    }
    if (filters.selectedUnlockSources?.size) {
        filtered = filtered.filter(item => filters.selectedUnlockSources.has(item.unlockSource || 'Unknown'));
    }
    if (filters.purchasableOnly !== null) filtered = filtered.filter(item => item.purchasable === filters.purchasableOnly);
    if (filters.selectedBuffs?.size) filtered = filterBySet(filtered, filters.selectedBuffs, matcher);
    if (filters.selectedDebuffs?.size) filtered = filterBySet(filtered, filters.selectedDebuffs, matcher);
    if (filters.selectedStats?.size) filtered = filterBySet(filtered, filters.selectedStats, matcher);
    return filtered;
}

function filterBySet(items: any[], set: Set<string>, matcher: ItemMatcher): any[] {
    return items.filter(item => Array.from(set).some(value => matcher.itemMatchesStrictTag(item, value)));
}

function normalizeHero(hero: string): string {
    return hero === 'Hob Gang' ? 'Hob' : hero;
}
