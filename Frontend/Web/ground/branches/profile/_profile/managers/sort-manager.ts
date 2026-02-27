import { HeroesGridRenderer } from '../main-heroes-grid/renderer';
import { ItemsGridRenderer } from '../items-grid/renderer';

interface Hero {
    name: string;
    level: number;
    rating: number;
    experience: number;
    exp_req: number;
    prestige: boolean;
    league: string;
    skin_num: string;
}

interface Item {
    name: string;
    rarity: string;
    level: number;
    cards: number;
    cards_need: number;
}

interface ProfileData {
    nickname: string;
    level: number;
    trophy: number;
    bonus_trophy: number;
    gems: number;
    coins: number;
    xp_current: number;
    xp_need: number;
    area: string;
    item_stats: Record<string, number>;
    heroes: Hero[];
    heroes_count: number;
    items: Item[];
    items_count: number;
    actual_version: string;
    install_version: string;
    profile_skins: Record<string, string[]>;
    itemsSort?: 'rarity' | 'level';
}

export class SortManager {
    private container: HTMLElement;
    private t: (key: string) => string;
    private cleanupFns: (() => void)[] = [];
    private data: ProfileData | null = null;
    private currentHeroSort: 'level' | 'rating' = 'level';
    private currentItemSort: 'rarity' | 'level' = 'rarity';

    // Веса редкости для сортировки
    private rarityWeights: Record<string, number> = {
        "Unique": 100,
        "Boon": 90,
        "Relic": 80,
        "Mythic": 70,
        "Legendary": 60,
        "Epic": 50,
        "Rare": 40,
        "Common": 30,
        "Special": 20
    };

    constructor(container: HTMLElement, t: (key: string) => string) {
        this.container = container;
        this.t = t;
    }

    public init(data: ProfileData): void {
        this.data = data;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Сортировка героев
        const heroSortBtns = this.container.querySelectorAll('.main-heroes-section .sort-btn');
        heroSortBtns.forEach(btn => {
            const handler = () => this.sortHeroes(btn as HTMLElement);
            btn.addEventListener('click', handler);
            this.cleanupFns.push(() => btn.removeEventListener('click', handler));
        });

        // Сортировка предметов
        const itemSortBtns = this.container.querySelectorAll('.profile-items-section .sort-btn');
        itemSortBtns.forEach(btn => {
            const handler = () => this.sortItems(btn as HTMLElement);
            btn.addEventListener('click', handler);
            this.cleanupFns.push(() => btn.removeEventListener('click', handler));
        });
    }

    private sortHeroes(btn: HTMLElement): void {
        const sortBy = btn.dataset.sort as 'level' | 'rating';
        if (!this.data || !sortBy) return;

        // Обновляем активную кнопку
        this.updateActiveButton(btn, '.main-heroes-section .sort-btn');

        // Сортируем героев
        this.data.heroes.sort((a, b) => {
            if (sortBy === 'level') {
                return b.level - a.level;
            }
            if (sortBy === 'rating') {
                return b.rating - a.rating;
            }
            return 0;
        });

        this.currentHeroSort = sortBy;
        this.updateHeroesGrid();
    }

    private sortItems(btn: HTMLElement): void {
        const sortBy = btn.dataset.sort as 'rarity' | 'level';
        if (!this.data || !sortBy) return;

        // Обновляем активную кнопку
        this.updateActiveButton(btn, '.profile-items-section .sort-btn');

        // Сортируем предметы
        this.data.items.sort((a, b) => {
            if (sortBy === 'rarity') {
                return this.getRarityWeight(b.rarity) - this.getRarityWeight(a.rarity);
            }
            if (sortBy === 'level') {
                return b.level - a.level;
            }
            return 0;
        });

        this.currentItemSort = sortBy;
        this.updateItemsGrid();
    }

    private updateActiveButton(activeBtn: HTMLElement, selector: string): void {
        // Удаляем активный класс у всех кнопок
        this.container.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        // Добавляем активный класс текущей кнопке
        activeBtn.classList.add('active');
    }

    private updateHeroesGrid(): void {
        const grid = this.container.querySelector('.main-heroes-grid');
        if (!grid || !this.data) return;
        
        grid.innerHTML = this.data.heroes.map((hero, index) => 
            HeroesGridRenderer.renderHeroCard(hero, index, this.t)
        ).join('');

        // Реинициализация AOS для новых элементов
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    private updateItemsGrid(): void {
        const grid = this.container.querySelector('#profileItemsGrid');
        if (!grid || !this.data) return;
        
        grid.innerHTML = this.data.items.map((item, index) => 
            ItemsGridRenderer.renderItemCard(item, index, this.t)
        ).join('');

        // Реинициализация AOS для новых элементов
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    private getRarityWeight(rarity: string): number {
        return this.rarityWeights[rarity] || 0;
    }

    public getCurrentSorts(): { heroSort: 'level' | 'rating', itemSort: 'rarity' | 'level' } {
        return {
            heroSort: this.currentHeroSort,
            itemSort: this.currentItemSort
        };
    }

    public destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
