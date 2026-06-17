import { FilterState } from '../ItemsStateManager';
import { ItemMatcher } from './item-matcher';
import { parseQueryToAST } from './query-parser';
import { clearSearchScores } from './search-score';
import { buildSearchPlan } from './search-plan';
import { applyFuseSearch } from './fuse-collector';

type FuseLike = Parameters<typeof applyFuseSearch>[3];

export function applySearch(items: any[], rawQuery: string, fuse: FuseLike, matcher: ItemMatcher): any[] {
    clearSearchScores(items);
    const plan = buildSearchPlan(rawQuery);
    let filtered = [...items];
    plan.strictQueries.forEach(query => { filtered = applyStructuredSearch(filtered, query, matcher); });
    return plan.terms.length ? applyFuseSearch(filtered, plan.terms, plan.groupCount, fuse) : filtered;
}

export function withoutSearch(filters: FilterState): FilterState {
    return { ...filters, searchQuery: '' };
}

function applyStructuredSearch(items: any[], query: string, matcher: ItemMatcher): any[] {
    const ast = parseQueryToAST(query);
    return items.filter(item => matcher.matchAST(item, ast));
}
