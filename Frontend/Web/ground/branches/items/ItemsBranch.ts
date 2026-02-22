import {Branch} from '@roots/Branch.ts';
import {t} from '../../localization/i18n';
import {ApiService} from '../../utils/ApiService';
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


interface FilterState {
    searchQuery: string;
    selectedTypes: Set<string>;
    selectedRarities: Set<string>;
    selectedHeroes: Set<string>;
    selectedUnlockSources: Set<string>;
    selectedBuffs: Set<string>;
    selectedDebuffs: Set<string>;
    purchasableOnly: boolean | null; // null = all, true = only purchasable, false = only non-purchasable
}

export class ItemsBranch extends Branch {
    private items: ItemDefinition[] = [];
    private filteredItems: ItemDefinition[] = [];
    private currentSort: 'rarity' | 'name' = 'rarity';
    private cleanupFns: (() => void)[] = [];
    private fuse: Fuse<ItemDefinition> | null = null; // Экземпляр Fuse.js
    private filters: FilterState = {
        searchQuery: '',
        selectedTypes: new Set(),
        selectedRarities: new Set(),
        selectedHeroes: new Set(),
        selectedUnlockSources: new Set(),
        selectedBuffs: new Set(),
        selectedDebuffs: new Set(),
        purchasableOnly: null
    };
    private advancedFiltersVisible: boolean = false;

