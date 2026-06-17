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
                        <div class="search-container" data-aos="fade-up">
                            <div class="search-input-wrapper">
                                <div id="itemSearch" class="search-input-rich" contenteditable="true" placeholder="${t('items_search_placeholder')}" autocomplete="off" spellcheck="false"></div>
                                <button id="advancedFiltersToggle" class="filter-toggle-btn" title="${t('items_advanced_filters')}">
                                    <span class="filter-toggle-icon">▼</span>
                                </button>
                            </div>

                            <div id="advancedFiltersPanel" class="advanced-filters-panel" style="display: none;">
                                <div class="prompt-panel-top">
                                    <div class="prompt-lists" aria-label="Активные условия поиска">
                                        <div class="prompt-list prompt-list-positive">
                                            <div class="prompt-list-title">Искать</div>
                                            <div id="positiveFilterList" class="prompt-list-items empty" data-empty="Выберите конкретные теги ниже"></div>
                                        </div>
                                        <div class="prompt-list prompt-list-negative">
                                            <div class="prompt-list-title">Исключить</div>
                                            <div id="negativeFilterList" class="prompt-list-items empty" data-empty="Второй клик по тегу исключает его"></div>
                                        </div>
                                    </div>
                                    <details id="advancedSearchHelp" class="advanced-search-help">
                                        <summary title="Как пользоваться поиском">?</summary>
                                        <div id="advancedSearchHelpContent" class="advanced-search-help-content">Загрузка справки...</div>
                                    </details>
                                </div>
                                <div class="filter-category logic-category advanced-only">
                                    <div class="filter-category-title">Продвинутая логика запроса</div>
                                    <div class="logical-chips">
                                        <button class="logical-chip" data-value="[]" data-group-type="logical" title="Скобки / группа условий"><span>[ ]</span></button>
                                        <button class="logical-chip" data-value="&" data-group-type="logical" title="Логическое И">И</button>
                                        <button class="logical-chip" data-value="|" data-group-type="logical" title="Логическое ИЛИ">ИЛИ</button>
                                        <button class="logical-chip" data-value="!" data-group-type="logical" title="Логическое НЕ">НЕ</button>
                                    </div>
                                </div>
                                <div id="advancedFormulaPreview" class="advanced-formula-preview advanced-only"></div>
                                ${this.renderDropdown('filterTypes', t('items_filter_types'))}
                                ${this.renderDropdown('filterRarities', t('items_filter_rarity'))}
                                ${this.renderDropdown('filterHeroes', t('items_filter_hero'))}
                                ${this.renderDropdown('filterUnlockSources', t('items_filter_unlock_source'))}
                                ${this.renderDropdown('filterBuffs', t('items_filter_buffs'))}
                                ${this.renderDropdown('filterDebuffs', t('items_filter_debuffs'))}
                                ${this.renderDropdown('filterStats', t('items_filter_stats'))}
                                ${this.renderDropdown('filterFlags', t('items_filter_purchasable'))}
                                <div class="filter-actions">
                                    <button id="clearFilters" class="filter-clear-btn">${t('items_clear_filters')}</button>
                                    <label class="advanced-mode-switch">
                                        <span>Продвинутые настройки</span>
                                        <input id="advancedModeToggle" type="checkbox">
                                        <span class="switch-ui" aria-hidden="true"></span>
                                    </label>
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
}
