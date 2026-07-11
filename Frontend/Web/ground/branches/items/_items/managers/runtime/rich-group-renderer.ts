import { logicLabel } from './logic-labels';

const SLOT = '()';
type TokenCompiler = (raw: string) => string;
type Part = { html: string; operand: boolean };

export function slotToken(): string { return SLOT; }

export function renderGroup(raw: string, compileToken: TokenCompiler): string {
    return `<span class="rich-group" contenteditable="false" data-raw="${escapeAttr(raw)}">${renderGroupInner(raw, compileToken)}</span>`;
}

export function renderGroupInner(raw: string, compileToken: TokenCompiler): string {
    const content = unwrap(raw).trim();
    if (!content || content === SLOT) return bracket(placeholder());
    return bracket(renderContent(content, compileToken));
}

export function replaceGroupSlot(raw: string, token: string): string {
    if (raw.includes(SLOT)) return raw.replace(SLOT, token);
    const inner = unwrap(raw).trim();
    return `[${inner ? `${inner} ${token}` : token}]`;
}

export function appendGroupOperator(raw: string, op: '&' | '|'): string {
    const inner = unwrap(raw).trim();
    if (!inner || inner.endsWith('&') || inner.endsWith('|')) return raw;
    if (inner.includes(SLOT)) return raw.replace(SLOT, `${op} ${SLOT}`);
    return `[${inner} ${op} ${SLOT}]`;
}

export function sanitizeGroupPlaceholders(query: string): string {
    return query.replaceAll(SLOT, '').replace(/\[\s*\]/g, ' ')
        .replace(/\s+([\]])/g, '$1').replace(/([\[])[\s&|]+/g, '$1')
        .replace(/\s*[&|]\s*\]/g, ']').replace(/\s+/g, ' ').trim();
}

function renderContent(content: string, compileToken: TokenCompiler): string {
    const parts = parseParts(content, compileToken);
    let html = '';
    let prevOperand = false;
    parts.forEach(part => {
        if (prevOperand && part.operand) html += operator('&', true);
        html += part.html;
        prevOperand = part.operand;
    });
    return html;
}

function parseParts(content: string, compileToken: TokenCompiler): Part[] {
    const parts: Part[] = [];
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        if (/\s/.test(char || '')) { i++; continue; }
        if (char === '[') { const parsed = parseBracket(content, i, compileToken); parts.push(parsed.part); i = parsed.end + 1; continue; }
        if (char === '&' || char === '|') { parts.push({ html: operator(char), operand: false }); i++; continue; }
        if (char === '!') { parts.push({ html: operator('!'), operand: false }); i++; continue; }
        if (content.startsWith(SLOT, i)) { parts.push({ html: placeholder(), operand: true }); i += SLOT.length; continue; }
        const start = i;
        while (i < content.length && !/[\s[\]&|!]/.test(content[i] || '')) i++;
        const word = content.slice(start, i);
        const op = wordOperator(word);
        parts.push(op ? { html: operator(op), operand: false } : { html: compileToken(`[${word}]`), operand: true });
    }
    return parts;
}

function parseBracket(content: string, start: number, compileToken: TokenCompiler): { part: Part; end: number } {
    const end = findMatching(content, start);
    if (end <= start) return { part: { html: compileToken(`[${content.slice(start + 1)}]`), operand: true }, end: content.length - 1 };
    const raw = content.slice(start, end + 1);
    const html = isSimpleToken(raw) ? compileToken(raw) : renderGroup(raw, compileToken);
    return { part: { html, operand: true }, end };
}

function isSimpleToken(raw: string): boolean {
    const content = unwrap(raw).trim();
    return !!content && content !== SLOT && !content.includes('[') && !/[&|]/.test(content);
}

function bracket(content: string): string {
    return `<span class="group-bracket">[</span>${content}<span class="group-bracket">]</span>`;
}

function placeholder(): string {
    return '<span class="rich-placeholder active-placeholder" contenteditable="false" data-parent-op="brackets">Выберите условие...</span>';
}

function wordOperator(word: string): string | null {
    const normalized = word.toUpperCase();
    if (normalized === 'AND' || normalized === 'И') return '&';
    if (normalized === 'OR' || normalized === 'ИЛИ') return '|';
    if (normalized === 'NOT' || normalized === 'НЕ') return '!';
    return null;
}

function operator(op: string, implicit = false): string {
    const cls = op === '&' ? 'op-and' : op === '|' ? 'op-or' : 'op-not';
    const label = logicLabel(op);
    const extra = implicit ? ' implicit-op' : '';
    return `<span class="rich-operator ${cls}${extra}" contenteditable="false" data-raw="${op}">${label}</span>`;
}

function unwrap(raw: string): string { return raw.startsWith('[') && raw.endsWith(']') ? raw.slice(1, -1) : raw; }

function findMatching(text: string, start: number): number {
    let depth = 0;
    for (let i = start; i < text.length; i++) {
        if (text[i] === '[') depth++;
        else if (text[i] === ']' && --depth === 0) return i;
    }
    return -1;
}

function escapeAttr(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
