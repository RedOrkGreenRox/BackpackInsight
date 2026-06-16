import { t } from '../../../../localization/i18n';
import { LoadingStates } from '../../../../utils/LoadingStates';

export class ItemsLayoutRenderer {
    public static render(): string {
        return `
            <section class="wiki-section">
                <div class="container">
                    <div class="wiki-header">
                        <h1 class="main-title" data-aos="fade-down">${t('items_title')}</h1>
                        <p class="wiki-subtitle">${t('items_subtitle')}</p>
                        
                        <!-- Объединенная строка поиска с круглой кнопкой-стрелкой -->
                        <div class="search-container" data-aos="fade-up">
                            <div class="search-input-wrapper">
                                <!-- Интерактивное WYSIWYG contenteditable поле ввода -->
                                <div id="itemSearch" class="search-input-rich" contenteditable="true" placeholder="${t('items_search_placeholder')}" autocomplete="off" spellcheck="false"></div>
                                <button id="advancedFiltersToggle" class="filter-toggle-btn" title="${t('items_advanced_filters')}">
                                    <span class="filter-toggle-icon">▼</span>
                                </button>
                            </div>
                            
                            <!-- Продвинутые фильтры, плавно выпадающие ПРЯМО из строки поиска -->
                            <div id="advancedFiltersPanel" class="advanced-filters-panel" style="display: none;">
                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterTypes">
                                        <span>${t('items_filter_types')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterTypes" class="dropdown-content filter-multiselect"></div>
                                </div>
                                
                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterRarities">
                                        <span>${t('items_filter_rarity')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterRarities" class="dropdown-content filter-multiselect"></div>
                                </div>
                                
                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterHeroes">
                                        <span>${t('items_filter_hero')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterHeroes" class="dropdown-content filter-multiselect"></div>
                                </div>
                                
                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterUnlockSources">
                                        <span>${t('items_filter_unlock_source')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterUnlockSources" class="dropdown-content filter-multiselect"></div>
                                </div>
                                
                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterBuffs">
                                        <span>${t('items_filter_buffs')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterBuffs" class="dropdown-content filter-multiselect"></div>
                                </div>
                                
                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterDebuffs">
                                        <span>${t('items_filter_debuffs')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterDebuffs" class="dropdown-content filter-multiselect"></div>
                                </div>
                                
                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterStats">
                                        <span>${t('items_filter_stats')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterStats" class="dropdown-content filter-multiselect"></div>
                                </div>

                                <div class="dropdown-filter">
                                    <button class="dropdown-toggle" data-target="filterSort">
                                        <span>${t('items_sort_title')}</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </button>
                                    <div id="filterSort" class="dropdown-content filter-multiselect"></div>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-checkbox-label">
                                        <input type="checkbox" id="filterPurchasable">
                                        <span>${t('items_filter_purchasable')}</span>
                                    </label>
                                </div>
                                
                                <!-- Объединенные экшены: логические операторы и сброс фильтров -->
                                <div class="filter-actions">
                                    <div class="logical-chips">
                                        <button class="logical-chip" data-value="[]" data-group-type="logical" title="Скобки (Группировка)"><span>[ ]</span></button>
                                        <button class="logical-chip" data-value="&" data-group-type="logical" title="Логическое И">&</button>
                                        <button class="logical-chip" data-value="|" data-group-type="logical" title="Логическое ИЛИ">|</button>
                                        <button class="logical-chip" data-value="!" data-group-type="logical" title="Логическое НЕ">!</button>
                                    </div>
                                    <button id="clearFilters" class="filter-clear-btn">${t('items_clear_filters')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="items-grid" id="wikiItemsGrid">
                        ${LoadingStates.createCardSkeleton(12)}
                    </div>
                    <div id="itemsScrollSentinel" class="items-scroll-sentinel" aria-hidden="true"></div>
                </div>
            </section>
        `;
    }
}
