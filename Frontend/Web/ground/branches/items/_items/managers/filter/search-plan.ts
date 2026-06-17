import { sanitizeGroupPlaceholders } from '../runtime/rich-group-renderer';
import { expandAliasTerm } from './alias-fuzzy';

export interface WeightedTerm { value: string; weight: number; group: number }
export interface SearchPlan { terms: WeightedTerm[]; strictQueries: string[]; groupCount: number }

export function buildSearchPlan(rawQuery: string): SearchPlan {
    const query = normalizeLogicWords(sanitizeGroupPlaceholders(stripSortTags(rawQuery)));
    if (hasGlobalLogic(query)) return { terms: [], strictQueries: [query], groupCount: 0 };
    const terms: WeightedTerm[] = [];
    const strictQueries: string[] = [];
    let text = '';
    let group = 0;
    for (let i = 0; i < query.length; i++) {
        if (query[i] !== '[') { text += query[i]; continue; }
        group = pushText(text, terms, strictQueries, group);
        text = '';
        const end = findMatchingBracket(query, i);
        if (end < 0) { text += query.slice(i); break; }
        group = processBracket(query.slice(i, end + 1), terms, strictQueries, group);
        i = end;
    }
    group = pushText(text, terms, strictQueries, group);
    return { terms, strictQueries, groupCount: group };
}

function pushText(text: string, terms: WeightedTerm[], strictQueries: string[], group: number): number {
    const token = text.trim();
    if (!token) return group;
    if (isStrictText(token)) strictQueries.push(token);
    else addTerm(token, 2.4, group++, terms);
    return group;
}

function processBracket(raw: string, terms: WeightedTerm[], strictQueries: string[], group: number): number {
    const token = raw.slice(1, -1).trim();
    if (isPurchasable(token)) strictQueries.push(purchasableQuery(token));
    else if (isStructuredBracket(token)) strictQueries.push(raw);
    else addTerm(token, weightForChip(token), group++, terms);
    return group;
}

function addTerm(value: string, weight: number, group: number, terms: WeightedTerm[]): void {
    const expanded = expandAliasTerm(value);
    const list = expanded.length ? expanded : [{ value, weight: 1 }];
    list.forEach(item => terms.push({ value: item.value, weight: weight * item.weight, group }));
}

function isStructuredBracket(token: string): boolean {
    return token.includes('[') || hasGlobalLogic(token) || isStrictToken(token);
}

function normalizeLogicWords(query: string): string {
    return query
        .replace(/(^|[\s\[\]()])(OR|ИЛИ)(?=$|[\s\[\]()])/gi, '$1|')
        .replace(/(^|[\s\[\]()])(AND|И)(?=$|[\s\[\]()])/gi, '$1&')
        .replace(/(^|[\s\[\]()])(NOT|НЕ)(?=$|[\s\[\]()])/gi, '$1!');
}

function stripSortTags(query: string): string { return (query || '').replace(/\{[^}]+\}/g, ''); }
function hasGlobalLogic(query: string): boolean { return /[&|]/.test(query); }
function isStrictText(text: string): boolean { return text.trim().startsWith('!') || isComparison(text); }
function isStrictToken(token: string): boolean { return token.startsWith('!') || (token.startsWith('<') && token.endsWith('>')) || isComparison(token); }
function isComparison(text: string): boolean { return /(?:^|\s|\()?\d*(?:\.\d+)?\s*[<>]=?|=/.test(text) && /[a-zA-Z_]/.test(text); }
function isPurchasable(token: string): boolean { return token.replace(/[!<>\s]/g, '').toLowerCase() === 'purchasable'; }
function purchasableQuery(token: string): string { return token.trim().startsWith('!') ? '[!<Purchasable>]' : '[<Purchasable>]'; }

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

function findMatchingBracket(query: string, start: number): number {
    let depth = 0;
    for (let i = start; i < query.length; i++) {
        if (query[i] === '[') depth++;
        else if (query[i] === ']' && --depth === 0) return i;
    }
    return -1;
}
