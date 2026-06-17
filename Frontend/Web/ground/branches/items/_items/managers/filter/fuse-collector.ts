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
        const score = (1 - (result.score ?? 0)) * term.weight;
        const current = scores.get(result.item.key) || { item: result.item.item, score: 0, groups: new Set<number>() };
        if (!current.groups.has(term.group)) current.score += score;
        else current.score = Math.max(current.score, current.score + score * 0.15);
        current.groups.add(term.group);
        scores.set(result.item.key, current);
    });
}
