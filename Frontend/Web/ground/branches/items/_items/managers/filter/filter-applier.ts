import { FilterState } from '../ItemsStateManager';
import { parseQueryToAST } from './query-parser';
import { ItemMatcher } from './item-matcher';

export function applyFilters(items: any[], filters: FilterState, matcher: ItemMatcher): any[] {
    let filtered = applyConcreteFilters(items, filters, matcher);
    const cleanQuery = (filters.searchQuery || '').replace(/\{[^}]+\}/g, '').trim();
    if (cleanQuery) {
        const ast = parseQueryToAST(cleanQuery);
        filtered = filtered.filter(item => matcher.matchAST(item, ast));
    }
    return filtered;
}

export function applyConcreteFilters(items: any[], filters: FilterState, matcher: ItemMatcher): any[] {
    let filtered = [...items];

    if (filters.selectedTypes?.size) {
        filtered = filtered.filter(item => (item.itemTypes || []).some((type: string) => filters.selectedTypes.has(type)));
    }
    if (filters.excludedTypes?.size) {
        filtered = filtered.filter(item => !(item.itemTypes || []).some((type: string) => filters.excludedTypes!.has(type)));
    }

    if (filters.selectedRarities?.size) filtered = filtered.filter(item => filters.selectedRarities.has(item.rarity));
    if (filters.excludedRarities?.size) filtered = filtered.filter(item => !filters.excludedRarities!.has(item.rarity));

    if (filters.selectedHeroes?.size) {
        filtered = filtered.filter(item => filters.selectedHeroes.has(normalizeHero(item.connectedHero || 'Shared')));
    }
    if (filters.excludedHeroes?.size) {
        filtered = filtered.filter(item => !filters.excludedHeroes!.has(normalizeHero(item.connectedHero || 'Shared')));
    }

    if (filters.selectedUnlockSources?.size) {
        filtered = filtered.filter(item => filters.selectedUnlockSources.has(item.unlockSource || 'Unknown'));
    }
    if (filters.excludedUnlockSources?.size) {
        filtered = filtered.filter(item => !filters.excludedUnlockSources!.has(item.unlockSource || 'Unknown'));
    }

    if (filters.purchasableOnly !== null) filtered = filtered.filter(item => item.purchasable === filters.purchasableOnly);

    if (filters.selectedBuffs?.size) filtered = filterBySet(filtered, filters.selectedBuffs, matcher, false);
    if (filters.excludedBuffs?.size) filtered = filterBySet(filtered, filters.excludedBuffs, matcher, true);
    if (filters.selectedDebuffs?.size) filtered = filterBySet(filtered, filters.selectedDebuffs, matcher, false);
    if (filters.excludedDebuffs?.size) filtered = filterBySet(filtered, filters.excludedDebuffs, matcher, true);
    if (filters.selectedStats?.size) filtered = filterBySet(filtered, filters.selectedStats, matcher, false);
    if (filters.excludedStats?.size) filtered = filterBySet(filtered, filters.excludedStats, matcher, true);

    return filtered;
}

function filterBySet(items: any[], set: Set<string>, matcher: ItemMatcher, negated: boolean): any[] {
    return items.filter(item => {
        const matched = Array.from(set).some(value => matcher.itemMatchesStrictTag(item, value));
        return negated ? !matched : matched;
    });
}

function normalizeHero(hero: string): string {
    return hero === 'Hob Gang' ? 'Hob' : hero;
}
