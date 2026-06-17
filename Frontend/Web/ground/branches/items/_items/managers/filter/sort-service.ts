import { RARITY_WEIGHTS } from './filter-types';
import { getSearchScore } from './search-score';

export type ItemSortMode = 'rarity' | 'name' | 'relevance';
type Criterion = 'relevance' | 'rarity-down' | 'rarity-up' | 'alphabet-up' | 'alphabet-down';

export function sortItems(items: any[], sortBy: ItemSortMode, query: string = ''): any[] {
    const criteria = resolveCriteria(sortBy, query, hasScores(items));
    if (!criteria.length) return [...items];
    return [...items].sort((a, b) => compareByCriteria(a, b, criteria));
}

function resolveCriteria(sortBy: ItemSortMode, query: string, scored: boolean): Criterion[] {
    const explicit = parseSortTags(query);
    const criteria = scored ? ['relevance' as Criterion] : [];
    if (explicit.length) criteria.push(...explicit.filter(item => item !== 'relevance'));
    else if (!scored && sortBy === 'rarity') criteria.push('rarity-down');
    else if (!scored && sortBy === 'name') criteria.push('alphabet-up');
    return criteria;
}

function parseSortTags(query: string): Criterion[] {
    const tags: Criterion[] = [];
    for (const match of query.matchAll(/\{([a-zA-Z\s]+)\}/gi)) {
        const criterion = tagToCriterion(match[1]!.toLowerCase().trim());
        if (criterion && !tags.includes(criterion)) tags.push(criterion);
    }
    return tags;
}

function tagToCriterion(tag: string): Criterion | null {
    if (tag === 'relevance') return 'relevance';
    if (tag === 'rarity down') return 'rarity-down';
    if (tag === 'rarity up') return 'rarity-up';
    if (tag === 'alphabet up') return 'alphabet-up';
    if (tag === 'alphabet down') return 'alphabet-down';
    return null;
}

function compareByCriteria(a: any, b: any, criteria: Criterion[]): number {
    for (const criterion of criteria) {
        const result = compareOne(a, b, criterion);
        if (result !== 0) return result;
    }
    return 0;
}

function compareOne(a: any, b: any, criterion: Criterion): number {
    if (criterion === 'relevance') return (getSearchScore(b) ?? 0) - (getSearchScore(a) ?? 0);
    if (criterion === 'rarity-down') return (RARITY_WEIGHTS[b.rarity] || 0) - (RARITY_WEIGHTS[a.rarity] || 0);
    if (criterion === 'rarity-up') return (RARITY_WEIGHTS[a.rarity] || 0) - (RARITY_WEIGHTS[b.rarity] || 0);
    if (criterion === 'alphabet-up') return a.name.localeCompare(b.name);
    if (criterion === 'alphabet-down') return b.name.localeCompare(a.name);
    return 0;
}

function hasScores(items: any[]): boolean {
    return items.some(item => getSearchScore(item) !== null);
}
