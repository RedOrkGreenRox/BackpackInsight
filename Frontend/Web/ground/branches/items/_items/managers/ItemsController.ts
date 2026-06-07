import { ItemDefinition, FilterState, ItemsStateManager } from '../managers/ItemsStateManager';
import { ItemsFilterManager } from '../managers/ItemsFilterManager';
import { ItemCard } from '../components/ItemCard';
import { ItemsFiltersUI } from '../components/ItemsFiltersUI';
import { t } from '../../../../localization/i18n';
import { ItemsBranch } from '../../ItemsBranch';

export class ItemsController {
    private stateManager = new ItemsStateManager();
    private filterManager = new ItemsFilterManager();
    
    public constructor(
        private branch: ItemsBranch,
        private filters: FilterState
    ) {}

    public async initializeItems() {
        try {
            const items = await this.branch.loadItems();
            this.filterManager.initFuse(items);
            this.setupFilterOptions(items);
        } catch (e) {
            console.error(e);
            const grid = this.branch.getContainer()?.querySelector('#wikiItemsGrid');
            if (grid) grid.innerHTML = `<div class="error">${t('error_server_unavailable')}</div>`;
        }
    }

    public setupEventListeners() {
        const container = this.branch.getContainer();
        if (!container) return;

        const searchInput = container.querySelector('#itemSearch') as HTMLInputElement;
        if (searchInput) {
            searchInput.value = this.filters.searchQuery;
            this.branch.addListener(searchInput, 'input', (e: Event) => {
                this.filters.searchQuery = (e.target as HTMLInputElement).value;
                this.updateAndRender();
            });
        }

        const advancedFiltersToggle = container.querySelector('#advancedFiltersToggle');
        if (advancedFiltersToggle) {
            this.branch.addListener(advancedFiltersToggle, 'click', () => this.toggleAdvancedFilters());
        }

        this.initDropdownFilters();

        const itemSortBtn = container.querySelector('#itemSortToggle');
        if (itemSortBtn) {
            this.branch.addListener(itemSortBtn, 'click', () => {
                this.branch.currentSort = this.branch.currentSort === 'rarity' ? 'name' : 'rarity';
                const text = container.querySelector('#itemSortText');
                if (text) text.textContent = this.branch.currentSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_name');
                this.updateAndRender();
            });
        }

        const clearFiltersBtn = container.querySelector('#clearFilters');
        if (clearFiltersBtn) {
            this.branch.addListener(clearFiltersBtn, 'click', () => this.clearFilters());
        }

        const purchasableCheckbox = container.querySelector('#filterPurchasable') as HTMLInputElement;
        if (purchasableCheckbox) {
            purchasableCheckbox.checked = this.filters.purchasableOnly === true;
            this.branch.addListener(purchasableCheckbox, 'change', (e: Event) => {
                const checked = (e.target as HTMLInputElement).checked;
                this.filters.purchasableOnly = checked ? true : null;
                this.updateAndRender();
            });
        }
    }

    private initDropdownFilters() {
        const container = this.branch.getContainer();
        const dropdownToggles = container?.querySelectorAll('.dropdown-toggle');
        dropdownToggles?.forEach(toggle => {
            this.branch.addListener(toggle, 'click', (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                const targetId = (toggle as HTMLElement).dataset['target'];
                if (!targetId) return;
                const dropdown = container?.querySelector(`#${targetId}`) as HTMLElement;
                const arrow = toggle.querySelector('.dropdown-arrow') as HTMLElement;
                if (!dropdown) return;
                const isOpen = dropdown.classList.contains('show');
                if (isOpen) {
                    dropdown.classList.remove('show');
                    arrow.textContent = '▼';
                    toggle.classList.remove('open');
                } else {
                    dropdown.classList.add('show');
                    arrow.textContent = '▲';
                    toggle.classList.add('open');
                }
            });
        });
    }

    private setupFilterOptions(items: ItemDefinition[]) {
        const options = this.filterManager.calculateFilterOptions(items);
        
        this.renderFilterChips('filterTypes', options.sortedTypes, this.filters.selectedTypes);
        this.renderFilterChips('filterRarities', options.sortedRarities, this.filters.selectedRarities);
        this.renderFilterChips('filterHeroes', options.sortedHeroes, this.filters.selectedHeroes);
        this.renderFilterChips('filterUnlockSources', options.sortedUnlockSources, this.filters.selectedUnlockSources);
        this.renderFilterChips('filterBuffs', options.sortedBuffs, this.filters.selectedBuffs);
        this.renderFilterChips('filterDebuffs', options.sortedDebuffs, this.filters.selectedDebuffs);
        this.renderFilterChips('filterStats', options.sortedStats, this.filters.selectedStats);

        this.updateAndRender();
    }

