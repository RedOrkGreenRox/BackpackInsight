/**
 * ProfileManager — оркестратор страницы профиля.
 * Аналог ItemDetailManager / MainManager.
 */
// @ts-ignore
import AOS from 'aos';
import { t } from '../../../../localization/i18n';
import { Gen } from '@roots/Gen';
import { ImageFormatService } from '@utils/ImageFormatService';
import { ProfileData } from '../utils/profile-types';
import { ProfileDataManager } from './ProfileDataManager';
import { ProfileStateManager, SavedState } from './ProfileStateManager';
import { ProfileSkinsManager } from './ProfileSkinsManager';
import { SortController } from '../sort/SortController';
import { ScreenshotManager } from './screenshot-manager';
import { HeaderRenderer } from '../header/header';
import { HeroesSectionRenderer } from '../heroes/heroes-section';
import { ItemsSectionRenderer } from '../items/items-section';
import { ItemCardRenderer } from '../items/item-card';

export class ProfileManager {
    private readonly container: HTMLElement;
    private readonly dataManager: ProfileDataManager;
    private readonly stateManager = new ProfileStateManager();
    private readonly skinsManager = new ProfileSkinsManager();

    private data: ProfileData;
    private currentItemSort: 'rarity' | 'level';
    private savedState: SavedState;

    private sortController: SortController | null = null;
    private screenshotManager: ScreenshotManager | null = null;
    private cleanupFns: (() => void)[] = [];

    constructor(
        container: HTMLElement,
        data: ProfileData,
        currentItemSort: 'rarity' | 'level',
        savedState: SavedState,
        dataManager: ProfileDataManager,
    ) {
        this.container = container;
        this.data = data;
        this.currentItemSort = currentItemSort;
        this.savedState = savedState;
        this.dataManager = dataManager;
    }

    init(): void {
        // Рендерим реальный контент поверх skeleton
        requestAnimationFrame(() => {
            if (!this.container) return;
            this.container.innerHTML = `
                <div class="container" id="profileContainer">
                    ${HeaderRenderer.render(this.data)}

                    <div class="button-download-profile">
                        <button id="saveProfileBtn">${t('profile_save_card')}</button>
                    </div>

                    ${HeroesSectionRenderer.render(this.data)}
                    ${ItemsSectionRenderer.render(this.data, this.currentItemSort)}
                </div>

                <script id="skins-data" type="application/json">
                    ${JSON.stringify(this.data.profile_skins)}
                </script>
            `;

            this.attachAll();
            setTimeout(() => this.restoreDynamicState(), 100);
        });
    }

    destroy(): void {
        this.saveCurrentState();
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
        this.screenshotManager?.destroy();
        this.screenshotManager = null;
        this.sortController?.destroy();
        this.sortController = null;
    }

    // ─── приватные методы ────────────────────────────────────────────────────

    private addListener(
        el: Element | null,
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void {
        if (!el) return;
        el.addEventListener(event, handler, options);
        this.cleanupFns.push(() => el.removeEventListener(event, handler, options));
    }

    private attachAll(): void {
        this.attachImageErrorHandler();
        this.attachHeroSort();
        this.attachItemSort();
        this.attachSkins();
        this.attachScreenshot();
        this.attachItemLinks();
        this.attachBeforeUnload();
    }

    private attachImageErrorHandler(): void {
        this.addListener(this.container, 'error', (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'SOURCE') return;
            if (target.tagName !== 'IMG' || !target.dataset['fallback']) return;
            const img = target as HTMLImageElement;
            if (img.dataset['failed'] === 'true') return;
            img.dataset['failed'] = 'true';
            const placeholder = ImageFormatService.placeholderSrc();
            if (img.parentElement?.tagName === 'PICTURE') {
                img.parentElement.querySelectorAll('source').forEach(s => {
                    s.srcset = placeholder;
                    s.type = 'image/webp';
                });
            }
            img.src = placeholder;
            img.parentElement?.classList.add('no-image');
        }, true);
    }

