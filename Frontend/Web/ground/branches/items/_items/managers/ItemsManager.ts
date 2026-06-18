import { ItemsFilterManager } from './ItemsFilterManager';
import { FilterState, ItemsStateManager } from './ItemsStateManager';
import { AdvancedPanelController } from './runtime/advanced-panel-controller';
import { ChipsSyncService } from './runtime/chips-sync-service';
import { DropdownController } from './runtime/dropdown-controller';
import { FilterIconResolver } from './runtime/filter-icon-resolver';
import { FilterOptionsController, RuntimeFilterOptions } from './runtime/filter-options-controller';
import { attachImageErrorHandler } from './runtime/image-error-handler';
import { defaultFilters, defaultSortPriorities, SortKey, SortPriority } from './runtime/items-runtime-types';
import { ItemsGridRenderer } from './runtime/items-grid-renderer';
import { LogicalChipsController } from './runtime/logical-chips-controller';
import { MultiselectFilterController } from './runtime/multiselect-filter-controller';
import { RichInputController } from './runtime/rich-input-controller';
import { RichQueryRenderer } from './runtime/rich-query-renderer';
import { SearchDebouncer } from './runtime/search-debouncer';

// Импортируем утилиты слотов и ввода каретки для продвинутого поиска
import { insertHTMLAtCaret } from './runtime/caret-utils';
import { refreshAncestorGroups } from './runtime/group-dom-raw';
import { renderGroupInner, replaceGroupSlot } from './runtime/rich-group-renderer';

// Импортируем выделенные контроллеры для SRP
import { ItemsUrlController } from './runtime/items-url-controller';
import { ItemsPromptChipsController } from './runtime/items-prompt-chips-controller';
import { ItemsHelpController } from './runtime/items-help-controller';

export class ItemsManager {
    private readonly filterManager = new ItemsFilterManager();
    private readonly stateManager = new ItemsStateManager();
    private readonly iconResolver = new FilterIconResolver();
    private readonly richRenderer = new RichQueryRenderer((value, type) => this.iconResolver.getIconForFilter(value, type));
    private readonly gridRenderer: ItemsGridRenderer;
    private readonly chipsSync: ChipsSyncService;
    private readonly searchDebouncer = new SearchDebouncer(200);
    private readonly cleanupFns: (() => void)[] = [];
    private richInputController: RichInputController | null = null;
    private filteredItems: any[] = [];
    private sortPriorities: SortPriority[] = defaultSortPriorities();
    private advancedFiltersVisible = false;
    private advancedModeEnabled = false;
    private filters: FilterState = defaultFilters();

    // Экземпляры выделенных контроллеров
    private urlController!: ItemsUrlController;
    private promptChipsController!: ItemsPromptChipsController;
    private helpController!: ItemsHelpController;

    constructor(private readonly container: HTMLElement, private readonly items: any[], private readonly sharedQuery: string | null = null) {
        this.gridRenderer = new ItemsGridRenderer(container);
        this.chipsSync = new ChipsSyncService(container);
    }

    public init(): void {
        this.restoreState();
        this.urlController = new ItemsUrlController(this.filters, () => this.advancedModeEnabled, this.container);
        this.promptChipsController = new ItemsPromptChipsController(this.container, this.filters, this.iconResolver);
        this.helpController = new ItemsHelpController(this.container);

        this.filterManager.initFuse(this.items);
        this.initRichInput();
        this.initPanelControls();
        attachImageErrorHandler(this.container, this.addListener.bind(this));
        new DropdownController(this.container, this.addListener.bind(this)).init();
        this.setupFilterOptions();
        this.initLogicalChips();
        this.applyAdvancedModeUI();
        this.syncAll();
    }

    public destroy(): void {
        this.saveState();
        this.searchDebouncer.clear();
        this.gridRenderer.destroy();
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns.length = 0;
    }

    private restoreState(): void {
        const restored = this.stateManager.restoreState();
        this.filters = restored.filters;
        this.sortPriorities = this.parseSortState(restored.currentSort);
        this.advancedFiltersVisible = restored.advancedFiltersVisible;
        this.advancedModeEnabled = restored.advancedModeEnabled;
        if (this.sharedQuery !== null) {
            this.filters = defaultFilters();
            this.filters.searchQuery = this.sharedQuery;
            this.advancedFiltersVisible = true;
            this.advancedModeEnabled = true;
        }
        this.ensureNegativeSets();
    }

