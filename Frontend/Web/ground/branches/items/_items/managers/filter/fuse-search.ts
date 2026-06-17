import { FilterState } from '../ItemsStateManager';
import { ItemMatcher } from './item-matcher';
import { getItemKey } from './prepared-items';
import { parseQueryToAST } from './query-parser';
import { PreparedItem } from './filter-types';
import { clearSearchScores, setSearchScore } from './search-score';
import { shortTermMatches } from './fuzzy-term-guard';
import { sanitizeGroupPlaceholders } from '../runtime/rich-group-renderer';

type FuseResult = { item: PreparedItem; score?: number };
type FuseLike = { search(query: string): FuseResult[] };
type WeightedTerm = { value: string; weight: number };

export function applySearch(items: any[], rawQuery: string, fuse: FuseLike | null, matcher: ItemMatcher): any[] {
    clearSearchScores(items);
    const plan = buildSearchPlan(rawQuery);
    let filtered = [...items];
    plan.strictQueries.forEach(query => { filtered = applyStructuredSearch(filtered, query, matcher); });
    return plan.terms.length ? applyFuseSearch(filtered, plan.terms, fuse, matcher) : filtered;
}

export function withoutSearch(filters: FilterState): FilterState {
    return { ...filters, searchQuery: '' };
}

function buildSearchPlan(rawQuery: string): { terms: WeightedTerm[]; strictQueries: string[] } {
    const query = normalizeLogicWords(sanitizeGroupPlaceholders(stripSortTags(rawQuery)));
    if (hasGlobalLogic(query)) return { terms: [], strictQueries: [query] };
    const terms: WeightedTerm[] = [];
    const strictQueries: string[] = [];
    let text = '';
    for (let i = 0; i < query.length; i++) {
        if (query[i] !== '[') { text += query[i]; continue; }
        pushText(text, terms, strictQueries);
        text = '';
        const end = findMatchingBracket(query, i);
        if (end < 0) { text += query.slice(i); break; }
        processBracket(query.slice(i, end + 1), terms, strictQueries);
        i = end;
    }
    pushText(text, terms, strictQueries);
    return { terms, strictQueries };
}

function pushText(text: string, terms: WeightedTerm[], strictQueries: string[]): void {
    const token = text.trim();
    if (!token) return;
    if (isStrictText(token)) strictQueries.push(token);
    else terms.push({ value: token, weight: 2.4 });
}

function processBracket(raw: string, terms: WeightedTerm[], strictQueries: string[]): void {
    const token = raw.slice(1, -1).trim();
    if (isPurchasable(token)) strictQueries.push(purchasableQuery(token));
    else if (isStructuredBracket(token)) strictQueries.push(raw);
    else terms.push({ value: token, weight: weightForChip(token) });
}

function isStructuredBracket(token: string): boolean {
    return token.includes('[') || hasGlobalLogic(token) || isStrictToken(token);
}

function findMatchingBracket(query: string, start: number): number {
    let depth = 0;
    for (let i = start; i < query.length; i++) {
        if (query[i] === '[') depth++;
        else if (query[i] === ']' && --depth === 0) return i;
    }
    return -1;
}

function stripSortTags(query: string): string {
    return (query || '').replace(/\{[^}]+\}/g, '');
}

function normalizeLogicWords(query: string): string {
    return query
        .replace(/(^|[\s\[\]()])(OR|ИЛИ)(?=$|[\s\[\]()])/gi, '$1|')
        .replace(/(^|[\s\[\]()])(AND|И)(?=$|[\s\[\]()])/gi, '$1&')
        .replace(/(^|[\s\[\]()])(NOT|НЕ)(?=$|[\s\[\]()])/gi, '$1!');
}

function hasGlobalLogic(query: string): boolean {
    return /[&|]/.test(query);
}

function isStrictToken(token: string): boolean {
    return token.startsWith('!') || (token.startsWith('<') && token.endsWith('>')) || isComparison(token);
}

function isStrictText(text: string): boolean {
    return text.trim().startsWith('!') || isComparison(text);
}

function isComparison(text: string): boolean {
    return /(?:^|\s|\()?\d*(?:\.\d+)?\s*[<>]=?|=/.test(text) && /[a-zA-Z_]/.test(text);
}

function isPurchasable(token: string): boolean {
    return token.replace(/[!<>\s]/g, '').toLowerCase() === 'purchasable';
}

function purchasableQuery(token: string): string {
    return token.trim().startsWith('!') ? '[!<Purchasable>]' : '[<Purchasable>]';
}

function weightForChip(token: string): number {
    const normalized = token.replace(/[!<>]/g, '').toLowerCase();
    if (isHero(normalized)) return 1;
    if (isLikelyType(normalized)) return 1.4;
    return 1.1;
}

function isHero(value: string): boolean {
    return ['chana', 'ronan', 'harkon', 'nymphedora', 'tink', 'buzz', 'morrow', 'enoch', 'celeste', 'dorf', 'hob', 'pepper', 'sage', 'kragg', 'fern', 'zahir', 'shared', 'crashtestducky'].includes(value);
}

function isLikelyType(value: string): boolean {
    return ['bag', 'meleeweapon', 'rangedweapon', 'pet', 'food', 'accessory', 'armor', 'mineral', 'plant', 'potion', 'rat', 'fish', 'dragon', 'skull', 'cheese', 'chocolate'].includes(value);
}

function applyStructuredSearch(items: any[], query: string, matcher: ItemMatcher): any[] {
    const ast = parseQueryToAST(query);
    return items.filter(item => matcher.matchAST(item, ast));
}

function applyFuseSearch(items: any[], terms: WeightedTerm[], fuse: FuseLike | null, matcher: ItemMatcher): any[] {
    if (!fuse) return terms.reduce((acc, term) => applyStructuredSearch(acc, term.value, matcher), items);
    const allowedKeys = new Set(items.map(getItemKey));
    const scores = new Map<string, { item: any; score: number; hits: number }>();
    terms.forEach(term => collectFuseScores(fuse, allowedKeys, scores, term));
    return [...scores.values()]
        .filter(entry => entry.hits === terms.length)
        .sort((a, b) => b.score - a.score)
        .map(entry => {
            setSearchScore(entry.item, entry.score);
            return entry.item;
        });
}

function collectFuseScores(fuse: FuseLike, allowed: Set<string>, scores: Map<string, { item: any; score: number; hits: number }>, term: WeightedTerm): void {
    fuse.search(term.value).forEach(result => {
        if (!allowed.has(result.item.key) || !shortTermMatches(term.value, result.item)) return;
        const score = (1 - (result.score ?? 0)) * term.weight;
        const current = scores.get(result.item.key) || { item: result.item.item, score: 0, hits: 0 };
        current.score += score;
        current.hits += 1;
        scores.set(result.item.key, current);
    });
}
