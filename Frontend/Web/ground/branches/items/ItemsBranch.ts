import {Branch} from '@roots/Branch.ts';
import {t} from '../../localization/i18n';
import {ItemsCacheService} from '../../utils/ItemsCacheService';
import {ImageFormatService} from '../../utils/ImageFormatService';
import {ItemPreviewPrefetchService} from '../../utils/ItemPreviewPrefetchService';
import {SearchTermService} from '../../utils/SearchTermService';
import {SlugService} from '../../utils/SlugService';
import {generateIconsOrText} from '../../utils/icon-parser';
import {LoadingStates} from '../../utils/LoadingStates';
import './items.scss';
// @ts-ignore
import AOS from 'aos';
// @ts-ignore
import Fuse from 'fuse.js';

// --- Точные типы на основе items.json ---

interface CombatStats {
    damageMin: number | null;
    damageMax: number | null;
    accuracy: number | null;
    staminaCost: number | null;
    cooldown: number | null;
    criticalChance: number | null;
    criticalDamage: number | null;
}

interface Recipe {
    resultId: string;
    ingredientIds: string[];
}

interface LevelChange {
    level: number;
    stat: string;
    value: number;
    type: string | null;
}

interface LevelInfo {
    maxLevel: number;
    chancePerLevel: number | null;
    baseChance: number | null;
    chanceBreakpointBonus: number | null;
    abilityDescription: string | null;
    changes: LevelChange[];
}

export interface ItemDefinition {
    id: string;
    name: string;
    rarity: string;
    coinValue: number | null;
    itemTypes: string[];
    connectedHero: string;
    unlockSource: string;
    itemShape: { x: number, y: number }[];
    itemStars: { x: number, y: number }[];
    purchasable: boolean;
    recipes: Recipe[];
    combatStats: CombatStats;
    tooltips: string[];
    allStats: Record<string, any>;
    levels: LevelInfo;
}


let cachedFuseItems: PreparedItem[] | null = null;
let cachedFuse: Fuse<PreparedItem> | null = null;

interface PreparedItem {
    key: string;
    item: ItemDefinition;
    slug: string;
    imagePath: string;
    imageSrc: string;
    tooltipText: string;
    normalizedHero: string;
    unlockSource: string;
    statKeysText: string;
    typeText: string;
    baseText: string;
    searchText: string;
    strictText: string;
}

interface FilterState {
    searchQuery: string;
    selectedTypes: Set<string>;
    selectedRarities: Set<string>;
    selectedHeroes: Set<string>;
    selectedUnlockSources: Set<string>;
    selectedBuffs: Set<string>;
    selectedDebuffs: Set<string>;
    selectedStats: Set<string>;
    purchasableOnly: boolean | null; // null = all, true = only purchasable, false = only non-purchasable
}