    private attachHeroSort(): void {
        this.sortController = new SortController(this.container);
        this.cleanupFns.push(() => {
            this.sortController?.destroy();
            this.sortController = null;
        });
    }

    private attachItemSort(): void {
        const btn = this.container.querySelector('#itemSortToggle');
        this.addListener(btn, 'click', () => {
            this.currentItemSort = this.currentItemSort === 'rarity' ? 'level' : 'rarity';
            Gen.getInstance().updateCurrentState({ itemsSort: this.currentItemSort });

            this.data.items = this.dataManager.sortItems(this.data.items, this.currentItemSort);

            const grid = this.container.querySelector('#profileItemsGrid');
            if (grid) {
                grid.innerHTML = this.data.items
                    .map((item, i) => ItemCardRenderer.render(item, i))
                    .join('');
            }
            const text = this.container.querySelector('#itemSortText');
            if (text) {
                text.textContent = this.currentItemSort === 'rarity'
                    ? t('items_sort_rarity')
                    : t('items_sort_level');
            }
            setTimeout(() => AOS.refresh(), 100);
        });
    }

    private attachSkins(): void {
        const skinsDataEl = document.getElementById('skins-data');
        const skinsMap = this.skinsManager.parseSkinsData(skinsDataEl?.textContent ?? null);

        this.container.querySelectorAll('.main-hero-card').forEach(card => {
            const heroName = (card as HTMLElement).dataset['heroName']?.toLowerCase();
            if (!heroName) return;

            const uniqueSkins = this.skinsManager.getUniqueSkins(heroName, skinsMap);
            if (uniqueSkins.length <= 1) {
                card.querySelectorAll('.skin-btn').forEach(b => {
                    (b as HTMLElement).style.display = 'none';
                });
                return;
            }

            let currentIdx = 0;
            const img = card.querySelector('.main-hero-image img') as HTMLImageElement | null;

            const updateSkin = () => {
                const skin = uniqueSkins[currentIdx];
                if (!skin || !img) return;
                const paths = this.skinsManager.getSkinImagePaths(heroName, skin);
                this.applySkinToImage(img, paths);
                (card as HTMLElement).dataset['currentSkin'] = skin;
                this.updateHeaderSkin(heroName, skin);
            };

            this.addListener(card.querySelector('.prev-skin'), 'click', (e: Event) => {
                e.stopPropagation();
                currentIdx = (currentIdx - 1 + uniqueSkins.length) % uniqueSkins.length;
                updateSkin();
            });
            this.addListener(card.querySelector('.next-skin'), 'click', (e: Event) => {
                e.stopPropagation();
                currentIdx = (currentIdx + 1) % uniqueSkins.length;
                updateSkin();
            });
        });
    }

