import { HeaderRenderer } from '../header/renderer';
import { HeroesGridRenderer } from '../main-heroes-grid/renderer';
import { ItemsGridRenderer } from '../items-grid/renderer';
import { SectionTitleRenderer } from '../section-title/renderer';
import { ButtonsSortRenderer } from '../buttons-sort/renderer';
import { SortManager } from './sort-manager';
import { ScreenshotManager } from './screenshot-manager';
import { SkinsManager } from './skins-manager';
import { StateManager } from './state-manager';
import { LoadingStates } from '../../../utils/LoadingStates';

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

export class ProfileManager {
    private container: HTMLElement;
    private data: ProfileData | null = null;
    private t: (key: string) => string;
    private sortManager: SortManager | null = null;
    private screenshotManager: ScreenshotManager | null = null;
    private skinsManager: SkinsManager | null = null;
    private stateManager: StateManager | null = null;

    constructor(container: HTMLElement, t: (key: string) => string) {
        this.container = container;
        this.t = t;
    }

    public async init(data?: ProfileData): Promise<void> {
        // Инициализация данных
        this.data = data || await this.stateManager?.restoreData() || null;
        if (!this.data) return;

        // Показываем skeleton пока загружается
        this.container.innerHTML = `
            <div class="container">
                ${LoadingStates.createProfileSkeleton()}
            </div>
        `;

        // Инициализация менеджеров
        this.stateManager = new StateManager();
        await this.stateManager.initState();
        
        this.sortManager = new SortManager(this.container, this.t);
        this.sortManager.init(this.data);
        
        this.screenshotManager = new ScreenshotManager(this.container);
        this.screenshotManager.init();
        
        this.skinsManager = new SkinsManager(this.container);
        this.skinsManager.init(this.data);

        // Рендеринг контента
        this.renderContent();
    }

    private renderContent(): void {
        if (!this.data || !this.container) return;

        const html = `
            ${HeaderRenderer.render(this.data, this.t)}
            ${this.renderHeroesSection()}
            ${this.renderItemsSection()}
        `;

        // Используем requestAnimationFrame для плавной замены skeleton на реальный контент
        requestAnimationFrame(() => {
            if (this.container) {
                this.container.innerHTML = html;
                
                // Реинициализация после рендеринга
                this.sortManager?.init(this.data);
                this.skinsManager?.init(this.data);
                this.screenshotManager?.init();
            }
        });
    }

    private renderHeroesSection(): string {
        if (!this.data) return '';
        
        return `
            <section class="main-heroes-section">
                ${SectionTitleRenderer.render('heroes', this.t)}
                ${ButtonsSortRenderer.render('heroes', this.t)}
                <div class="main-heroes-grid">
                    ${this.data.heroes.map((hero, index) => 
                        HeroesGridRenderer.renderHeroCard(hero, index, this.t)
                    ).join('')}
                </div>
            </section>
        `;
    }

    private renderItemsSection(): string {
        if (!this.data) return '';
        
        return `
            <section class="profile-items-section">
                ${SectionTitleRenderer.render('items', this.t)}
                ${ButtonsSortRenderer.render('items', this.t)}
                <div class="profile-items-grid" id="profileItemsGrid">
                    ${this.data.items.map((item, index) => 
                        ItemsGridRenderer.renderItemCard(item, index, this.t)
                    ).join('')}
                </div>
            </section>
        `;
    }

    public destroy(): void {
        this.sortManager?.destroy();
        this.screenshotManager?.destroy();
        this.skinsManager?.destroy();
        this.stateManager?.saveState();
        
        this.sortManager = null;
        this.screenshotManager = null;
        this.skinsManager = null;
        this.stateManager = null;
    }
}
