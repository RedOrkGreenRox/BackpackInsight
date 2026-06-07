import { t } from '../../../../localization/i18n';
import { SortController } from '../sort/SortController';
import { ScreenshotManager } from '../managers/screenshot-manager';
import { ProfileStateManager, SavedState } from '../managers/ProfileStateManager';
import { ProfileSkinsManager } from '../managers/ProfileSkinsManager';
import { ProfileSortManager } from '../managers/ProfileSortManager';
import { ItemCardRenderer } from '../index';
import { rarityWeights } from '../utils/rarity-weights';

export class ProfileController {
    private stateManager = new ProfileStateManager();
    private skinsManager = new ProfileSkinsManager();
    private sortManager = new ProfileSortManager();
    private sortController: SortController | null = null;
    private screenshotManager: ScreenshotManager | null = null;

    public constructor(private branch: any) {}

    public getCurrentItemSort(): 'rarity' | 'level' {
        return this.stateManager.restoreState().itemSort;
    }

    public sortItems(items: any[], sortType: 'rarity' | 'level') {
        return this.sortManager.sortItems(items, sortType, rarityWeights);
    }

    public setupEventListeners() {
        const { container } = this.branch;
        if (!container) return;

        this.sortController = new SortController(container);
        this.branch.addListener(this.sortController, 'destroy', () => {
            this.sortController = null;
        });

        const itemSortBtn = container.querySelector('#itemSortToggle');
        if (itemSortBtn) {
            this.branch.addListener(itemSortBtn, 'click', () => {
                this.branch.currentItemSort = this.branch.currentItemSort === 'rarity' ? 'level' : 'rarity';
                const text = container.querySelector('#itemSortText');
                if (text) text.textContent = this.branch.currentItemSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_level');
                
                this.branch.data!.items = this.sortItems(this.branch.data!.items, this.branch.currentItemSort);
                const grid = container.querySelector('#profileItemsGrid');
                if (grid) {
                    grid.innerHTML = this.branch.data!.items.map((item: any, index: number) => ItemCardRenderer.render(item, index)).join('');
                }
                setTimeout(() => { (window as any).AOS?.refresh(); }, 100);
            });
        }

        const itemLinks = container.querySelectorAll('.item-card-link');
        itemLinks.forEach((link: Element) => {
            const card = link.querySelector('.item-card');
            if (card) {
                const name = card.querySelector('.item-name')?.textContent;
                const itemData = this.branch.data?.items.find((i: any) => i.name === name);
                if (itemData) {
                    (link as any)._stateData = { playerItem: itemData };
                }
            }
            this.branch.addListener(link, 'click', () => this.saveCurrentState());
        });

        window.addEventListener('beforeunload', () => this.saveCurrentState());
    }

    public initSkins() {
        const { container } = this.branch;
        if (!container) return;

        const skinsDataEl = document.getElementById('skins-data');
        const skinsMap = this.skinsManager.parseSkinsData(skinsDataEl?.textContent || null);

        const cards = container.querySelectorAll('.main-hero-card');
        cards.forEach((card: Element) => {
            const heroName = (card as HTMLElement).dataset['heroName']?.toLowerCase();
            if (!heroName) return;
            
            const uniqueSkins = this.skinsManager.getUniqueSkins(heroName, skinsMap);

            if (uniqueSkins.length <= 1) {
                card.querySelectorAll('.skin-btn').forEach((b: Element) => (b as HTMLElement).style.display = 'none');
                return;
            }

            let currentSkinIdx = 0;
            const imgContainer = card.querySelector('.main-hero-image');
            const img = imgContainer?.querySelector('img') as HTMLImageElement;

            const updateSkin = () => {
                const skin = uniqueSkins[currentSkinIdx];
                if (!skin) return;
                const paths = this.skinsManager.getSkinImagePaths(heroName, skin);

                if (img) {
                    img.style.opacity = '0';
                    setTimeout(() => {
                        img.src = paths.webp;
                        const picture = img.parentElement;
                        if (picture) {
                            const sources = picture.querySelectorAll('source');
                            sources.forEach((s: Element) => {
                                const source = s as HTMLSourceElement;
                                if (source.type === 'image/webp') source.srcset = paths.webp;
                                if (source.type === 'image/avif') source.srcset = paths.avif;
                            });
                        }
                        requestAnimationFrame(() => { img.style.opacity = '1'; });
                    }, 200);
                }
                (card as HTMLElement).dataset['currentSkin'] = skin;
                this.updateHeaderSkin(heroName, skin);
            };

            const prevBtn = card.querySelector('.prev-skin');
            const nextBtn = card.querySelector('.next-skin');

            this.branch.addListener(prevBtn, 'click', (e: Event) => {
                e.stopPropagation();
                currentSkinIdx = (currentSkinIdx - 1 + uniqueSkins.length) % uniqueSkins.length;
                updateSkin();
            });

            this.branch.addListener(nextBtn, 'click', (e: Event) => {
                e.stopPropagation();
                currentSkinIdx = (currentSkinIdx + 1) % uniqueSkins.length;
                updateSkin();
            });
        });
    }