    private applySkinToImage(img: HTMLImageElement, paths: { webp: string; avif: string }): void {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = paths.webp;
            (img.parentElement?.querySelectorAll('source') as NodeListOf<HTMLSourceElement>)
                ?.forEach(s => {
                    if (s.type === 'image/webp') s.srcset = paths.webp;
                    if (s.type === 'image/avif') s.srcset = paths.avif;
                });
            requestAnimationFrame(() => { img.style.opacity = '1'; });
        }, 200);
    }

    private updateHeaderSkin(heroName: string, skin: string): void {
        const lowerHero = heroName.toLowerCase();
        const lowerSkin = skin.toLowerCase();
        const headerCard = this.container.querySelector(`.stat-hero-card[data-hero-name="${lowerHero}"]`);
        if (!headerCard) return;

        const img = headerCard.querySelector('.stat-hero-image-wrapper img') as HTMLImageElement | null;
        const sources = headerCard.querySelectorAll('.stat-hero-image-wrapper source');
        const webp = `/images/heroes/${lowerHero}/webp/${lowerHero}${lowerSkin}.webp`;
        const avif = `/images/heroes/${lowerHero}/avif/${lowerHero}${lowerSkin}.avif`;

        if (img) img.src = webp;
        (sources as NodeListOf<HTMLSourceElement>).forEach(s => {
            if (s.type === 'image/avif') s.srcset = avif;
            if (s.type === 'image/webp') s.srcset = webp;
        });
    }

    private attachScreenshot(): void {
        this.screenshotManager = new ScreenshotManager(this.container, t);
        this.screenshotManager.init();
    }

    private attachItemLinks(): void {
        this.container.querySelectorAll('.item-card-link').forEach(link => {
            const name = link.querySelector('.item-name')?.textContent;
            const itemData = this.data.items.find(i => i.name === name);
            if (itemData) (link as any)._stateData = { playerItem: itemData };

            this.addListener(link, 'click', () => this.saveCurrentState());
        });
    }

    private attachBeforeUnload(): void {
        const handler = () => this.saveCurrentState();
        globalThis.addEventListener('beforeunload', handler);
        this.cleanupFns.push(() => globalThis.removeEventListener('beforeunload', handler));
    }

    // ─── state ──────────────────────────────────────────────────────────────

    private saveCurrentState(): void {
        const state: SavedState = {
            scrollY: globalThis.scrollY,
            itemSort: this.currentItemSort,
            heroSort: {
                sortBy: this.sortController?.getCurrentSort() ?? 'level',
                inverted: this.sortController?.isInverted() ?? false,
            },
            currentSkins: {},
        };

        this.container.querySelectorAll('.main-hero-card').forEach(card => {
            const heroName = (card as HTMLElement).dataset['heroName'];
            const currentSkin = (card as HTMLElement).dataset['currentSkin'];
            if (heroName && currentSkin) state.currentSkins[heroName] = currentSkin;
        });

        this.stateManager.saveState(state);
    }

    private restoreDynamicState(): void {
        const state = this.savedState;

        if (state.scrollY > 0) globalThis.scrollTo(0, state.scrollY);

        // Сортировка предметов
        if (state.itemSort !== this.currentItemSort) {
            this.currentItemSort = state.itemSort;
            this.data.items = this.dataManager.sortItems(this.data.items, this.currentItemSort);
            const grid = this.container.querySelector('#profileItemsGrid');
            if (grid) {
                grid.innerHTML = this.data.items
                    .map((item, i) => ItemCardRenderer.render(item, i))
                    .join('');
            }
            const text = this.container.querySelector('#itemSortText');
            if (text) {
                text.textContent = this.currentItemSort === 'rarity'
                    ? t('items_sort_rarity')
                    : t('items_sort_level');
            }
        }

        // Сортировка героев
        if (this.sortController && state.heroSort.sortBy) {
            this.sortController.applySortWithParams(state.heroSort.sortBy, state.heroSort.inverted);
        }

        // Скины
        setTimeout(() => this.restoreSkins(state.currentSkins), 200);
    }

    private restoreSkins(currentSkins: Record<string, string>): void {
        const skinsDataEl = document.getElementById('skins-data');
        const skinsMap = this.skinsManager.parseSkinsData(skinsDataEl?.textContent ?? null);

        Object.entries(currentSkins).forEach(([heroName, skin]) => {
            const heroCard = this.container.querySelector(`.main-hero-card[data-hero-name="${heroName}"]`);
            if (!heroCard) return;

            const uniqueSkins = this.skinsManager.getUniqueSkins(heroName, skinsMap);
            if (!uniqueSkins.includes(skin)) return;

            const img = heroCard.querySelector('.main-hero-image img') as HTMLImageElement | null;
            if (!img) return;

            const paths = this.skinsManager.getSkinImagePaths(heroName, skin);
            img.src = paths.webp;
            img.parentElement?.querySelectorAll('source').forEach(s => {
                if (s.type === 'image/webp') s.srcset = paths.webp;
                if (s.type === 'image/avif') s.srcset = paths.avif;
            });
            (heroCard as HTMLElement).dataset['currentSkin'] = skin;
            this.updateHeaderSkin(heroName, skin);
        });
    }
}