    private renderFilterChips(id: string, options: string[], selectedSet: Set<string>) {
        const container = this.branch.getContainer()?.querySelector(`#${id}`);
        if (!container) return;
        container.innerHTML = ItemsFiltersUI.renderChips(id, options, selectedSet);

        this.branch.addListener(container, 'click', (e: Event) => {
            const button = (e.target as HTMLElement).closest('.filter-chip') as HTMLButtonElement;
            if (!button || !container.classList.contains('show')) return;

            const option = button.dataset['value']!;
            if (selectedSet.has(option)) {
                selectedSet.delete(option);
                button.classList.remove('active');
            } else {
                selectedSet.add(option);
                button.classList.add('active');
            }
            this.updateAndRender();
        });
    }

    private toggleAdvancedFilters() {
        this.branch.advancedFiltersVisible = !this.branch.advancedFiltersVisible;
        const container = this.branch.getContainer();
        const panel = container?.querySelector('#advancedFiltersPanel') as HTMLElement;
        const icon = container?.querySelector('.filter-toggle-icon') as HTMLElement;
        const toggleBtn = container?.querySelector('#advancedFiltersToggle') as HTMLElement;

        if (panel && toggleBtn) {
            if (this.branch.advancedFiltersVisible) {
                panel.style.display = 'block';
                setTimeout(() => {
                    panel.classList.add('show');
                    setTimeout(() => { if ((window as any).AOS) (window as any).AOS.refresh(); }, 50);
                }, 10);
                toggleBtn.classList.add('open');
            } else {
                panel.classList.remove('show');
                setTimeout(() => {
                    if (!panel.classList.contains('show')) panel.style.display = 'none';
                    if ((window as any).AOS) (window as any).AOS.refresh();
                }, 400);
                toggleBtn.classList.remove('open');
            }
        }
        if (icon) icon.textContent = this.branch.advancedFiltersVisible ? '▲' : '▼';
        this.stateManager.saveState(this.filters, this.branch.currentSort, this.branch.advancedFiltersVisible);
    }

    private clearFilters() {
        this.filters = {
            searchQuery: '',
            selectedTypes: new Set(),
            selectedRarities: new Set(),
            selectedHeroes: new Set(),
            selectedUnlockSources: new Set(),
            selectedBuffs: new Set(),
            selectedDebuffs: new Set(),
            selectedStats: new Set(),
            purchasableOnly: null
        };

        const container = this.branch.getContainer();
        const searchInput = container?.querySelector('#itemSearch') as HTMLInputElement;
        if (searchInput) searchInput.value = '';
        const purchasableCheckbox = container?.querySelector('#filterPurchasable') as HTMLInputElement;
        if (purchasableCheckbox) purchasableCheckbox.checked = false;

        container?.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        this.updateAndRender();
    }

    public updateAndRender() {
        const filtered = this.filterManager.applyFilters(this.branch.items, this.filters);
        const sorted = this.filterManager.sortItems(filtered, this.branch.currentSort);
        this.branch.filteredItems = sorted;
        
        const currentOrder = sorted.map(item => item.name);
        sessionStorage.setItem('filteredItemsOrder', JSON.stringify(currentOrder));

        this.renderGrid();
        this.stateManager.saveState(this.filters, this.branch.currentSort, this.branch.advancedFiltersVisible);
    }

    private renderGrid() {
        const container = this.branch.getContainer();
        const grid = container?.querySelector('#wikiItemsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const fragment = document.createDocumentFragment();
        this.branch.filteredItems.forEach((item, index) => {
            const cardHtml = ItemCard.render(item, index);
            const wrapper = document.createElement('div');
            wrapper.innerHTML = cardHtml;
            const link = wrapper.firstElementChild as HTMLElement;
            link.addEventListener('click', () => {
                (link as any)._stateData = { itemData: item, scrollY: window.scrollY };
            });
            fragment.appendChild(link);
        });
        grid.appendChild(fragment);
        requestAnimationFrame(() => { if ((window as any).AOS) (window as any).AOS.refresh(); });
    }

    public syncFiltersPanelUI() {
        const container = this.branch.getContainer();
        const panel = container?.querySelector('#advancedFiltersPanel') as HTMLElement;
        const icon = container?.querySelector('.filter-//toggle-icon') as HTMLElement;
        const toggleBtn = container?.querySelector('#advancedFiltersToggle') as HTMLElement;
        if (panel && icon && toggleBtn) {
            if (this.branch.advancedFiltersVisible) {
                panel.style.display = 'block';
                setTimeout(() => { panel.classList.add('show'); }, 10);
                toggleBtn.classList.add('open');
            } else {
                panel.style.display = 'none';
                panel.classList.remove('show');
                toggleBtn.classList.remove('open');
            }
            icon.textContent = this.branch.advancedFiltersVisible ? '▲' : '▼';
        }
    }
}