    private updateHeaderSkin(heroName: string, skin: string): void {
        const { container } = this.branch;
        const lowerHero = heroName.toLowerCase();
        const lowerSkin = skin.toLowerCase();
        const headerCard = container?.querySelector(`.stat-hero-card[data-hero-name="${lowerHero}"]`);
        if (!headerCard) return;

        const imgWrapper = headerCard.querySelector('.stat-hero-image-wrapper');
        const img = imgWrapper?.querySelector('img');
        const sources = imgWrapper?.querySelectorAll('source');
        const paths = this.skinsManager.getSkinImagePaths(lowerHero, lowerSkin);

        if (img) {
            img.src = paths.webp;
            sources?.forEach((s: Element) => {
                const source = s as HTMLSourceElement;
                if (source.type === 'image/avif') source.srcset = paths.avif;
                if (source.type === 'image/webp') source.srcset = paths.webp;
            });
        }
    }

    public setupScreenshot() {
        const { container } = this.branch;
        if (!container) return;
        this.screenshotManager = new ScreenshotManager(container, t);
        this.screenshotManager.init();
    }

    public saveCurrentState() {
        if (!this.branch.container) return;

        const state: SavedState = {
            scrollY: window.scrollY,
            itemSort: this.branch.currentItemSort,
            heroSort: {
                sortBy: this.sortController?.getCurrentSort() || 'level',
                inverted: this.sortController?.isInverted() || false
            },
            currentSkins: {}
        };

        const heroCards = this.branch.container.querySelectorAll('.main-hero-card');
        heroCards.forEach((card: Element) => {
            const heroName = (card as HTMLElement).dataset['heroName'];
            const currentSkin = (card as HTMLElement).dataset['currentSkin'];
            if (heroName && currentSkin) state.currentSkins[heroName] = currentSkin;
        });

        this.stateManager.saveState(state);
    }

    public restoreDynamicState() {
        const { container } = this.branch;
        if (!container) return;

        const state = this.stateManager.restoreState();
        if (state.scrollY > 0) window.scrollTo(0, state.scrollY);

        if (state.itemSort !== this.branch.currentItemSort) {
            this.branch.currentItemSort = state.itemSort;
            this.branch.data!.items = this.sortItems(this.branch.data!.items, this.branch.currentItemSort);
            const grid = container.querySelector('#profileItemsGrid');
            if (grid && this.branch.data) {
                grid.innerHTML = this.branch.data.items.map((item: any, index: number) => ItemCardRenderer.render(item, index)).join('');
                const text = container.querySelector('#itemSortText');
                if (text) text.textContent = this.branch.currentItemSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_level');
            }
        }

        if (this.sortController && state.heroSort.sortBy) {
            this.sortController.applySortWithParams(state.heroSort.sortBy, state.heroSort.inverted);
        }

        setTimeout(() => this.restoreSkins(state.currentSkins), 200);
    }

    private restoreSkins(currentSkins: Record<string, string>) {
        const { container } = this.branch;
        if (!container) return;

        const skinsDataEl = document.getElementById('skins-data');
        const skinsMap = this.skinsManager.parseSkinsData(skinsDataEl?.textContent || null);

        Object.entries(currentSkins).forEach(([heroName, skin]) => {
            const heroCard = container?.querySelector(`.main-hero-card[data-hero-name="${heroName}"]`);
            if (!heroCard) return;

            const uniqueSkins = this.skinsManager.getUniqueSkins(heroName, skinsMap);
            if (uniqueSkins.includes(skin)) {
                const imgContainer = heroCard.querySelector('.main-hero-image');
                const img = imgContainer?.querySelector('img') as HTMLImageElement;
                if (img) {
                    const paths = this.skinsManager.getSkinImagePaths(heroName, skin);
                    img.src = paths.webp;
                    const picture = img.parentElement;
                    if (picture) {
                        const sources = picture.querySelectorAll('source');
                        sources.forEach((s: Element) => {
                            const source = s as HTMLSourceElement;
                            if (source.type === 'image/webp') source.srcset = paths.webp;
                            if (source.type === 'image/avif') source.srcset = paths.avif;
                        });
                    }
                    (heroCard as HTMLElement).dataset['currentSkin'] = skin;
                    this.updateHeaderSkin(heroName, skin);
                }
            }
        });
    }
}