    private rarityWeights: Record<string, number> = {
        "Unique": 100, "Boon": 90, "Relic": 80, "Mythic": 70,
        "Legendary": 60, "Epic": 50, "Rare": 40, "Common": 30, "Special": 20
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
                                <div class="filter-group">
                                    <label class="filter-label">${t('items_filter_types')}</label>
                                    <div id="filterTypes" class="filter-multiselect"></div>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">${t('items_filter_rarity')}</label>
                                    <div id="filterRarities" class="filter-multiselect"></div>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">${t('items_filter_hero')}</label>
                                    <div id="filterHeroes" class="filter-multiselect"></div>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">${t('items_filter_unlock_source')}</label>
                                    <div id="filterUnlockSources" class="filter-multiselect"></div>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">${t('items_filter_buffs')}</label>
                                    <div id="filterBuffs" class="filter-multiselect"></div>
                                </div>
                                
                                <div class="filter-group">
                                    <label class="filter-label">${t('items_filter_debuffs')}</label>
                                    <div id="filterDebuffs" class="filter-multiselect"></div>
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
        this.loadItems().catch(console.error);

        const searchInput = this.container?.querySelector('#itemSearch') as HTMLInputElement;
        if (searchInput) {
            this.addListener(searchInput, 'input', (e) => {
                this.filters.searchQuery = (e.target as HTMLInputElement).value;
                this.applyFilters();
            });
        }

        const advancedFiltersToggle = this.container?.querySelector('#advancedFiltersToggle');
        if (advancedFiltersToggle) {
            this.addListener(advancedFiltersToggle, 'click', () => {
                this.toggleAdvancedFilters();
            });
        }

        const itemSortBtn = this.container?.querySelector('#itemSortToggle');
        if (itemSortBtn) {
            this.addListener(itemSortBtn, 'click', () => {
                this.currentSort = this.currentSort === 'rarity' ? 'name' : 'rarity';

                const text = this.container?.querySelector('#itemSortText');
                if (text) text.textContent = this.currentSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_name');

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
            this.addListener(purchasableCheckbox, 'change', (e) => {
                const checked = (e.target as HTMLInputElement).checked;
                this.filters.purchasableOnly = checked ? true : null;
                this.applyFilters();
            });
        }

        this.container?.addEventListener('error', (e) => {
            const target = e.target as HTMLImageElement;
            if (target.tagName === 'IMG' && target.hasAttribute('data-fallback')) {
                if (target.getAttribute('data-failed') === 'true') return;
                target.setAttribute('data-failed', 'true');
                console.warn(`[ItemsBranch] Image not found for item: "${target.alt}". Using placeholder.`);
                const placeholder = '/images/placeholder/placeholder.webp';
                const picture = target.parentElement;
                if (picture && picture.tagName === 'PICTURE') {
                    const sources = picture.querySelectorAll('source');
                    sources.forEach(s => {
                        s.srcset = placeholder;
                        s.type = 'image/webp';
                    });
                }
                target.src = placeholder;
                target.parentElement?.classList.add('no-image');
            }
        }, true);
    }

    private async loadItems() {
        try {
            this.items = await ApiService.getItems();
            sessionStorage.setItem('allItems', JSON.stringify(this.items));

            // Инициализация Fuse.js
            const options = {
                includeScore: true,
                threshold: 0.4,
                keys: [
                    {name: 'name', weight: 2},
                    {name: 'itemTypes', weight: 1.5},
                    {name: 'connectedHero', weight: 1},
                    {name: 'tooltips', weight: 0.5}
                ]
            };
            this.fuse = new Fuse(this.items, options);

            // setupFilterOptions вызывает applyFilters, который вызывает sortAndRender
            this.setupFilterOptions();
        } catch (e) {
            console.error(e);
            const grid = this.container?.querySelector('#wikiItemsGrid');
            if (grid) grid.innerHTML = `<div class="error">${t('error_server_unavailable')}</div>`;
        }
    }

    private setupFilterOptions() {
        // Извлекаем уникальные значения
        const allTypes = new Set<string>();
        const allRarities = new Set<string>();
        const allHeroes = new Set<string>();
        const allUnlockSources = new Set<string>();
        const allBuffs = new Set<string>();
        const allDebuffs = new Set<string>();

        // Определяем баффы и дебаффы
        const buffKeywords = ['Buff', 'Haste', 'Regeneration', 'Resist', 'Thorns', 'Armor', 'Luck', 'Health', 'MaxHealth', 'Lifesteal', 'Empower', 'Static', 'Stamina', 'StaminaRecovery'];
        const debuffKeywords = ['Burn', 'Bleed', 'Poison', 'Chill', 'Curse', 'Blind', 'Stun', 'Debuff', 'Fatigue', 'Insanity'];

        this.items.forEach(item => {
            item.itemTypes.forEach(type => allTypes.add(type));
            allRarities.add(item.rarity);
            // Объединяем "Hob Gang" и "Hob" как одного героя
            const hero = item.connectedHero || 'Shared';
            const normalizedHero = hero === 'Hob Gang' ? 'Hob' : hero;
            allHeroes.add(normalizedHero);
            allUnlockSources.add(item.unlockSource || 'Unknown');

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
        });

        // Сортируем для удобства
        const sortedTypes = Array.from(allTypes).sort();
        const sortedRarities = Array.from(allRarities).sort((a, b) => {
            const weightA = this.rarityWeights[a] || 0;
            const weightB = this.rarityWeights[b] || 0;
            return weightB - weightA;
        });
        const sortedHeroes = Array.from(allHeroes).sort();
        const sortedUnlockSources = Array.from(allUnlockSources).sort();
        const sortedBuffs = Array.from(allBuffs).sort();
        const sortedDebuffs = Array.from(allDebuffs).sort();

        // Создаем UI для фильтров
        this.createMultiselectFilter('filterTypes', sortedTypes, this.filters.selectedTypes);
        this.createMultiselectFilter('filterRarities', sortedRarities, this.filters.selectedRarities);
        this.createMultiselectFilter('filterHeroes', sortedHeroes, this.filters.selectedHeroes);
        this.createMultiselectFilter('filterUnlockSources', sortedUnlockSources, this.filters.selectedUnlockSources);
        this.createMultiselectFilter('filterBuffs', sortedBuffs, this.filters.selectedBuffs);
        this.createMultiselectFilter('filterDebuffs', sortedDebuffs, this.filters.selectedDebuffs);

        // Применяем фильтры после настройки опций
        this.applyFilters();
    }

    private createMultiselectFilter(containerId: string, options: string[], selectedSet: Set<string>) {
        const container = this.container?.querySelector(`#${containerId}`);
        if (!container) return;

        container.innerHTML = '';

        // Генерируем кнопки
        options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'filter-chip';
            button.dataset.value = option;

            const iconHtml = this.getIconForFilter(option, containerId);
            button.innerHTML = iconHtml ? iconHtml : `<span>${option}</span>`;

            if (selectedSet.has(option)) button.classList.add('active');
            container.appendChild(button);
        });

        // ОДИН слушатель на весь контейнер (Делегирование событий)
        // Это избавляет от необходимости добавлять тысячи функций в cleanupFns
        this.addListener(container, 'click', (e) => {
            const button = (e.target as HTMLElement).closest('.filter-chip') as HTMLButtonElement;
            if (!button) return;

            const option = button.dataset.value!;
            if (selectedSet.has(option)) {
                selectedSet.delete(option);
                button.classList.remove('active');
            } else {
                selectedSet.add(option);
                button.classList.add('active');
            }
            this.applyFilters();
        });
    }

