import { t } from '../../../../../localization/i18n';
import { FilterIconResolver } from './filter-icon-resolver';
import { ListenerRegistrar, SortKey } from './items-runtime-types';

export interface MultiselectCallbacks {
    cycleFilter(value: string, groupType: string): void;
    cycleSort(key: SortKey): void;
    moveSort(key: SortKey, direction: -1 | 1): void;
}

export class MultiselectFilterController {
    constructor(
        private readonly container: HTMLElement,
        private readonly addListener: ListenerRegistrar,
        private readonly iconResolver: FilterIconResolver,
        private readonly callbacks: MultiselectCallbacks,
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
        if (containerId === 'filterSort') return { withIcons: [], withoutIcons: options };
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
        const label = containerId === 'filterSort' ? sortLabel(option) : option;
        const iconHtml = this.iconResolver.getIconForFilter(option, containerId);
        button.title = label;
        button.setAttribute('aria-label', label);
        button.innerHTML = containerId === 'filterSort'
            ? `<span>${label}</span><span class="sort-dir"></span><span class="sort-priority"></span><span class="sort-order-controls"><b data-sort-move="up">▲</b><b data-sort-move="down">▼</b></span>`
            : iconHtml || `<span>${label}</span>`;
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
        const option = button.dataset['value'];
        const type = button.dataset['groupType'];
        if (!option || !type) return;
        if (type === 'sort') return this.handleSortClick(e, option);
        this.callbacks.cycleFilter(option, type);
    }

    private handleSortClick(e: Event, option: string): void {
        const key = sortKeyFromOption(option);
        const move = (e.target as HTMLElement).dataset['sortMove'];
        if (move === 'up' || move === 'down') this.callbacks.moveSort(key, move === 'up' ? -1 : 1);
        else this.callbacks.cycleSort(key);
    }

    private toggleNoIcon(container: Element): void { container.classList.toggle('show-no-icon-extra'); }
}

function sortKeyFromOption(option: string): SortKey {
    if (option === 'Relevance') return 'relevance';
    if (option === 'Alphabet') return 'alphabet';
    return 'rarity';
}

function sortLabel(option: string): string {
    if (option === 'Relevance') return t('items_sort_relevance');
    if (option === 'Alphabet') return 'Алфавит';
    return 'Редкость';
}
