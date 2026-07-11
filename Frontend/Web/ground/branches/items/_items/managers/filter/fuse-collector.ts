import { PreparedItem } from './filter-types';
import { getItemKey } from './prepared-items';
import { setSearchScore } from './search-score';
import { shortTermMatches } from './fuzzy-term-guard';
import { WeightedTerm } from './search-plan';

type FuseResult = { item: PreparedItem; score?: number };
type FuseLike = { search(query: string): FuseResult[] };
type ScoreEntry = { item: any; score: number; groups: Set<number> };

export function applyFuseSearch(items: any[], terms: WeightedTerm[], groupCount: number, fuse: FuseLike | null): any[] {
    if (!fuse) return items;
    const allowedKeys = new Set(items.map(getItemKey));
    const scores = new Map<string, ScoreEntry>();
    terms.forEach(term => collectFuseScores(fuse, allowedKeys, scores, term));
    return [...scores.values()]
        .filter(entry => entry.groups.size === groupCount)
        .sort((a, b) => b.score - a.score)
        .map(entry => {
            setSearchScore(entry.item, entry.score);
            return entry.item;
        });
}

function collectFuseScores(fuse: FuseLike, allowed: Set<string>, scores: Map<string, ScoreEntry>, term: WeightedTerm): void {
    fuse.search(term.value).forEach(result => {
        if (!allowed.has(result.item.key) || !shortTermMatches(term.value, result.item)) return;
        const base = (1 - (result.score ?? 0)) * term.weight * fuzzyMultiplier(term.value, result.item);
        const score = base + exactFieldBonus(term.value, result.item, term.weight);
        const current = scores.get(result.item.key) || { item: result.item.item, score: 0, groups: new Set<number>() };
        if (!current.groups.has(term.group)) current.score += score;
        else current.score = Math.max(current.score, current.score + score * 0.15);
        current.groups.add(term.group);
        scores.set(result.item.key, current);
    });
}

function exactFieldBonus(value: string, item: PreparedItem, weight: number): number {
    const token = normalizeSingle(value);
    if (!token) return 0;
    const inName = hasWord(item.slug.replaceAll('-', ' '), token);
    const inTags = hasWord(`${item.typeText} ${item.strictText}`, token);
    const inTooltip = hasWord(item.tooltipText, token);
    let bonus = 0;
    if (inName) bonus += weight * 1.2;
    if (inTags) bonus += weight * 1.8;
    if (inTooltip) bonus += weight * 0.25;
    if (inName && inTags) bonus += weight * 1.35;
    return bonus;
}

function fuzzyMultiplier(value: string, item: PreparedItem): number {
    const token = normalizeSingle(value);
    if (!token) return 1;
    if (hasWord(item.baseText, token) || hasWord(item.searchText, token)) return 1;
    // Слитные fuzzy-совпадения вроде skull -> skullduggery остаются, но получают сильный штраф.
    return 0.18;
}

function normalizeSingle(value: string): string {
    const token = value.toLowerCase().trim();
    return token && !token.includes(' ') ? token : '';
}

function hasWord(text: string, token: string): boolean {
    return ` ${text.toLowerCase()} `.includes(` ${token} `);
}