    private createIconHtml(iconName: string, title: string): string {
        const imageFormats = [
            {type: 'image/webp', ext: 'webp', path: '/images/fonticon/webp'},
            {type: 'image/avif', ext: 'avif', path: '/images/fontIcon/avif'},
        ];
        const defaultFormat = imageFormats.find(f => f.ext === 'webp') || imageFormats[0];

        const sources = imageFormats.map(format =>
            `<source srcset="${format.path}/${iconName.toLowerCase()}.${format.ext}" type="${format.type}">`
        ).join('');

        return `<picture class="filter-icon" title="${title}">` +
            `${sources}` +
            `<img src="${defaultFormat.path}/${iconName.toLowerCase()}.${defaultFormat.ext}" alt="${title}" loading="lazy">` +
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
            'Gold': 'Gold'
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
            'Health': 'Health',
            'MaxHealth': 'MaxHealth',
            'Lifesteal': 'Lifesteal',
            'Empower': 'Empower',
            'Static': 'Static',
            'Stamina': 'Stamina',
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
            'Sage': 'Sage'
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

        if (panel) {
            panel.style.display = this.advancedFiltersVisible ? 'block' : 'none';
        }
        if (icon) {
            icon.textContent = this.advancedFiltersVisible ? '▲' : '▼';
        }
        
        // Обновляем AOS после закрытия панели, чтобы анимации применились к видимым элементам
        if (!this.advancedFiltersVisible) {
            setTimeout(() => AOS.refresh(), 100);
        }
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

        this.setupFilterOptions();
        this.applyFilters();
    }

