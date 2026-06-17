// @ts-ignore
import Fuse from 'fuse.js';
import aliasesJson from '../../../../../../static/search/term-aliases.ru.json';
import { SearchTermService } from '../../../../../utils/SearchTermService';

type AliasEntry = string | { term: string; weight?: number };
type AliasMap = Record<string, AliasEntry[]>;

interface AliasDoc {
    term: string;
    canonical: string;
    weight: number;
}

export interface AliasExpansion {
    value: string;
    weight: number;
}

let fuse: Fuse<AliasDoc> | null = null;
let docs: AliasDoc[] = [];

export function expandAliasTerm(raw: string): AliasExpansion[] {
    const term = SearchTermService.normalizeText(raw);
    if (!term) return [];
    ensureIndex();
    const out = new Map<string, number>();
    add(out, term, 1);
    exact(term).forEach(doc => addDoc(out, doc, 1));
    if (term.length >= 4) {
        fuzzy(term).forEach(({ item, score }) => addDoc(out, item, Math.max(0.25, 1 - (score ?? 0))));
    }
    return [...out.entries()].map(([value, weight]) => ({ value, weight }));
}

function ensureIndex(): void {
    if (fuse) return;
    docs = buildDocs(aliasesJson as AliasMap);
    fuse = new Fuse(docs, {
        includeScore: true,
        threshold: 0.38,
        ignoreLocation: true,
        keys: [{ name: 'term', weight: 1 }],
    });
}

function buildDocs(aliases: AliasMap): AliasDoc[] {
    const result: AliasDoc[] = [];
    Object.entries(aliases).forEach(([canonicalRaw, list]) => {
        const canonical = SearchTermService.normalizeText(canonicalRaw);
        if (!canonical) return;
        result.push({ term: canonical, canonical, weight: 1 });
        list.forEach(entry => {
            const alias = SearchTermService.normalizeText(aliasTerm(entry));
            if (alias) result.push({ term: alias, canonical, weight: aliasWeight(entry) });
        });
    });
    return dedupe(result);
}

function exact(term: string): AliasDoc[] {
    return docs.filter(doc => doc.term === term || doc.canonical === term);
}

function fuzzy(term: string): Array<{ item: AliasDoc; score?: number }> {
    return (fuse?.search(term) || []).slice(0, 8);
}

function addDoc(out: Map<string, number>, doc: AliasDoc, multiplier: number): void {
    add(out, doc.canonical, multiplier * doc.weight);
    add(out, doc.term, multiplier * doc.weight * 0.92);
}

function add(out: Map<string, number>, value: string, weight: number): void {
    out.set(value, Math.max(out.get(value) || 0, weight));
}

function aliasTerm(entry: AliasEntry): string {
    return typeof entry === 'string' ? entry : entry.term;
}

function aliasWeight(entry: AliasEntry): number {
    return typeof entry === 'string' ? 0.92 : (entry.weight ?? 0.92);
}

function dedupe(items: AliasDoc[]): AliasDoc[] {
    const map = new Map<string, AliasDoc>();
    items.forEach(item => {
        const key = `${item.term}\u0000${item.canonical}`;
        const prev = map.get(key);
        if (!prev || item.weight > prev.weight) map.set(key, item);
    });
    return [...map.values()];
}
