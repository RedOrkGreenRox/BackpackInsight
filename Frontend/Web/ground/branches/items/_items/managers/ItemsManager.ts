import { ItemsFilterManager } from './ItemsFilterManager';
import { ItemsStateManager, FilterState } from './ItemsStateManager';
import { AdvancedPanelController } from './runtime/advanced-panel-controller';
import { ChipsSyncService } from './runtime/chips-sync-service';
import { DropdownController } from './runtime/dropdown-controller';
import { FilterIconResolver } from './runtime/filter-icon-resolver';
import { FilterOptionsController } from './runtime/filter-options-controller';
import { attachImageErrorHandler } from './runtime/image-error-handler';
import { defaultFilters, SortMode } from './runtime/items-runtime-types';
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
    private currentSort: SortMode = 'rarity';
    private advancedFiltersVisible = false;
    private filters: FilterState = defaultFilters();
    constructor(private readonly container: HTMLElement, private readonly items: any[]) {
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
        this.chipsSync.sync(this.filters.searchQuery);
        this.initLogicalChips();
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
        this.currentSort = (restored.currentSort || 'rarity') as SortMode;
        this.advancedFiltersVisible = restored.advancedFiltersVisible;
    }
    private initRichInput(): void {
        this.richInputController = new RichInputController(
            this.container,
            this.richRenderer,
            this.addListener.bind(this),
            () => this.onQueryInput(),
            () => this.onQueryCompiled(),
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
        
    }
    private setupFilterOptions(): void {
        const multiselect = new MultiselectFilterController(
            this.container,
            this.addListener.bind(this),
            this.iconResolver,
            this.richRenderer,
        );
        new FilterOptionsController(multiselect).setup(this.filterManager.calculateFilterOptions(this.items));
        this.applyFilters();
    }
    private initLogicalChips(): void {
        if (!this.richInputController) return;
        new LogicalChipsController(this.container, this.addListener.bind(this), this.richInputController, this.richRenderer).init();
    }
    private onQueryInput(): void {
        this.filters.searchQuery = this.richRenderer.getCleanTextFromRichHTML(this.container);
        this.saveState();
        this.searchDebouncer.run(() => this.applyFilters());
    }
    private onQueryCompiled(): void {
        this.filters.searchQuery = this.richRenderer.getCleanTextFromRichHTML(this.container);
        this.saveState();
        this.applyFilters();
        this.chipsSync.sync(this.filters.searchQuery);
    }
        private clearFilters(): void {
        const richInput = this.container.querySelector('#itemSearch') as HTMLElement;
        if (richInput) richInput.innerHTML = '';
        this.container.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        this.currentSort = 'rarity';
        this.filters = defaultFilters();
        this.saveState();
        this.applyFilters();
    }
    private applyFilters(): void {
        this.filteredItems = this.filterManager.applyFilters(this.items, this.filters);
        this.filteredItems = this.filterManager.sortItems(this.filteredItems, this.currentSort, this.filters.searchQuery);
        sessionStorage.setItem('filteredItemsOrder', JSON.stringify(this.filteredItems.map(item => item.name)));
        this.gridRenderer.render(this.filteredItems);
        this.chipsSync.sync(this.filters.searchQuery);
    }
    private saveState(): void {
        this.stateManager.saveState(this.filters, this.currentSort, this.advancedFiltersVisible);
    }
    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: any): void {
        if (!element) return;
        element.addEventListener(event, handler, options);
        this.cleanupFns.push(() => element.removeEventListener(event, handler, options));
    }
}
