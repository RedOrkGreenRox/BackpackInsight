import { t } from '../../../../../localization/i18n';
import { HERO_LIST, RARITY_LIST, TYPE_LIST } from './items-runtime-types';
import { groupRawFromDom } from './group-dom-raw';
import { logicLabel } from './logic-labels';
import { renderGroup } from './rich-group-renderer';

export class RichQueryRenderer {
    constructor(private readonly resolveIcon: (value: string, filterType: string) => string | null) {}

    public renderTextToRichHTML(query: string): string {
        let html = '';
        let i = 0;
        let textBuffer = '';
        const caretGap = ' ';
        const flush = () => {
            if (!textBuffer) return;
            html += textBuffer
                .replace(/\s+(ИЛИ|OR|\|)\s+/gi, ` ${caretGap}<span class="rich-operator op-or" contenteditable="false" data-raw="|">${logicLabel('|')}</span>${caretGap} `)
                .replace(/\s+(И|AND|&)\s+/gi, ` ${caretGap}<span class="rich-operator op-and" contenteditable="false" data-raw="&">${logicLabel('&')}</span>${caretGap} `)
                .replace(/\s*(НЕ|NOT|!)\s*(?=\[)/gi, ` ${caretGap}<span class="rich-operator op-not" contenteditable="false" data-raw="!">${logicLabel('!')}</span>${caretGap}`);
            textBuffer = '';
        };
        while (i < query.length) {
            const char = query[i];
            if (char === '[') i = this.consumeBracket(query, i, () => flush(), token => { html += token; });
            else if (char === '&') { flush(); html += `${caretGap}<span class="rich-operator op-and" contenteditable="false" data-raw="&">${logicLabel('&')}</span>${caretGap}`; i++; }
            else if (char === '|') { flush(); html += `${caretGap}<span class="rich-operator op-or" contenteditable="false" data-raw="|">${logicLabel('|')}</span>${caretGap}`; i++; }
            else if (char === '!' && query[i + 1] !== '[') { flush(); html += `${caretGap}<span class="rich-operator op-not" contenteditable="false" data-raw="!">${logicLabel('!')}</span>${caretGap}`; i++; }
            else if (char === '{') i = this.consumeSort(query, i, () => flush(), token => { html += token; }, text => { textBuffer += text; }, caretGap);
            else { textBuffer += char; i++; }
        }
        flush();
        return ` ${html} `;
    }

    public compileTokenToHTML(tagText: string): string {
        let content = tagText.slice(1, -1).trim();
        let isNegated = false;
        let isExact = false;
        if (content.startsWith('!')) { isNegated = true; content = content.slice(1).trim(); }
        if (content.startsWith('<') && content.endsWith('>')) { isExact = true; content = content.slice(1, -1).trim(); }
        let stateClasses = isExact ? 'exact' : 'plain';
        if (isNegated) stateClasses = `negated ${stateClasses}`;
        const groupType = this.resolveGroupType(content);
        const iconHtml = this.resolveIcon(content, this.filterId(groupType));
        const displayLabel = groupType === 'sort' ? t(`items_sort_${content.toLowerCase().replace(' ', '_')}`) : content;
        return `
            <span class="rich-token ${stateClasses}" contenteditable="false" data-raw="${tagText}" data-value="${content}" data-group-type="${groupType}">
                ${iconHtml || ''}${iconHtml ? '' : `<span>${displayLabel}</span>`}<span class="token-close-btn">&times;</span>
            </span>
        `.trim().replace(/\s+/g, ' ');
    }

    public getCleanTextFromRichHTML(container: HTMLElement): string {
        const richInput = container.querySelector('#itemSearch') as HTMLElement;
        if (!richInput) return '';
        let text = '';
        richInput.childNodes.forEach(node => {
            if (node.nodeType === 3) text += node.textContent?.replace(/\u200B/g, '');
            else if (node.nodeType === 1) {
                const el = node as HTMLElement;
                if (el.classList.contains('rich-placeholder')) return;
                if (el.classList.contains('caret-spacer')) { text += ' '; return; }
                if (el.classList.contains('rich-group')) text += ` ${groupRawFromDom(el)} `;
                else text += el.dataset['raw'] ? ` ${el.dataset['raw']} ` : el.textContent?.replace(/\u200B/g, '');
            }
        });
        return text.replace(/\s+/g, ' ').trim();
    }

    private resolveGroupType(content: string): string {
        const norm = content.toLowerCase();
        if (HERO_LIST.includes(norm)) return 'hero';
        if (RARITY_LIST.includes(norm)) return 'rarity';
        if (TYPE_LIST.includes(norm)) return 'type';
        if (norm === 'purchasable') return 'flag';
        if (['buff','haste','regeneration','resist','thorns','luck','lifesteal','empower','cleanse','heal','mana'].includes(norm)) return 'buff';
        if (['burn','bleed','poison','chill','frost','curse','blind','stun','debuff'].includes(norm)) return 'debuff';
        if (['critical','cooldown','health','maxhealth','armor','damage','accuracy','stamina','staminarecovery','static','soul','shield','block'].includes(norm)) return 'stat';
        return 'plain';
    }

    private consumeBracket(query: string, i: number, flush: () => void, add: (html: string) => void): number {
        flush();
        let depth = 0;
        const start = i;
        let matched = false;
        while (i < query.length) {
            if (query[i] === '[') depth++;
            else if (query[i] === ']' && --depth === 0) { matched = true; i++; break; }
            i++;
        }
        if (!matched) { add(query.slice(start)); return query.length; }
        const raw = query.slice(start, i);
        const rendered = this.isSimpleToken(raw) ? this.compileTokenToHTML(raw) : renderGroup(raw, token => this.compileTokenToHTML(token));
        add(` ${rendered} `);
        return i;
    }

    private filterId(groupType: string): string {
        const ids: Record<string, string> = {
            hero: 'filterHeroes', type: 'filterTypes', rarity: 'filterRarities',
            buff: 'filterBuffs', debuff: 'filterDebuffs', stat: 'filterStats', flag: 'filterFlags', sort: 'filterSort',
        };
        return ids[groupType] || 'filterTypes';
    }

    private isSimpleToken(raw: string): boolean {
        const content = raw.slice(1, -1).trim();
        return !!content && content !== '__slot__' && !content.includes('[') && !/[&|]/.test(content);
    }

    private consumeSort(query: string, i: number, flush: () => void, add: (html: string) => void, addText: (text: string) => void, gap: string): number {
        flush();
        const start = i;
        while (i < query.length && query[i] !== '}') i++;
        if (query[i] !== '}') { addText(query.slice(start)); return query.length; }
        i++;
        const sortTag = query.slice(start, i);
        const translated = t(`items_sort_${sortTag.slice(1, -1).trim().toLowerCase().replace(' ', '_')}`);
        add(`${gap}<span class="rich-operator op-sort" contenteditable="false" data-raw="${sortTag}">${translated}</span>${gap}`);
        return i;
    }
}
