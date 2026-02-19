import {Branch} from '@roots/Branch.ts';
import {t} from '../../localization/i18n';
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


export class ItemsBranch extends Branch {
    private items: ItemDefinition[] = [];
    private filteredItems: ItemDefinition[] = [];
    private currentSort: 'rarity' | 'name' = 'rarity';
    private cleanupFns: (() => void)[] = [];
    private fuse: Fuse<ItemDefinition> | null = null; // Экземпляр Fuse.js

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

                        <div class="sort-controls" style="margin-top: 20px;" data-aos="fade-up">
                            <button id="itemSortToggle" class="sort-btn">
                                <span id="itemSortText">${sortLabel}</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="items-grid" id="wikiItemsGrid">
                        <div class="loading-spinner" style="display: none;">${t('profile_loading_button')}</div>
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
                const query = (e.target as HTMLInputElement).value; // Не приводим к lowerCase
                this.filterItems(query);
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
        const spinner = this.container?.querySelector('.loading-spinner') as HTMLElement;
        if (spinner) spinner.style.display = 'block';

        try {
            const response = await fetch('/api/items');
            if (!response.ok) throw new Error('Failed to load items');

            this.items = await response.json();
            sessionStorage.setItem('allItems', JSON.stringify(this.items));

            // ИСПРАВЛЕНО: Убрана фильтрация Special
            // this.items = this.items.filter(i => i.rarity !== 'Special');

            // Инициализация Fuse.js
            const options = {
                includeScore: true,
                threshold: 0.4, // Насколько "нечетким" должен быть поиск
                keys: [
                    {name: 'name', weight: 2}, // Имени предмета даем больший вес
                    {name: 'itemTypes', weight: 1.5},
                    {name: 'connectedHero', weight: 1},
                    {name: 'tooltips', weight: 0.5} // Описанию даем меньший вес
                ]
            };
            this.fuse = new Fuse(this.items, options);

            this.filteredItems = [...this.items];
            this.sortAndRender();
        } catch (e) {
            console.error(e);
            const grid = this.container?.querySelector('#wikiItemsGrid');
            if (grid) grid.innerHTML = `<div class="error">${t('error_server_unavailable')}</div>`;
        } finally {
            if (spinner) spinner.style.display = 'none';
        }
    }

    private filterItems(query: string) {
        if (!query.trim()) {
            this.filteredItems = [...this.items];
        } else {
            if (this.fuse) {
                const result = this.fuse.search(query);
                this.filteredItems = result.map((res: any) => res.item);
            } else {
                // Фоллбэк на простой поиск, если Fuse не инициализирован
                this.filteredItems = this.items.filter(item =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
            }
        }
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

        this.renderGrid();
    }

    private renderGrid() {
        const grid = this.container?.querySelector('#wikiItemsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        this.filteredItems.forEach((item, index) => {
            // Форматирование имени для URL и файла: lowercase и замена пробелов на дефисы
            const slug = item.name.toLowerCase().split(' ').join('-');

            const link = document.createElement('a');
            link.href = `/item/${slug}`;
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
                        <source srcset="/images/items/avif/${slug}.avif" type="image/avif">
                        <source srcset="/images/items/webp/${slug}.webp" type="image/webp">
                        <img src="/images/items/webp/${slug}.webp"
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