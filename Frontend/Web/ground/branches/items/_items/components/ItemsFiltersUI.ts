import { ItemsIconService } from '@branches/items/_items/services/ItemsIconService';

export class ItemsFiltersUI {
    public static renderMain(): string {
        const sortLabel = 'items_sort_rarity'; // Default key
        return `
            <div class="search-container" data-aos="fade-up">
                <input type="text" id="itemSearch" placeholder="search..." class="search-input">
            </div>

            <div class="filter-controls" data-aos="fade-up">
                <button id="advancedFiltersToggle" class="filter-toggle-btn">
                    <span id="advancedFiltersToggleText">filters</span>
                    <span class="filter-toggle-icon">▼</span>
                </button>
                
                <div id="advancedFiltersPanel" class="advanced-filters-panel" style="display: none;">
                    ${this.renderDropdown('filterTypes', 'types')}
                    ${this.renderDropdown('filterRarities', 'rarity')}
                    ${this.renderDropdown('filterHeroes', 'hero')}
                    ${this.renderDropdown('filterUnlockSources', 'source')}
                    ${this.renderDropdown('filterBuffs', 'buffs')}
                    ${this.renderDropdown('filterDebuffs', 'debuffs')}
                    ${this.renderDropdown('filterStats', 'stats')}
                    
                    <div class="filter-group">
                        <label class="filter-checkbox-label">
                            <input type="checkbox" id="filterPurchasable">
                            <span>purchasable</span>
                        </label>
                    </div>
                    
                    <div class="filter-actions">
                        <button id="clearFilters" class="filter-clear-btn">clear</button>
                    </div>
                </div>
            </div>

            <div class="sort-controls" style="margin-top: 20px;" data-aos="fade-up">
                <button id="itemSortToggle" class="sort-btn">
                    <span id="itemSortText">${sortLabel}</span>
                </button>
            </div>
        `;
    }

    private static renderDropdown(id: string, label: string): string {
        return `
            <div class="dropdown-filter">
                <button class="dropdown-toggle" data-target="${id}">
                    <span>${label}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div id="${id}" class="dropdown-content filter-multiselect"></div>
            </div>
        `;
    }

    public static renderChips(containerId: string, options: string[], selectedSet: Set<string>): string {
        let html = '';
        const withIcons: string[] = [];
        const withoutIcons: string[] = [];

        options.forEach(option => {
            const iconHtml = ItemsIconService.getIconForFilter(option, containerId);
            if (iconHtml) withIcons.push(option); else withoutIcons.push(option);
        });

        [...withIcons, ...withoutIcons].forEach(option => {
            const rarityClass = containerId === 'filterRarities' ? `rarity-${option.toLowerCase()}` : '';
            const activeClass = selectedSet.has(option) ? 'active' : '';
            const iconHtml = ItemsIconService.getIconForFilter(option, containerId);
            
            html += `<button type="button" class="filter-chip ${rarityClass} ${activeClass}" data-value="${option}">
                ${iconHtml ? iconHtml : `<span>${option}</span>`}
            </button>`;
        });

        return html;
    }
}