    private applyFilters() {
        let filtered = [...this.items];

        // Текстовый поиск
        if (this.filters.searchQuery.trim()) {
            if (this.fuse) {
                const result = this.fuse.search(this.filters.searchQuery);
                filtered = result.map((res: any) => res.item);
            } else {
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(this.filters.searchQuery.toLowerCase()) ||
                    item.tooltips.some(tip => tip.toLowerCase().includes(this.filters.searchQuery.toLowerCase()))
                );
            }
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
                const hero = item.connectedHero || 'Shared';
                const normalizedHero = hero === 'Hob Gang' ? 'Hob' : hero;
                return this.filters.selectedHeroes.has(normalizedHero);
            });
        }

        // Фильтр по источнику разблокировки
        if (this.filters.selectedUnlockSources.size > 0) {
            filtered = filtered.filter(item =>
                this.filters.selectedUnlockSources.has(item.unlockSource || 'Unknown')
            );
        }

        // Фильтр по возможности покупки
        if (this.filters.purchasableOnly !== null) {
            filtered = filtered.filter(item =>
                item.purchasable === this.filters.purchasableOnly
            );
        }

        // Фильтр по баффам
        if (this.filters.selectedBuffs.size > 0) {
            filtered = filtered.filter(item => {
                const tooltipText = item.tooltips.join(' ').toLowerCase();
                return Array.from(this.filters.selectedBuffs).some(buff =>
                    tooltipText.includes(buff.toLowerCase())
                );
            });
        }

        // Фильтр по дебаффам
        if (this.filters.selectedDebuffs.size > 0) {
            filtered = filtered.filter(item => {
                const tooltipText = item.tooltips.join(' ').toLowerCase();
                return Array.from(this.filters.selectedDebuffs).some(debuff =>
                    tooltipText.includes(debuff.toLowerCase())
                );
            });
        }

        this.filteredItems = filtered;
        this.sortAndRender();
    }


    private sortAndRender() {
        if (this.filteredItems.length > 0) {
            this.filteredItems.sort((a, b) => {
                if (this.currentSort === 'rarity') {
                    const weightA = this.rarityWeights[a.rarity] || 0;
                    const weightB = this.rarityWeights[b.rarity] || 0;
                    if (weightA !== weightB) return weightB - weightA;
                }
                return a.name.localeCompare(b.name);
            });
        }

        // СОХРАНЯЕМ ПОРЯДОК:
        // Записываем массив имен (или ID) отфильтрованных предметов
        const currentOrder = this.filteredItems.map(item => item.name);
        sessionStorage.setItem('filteredItemsOrder', JSON.stringify(currentOrder));

        // Применяем сортировку сразу при генерации
        this.renderGrid();
    }

    private getItemImagePath(item: ItemDefinition): string {
        // Проверяем условие для Special предметов с тултипом "Step {римское число}"
        if (item.rarity === 'Special' && item.tooltips.length > 0) {
            const firstTooltip = item.tooltips[0];
            const stepMatch = firstTooltip.match(/Step\s+([IVXLCDM]+)/);
            
            if (stepMatch) {
                const romanNumeral = stepMatch[1];
                // Конвертируем римское число в арабское
                const arabicNumber = this.romanToArabic(romanNumeral);
                return `heist-plan-${arabicNumber}`;
            }
        }
        
        // Стандартная логика для остальных предметов
        return item.name.toLowerCase().split(' ').join('-');
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

        grid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        this.filteredItems.forEach((item, index) => {
            // Определяем путь к картинке
            const imagePath = this.getItemImagePath(item);

            const link = document.createElement('a');
            link.href = `/item/${item.name.toLowerCase().split(' ').join('-')}`;
            link.setAttribute('data-link', '');
            link.className = 'item-card-link';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.style.display = 'block';

            (link as any)._stateData = {itemData: item};

            link.setAttribute('data-aos', 'fade-up');
            const delay = Math.min((index % 10) * 30, 300);
            link.setAttribute('data-aos-delay', `${delay}`);

            const card = document.createElement('div');
            card.className = 'item-card';

            card.innerHTML = `
                <div class="item-image-wrapper">
                    <picture>
                        <source srcset="/images/items/avif/${imagePath}.avif" type="image/avif">
                        <source srcset="/images/items/webp/${imagePath}.webp" type="image/webp">
                        <img src="/images/items/webp/${imagePath}.webp"
                             alt="${item.name}" 
                             loading="lazy" 
                             class="item-icon"
                             data-fallback>
                    </picture>
                </div>
                <span class="item-name">${item.name}</span>
                <div class="item-stats">
                    <span class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</span>
                </div>
            `;

            link.appendChild(card);
            fragment.appendChild(link);
            link.addEventListener('click', () => {
                (link as any)._stateData = {
                    itemData: item,
                    scrollY: window.scrollY // ЗАПОМИНАЕМ ТЕКУЩУЮ ПОЗИЦИЮ
                };
            });
        });

        grid.appendChild(fragment);

        setTimeout(() => AOS.refresh(), 100);
    }

    protected destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}