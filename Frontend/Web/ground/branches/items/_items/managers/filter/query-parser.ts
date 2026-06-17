import { ASTNode } from './filter-types';

function normalizeOperators(query: string): string {
    return query
        .replace(/(^|[\s\[\]()])(OR|ИЛИ)(?=$|[\s\[\]()])/gi, '$1|')
        .replace(/(^|[\s\[\]()])(AND|И)(?=$|[\s\[\]()])/gi, '$1&')
        .replace(/(^|[\s\[\]()])(NOT|НЕ)(?=$|[\s\[\]()])/gi, '$1!');
}

function splitByOperator(query: string, op: string): string[] {
    const parts: string[] = [];
    let start = 0;
    let depth = 0;
    const n = query.length;
    const opLen = op.length;
    for (let i = 0; i < n; i++) {
        if (query[i] === '[') depth++;
        else if (query[i] === ']') depth--;
        else if (depth === 0 && query.slice(i, i + opLen) === op) {
            parts.push(query.slice(start, i));
            start = i + opLen;
            i += opLen - 1;
        }
    }
    parts.push(query.slice(start));
    return parts.map(p => p.trim()).filter(Boolean);
}

function tokenizeBracketContent(content: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    const n = content.length;
    while (i < n) {
        while (i < n && /\s/.test(content[i] || '')) i++;
        if (i >= n) break;
        const start = i;
        if (content[i] === '(') {
            let depth = 0;
            while (i < n) {
                if (content[i] === '(') depth++;
                else if (content[i] === ')' && --depth === 0) { i++; break; }
                i++;
            }
        } else {
            while (i < n && !/\s/.test(content[i] || '') && content[i] !== '(') i++;
        }
        tokens.push(content.slice(start, i));
    }
    return tokens;
}

export function parseToken(tokenStr: string): ASTNode {
    let isNegated = false;
    let isExact = false;
    let isComparison = false;
    let term = tokenStr.trim();
    if (term.startsWith('!')) { isNegated = true; term = term.slice(1).trim(); }
    if (term.startsWith('<') && term.endsWith('>')) {
        isExact = true;
        term = term.slice(1, -1).trim();
    }
    if (term.includes('<=') || term.includes('>=') || term.includes('<') || term.includes('>') || term.includes('=')) {
        isComparison = true;
    }
    return { type: 'token', term, isExact, isNegated, isComparison };
}

function parseBracket(trimmed: string, start: number): { node: ASTNode; end: number; matched: boolean } {
    let i = start;
    let depth = 0;
    let matched = false;
    while (i < trimmed.length) {
        if (trimmed[i] === '[') depth++;
        else if (trimmed[i] === ']' && --depth === 0) { matched = true; i++; break; }
        i++;
    }
    if (!matched) return { node: parseToken(trimmed.slice(start)), end: trimmed.length, matched };
    const content = trimmed.slice(start + 1, i - 1).trim();
    const node = content.includes('[')
        ? makeAnd(parseQueryToAST(content))
        : { type: 'or' as const, children: tokenizeBracketContent(content).map(parseToken) };
    return { node, end: i, matched };
}

function makeAnd(children: ASTNode[]): ASTNode {
    return children.length === 1 && children[0]!.type === 'and' ? children[0]! : { type: 'and', children };
}

export function parseQueryToAST(query: string): ASTNode[] {
    const trimmed = normalizeOperators(query.trim());
    if (!trimmed) return [];
    const orParts = splitByOperator(trimmed, '|');
    if (orParts.length > 1) return [{ type: 'or', children: orParts.map(p => makeAnd(parseQueryToAST(p))) }];
    const andParts = splitByOperator(trimmed, '&');
    if (andParts.length > 1) return [{ type: 'and', children: andParts.map(p => makeAnd(parseQueryToAST(p))) }];

    const clauses: ASTNode[] = [];
    let i = 0;
    while (i < trimmed.length) {
        while (i < trimmed.length && /\s/.test(trimmed[i] || '')) i++;
        if (i >= trimmed.length) break;
        let isNegated = false;
        if (trimmed[i] === '!') {
            isNegated = true;
            i++;
            while (i < trimmed.length && /\s/.test(trimmed[i] || '')) i++;
        }
        let node: ASTNode;
        if (trimmed[i] === '[') {
            const parsed = parseBracket(trimmed, i);
            node = parsed.node;
            i = parsed.end;
        } else {
            const start = i;
            while (i < trimmed.length && !/\s/.test(trimmed[i] || '') && trimmed[i] !== '[') i++;
            node = parseToken(trimmed.slice(start, i));
        }
        if (isNegated) node.isNegated = true;
        clauses.push(node);
    }
    return clauses;
}