    private parseSortState(raw: string): SortPriority[] {
        try {
            const parsed = JSON.parse(raw || '');
            if (parsed && Array.isArray(parsed) && parsed.every(item => ['relevance', 'rarity', 'alphabet'].includes(item?.key) && ['down', 'up'].includes(item?.direction))) {
                return parsed as SortPriority[];
            }
        } catch {
            // legacy value below
        }
        if (raw === 'rarity-up') return [{ key: 'rarity', direction: 'up' }];
        if (raw === 'name') return [{ key: 'alphabet', direction: 'up' }];
        if (raw === 'alphabet-down') return [{ key: 'alphabet', direction: 'down' }];
        if (raw === 'relevance') return [{ key: 'relevance', direction: 'down' }];
        return defaultSortPriorities();
    }

    private ensureNegativeSets(): void {
        this.filters.excludedTypes ??= new Set();
        this.filters.excludedRarities ??= new Set();
        this.filters.excludedHeroes ??= new Set();
        this.filters.excludedUnlockSources ??= new Set();
        this.filters.excludedBuffs ??= new Set();
        this.filters.excludedDebuffs ??= new Set();
        this.filters.excludedStats ??= new Set();
    }

    private initRichInput(): void {
        this.richInputController = new RichInputController(
            this.container,
            this.richRenderer,
            this.addListener.bind(this),
            () => this.onQueryInput(),
            () => this.onQueryCompiled(),
            () => this.advancedModeEnabled,
        );
        this.richInputController.init(this.filters.searchQuery);
    }

    private initPanelControls(): void {
        new AdvancedPanelController(
            this.container,
            this.addListener.bind(this),
            () => this.advancedFiltersVisible,
            visible => { this.advancedFiltersVisible = visible; },
            () => this.saveState(),
        ).init();
        this.addListener(this.container.querySelector('#clearFilters'), 'click', () => this.clearFilters());
        this.addListener(this.container.querySelector('#advancedModeToggle'), 'change', e => {
            this.advancedModeEnabled = (e.target as HTMLInputElement).checked;
            if (this.advancedModeEnabled) this.richInputController?.triggerCompilation();
            else this.richInputController?.renderPlainText();
            this.applyAdvancedModeUI();
            this.saveState();
            this.applyFilters();
        });
        this.addListener(this.container.querySelector('#positiveFilterList'), 'click', e => this.removePromptChip(e));
        this.addListener(this.container.querySelector('#negativeFilterList'), 'click', e => this.removePromptChip(e));
        this.addListener(this.container, 'click', e => this.copyHelpExample(e));
    }

    private setupFilterOptions(): void {
        const multiselect = new MultiselectFilterController(
            this.container,
            this.addListener.bind(this),
            this.iconResolver,
            {
                cycleFilter: (value, groupType) => this.cycleConcreteFilter(value, groupType),
                cycleSort: key => this.cycleSort(key),
                moveSort: (key, direction) => this.moveSort(key, direction),
            },
        );
        const options = this.filterManager.calculateFilterOptions(this.items);
        new FilterOptionsController(multiselect).setup(options);
        this.helpController.renderAdvancedHelp(options);
        this.applyFilters();
    }

    private initLogicalChips(): void {
        if (!this.richInputController) return;
        new LogicalChipsController(this.container, this.addListener.bind(this), this.richInputController, this.richRenderer).init();
    }

    private onQueryInput(): void {
        this.filters.searchQuery = this.richRenderer.getCleanTextFromRichHTML(this.container);
        this.saveState();
        this.urlController.syncUrl();
        this.searchDebouncer.run(() => this.applyFilters());
    }

    private onQueryCompiled(): void {
        this.filters.searchQuery = this.richRenderer.getCleanTextFromRichHTML(this.container);
        this.saveState();
        this.urlController.syncUrl();
        this.applyFilters();
        this.syncAll();
    }

