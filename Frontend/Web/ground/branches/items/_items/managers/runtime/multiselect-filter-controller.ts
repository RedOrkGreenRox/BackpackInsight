import { t } from '../../../../../localization/i18n';
import { insertHTMLAtCaret } from './caret-utils';
import { FilterIconResolver } from './filter-icon-resolver';
import { ListenerRegistrar } from './items-runtime-types';
import { refreshAncestorGroups } from './group-dom-raw';
import { replaceGroupSlot, renderGroupInner } from './rich-group-renderer';
import { RichQueryRenderer } from './rich-query-renderer';
import { replaceFocusedToken } from './token-replacer';

const TYPE_MAPPING: Record<string, string> = { 'Melee Weapon': 'MeleeWeapon', 'Ranged Weapon': 'RangedWeapon' };

export class MultiselectFilterController {
    constructor(
        private readonly container: HTMLElement,
        private readonly addListener: ListenerRegistrar,
        private readonly iconResolver: FilterIconResolver,
        private readonly renderer: RichQueryRenderer,
    ) {}

    public create(containerId: string, options: string[], groupType: string): void {
        const container = this.container.querySelector(`#${containerId}`);
        if (!container) return;
        container.innerHTML = '';
        const { withIcons, withoutIcons } = this.splitByIcon(options, containerId);
        withIcons.forEach(option => container.appendChild(this.createButton(option, containerId, groupType)));
        if (withoutIcons.length && containerId === 'filterTypes') container.appendChild(this.createMoreButton());
        withoutIcons.forEach(option => container.appendChild(this.createButton(option, containerId, groupType, containerId === 'filterTypes')));
        this.addListener(container, 'click', (e: Event) => this.onClick(e, container));
    }

    private splitByIcon(options: string[], containerId: string): { withIcons: string[]; withoutIcons: string[] } {
        const withIcons: string[] = [];
        const withoutIcons: string[] = [];
        options.forEach(option => (this.iconResolver.getIconForFilter(option, containerId) ? withIcons : withoutIcons).push(option));
        return { withIcons, withoutIcons };
    }

    private createButton(option: string, containerId: string, groupType: string, hidden = false): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = hidden ? 'filter-chip no-icon-extra' : 'filter-chip';
        button.dataset['groupType'] = groupType;
        button.dataset['value'] = option;
        if (containerId === 'filterRarities') button.classList.add(`rarity-${option.toLowerCase()}`);
        const iconHtml = this.iconResolver.getIconForFilter(option, containerId);
        const label = containerId === 'filterSort' ? t(`items_sort_${option.toLowerCase().replace(' ', '_')}`) : option;
        button.title = label;
        button.setAttribute('aria-label', label);
        button.innerHTML = iconHtml || `<span>${label}</span>`;
        return button;
    }

    private createMoreButton(): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-chip filter-more-chip';
        button.dataset['moreToggle'] = 'true';
        button.innerHTML = '<span>…</span>';
        return button;
    }

    private onClick(e: Event, container: Element): void {
        const button = (e.target as HTMLElement).closest('.filter-chip') as HTMLButtonElement;
        if (!button || !container.classList.contains('show')) return;
        if (button.dataset['moreToggle']) return this.toggleNoIcon(container);
        const option = button.dataset['value']!;
        const type = button.dataset['groupType']!;
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (!richInput) return;
        if (type === 'sort') return this.toggleSortTag(richInput, option);
        if (this.tryUpdateFocusedToken(richInput, option, type)) return;
        if (this.tryReplacePlaceholder(richInput, option, type)) return;
        this.insertNewTag(richInput, option);
    }

    private toggleNoIcon(container: Element): void {
        container.classList.toggle('show-no-icon-extra');
    }

    private tryUpdateFocusedToken(richInput: HTMLElement, option: string, type: string): boolean {
        const focusedToken = richInput.querySelector('.rich-token.focused-token') as HTMLElement;
        if (!focusedToken || type === 'sort') return false;
        if (focusedToken.dataset['value'] !== option || focusedToken.dataset['groupType'] !== type) {
            replaceFocusedToken(richInput, focusedToken, option, this.renderer, value => this.mapped(value));
            return true;
        }
        const nextRaw = this.nextRawForToken(focusedToken, option);
        if (!nextRaw) { focusedToken.remove(); richInput.dispatchEvent(new Event('input', { bubbles: true })); return true; }
        const newToken = this.htmlToElement(this.renderer.compileTokenToHTML(nextRaw));
        newToken.classList.add('focused-token');
        richInput.replaceChild(newToken, focusedToken);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    }

    private tryReplacePlaceholder(richInput: HTMLElement, option: string, type: string): boolean {
        const placeholder = richInput.querySelector('.rich-placeholder.active-placeholder') as HTMLElement;
        if (!placeholder || type === 'sort') return false;
        const newTag = `<${this.mapped(option)}>`;
        const group = placeholder.closest('.rich-group') as HTMLElement | null;
        if (group) this.replaceGroupPlaceholder(group, newTag);
        else richInput.replaceChild(this.htmlToElement(this.renderer.compileTokenToHTML(`[${newTag}]`)), placeholder);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    }

    private insertNewTag(richInput: HTMLElement, option: string): void {
        const tag = `[<${this.mapped(option)}>]`;
        const html = this.renderer.compileTokenToHTML(tag);
        insertHTMLAtCaret(richInput, html);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    private nextRawForToken(token: HTMLElement, option: string): string {
        const mapped = this.mapped(option);
        const isExact = token.classList.contains('exact');
        const isNegated = token.classList.contains('negated');
        if (mapped === 'Purchasable') return isExact && !isNegated ? `[!<${mapped}>]` : '';
        if (isExact && !isNegated) return `[${mapped}]`;
        if (!isExact && !isNegated) return `[!<${mapped}>]`;
        if (isExact && isNegated) return `[!${mapped}]`;
        return '';
    }

    private replaceGroupPlaceholder(group: HTMLElement, token: string): void {
        const raw = replaceGroupSlot(group.dataset['raw'] || '[]', token);
        group.dataset['raw'] = raw;
        group.innerHTML = renderGroupInner(raw, value => this.renderer.compileTokenToHTML(value));
        refreshAncestorGroups(group);
    }

    private toggleSortTag(richInput: HTMLElement, option: string): void {
        const tag = `{${option}}`;
        const existing = Array.from(richInput.querySelectorAll('.op-sort'))
            .find(el => (el as HTMLElement).dataset['raw'] === tag);
        if (existing) existing.remove();
        else insertHTMLAtCaret(richInput, `<span class="rich-operator op-sort" contenteditable="false" data-raw="${tag}">${t(`items_sort_${option.toLowerCase().replace(' ', '_')}`)}</span>`);
        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    private htmlToElement(html: string): HTMLElement {
        const dummy = document.createElement('div');
        dummy.innerHTML = html;
        return dummy.firstElementChild as HTMLElement;
    }

    private mapped(option: string): string {
        return TYPE_MAPPING[option] || option.replace(/\s+/g, '');
    }
}
