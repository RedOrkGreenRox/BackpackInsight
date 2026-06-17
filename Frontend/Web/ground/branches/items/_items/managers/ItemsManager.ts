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

    constructor(private readonly container: HTMLElement, private readonly items: any[], private readonly sharedQuery: string | null = null) {
        this.gridRenderer = new ItemsGridRenderer(container);
        this.chipsSync = new ChipsSyncService(container);
    }

    public init(): void {
        this.restoreState();
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
            if (Array.isArray(parsed) && parsed.every(item => ['relevance', 'rarity', 'alphabet'].includes(item?.key) && ['down', 'up'].includes(item?.direction))) {
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
        this.renderAdvancedHelp(options);
        this.applyFilters();
    }

    private initLogicalChips(): void {
        if (!this.richInputController) return;
        new LogicalChipsController(this.container, this.addListener.bind(this), this.richInputController, this.richRenderer).init();
    }

    private onQueryInput(): void {
        this.filters.searchQuery = this.richRenderer.getCleanTextFromRichHTML(this.container);
        this.saveState();
        this.syncUrl();
        this.searchDebouncer.run(() => this.applyFilters());
    }

    private onQueryCompiled(): void {
        this.filters.searchQuery = this.richRenderer.getCleanTextFromRichHTML(this.container);
        this.saveState();
        this.syncUrl();
        this.applyFilters();
        this.syncAll();
    }

    private clearFilters(): void {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (richInput) richInput.textContent = '';
        this.sortPriorities = defaultSortPriorities();
        this.filters = defaultFilters();
        this.saveState();
        this.syncUrl();
        this.applyFilters();
        this.syncAll();
    }

    private cycleConcreteFilter(value: string, groupType: string): void {
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

    private afterFilterChange(): void {
        this.saveState();
        this.syncUrl();
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
        this.renderSearchFilterPreview();
        this.renderPromptLists();
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

    private renderSearchFilterPreview(): void {
        const input = this.container.querySelector('#itemSearch') as HTMLElement | null;
        if (!input) return;
        const formula = this.advancedModeEnabled ? '' : this.normalizeShareQuery(this.buildConcreteFormula());
        if (formula) input.dataset['filterQuery'] = formula;
        else delete input.dataset['filterQuery'];
    }

    private syncUrl(): void {
        const raw = this.shareQuery();
        const normalized = this.normalizeShareQuery(raw);
        const nextPath = normalized ? `/items/${encodeURIComponent(normalized)}` : '/items';
        if (globalThis.location.pathname !== nextPath) {
            history.replaceState(history.state || {}, '', nextPath);
        }
    }

    private shareQuery(): string {
        const text = (this.filters.searchQuery || '').trim();
        if (this.advancedModeEnabled) return text;
        const formula = this.buildConcreteFormula();
        return [text, formula].filter(Boolean).join(' & ');
    }

    private normalizeShareQuery(query: string): string {
        return query
            .replace(/\s+/g, ' ')
            .replace(/\s*([&|!])\s*/g, '$1')
            .replace(/\s*([<>]=?|=)\s*/g, '$1')
            .replace(/\s*([\[\](){}])\s*/g, '$1')
            .trim()
            .toLowerCase();
    }

    private renderPromptLists(): void {
        const positive = this.container.querySelector('#positiveFilterList') as HTMLElement | null;
        const negative = this.container.querySelector('#negativeFilterList') as HTMLElement | null;
        if (!positive || !negative) return;
        positive.innerHTML = this.promptChips('include');
        negative.innerHTML = this.promptChips('exclude');
        positive.classList.toggle('empty', !positive.innerHTML.trim());
        negative.classList.toggle('empty', !negative.innerHTML.trim());
    }

    private promptChips(kind: 'include' | 'exclude'): string {
        const chips: string[] = [];
        const addSet = (set: Set<string> | undefined, groupType: string, filterId: string, label: string) => {
            (set ?? new Set<string>()).forEach(value => chips.push(this.promptChip(kind, groupType, filterId, label, value)));
        };
        if (kind === 'include') {
            addSet(this.filters.selectedTypes, 'type', 'filterTypes', 'Тип');
            addSet(this.filters.selectedRarities, 'rarity', 'filterRarities', 'Редкость');
            addSet(this.filters.selectedHeroes, 'hero', 'filterHeroes', 'Герой');
            addSet(this.filters.selectedUnlockSources, 'unlock', 'filterUnlockSources', 'Источник');
            addSet(this.filters.selectedBuffs, 'buff', 'filterBuffs', 'Бафф');
            addSet(this.filters.selectedDebuffs, 'debuff', 'filterDebuffs', 'Дебафф');
            addSet(this.filters.selectedStats, 'stat', 'filterStats', 'Стата');
            if (this.filters.purchasableOnly === true) chips.push(this.promptChip(kind, 'flag', 'filterFlags', 'Флаг', 'Purchasable'));
        } else {
            addSet(this.filters.excludedTypes, 'type', 'filterTypes', 'Тип');
            addSet(this.filters.excludedRarities, 'rarity', 'filterRarities', 'Редкость');
            addSet(this.filters.excludedHeroes, 'hero', 'filterHeroes', 'Герой');
            addSet(this.filters.excludedUnlockSources, 'unlock', 'filterUnlockSources', 'Источник');
            addSet(this.filters.excludedBuffs, 'buff', 'filterBuffs', 'Бафф');
            addSet(this.filters.excludedDebuffs, 'debuff', 'filterDebuffs', 'Дебафф');
            addSet(this.filters.excludedStats, 'stat', 'filterStats', 'Стата');
            if (this.filters.purchasableOnly === false) chips.push(this.promptChip(kind, 'flag', 'filterFlags', 'Флаг', 'Purchasable'));
        }
        return chips.join('');
    }

    private promptChip(kind: 'include' | 'exclude', groupType: string, filterId: string, label: string, value: string): string {
        const icon = this.iconResolver.getIconForFilter(value, filterId) || '';
        const safeValue = this.escapeAttr(value);
        return `<button class="prompt-token ${kind}" data-group-type="${groupType}" data-value="${safeValue}" title="Убрать: ${label}: ${safeValue}">${icon}<span>${label}: ${this.escapeHtml(value)}</span><b>×</b></button>`;
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
        const formula = this.buildConcreteFormula();
        target.innerHTML = formula
            ? `<span>Формула списков:</span> <code>${this.escapeHtml(formula)}</code><button class="copy-query-btn" data-copy="${this.escapeAttr(formula)}">Копировать</button>`
            : '<span>Формула списков появится здесь после выбора тегов.</span>';
    }

    private buildConcreteFormula(): string {
        const parts: string[] = [];
        const add = (set: Set<string> | undefined, negated = false) => {
            const values = [...(set ?? new Set<string>())].map(v => `[<${this.mappedTag(v)}>]`);
            if (!values.length) return;
            const chunk = values.length > 1 ? `(${values.join(' | ')})` : values[0]!;
            parts.push(negated ? `!${chunk}` : chunk);
        };
        add(this.filters.selectedTypes); add(this.filters.selectedRarities); add(this.filters.selectedHeroes);
        add(this.filters.selectedUnlockSources); add(this.filters.selectedBuffs); add(this.filters.selectedDebuffs); add(this.filters.selectedStats);
        add(this.filters.excludedTypes, true); add(this.filters.excludedRarities, true); add(this.filters.excludedHeroes, true);
        add(this.filters.excludedUnlockSources, true); add(this.filters.excludedBuffs, true); add(this.filters.excludedDebuffs, true); add(this.filters.excludedStats, true);
        if (this.filters.purchasableOnly === true) parts.push('[<Purchasable>]');
        if (this.filters.purchasableOnly === false) parts.push('![<Purchasable>]');
        return parts.join(' & ');
    }

    private mappedTag(value: string): string {
        if (value === 'Melee Weapon') return 'MeleeWeapon';
        if (value === 'Ranged Weapon') return 'RangedWeapon';
        return value.replace(/\s+/g, '');
    }

    private renderAdvancedHelp(options: RuntimeFilterOptions): void {
        const target = this.container.querySelector('#advancedSearchHelpContent');
        if (!target) return;
        const list = (values: string[]) => values.map(v => `<code>${this.escapeHtml(v)}</code>`).join(' ');
        const examples = ['[<Knife>] | [<Dagger>]', '[Poison] & [<Dagger>]', '![<Purchasable>]', '1 < cooldown < 5', 'damageMax > 10 & [<MeleeWeapon>]', '([Poison] | [Burn]) & ![<Boon>]'];
        target.innerHTML = `
            <h3>Как работает поиск</h3>
            <p><b>Обычный режим:</b> строка сверху ищет только текстом по уже отфильтрованному списку. Теги выбираются кнопками: первый клик — зелёный «Искать», второй — красный «Исключить», третий — убрать.</p>
            <p><b>Продвинутый режим:</b> можно писать формулу руками. Это быстрее кнопок, если привыкнуть: вставил текст, нажал Enter — получил токены.</p>
            <ul>
                <li><code>[Poison]</code> — <b>умный НЕ точный тег</b>: ищет термин шире, через описания, иконки и алиасы. Хорошо для эффектов вроде Poison/Burn.</li>
                <li><code>[&lt;Knife&gt;]</code> — <b>конкретный точный тег</b>: только точный тип/герой/редкость/флаг. В списках «Искать/Исключить» все теги работают именно так.</li>
                <li><code>!</code> / <code>НЕ</code> / <code>NOT</code> — исключить: <code>![&lt;Purchasable&gt;]</code>.</li>
                <li><code>&amp;</code> / <code>И</code> / <code>AND</code> — оба условия: <code>[Poison] &amp; [&lt;Dagger&gt;]</code>.</li>
                <li><code>|</code> / <code>ИЛИ</code> / <code>OR</code> — любое условие: <code>[&lt;Knife&gt;] | [&lt;Dagger&gt;]</code>.</li>
                <li><code>[ ]</code> — группа условий. Двойной клик по токену возвращает сырой текст.</li>
                <li>Сравнения: <code>damageMax &gt; 10</code>, <code>1 &lt; cooldown &lt; 5</code>, <code>accuracy &gt;= 80</code>, <code>cost &lt;= 5</code>.</li>
                <li>Сортировка в обычном UI задаётся тремя приоритетами. В тексте также работают: <code>{rarity down}</code>, <code>{rarity up}</code>, <code>{alphabet up}</code>, <code>{alphabet down}</code>, <code>{relevance}</code>.</li>
            </ul>
            <h3>Примеры — можно скопировать</h3>
            ${examples.map(example => `<div class="copy-example"><code>${this.escapeHtml(example)}</code><button class="copy-query-btn" data-copy="${this.escapeAttr(example)}">Копировать</button></div>`).join('')}
            <h3>Теги из текущей базы</h3>
            <p><b>Типы:</b> ${list(options.sortedTypes)}</p>
            <p><b>Редкости:</b> ${list(options.sortedRarities)}</p>
            <p><b>Герои:</b> ${list(options.sortedHeroes)}</p>
            <p><b>Источники:</b> ${list(options.sortedUnlockSources)}</p>
            <p><b>Баффы:</b> ${list(options.sortedBuffs)}</p>
            <p><b>Дебаффы:</b> ${list(options.sortedDebuffs)}</p>
            <p><b>Статы/термины:</b> ${list(options.sortedStats)} <code>damageMin</code> <code>damageMax</code> <code>criticalChance</code> <code>criticalDamage</code> <code>staminaCost</code> <code>coinValue</code></p>
            <p><b>Флаги:</b> ${list(options.sortedFlags)}</p>
        `;
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