    private clearFilters(): void {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (richInput) richInput.textContent = '';
        this.sortPriorities = defaultSortPriorities();
        this.filters = defaultFilters();
        // Переинициализируем UrlController
        this.urlController = new ItemsUrlController(this.filters, () => this.advancedModeEnabled, this.container);
        this.saveState();
        this.urlController.syncUrl();
        this.applyFilters();
        this.syncAll();
    }

    private cycleConcreteFilter(value: string, groupType: string): void {
        if (this.advancedModeEnabled) {
            // Если включен продвинутый режим - вставляем тег в слот или позицию каретки
            this.insertTagIntoRichInput(value, groupType);
            return;
        }

        this.ensureNegativeSets();
        if (groupType === 'flag' && value === 'Purchasable') {
            this.filters.purchasableOnly = this.filters.purchasableOnly === null ? true : this.filters.purchasableOnly === true ? false : null;
            this.afterFilterChange();
            return;
        }
        const sets = this.setsFor(groupType);
        if (!sets) return;
        if (!sets.include.has(value) && !sets.exclude.has(value)) sets.include.add(value);
        else if (sets.include.has(value)) { sets.include.delete(value); sets.exclude.add(value); }
        else sets.exclude.delete(value);
        this.afterFilterChange();
    }

    private insertTagIntoRichInput(value: string, groupType: string): void {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement | null;
        if (!richInput) return;

        const isStrict = ['type', 'rarity', 'hero', 'unlock', 'flag'].includes(groupType);
        const tag = isStrict ? `[<${this.mappedTag(value)}>]` : `[${value}]`;

        const placeholder = this.container.querySelector('.rich-placeholder.active-placeholder') as HTMLElement | null;
        const group = placeholder?.closest('.rich-group') as HTMLElement | null;

        if (group) {
            const nextRaw = replaceGroupSlot(group.dataset['raw'] || '[]', tag);
            group.dataset['raw'] = nextRaw;
            group.innerHTML = renderGroupInner(nextRaw, token => this.richRenderer.compileTokenToHTML(token));
            refreshAncestorGroups(group);
        } else {
            insertHTMLAtCaret(richInput, this.richRenderer.compileTokenToHTML(tag));
        }

        richInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    private mappedTag(value: string): string {
        if (value === 'Melee Weapon') return 'MeleeWeapon';
        if (value === 'Ranged Weapon') return 'RangedWeapon';
        return value.replace(/\s+/g, '');
    }

    private afterFilterChange(): void {
        this.saveState();
        this.urlController.syncUrl();
        this.applyFilters();
        this.syncAll();
    }

    private setsFor(groupType: string): { include: Set<string>; exclude: Set<string> } | null {
        this.ensureNegativeSets();
        if (groupType === 'type') return { include: this.filters.selectedTypes, exclude: this.filters.excludedTypes! };
        if (groupType === 'rarity') return { include: this.filters.selectedRarities, exclude: this.filters.excludedRarities! };
        if (groupType === 'hero') return { include: this.filters.selectedHeroes, exclude: this.filters.excludedHeroes! };
        if (groupType === 'unlock') return { include: this.filters.selectedUnlockSources, exclude: this.filters.excludedUnlockSources! };
        if (groupType === 'buff') return { include: this.filters.selectedBuffs, exclude: this.filters.excludedBuffs! };
        if (groupType === 'debuff') return { include: this.filters.selectedDebuffs, exclude: this.filters.excludedDebuffs! };
        if (groupType === 'stat') return { include: this.filters.selectedStats, exclude: this.filters.excludedStats! };
        return null;
    }

    private cycleSort(key: SortKey): void {
        const existing = this.sortPriorities.find(item => item.key === key);
        if (!existing) this.sortPriorities.push({ key, direction: 'down' });
        else if (existing.direction === 'down') existing.direction = 'up';
        else this.sortPriorities = this.sortPriorities.filter(item => item.key !== key);
        if (!this.sortPriorities.length) this.sortPriorities = defaultSortPriorities();
        this.afterFilterChange();
    }

    private moveSort(key: SortKey, direction: -1 | 1): void {
        const index = this.sortPriorities.findIndex(item => item.key === key);
        if (index < 0) return;
        const next = index + direction;
        if (next < 0 || next >= this.sortPriorities.length) return;
        const copy = [...this.sortPriorities];
        [copy[index], copy[next]] = [copy[next]!, copy[index]!];
        this.sortPriorities = copy;
        this.afterFilterChange();
    }

    private applyFilters(): void {
        const concreteItems = this.filterManager.applyConcreteFilters(this.items, this.filters);
        const searchedItems = this.advancedModeEnabled
            ? this.filterManager.applyAdvancedSearch(concreteItems, this.filters.searchQuery)
            : this.filterManager.applyPlainTextSearch(concreteItems, this.filters.searchQuery);
        this.filteredItems = this.filterManager.sortItems(searchedItems, [
            { key: 'relevance', direction: 'down' },
            { key: 'rarity', direction: 'down' },
        ], this.advancedModeEnabled ? this.filters.searchQuery : '');
        sessionStorage.setItem('filteredItemsOrder', JSON.stringify(this.filteredItems.map(item => item.name)));
        this.gridRenderer.render(this.filteredItems);
    }

    private syncAll(): void {
        this.chipsSync.sync(this.filters, this.sortPriorities);
        this.renderFormulaPreview();
        this.urlController.renderSearchFilterPreview();
        this.promptChipsController.renderPromptLists();
        const toggle = this.container.querySelector('#advancedModeToggle') as HTMLInputElement | null;
        if (toggle) toggle.checked = this.advancedModeEnabled;
    }

    private saveState(): void {
        this.stateManager.saveState(this.filters, JSON.stringify(this.sortPriorities), this.advancedFiltersVisible, this.advancedModeEnabled);
    }

    private applyAdvancedModeUI(): void {
        this.container.classList.toggle('advanced-search-enabled', this.advancedModeEnabled);
        this.container.querySelectorAll('.advanced-only').forEach(el => {
            (el as HTMLElement).style.display = this.advancedModeEnabled ? '' : 'none';
        });
        this.container.querySelectorAll('.prompt-lists').forEach(el => {
            (el as HTMLElement).style.display = this.advancedModeEnabled ? 'none' : '';
        });
        const formula = this.container.querySelector('#advancedFormulaPreview') as HTMLElement | null;
        if (formula) formula.style.display = 'none';
        const toggle = this.container.querySelector('#advancedModeToggle') as HTMLInputElement | null;
        if (toggle) toggle.checked = this.advancedModeEnabled;
    }

    private copyHelpExample(e: Event): void {
        const btn = (e.target as HTMLElement).closest('.copy-query-btn') as HTMLButtonElement | null;
        const text = btn?.dataset['copy'];
        if (!btn || !text) return;
        navigator.clipboard?.writeText(text).catch(() => undefined);
        btn.textContent = 'Скопировано';
        setTimeout(() => { btn.textContent = 'Копировать'; }, 900);
    }

    private removePromptChip(e: Event): void {
        const token = (e.target as HTMLElement).closest('.prompt-token') as HTMLElement | null;
        if (!token) return;
        const value = token.dataset['value'];
        const groupType = token.dataset['groupType'];
        if (!value || !groupType) return;
        if (groupType === 'flag' && value === 'Purchasable') this.filters.purchasableOnly = null;
        else {
            const sets = this.setsFor(groupType);
            sets?.include.delete(value);
            sets?.exclude.delete(value);
        }
        this.afterFilterChange();
    }

    private renderFormulaPreview(): void {
        const target = this.container.querySelector('#advancedFormulaPreview') as HTMLElement | null;
        if (!target) return;
        const formulaText = this.urlController.buildConcreteFormula();
        target.innerHTML = formulaText
            ? `<span>Формула списков:</span> <code>${this.escapeHtml(formulaText)}</code><button class="copy-query-btn" data-copy="${this.escapeAttr(formulaText)}">Копировать</button>`
            : '<span>Формула списков появится здесь после выбора тегов.</span>';
    }

    private escapeHtml(value: string): string {
        return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    }

    private escapeAttr(value: string): string {
        return this.escapeHtml(value);
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: any): void {
        if (!element) return;
        element.addEventListener(event, handler, options);
        this.cleanupFns.push(() => element.removeEventListener(event, handler, options));
    }
}
export type { RuntimeFilterOptions };