export class ItemsBranch extends Branch {
    private items: ItemDefinition[] = [];
    private preparedItems: PreparedItem[] = [];
    private preparedByKey = new Map<string, PreparedItem>();
    private filteredItems: ItemDefinition[] = [];
    private currentSort: 'rarity' | 'name' = 'rarity';
    private cleanupFns: (() => void)[] = [];
    private fuse: Fuse<PreparedItem> | null = null; // Экземпляр Fuse.js
    private readonly searchScores = new Map<string, number>();
    private readonly strictTagScores = new Map<string, number>();
    private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private intersectionObserver: IntersectionObserver | null = null;
    private renderedCount = 0;
    private readonly renderBatchSize = 80;
    private readonly eagerImagesCount = 12;
    private filters: FilterState = {
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
    private advancedFiltersVisible: boolean = false;

    // Константы для ключей sessionStorage
    private readonly STORAGE_KEYS = {
        SEARCH_QUERY: 'items_search_query',
        SELECTED_TYPES: 'items_selected_types',
        SELECTED_RARITIES: 'items_selected_rarities',
        SELECTED_HEROES: 'items_selected_heroes',
        SELECTED_UNLOCK_SOURCES: 'items_selected_unlock_sources',
        SELECTED_BUFFS: 'items_selected_buffs',
        SELECTED_DEBUFFS: 'items_selected_debuffs',
        SELECTED_STATS: 'items_selected_stats',
        PURCHASABLE_ONLY: 'items_purchasable_only',
        CURRENT_SORT: 'items_current_sort',
        ADVANCED_FILTERS_VISIBLE: 'items_advanced_filters_visible'
    };

    private readonly rarityWeights: Record<string, number> = {
        "Unique": 100, "Mythic": 90, "Legendary": 80, "Epic": 70,
        "Rare": 60, "Common": 50, "Boon": 40, "Relic": 30, "Special": 20
    };

    protected getHtml(): string {
        const sortLabel = this.currentSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_name');

        return `
            <section class="wiki-section">
                <div class="container">
                    <div class="wiki-header">
                        <h1 class="main-title" data-aos="fade-down">${t('items_title')}</h1>
                        <p class="wiki-subtitle">${t('items_subtitle')}</p>
                        
                        <div class="search-container" data-aos="fade-up">
                            <input type="text" id="itemSearch" placeholder="${t('items_search_placeholder')}" class="search-input">
                        </div>

                        <div class="filter-controls" data-aos="fade-up">
                            <button id="advancedFiltersToggle" class="filter-toggle-btn">
                                <span id="advancedFiltersToggleText">${t('items_advanced_filters')}</span>
                                <span class="filter-toggle-icon">▼</span>
                            </button>
                            
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
                                
                                <div class="filter-group">
                                    <label class="filter-checkbox-label">
                                        <input type="checkbox" id="filterPurchasable">
                                        <span>${t('items_filter_purchasable')}</span>
                                    </label>
                                </div>
                                
                                <div class="filter-actions">
                                    <button id="clearFilters" class="filter-clear-btn">${t('items_clear_filters')}</button>
                                </div>
                            </div>
                        </div>

                        <div class="sort-controls" style="margin-top: 20px;" data-aos="fade-up">
                            <button id="itemSortToggle" class="sort-btn">
                                <span id="itemSortText">${sortLabel}</span>
                            </button>
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

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        if (element) {
            element.addEventListener(event, handler, options);
            this.cleanupFns.push(() => element.removeEventListener(event, handler, options));
        }
    }

    protected init(): void {
        // Восстанавливаем состояние из sessionStorage
        this.restoreState();
        
        this.loadItems().catch(console.error);

        const searchInput = this.container?.querySelector('#itemSearch') as HTMLInputElement;
        if (searchInput) {
            // Восстанавливаем значение поиска
            searchInput.value = this.filters.searchQuery;
            
            this.addListener(searchInput, 'input', (e) => {
                this.filters.searchQuery = (e.target as HTMLInputElement).value;
                this.saveState();

                if (this.searchDebounceTimer) {
                    clearTimeout(this.searchDebounceTimer);
                }
                this.searchDebounceTimer = setTimeout(() => {
                    this.applyFilters();
                }, 200);
            });
        }

        const advancedFiltersToggle = this.container?.querySelector('#advancedFiltersToggle');
        if (advancedFiltersToggle) {
            this.addListener(advancedFiltersToggle, 'click', () => {
                this.toggleAdvancedFilters();
            });
        }

        // Инициализация выпадающих фильтров
        this.initDropdownFilters();

        const itemSortBtn = this.container?.querySelector('#itemSortToggle');
        if (itemSortBtn) {
            this.addListener(itemSortBtn, 'click', () => {
                this.currentSort = this.currentSort === 'rarity' ? 'name' : 'rarity';

                const text = this.container?.querySelector('#itemSortText');
                if (text) text.textContent = this.currentSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_name');

                this.saveState();
                this.sortAndRender();
            });
        }

        const clearFiltersBtn = this.container?.querySelector('#clearFilters');
        if (clearFiltersBtn) {
            this.addListener(clearFiltersBtn, 'click', () => {
                this.clearFilters();
            });
        }

        const purchasableCheckbox = this.container?.querySelector('#filterPurchasable') as HTMLInputElement;
        if (purchasableCheckbox) {
            // Восстанавливаем состояние чекбокса
            purchasableCheckbox.checked = this.filters.purchasableOnly === true;
            
            this.addListener(purchasableCheckbox, 'change', (e) => {
                const checked = (e.target as HTMLInputElement).checked;
                this.filters.purchasableOnly = checked ? true : null;
                this.saveState();
                this.applyFilters();
            });
        }

        // Восстанавливаем видимость панели фильтров
        const panel = this.container?.querySelector('#advancedFiltersPanel') as HTMLElement;
        const icon = this.container?.querySelector('.filter-toggle-icon') as HTMLElement;
        const toggleBtn = this.container?.querySelector('#advancedFiltersToggle') as HTMLElement;
        if (panel && icon && toggleBtn) {
            if (this.advancedFiltersVisible) {
                panel.style.display = 'block';
                // Небольшая задержка для применения display перед добавлением класса
                setTimeout(() => {
                    panel.classList.add('show');
                }, 10);
                toggleBtn.classList.add('open');
            } else {
                panel.style.display = 'none';
                panel.classList.remove('show');
                toggleBtn.classList.remove('open');
            }
            icon.textContent = this.advancedFiltersVisible ? '▲' : '▼';
        }

        this.container?.addEventListener('error', (e) => {
            const target = e.target as HTMLImageElement;
            if (target.tagName === 'IMG' && target.dataset['fallback']) {
                if (target.dataset['failed'] === 'true') return;
                target.dataset['failed'] = 'true';
                console.warn(`[ItemsBranch] Image not found for item: "${target.alt}". Using placeholder.`);
                const placeholder = ImageFormatService.placeholderSrc();
                if (target.parentElement?.tagName === 'PICTURE') {
                    target.parentElement.querySelectorAll('source').forEach(s => {
                        s.srcset = placeholder;
                        s.type = 'image/webp';
                    });
                }
                target.src = placeholder;
                target.parentElement?.classList.add('no-image');
            }
        }, true);
    }

    private initDropdownFilters(): void {
        const dropdownToggles = this.container?.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles?.forEach(toggle => {
            this.addListener(toggle, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = (toggle as HTMLElement).dataset['target'];
                if (!targetId) return;
                
                const dropdown = this.container?.querySelector(`#${targetId}`) as HTMLElement;
                const arrow = toggle.querySelector('.dropdown-arrow') as HTMLElement;
                
                if (!dropdown) return;
                
                // Переключаем текущий дропдаун с плавной анимацией
                const isOpen = dropdown.classList.contains('show');
                
                if (isOpen) {
                    // Закрываем
                    dropdown.classList.remove('show');
                    arrow.textContent = '▼';
                    toggle.classList.remove('open');
                } else {
                    // Открываем
                    dropdown.classList.add('show');
                    arrow.textContent = '▲';
                    toggle.classList.add('open');
                }
            });
        });
        
        // Закрытие дропдаунов при клике вне - УДАЛЕНО
        // Теперь дропдауны не закрываются при клике вне
    }

    private async loadItems() {
        try {
            const [items] = await Promise.all([
                ItemsCacheService.getAllItems() as unknown as Promise<ItemDefinition[]>,
                SearchTermService.init()
            ]);
            this.items = items;
            this.prepareItems();

            this.fuse = this.getFuse();

            // setupFilterOptions вызывает applyFilters, который вызывает sortAndRender
            this.setupFilterOptions();
        } catch (e) {
            console.error(e);
            const grid = this.container?.querySelector('#wikiItemsGrid');
            if (grid) grid.innerHTML = `<div class="error">${t('error_server_unavailable')}</div>`;
        }
    }

    private getItemKey(item: ItemDefinition): string {
        return item.id || item.name;
    }

    private prepareItems(): void {
        this.preparedItems = this.items.map(item => {
            const imagePath = this.getItemImagePath(item);
            const normalizedHero = (item.connectedHero || 'Shared') === 'Hob Gang' ? 'Hob' : (item.connectedHero || 'Shared');
            const tooltipText = SearchTermService.normalizeText(item.tooltips.join(' '));
            const statKeysText = SearchTermService.normalizeText(Object.keys(item.allStats || {}).join(' '));
            const typeText = SearchTermService.normalizeText(item.itemTypes.join(' '));
            const baseSearchText = [
                item.id,
                item.name,
                item.rarity,
                item.itemTypes.join(' '),
                normalizedHero,
                item.unlockSource || '',
                item.tooltips.join(' '),
                Object.keys(item.allStats || {}).join(' ')
            ].join(' ');

            const baseText = SearchTermService.normalizeText(baseSearchText);
            return {
                key: this.getItemKey(item),
                item,
                slug: SlugService.toSlug(item.name),
                imagePath,
                imageSrc: ImageFormatService.itemSrc(imagePath),
                tooltipText,
                normalizedHero,
                unlockSource: item.unlockSource || 'Unknown',
                statKeysText,
                typeText,
                baseText,
                searchText: SearchTermService.expandText(baseSearchText),
                strictText: this.buildStrictText(baseText)
            };
        });

        this.preparedByKey = new Map(this.preparedItems.map(prepared => [prepared.key, prepared]));
    }

    private getPrepared(item: ItemDefinition): PreparedItem | undefined {
        return this.preparedByKey.get(this.getItemKey(item));
    }

    private parseSearchInput(rawQuery: string): { textQuery: string; strictTagGroups: string[][] } {
        const strictTagGroups: string[][] = [];
        let textQuery = rawQuery.replace(/\[([^\]]+)]/g, (_match, groupContent: string) => {
            const tags = this.parseStrictTagGroup(groupContent);
            if (tags.length > 0) strictTagGroups.push(tags);
            return ' ';
        });

        return {
            textQuery: SearchTermService.normalizeText(textQuery),
            strictTagGroups
        };
    }

    private parseStrictTagGroup(groupContent: string): string[] {
        return groupContent
            .split(/[^\p{L}\p{N}_]+/gu)
            .map(tag => tag.trim())
            .filter(Boolean)
            .map(tag => SearchTermService.normalizeText(tag));
    }

    private buildStrictText(baseText: string): string {
        const strictTokens = new Set<string>(SearchTermService.tokenize(baseText));
        const aliases: Record<string, string[]> = {
            meleeweapon: ['melee weapon', 'melee'],
            rangedweapon: ['ranged weapon', 'ranged'],
            critchance: ['crit chance', 'critical chance'],
            critdamage: ['crit damage', 'critical damage'],
            maxhealth: ['max health', 'health'],
            staminacost: ['stamina cost', 'stamina usage', 'stamina'],
            staminausage: ['stamina usage', 'stamina cost', 'stamina'],
            staminarecovery: ['stamina recovery', 'stamina'],
            typeaccessory: ['accessory'],
            typearmor: ['armor'],
            typebag: ['bag'],
            typecharm: ['charm'],
            typefish: ['fish'],
            typefood: ['food'],
            typeingredient: ['ingredient'],
            typemineral: ['mineral'],
            typeplant: ['plant'],
            typepotion: ['potion'],
            typerat: ['rat'],
            typeskull: ['skull'],
            typetool: ['tool']
        };

        for (const [compact, variants] of Object.entries(aliases)) {
            if (strictTokens.has(compact) || variants.some(variant => baseText.includes(SearchTermService.normalizeText(variant)))) {
                strictTokens.add(compact);
                variants.forEach(variant => SearchTermService.tokenize(variant).forEach(token => strictTokens.add(token)));
            }
        }

        return [...strictTokens].join(' ');
    }

    private getStrictTagScore(item: ItemDefinition, tag: string): number | null {
        const prepared = this.getPrepared(item);
        if (!prepared) return null;

        const tagText = this.buildStrictText(SearchTermService.normalizeText(tag));
        const tagTokens = SearchTermService.tokenize(tagText);
        if (tagTokens.length === 0) return null;

        const itemTypeText = SearchTermService.normalizeText(item.itemTypes.join(' '));
        const itemTypeStrictText = this.buildStrictText(itemTypeText);
        if (this.strictFieldMatches(itemTypeStrictText, tagTokens)) return 0;

        const heroText = SearchTermService.normalizeText(item.connectedHero || '');
        const heroStrictText = this.buildStrictText(heroText);
        if (this.strictFieldMatches(heroStrictText, tagTokens)) return 0;

        if (this.strictFieldMatches(prepared.statKeysText, tagTokens)) return 0;
        if (this.strictFieldMatches(prepared.tooltipText, tagTokens)) return 0.35;
        if (this.strictFieldMatches(prepared.baseText, tagTokens)) return 0.45;

        return null;
    }

    private itemMatchesStrictTag(item: ItemDefinition, tag: string): boolean {
        return this.getStrictTagScore(item, tag) !== null;
    }

    private strictFieldMatches(fieldText: string, tagTokens: string[]): boolean {
        const fieldTokens = new Set(SearchTermService.tokenize(fieldText));
        return tagTokens.every(token => fieldTokens.has(token));
    }

    private getFuse(): Fuse<PreparedItem> {
        if (cachedFuse && cachedFuseItems === this.preparedItems) {
            return cachedFuse;
        }

        const options = {
            includeScore: true,
            threshold: 0.4,
            keys: [
                {name: 'item.name', weight: 2.4},
                {name: 'typeText', weight: 1.4},
                {name: 'normalizedHero', weight: 1},
                {name: 'searchText', weight: 1.1},
                {name: 'tooltipText', weight: 0.35}
            ]
        };

        cachedFuseItems = this.preparedItems;
        cachedFuse = new Fuse(this.preparedItems, options);
        return cachedFuse;
    }

    private setupFilterOptions() {
        // Извлекаем уникальные значения
        const allTypes = new Set<string>();
        const allRarities = new Set<string>();
        const allHeroes = new Set<string>();
        const allUnlockSources = new Set<string>();
        const allBuffs = new Set<string>();
        const allDebuffs = new Set<string>();
        const allStats = new Set<string>();

        // Определяем баффы и дебаффы
        const buffKeywords = ['Buff', 'Haste', 'Regeneration', 'Resist', 'Thorns', 'Armor', 'Luck', 'Lifesteal', 'Empower'];
        const debuffKeywords = ['Burn', 'Bleed', 'Poison', 'Chill', 'Curse', 'Blind', 'Stun', 'Debuff', 'Fatigue', 'Insanity'];
        
        // Определяем статистики
        const statKeywords = ['Health', 'MaxHealth', 'Armor', 'Damage', 'Accuracy', 'CritChance', 'CritDamage', 'Stamina', 'StaminaRecovery', 'Resist', 'Static', 'Soul'];

        this.preparedItems.forEach(prepared => {
            const item = prepared.item;
            item.itemTypes.forEach(type => allTypes.add(type));
            allRarities.add(item.rarity);
            allHeroes.add(prepared.normalizedHero);
            allUnlockSources.add(prepared.unlockSource);

            // Извлекаем баффы и дебаффы из подготовленного текста tooltips
            buffKeywords.forEach(buff => {
                if (prepared.tooltipText.includes(buff.toLowerCase())) {
                    allBuffs.add(buff);
                }
            });
            debuffKeywords.forEach(debuff => {
                if (prepared.tooltipText.includes(debuff.toLowerCase())) {
                    allDebuffs.add(debuff);
                }
            });
            
            // Извлекаем статистики из подготовленных tooltips/allStats
            statKeywords.forEach(stat => {
                const needle = stat.toLowerCase();
                if (prepared.tooltipText.includes(needle) || prepared.statKeysText.includes(needle)) {
                    allStats.add(stat);
                }
            });
        });

        // Сортируем для удобства
        // Особый порядок для типов предметов
        const priorityTypes = ['Bag', 'Melee Weapon', 'Ranged Weapon', 'Pet', 'Food', 'Accessory', 'Armor'];
        const sortedTypes = Array.from(allTypes).sort((a, b) => {
            const priorityA = priorityTypes.indexOf(a);
            const priorityB = priorityTypes.indexOf(b);
            
            // Если оба в приоритете - сортируем по приоритету
            if (priorityA !== -1 && priorityB !== -1) {
                return priorityA - priorityB;
            }
            // Если только один в приоритете - он идет первым
            if (priorityA !== -1) return -1;
            if (priorityB !== -1) return 1;
            // Остальные - алфавитно
            return a.localeCompare(b);
        });
        
        // Редкости - в порядке понижения веса (уже реализовано)
        const sortedRarities = Array.from(allRarities).sort((a, b) => {
            const weightA = this.rarityWeights[a] || 0;
            const weightB = this.rarityWeights[b] || 0;
            return weightB - weightA;
        });
        
        // Герои - Shared всегда первым
        const sortedHeroes = Array.from(allHeroes).sort((a, b) => {
            if (a === 'Shared') return -1;
            if (b === 'Shared') return 1;
            return a.localeCompare(b);
        });
        
        const sortedUnlockSources = Array.from(allUnlockSources).sort((a, b) => a.localeCompare(b));
        
        // Баффы - Buff всегда первым
        const sortedBuffs = Array.from(allBuffs).sort((a, b) => {
            if (a === 'Buff') return -1;
            if (b === 'Buff') return 1;
            return a.localeCompare(b);
        });
        
        // Дебаффы - Debuff всегда первым
        const sortedDebuffs = Array.from(allDebuffs).sort((a, b) => {
            if (a === 'Debuff') return -1;
            if (b === 'Debuff') return 1;
            return a.localeCompare(b);
        });
        
        // Статистики - в заданном порядке
        const statsOrder = ['Health', 'MaxHealth', 'Armor', 'Damage', 'Accuracy', 'CritChance', 'CritDamage', 'Stamina', 'Resist', 'Static', 'Soul'];
        const sortedStats = Array.from(allStats).sort((a, b) => {
            const indexA = statsOrder.indexOf(a);
            const indexB = statsOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        // Создаем UI для фильтров
        this.createMultiselectFilter('filterTypes', sortedTypes, this.filters.selectedTypes);
        this.createMultiselectFilter('filterRarities', sortedRarities, this.filters.selectedRarities);
        this.createMultiselectFilter('filterHeroes', sortedHeroes, this.filters.selectedHeroes);
        this.createMultiselectFilter('filterUnlockSources', sortedUnlockSources, this.filters.selectedUnlockSources);
        this.createMultiselectFilter('filterBuffs', sortedBuffs, this.filters.selectedBuffs);
        this.createMultiselectFilter('filterDebuffs', sortedDebuffs, this.filters.selectedDebuffs);
        this.createMultiselectFilter('filterStats', sortedStats, this.filters.selectedStats);

        // Применяем фильтры после настройки опций
        this.applyFilters();
    }

    private createMultiselectFilter(containerId: string, options: string[], selectedSet: Set<string>) {
        const container = this.container?.querySelector(`#${containerId}`);
        if (!container) return;

        container.innerHTML = '';

        // Разделяем опции на те что с иконками и те что без
        const optionsWithIcons: string[] = [];
        const optionsWithoutIcons: string[] = [];
        
        options.forEach(option => {
            const iconHtml = this.getIconForFilter(option, containerId);
            if (iconHtml) {
                optionsWithIcons.push(option);
            } else {
                optionsWithoutIcons.push(option);
            }
        });

        // Генерируем кнопки: сначала с иконками, потом без
        [...optionsWithIcons, ...optionsWithoutIcons].forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'filter-chip';
            
            // Добавляем CSS класс для редкостей если это фильтр редкостей
            if (containerId === 'filterRarities') {
                const rarityClass = `rarity-${option.toLowerCase()}`;
                button.classList.add(rarityClass);
            }
            
            button.dataset['value'] = option;

            const iconHtml = this.getIconForFilter(option, containerId);
            button.innerHTML = iconHtml || `<span>${option}</span>`;

            // Восстанавливаем визуальное состояние из сохраненных данных
            if (selectedSet.has(option)) button.classList.add('active');
            container.appendChild(button);
        });

        // ОДИН слушатель на весь контейнер (Делегирование событий)
        // Это избавляет от необходимости добавлять тысячи функций в cleanupFns
        this.addListener(container, 'click', (e) => {
            const button = (e.target as HTMLElement).closest('.filter-chip') as HTMLButtonElement;
            if (!button) return;

            // Проверяем, открыт ли текущий dropdown (container - это dropdown-content)
            if (!container.classList.contains('show')) {
                return; // Не обрабатываем клик, если dropdown закрыт
            }

            const option = button.dataset['value']!;
            if (selectedSet.has(option)) {
                selectedSet.delete(option);
                button.classList.remove('active');
            } else {
                selectedSet.add(option);
                button.classList.add('active');
            }
            
            // Сохраняем состояние при изменении фильтров
            this.saveState();
            this.applyFilters();
        });
    }

    private createIconHtml(iconName: string, title: string): string {
        const imageFormats = [
            {type: 'image/avif', ext: 'avif', path: '/images/fonticon/avif'},
            {type: 'image/webp', ext: 'webp', path: '/images/fonticon/webp'},
        ];
        const defaultFormat = imageFormats.find(f => f.ext === 'webp') || imageFormats[0];

        const sources = imageFormats.map(format =>
            `<source srcset="${format.path}/${iconName.toLowerCase()}.${format.ext}" type="${format.type}">`
        ).join('');

        return `<picture class="filter-icon" title="${title}">` +
            `${sources}` +
            `<img src="${defaultFormat?.path}/${iconName.toLowerCase()}.${defaultFormat?.ext}" alt="${title}" loading="lazy">` +
            `</picture>`;
    }

    private getIconForFilter(value: string, filterType: string): string | null {
        // Маппинг для типов предметов (нормализуем пробелы)
        const normalizedValue = value.replace(/\s+/g, '');
        const typeMapping: Record<string, string> = {
            'Armor': 'TypeArmor',
            'Accessory': 'TypeAccessory',
            'Food': 'TypeFood',
            'Plant': 'TypePlant',
            'Mineral': 'TypeMineral',
            'Potion': 'TypePotion',
            'MeleeWeapon': 'MeleeWeapon',
            'Melee Weapon': 'MeleeWeapon',
            'RangedWeapon': 'RangedWeapon',
            'Ranged Weapon': 'RangedWeapon',
            'Pet': 'Pet',
            'Mana': 'Mana',
            'Gold': 'Gold',
            'Rat': 'TypeRat'
        };

        // Маппинг для баффов
        const buffMapping: Record<string, string> = {
            'Buff': 'Buff',
            'Haste': 'Haste',
            'Regeneration': 'Regeneration',
            'Resist': 'Resist',
            'Thorns': 'Thorns',
            'Armor': 'Armor',
            'Luck': 'Luck',
            'Lifesteal': 'Lifesteal',
            'Empower': 'Empower',
            'StaminaRecovery': 'StaminaRecovery'
        };

        // Маппинг для дебаффов
        const debuffMapping: Record<string, string> = {
            'Burn': 'Burn',
            'Bleed': 'Bleed',
            'Poison': 'Poison',
            'Chill': 'Chill',
            'Curse': 'Curse',
            'Blind': 'Blind',
            'Stun': 'Stun',
            'Debuff': 'Debuff',
            'Fatigue': 'Fatigue',
            'Insanity': 'Insanity'
        };

        // Маппинг для статистик
        const statsMapping: Record<string, string> = {
            'Health': 'Health',
            'MaxHealth': 'MaxHealth',
            'Armor': 'Armor', // НЕ TypeArmor, а просто Armor
            'Damage': 'Damage',
            'Accuracy': 'Accuracy',
            'CritChance': 'CritChance',
            'CritDamage': 'CritDamage',
            'Stamina': 'Stamina',
            'StaminaRecovery': 'StaminaRecovery',
            'Resist': 'Resist',
            'Static': 'Static',
            'Soul': 'Soul'
        };

        // Маппинг для героев
        const heroMapping: Record<string, string> = {
            'Chana': 'Chana',
            'Ronan': 'Ronan',
            'Harkon': 'Harkon',
            'Nymphedora': 'Nymphedora',
            'Tink': 'Tink',
            'Buzz': 'Buzz',
            'Morrow': 'Morrow',
            'Enoch': 'Enoch',
            'Celeste': 'Celeste',
            'Shared': 'Shared',
            'Dorf': 'Dorf',
            'Hob': 'Hob',
            'Pepper': 'Pepper',
            'Sage': 'Sage',
            'Kragg': 'Kragg',
            'Fern': 'Fern',
            'Zahir': 'Zahir',
            'Crash Test Ducky': 'CrashTestDucky',
        };

        let iconName: string | null = null;

        if (filterType === 'filterTypes') {
            // Пробуем сначала точное совпадение, потом нормализованное
            iconName = typeMapping[value] || typeMapping[normalizedValue] || null;
            // Если нет прямого маппинга, пробуем через generateIconsOrText
            if (!iconName) {
                // Пробуем разные варианты написания
                const variants = [
                    value,
                    normalizedValue,
                    value.replace(/\s+/g, ''),
                    value.toLowerCase(),
                    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                ];

                for (const variant of variants) {
                    const result = generateIconsOrText([variant]);
                    if (result.includes('<picture')) {
                        return result;
                    }
                }
            }
        } else if (filterType === 'filterHeroes') {
            iconName = heroMapping[value] || null;
        } else if (filterType === 'filterBuffs') {
            iconName = buffMapping[value] || null;
        } else if (filterType === 'filterDebuffs') {
            iconName = debuffMapping[value] || null;
        } else if (filterType === 'filterStats') {
            iconName = statsMapping[value] || null;
        }
        // Для редкости и unlock sources оставляем текст (редкость имеет цветовую индикацию через классы)

        if (iconName) {
            return this.createIconHtml(iconName, value);
        }

        return null;
    }

    private toggleAdvancedFilters() {
        this.advancedFiltersVisible = !this.advancedFiltersVisible;
        const panel = this.container?.querySelector('#advancedFiltersPanel') as HTMLElement;
        const icon = this.container?.querySelector('.filter-toggle-icon') as HTMLElement;
        const toggleBtn = this.container?.querySelector('#advancedFiltersToggle') as HTMLElement;

        if (panel && toggleBtn) {
            if (this.advancedFiltersVisible) {
                // Открываем с плавной анимацией
                panel.style.display = 'block';
                // Небольшая задержка для применения display перед добавлением класса
                setTimeout(() => {
                    panel.classList.add('show');
                    // Обновляем AOS после открытия меню фильтров
                    setTimeout(() => {
                        if (AOS !== undefined) {
                            AOS.refresh();
                        }
                    }, 50);
                }, 10);
                toggleBtn.classList.add('open');
            } else {
                // Закрываем с плавной анимацией
                panel.classList.remove('show');
                // Ждем окончания анимации перед скрытием
                setTimeout(() => {
                    if (!panel.classList.contains('show')) {
                        panel.style.display = 'none';
                    }
                    // Обновляем AOS после закрытия меню фильтров
                    if (AOS !== undefined) {
                        AOS.refresh();
                    }
                }, 400); // Соответствует времени transition в CSS
                toggleBtn.classList.remove('open');
            }
        }
        
        if (icon) {
            icon.textContent = this.advancedFiltersVisible ? '▲' : '▼';
        }
        
        // Сохраняем состояние видимости панели
        this.saveState();
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

        const searchInput = this.container?.querySelector('#itemSearch') as HTMLInputElement;
        if (searchInput) searchInput.value = '';

        const purchasableCheckbox = this.container?.querySelector('#filterPurchasable') as HTMLInputElement;
        if (purchasableCheckbox) purchasableCheckbox.checked = false;

        // Обновляем визуальное состояние чипов
        this.container?.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        this.saveState();
        // Применяем фильтры для немедленного показа всех предметов
        this.applyFilters();
        
        // Обновляем UI фильтров без повторного применения фильтров
        this.updateFilterOptionsUI();
    }

    /**
     * Обновляет UI фильтров без повторного применения фильтров
     */
    private updateFilterOptionsUI() {
        const allTypes = new Set<string>();
        const allRarities = new Set<string>();
        const allHeroes = new Set<string>();
        const allUnlockSources = new Set<string>();
        const allBuffs = new Set<string>();
        const allDebuffs = new Set<string>();
        const allStats = new Set<string>();

        // Определяем баффы и дебаффы
        const buffKeywords = ['Buff', 'Haste', 'Regeneration', 'Resist', 'Thorns', 'Armor', 'Luck', 'Lifesteal', 'Empower'];
        const debuffKeywords = ['Burn', 'Bleed', 'Poison', 'Chill', 'Curse', 'Blind', 'Stun', 'Debuff', 'Fatigue', 'Insanity'];
        
        // Определяем статистики
        const statKeywords = ['Health', 'MaxHealth', 'Armor', 'Damage', 'Accuracy', 'CritChance', 'CritDamage', 'Stamina', 'StaminaRecovery', 'Resist', 'Static', 'Soul'];

        this.items.forEach(item => {
            item.itemTypes.forEach(type => allTypes.add(type));
            allRarities.add(item.rarity);
            // Объединяем "Hob Gang" и "Hob" как одного героя
            const hero = item.connectedHero || 'Shared';
            if (hero === 'Hob Gang') allHeroes.add('Hob');
            else allHeroes.add(hero);
            allUnlockSources.add(item.unlockSource);

            // Извлекаем баффы и дебаффы из tooltips
            const tooltipText = item.tooltips.join(' ').toLowerCase();
            buffKeywords.forEach(buff => {
                if (tooltipText.includes(buff.toLowerCase())) {
                    allBuffs.add(buff);
                }
            });
            debuffKeywords.forEach(debuff => {
                if (tooltipText.includes(debuff.toLowerCase())) {
                    allDebuffs.add(debuff);
                }
            });
            
            // Извлекаем статистики из tooltips и allStats
            statKeywords.forEach(stat => {
                if (tooltipText.includes(stat.toLowerCase()) || 
                    (item.allStats && Object.keys(item.allStats).some(key => key.toLowerCase().includes(stat.toLowerCase())))) {
                    allStats.add(stat);
                }
            });
        });

        // Сортируем опции
        const sortedTypes = Array.from(allTypes).sort((a, b) => a.localeCompare(b));
        const sortedRarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Unique', 'Relic', 'Boon', 'Special'].filter(rarity => allRarities.has(rarity));
        const sortedHeroes = Array.from(allHeroes).sort((a, b) => {
            const heroOrder = ['Chana', 'Ronan', 'Harkon', 'Shared', 'Hob'];
            const indexA = heroOrder.indexOf(a);
            const indexB = heroOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
        const sortedUnlockSources = Array.from(allUnlockSources).sort((a, b) => a.localeCompare(b));
        const sortedBuffs = Array.from(allBuffs).sort((a, b) => a.localeCompare(b));
        const sortedDebuffs = Array.from(allDebuffs).sort((a, b) => a.localeCompare(b));
        
        // Статистики - в заданном порядке
        const statsOrder = ['Health', 'MaxHealth', 'Armor', 'Damage', 'Accuracy', 'CritChance', 'CritDamage', 'Stamina', 'StaminaRecovery', 'Resist', 'Static', 'Soul'];
        const sortedStats = Array.from(allStats).sort((a, b) => {
            const indexA = statsOrder.indexOf(a);
            const indexB = statsOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        // Создаем UI для фильтров (без вызова applyFilters)
        this.createMultiselectFilter('filterTypes', sortedTypes, this.filters.selectedTypes);
        this.createMultiselectFilter('filterRarities', sortedRarities, this.filters.selectedRarities);
        this.createMultiselectFilter('filterHeroes', sortedHeroes, this.filters.selectedHeroes);
        this.createMultiselectFilter('filterUnlockSources', sortedUnlockSources, this.filters.selectedUnlockSources);
        this.createMultiselectFilter('filterBuffs', sortedBuffs, this.filters.selectedBuffs);
        this.createMultiselectFilter('filterDebuffs', sortedDebuffs, this.filters.selectedDebuffs);
        this.createMultiselectFilter('filterStats', sortedStats, this.filters.selectedStats);
    }

    /**
     * Сохранение состояния в sessionStorage
     */
    private saveState(): void {
        try {
            sessionStorage.setItem(this.STORAGE_KEYS.SEARCH_QUERY, this.filters.searchQuery);
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_TYPES, JSON.stringify([...this.filters.selectedTypes]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_RARITIES, JSON.stringify([...this.filters.selectedRarities]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_HEROES, JSON.stringify([...this.filters.selectedHeroes]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_UNLOCK_SOURCES, JSON.stringify([...this.filters.selectedUnlockSources]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_BUFFS, JSON.stringify([...this.filters.selectedBuffs]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_DEBUFFS, JSON.stringify([...this.filters.selectedDebuffs]));
            sessionStorage.setItem(this.STORAGE_KEYS.SELECTED_STATS, JSON.stringify([...this.filters.selectedStats]));
            sessionStorage.setItem(this.STORAGE_KEYS.PURCHASABLE_ONLY, JSON.stringify(this.filters.purchasableOnly));
            sessionStorage.setItem(this.STORAGE_KEYS.CURRENT_SORT, this.currentSort);
            sessionStorage.setItem(this.STORAGE_KEYS.ADVANCED_FILTERS_VISIBLE, JSON.stringify(this.advancedFiltersVisible));
        } catch (e) {
            console.warn('[ItemsBranch] Failed to save state to sessionStorage:', e);
        }
    }

    /**
     * Восстановление состояния из sessionStorage
     */
    private restoreState(): void {
        try {
            // Восстанавливаем поисковый запрос
            const savedSearch = sessionStorage.getItem(this.STORAGE_KEYS.SEARCH_QUERY);
            if (savedSearch !== null) {
                this.filters.searchQuery = savedSearch;
            }

            // Восстанавливаем выбранные типы
            const savedTypes = sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_TYPES);
            if (savedTypes) {
                const typesArray = JSON.parse(savedTypes);
                this.filters.selectedTypes = new Set(typesArray);
            }

            // Восстанавливаем выбранные редкости
            const savedRarities = sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_RARITIES);
            if (savedRarities) {
                const raritiesArray = JSON.parse(savedRarities);
                this.filters.selectedRarities = new Set(raritiesArray);
            }

            // Восстанавливаем выбранных героев
            const savedHeroes = sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_HEROES);
            if (savedHeroes) {
                const heroesArray = JSON.parse(savedHeroes);
                this.filters.selectedHeroes = new Set(heroesArray);
            }

            // Восстанавливаем источники разблокировки
            const savedUnlockSources = sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_UNLOCK_SOURCES);
            if (savedUnlockSources) {
                const unlockSourcesArray = JSON.parse(savedUnlockSources);
                this.filters.selectedUnlockSources = new Set(unlockSourcesArray);
            }

            // Восстанавливаем баффы
            const savedBuffs = sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_BUFFS);
            if (savedBuffs) {
                const buffsArray = JSON.parse(savedBuffs);
                this.filters.selectedBuffs = new Set(buffsArray);
            }

            // Восстанавливаем дебаффы
            const savedDebuffs = sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_DEBUFFS);
            if (savedDebuffs) {
                const debuffsArray = JSON.parse(savedDebuffs);
                this.filters.selectedDebuffs = new Set(debuffsArray);
            }

            // Восстанавливаем статистики
            const savedStats = sessionStorage.getItem(this.STORAGE_KEYS.SELECTED_STATS);
            if (savedStats) {
                const statsArray = JSON.parse(savedStats);
                this.filters.selectedStats = new Set(statsArray);
            }

            // Восстанавливаем фильтр покупаемости
            const savedPurchasable = sessionStorage.getItem(this.STORAGE_KEYS.PURCHASABLE_ONLY);
            if (savedPurchasable !== null) {
                this.filters.purchasableOnly = JSON.parse(savedPurchasable);
            }

            // Восстанавливаем сортировку
            const savedSort = sessionStorage.getItem(this.STORAGE_KEYS.CURRENT_SORT);
            if (savedSort === 'rarity' || savedSort === 'name') {
                this.currentSort = savedSort;
            }

            // Восстанавливаем видимость панели фильтров
            const savedAdvancedVisible = sessionStorage.getItem(this.STORAGE_KEYS.ADVANCED_FILTERS_VISIBLE);
            if (savedAdvancedVisible !== null) {
                this.advancedFiltersVisible = JSON.parse(savedAdvancedVisible);
            }
        } catch (e) {
            console.warn('[ItemsBranch] Failed to restore state from sessionStorage:', e);
        }
    }

    private applyFilters() {
        let filtered = [...this.items];
        const { textQuery: searchQuery, strictTagGroups } = this.parseSearchInput(this.filters.searchQuery);
        this.searchScores.clear();
        this.strictTagScores.clear();

        // Текстовый поиск. Расширенные термины ищутся как OR, а не одной длинной AND-подобной строкой.
        if (searchQuery) {
            if (this.fuse) {
                const resultByKey = new Map<string, { item: ItemDefinition; score: number }>();
                const queries = SearchTermService.getWeightedExpandedQueryTerms(searchQuery);

                queries.forEach((query) => {
                    if (query.isOriginal) {
                        const result = this.fuse!.search(query.term);
                        result.forEach((res: any) => {
                            const score = (res.score ?? 1) + query.weight;
                            const existing = resultByKey.get(res.item.key);
                            if (!existing || score < existing.score) {
                                resultByKey.set(res.item.key, { item: res.item.item, score });
                            }
                        });
                        return;
                    }

                    // Алиасы не гоняем через fuzzy, иначе poison начинает матчить potion.
                    // Для алиасов используем точный includes по подготовленным полям с разными весами.
                    this.preparedItems.forEach(prepared => {
                        const fieldScore = this.getAliasFieldScore(prepared, query.term);
                        if (fieldScore === null) return;

                        const score = fieldScore + query.weight;
                        const existing = resultByKey.get(prepared.key);
                        if (!existing || score < existing.score) {
                            resultByKey.set(prepared.key, { item: prepared.item, score });
                        }
                    });
                });

                resultByKey.forEach((value, key) => {
                    this.searchScores.set(key, value.score);
                });
                filtered = [...resultByKey.values()].sort((a, b) => a.score - b.score).map(entry => entry.item);
            } else {
                filtered = filtered.filter(item => {
                    const prepared = this.getPrepared(item);
                    const matches = SearchTermService.normalizeText(item.name).includes(searchQuery) ||
                        !!prepared?.searchText.includes(searchQuery) ||
                        SearchTermService.semanticRank(prepared?.searchText || '', searchQuery) < 2;
                    if (matches) this.searchScores.set(item.id || item.name, this.getSearchHeuristicScore(item, searchQuery));
                    return matches;
                });
            }
        }

        // Строгие теги из поисковой строки: [Poison], [MeleeWeapon RangedWeapon].
        // Внутри одной группы — OR, между группами — AND.
        if (strictTagGroups.length > 0) {
            filtered = filtered.filter(item => {
                let totalScore = 0;

                for (const group of strictTagGroups) {
                    let bestGroupScore: number | null = null;
                    let matchedTagsCount = 0;

                    for (const tag of group) {
                        const score = this.getStrictTagScore(item, tag);
                        if (score === null) continue;

                        matchedTagsCount += 1;
                        if (bestGroupScore === null || score < bestGroupScore) {
                            bestGroupScore = score;
                        }
                    }

                    if (bestGroupScore === null) return false;

                    // Внутри OR-группы больше совпавших тегов = выше в выдаче.
                    // Маленький бонус не даёт tooltip-совпадениям обгонять прямые itemTypes/hero/stats совпадения.
                    const multiMatchBonus = Math.min(matchedTagsCount, 10) * 0.01;
                    totalScore += bestGroupScore - multiMatchBonus;
                }

                this.strictTagScores.set(this.getItemKey(item), totalScore);
                return true;
            });
        }

        // Фильтр по типам
        if (this.filters.selectedTypes.size > 0) {
            filtered = filtered.filter(item =>
                item.itemTypes.some(type => this.filters.selectedTypes.has(type))
            );
        }

        // Фильтр по редкости
        if (this.filters.selectedRarities.size > 0) {
            filtered = filtered.filter(item =>
                this.filters.selectedRarities.has(item.rarity)
            );
        }

        // Фильтр по герою
        if (this.filters.selectedHeroes.size > 0) {
            filtered = filtered.filter(item => {
                const prepared = this.getPrepared(item);
                return this.filters.selectedHeroes.has(prepared?.normalizedHero || 'Shared');
            });
        }

        // Фильтр по источнику разблокировки
        if (this.filters.selectedUnlockSources.size > 0) {
            filtered = filtered.filter(item => {
                const prepared = this.getPrepared(item);
                return this.filters.selectedUnlockSources.has(prepared?.unlockSource || 'Unknown');
            });
        }

        // Фильтр по возможности покупки
        if (this.filters.purchasableOnly !== null) {
            filtered = filtered.filter(item =>
                item.purchasable === this.filters.purchasableOnly
            );
        }

        // Фильтр по баффам
        if (this.filters.selectedBuffs.size > 0) {
            filtered = filtered.filter(item =>
                Array.from(this.filters.selectedBuffs).some(buff =>
                    this.itemMatchesStrictTag(item, buff)
                )
            );
        }

        // Фильтр по дебаффам
        if (this.filters.selectedDebuffs.size > 0) {
            filtered = filtered.filter(item =>
                Array.from(this.filters.selectedDebuffs).some(debuff =>
                    this.itemMatchesStrictTag(item, debuff)
                )
            );
        }

        // Фильтр по статистикам
        if (this.filters.selectedStats.size > 0) {
            filtered = filtered.filter(item =>
                Array.from(this.filters.selectedStats).some(stat =>
                    this.itemMatchesStrictTag(item, stat)
                )
            );
        }

        this.filteredItems = filtered;
        this.sortAndRender();
    }


    private sortAndRender() {
        if (this.filteredItems.length > 0) {
            const { textQuery: searchQuery } = this.parseSearchInput(this.filters.searchQuery);
            this.filteredItems.sort((a, b) => {
                if (searchQuery) {
                    return this.compareSearchResults(a, b, searchQuery);
                }

                return this.compareWithStrictTagScore(a, b);
            });
        }

        // СОХРАНЯЕМ ПОРЯДОК:
        // Записываем массив имен (или ID) отфильтрованных предметов
        const currentOrder = this.filteredItems.map(item => item.name);
        sessionStorage.setItem('filteredItemsOrder', JSON.stringify(currentOrder));

        // Применяем сортировку сразу при генерации
        this.renderGrid();
    }

    private compareWithStrictTagScore(a: ItemDefinition, b: ItemDefinition): number {
        const scoreA = this.strictTagScores.get(this.getItemKey(a));
        const scoreB = this.strictTagScores.get(this.getItemKey(b));

        if (scoreA !== undefined || scoreB !== undefined) {
            const normalizedA = scoreA ?? Number.POSITIVE_INFINITY;
            const normalizedB = scoreB ?? Number.POSITIVE_INFINITY;
            if (normalizedA !== normalizedB) return normalizedA - normalizedB;
        }

        return this.compareByCurrentSort(a, b);
    }

    private compareByCurrentSort(a: ItemDefinition, b: ItemDefinition): number {
        if (this.currentSort === 'rarity') {
            const weightA = this.rarityWeights[a.rarity] || 0;
            const weightB = this.rarityWeights[b.rarity] || 0;
            if (weightA !== weightB) return weightB - weightA;
        }

        return a.name.localeCompare(b.name);
    }

    private getAliasFieldScore(prepared: PreparedItem, term: string): number | null {
        if (SearchTermService.normalizeText(prepared.item.name).includes(term)) return 0.05;
        if (prepared.typeText.includes(term)) return 0.1;
        if (prepared.normalizedHero.toLowerCase().includes(term)) return 0.14;
        if (prepared.statKeysText.includes(term)) return 0.18;
        if (prepared.tooltipText.includes(term)) return 0.3;
        if (prepared.searchText.includes(term)) return 0.42;
        return null;
    }

    private compareSearchResults(a: ItemDefinition, b: ItemDefinition, query: string): number {
        const rankA = this.getSearchRank(a, query);
        const rankB = this.getSearchRank(b, query);
        if (rankA !== rankB) return rankA - rankB;

        const scoreA = this.searchScores.get(a.id || a.name) ?? this.getSearchHeuristicScore(a, query);
        const scoreB = this.searchScores.get(b.id || b.name) ?? this.getSearchHeuristicScore(b, query);
        if (scoreA !== scoreB) return scoreA - scoreB;

        return this.compareWithStrictTagScore(a, b);
    }

    private getSearchRank(item: ItemDefinition, query: string): number {
        const name = SearchTermService.normalizeText(item.name);
        const words = name.split(/\s+/);
        const prepared = this.getPrepared(item);

        if (name === query) return 0;
        if (name.startsWith(query)) return 1;
        if (words.some(word => word.startsWith(query))) return 2;
        if (name.includes(query)) return 3;

        const semanticRank = SearchTermService.semanticRank(prepared?.searchText || '', query);
        if (semanticRank === 0) return 4;
        if (semanticRank === 1) return 5;

        return 6;
    }

    private getSearchHeuristicScore(item: ItemDefinition, query: string): number {
        const rank = this.getSearchRank(item, query);
        if (rank < 6) return rank / 10;

        const prepared = this.getPrepared(item);
        return prepared?.searchText.includes(query) ? 0.9 : 1;
    }

    private getItemImagePath(item: ItemDefinition): string {
        const maskedItems: Record<string, string> = {
            "Suspicious Sausage": "tender-sausage",
            "Fools Gold": "gold-ore",
            "Feral Cat": "black-cat",
            "Cursed Dagger": "poison-dagger",
            "Book of Dark Secrets": "dusty-book",
            "Blind Fury Potion": "wrath-potion",
            "Feather of Icarus": "phoenix-feather"
        };

        const texture = maskedItems[item.name];
        if (texture) {
            return texture;
        }

        // Проверяем условие для Special предметов с тултипом "Step {число}" (римское или арабское)
        if (item.rarity === 'Special' && item.tooltips && item.tooltips.length > 0) {
            const firstTooltip = item.tooltips[0];
            if (firstTooltip) {
                // Сначала пробуем найти арабские цифры: например, "Step 1/4" или "Step 3"
                const arabicNum = /Step\s+(\d+)/i.exec(firstTooltip)?.[1];
                if (arabicNum) return `heist-plan-${arabicNum}`;

                // Если не нашли арабские, пробуем римские: например, "Step IV"
                const romanNumeral = /Step\s+([IVXLCDM]+)/i.exec(firstTooltip)?.[1];
                if (romanNumeral) return `heist-plan-${this.romanToArabic(romanNumeral)}`;
            }
        }
        
        // Стандартная логика для остальных предметов
        return SlugService.toSlug(item.name);
    }

    private romanToArabic(roman: string): number {
        const romanNumerals: Record<string, number> = {
            'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
            'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
            'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
            'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20
        };
        return romanNumerals[roman] || 1;
    }

    private renderGrid() {
        const grid = this.container?.querySelector('#wikiItemsGrid');
        if (!grid) return;

        this.disconnectInfiniteScroll();
        grid.innerHTML = '';
        this.renderedCount = 0;
        this.appendNextItemsBatch();
        this.setupInfiniteScroll();
    }

    private setupInfiniteScroll(): void {
        const sentinel = this.container?.querySelector('#itemsScrollSentinel');
        if (!sentinel) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting) {
                this.appendNextItemsBatch();
            }
        }, {
            root: null,
            rootMargin: '900px 0px',
            threshold: 0
        });

        this.intersectionObserver.observe(sentinel);
    }

    private disconnectInfiniteScroll(): void {
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;
    }

    private appendNextItemsBatch(): void {
        const grid = this.container?.querySelector('#wikiItemsGrid');
        if (!grid) return;
        if (this.renderedCount >= this.filteredItems.length) {
            this.disconnectInfiniteScroll();
            return;
        }

        const start = this.renderedCount;
        const end = Math.min(start + this.renderBatchSize, this.filteredItems.length);
        const fragment = document.createDocumentFragment();

        for (let index = start; index < end; index++) {
            const item = this.filteredItems[index];
            if (!item) continue;

            const prepared = this.getPrepared(item);
            const imageSrc = prepared?.imageSrc || ImageFormatService.itemSrc(this.getItemImagePath(item));
            const slug = prepared?.slug || SlugService.toSlug(item.name);

            const link = document.createElement('a');
            link.href = `/item/${slug}`;
            link.dataset['link'] = '';
            link.className = 'item-card-link';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.style.display = 'block';

            (link as any)._stateData = {itemData: item};

            link.dataset['aos'] = 'fade-up';
            link.dataset['aosOffset'] = '-400px';
            const delay = Math.min((index % 10) * 30, 300);
            link.dataset['aosDelay'] = `${delay}`;

            const card = document.createElement('div');
            card.className = 'item-card';

            const isEagerImage = index < this.eagerImagesCount;
            card.innerHTML = `
                <div class="item-image-wrapper">
                    <img src="${imageSrc}"
                         alt="${item.name}" 
                         loading="${isEagerImage ? 'eager' : 'lazy'}"
                         decoding="async"
                         fetchpriority="${isEagerImage ? 'high' : 'low'}"
                         class="item-icon"
                         data-fallback>
                </div>
                <span class="item-name">${item.name}</span>
                <div class="item-stats">
                    <span class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</span>
                </div>
            `;

            link.appendChild(card);
            fragment.appendChild(link);
            link.addEventListener('pointerenter', () => {
                ItemPreviewPrefetchService.prefetch(item as any, imageSrc);
            }, { passive: true });
            link.addEventListener('click', () => {
                (link as any)._stateData = {
                    itemData: item,
                    scrollY: window.scrollY
                };
            });
        }

        this.renderedCount = end;
        grid.appendChild(fragment);

        requestAnimationFrame(() => {
            AOS.refresh();

            setTimeout(() => {
                const elements = Array.from(grid.querySelectorAll('.item-card-link')).slice(start, end);
                elements.forEach((el, localIndex) => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        el.classList.add('aos-animate');
                        (el as HTMLElement).style.animationDelay = `${Math.min((localIndex % 10) * 30, 300)}ms`;
                        (el as HTMLElement).style.animation = 'fadeUp 0.6s ease-out forwards';
                    }
                });
            }, 50);
        });

        if (this.renderedCount >= this.filteredItems.length) {
            this.disconnectInfiniteScroll();
        }
    }

    protected destroy(): void {
        // Сохраняем состояние перед уничтожением компонента
        this.saveState();
        
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }
        this.disconnectInfiniteScroll();
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}