/**
 * ItemDetailManager — оркестратор всей логики ItemDetailBranch.
 * Аналог MainManager для ветки main.
 */
import { ItemDetailRenderer } from '../components/ItemDetailRenderer';
import { ItemDataLoader } from './ItemDataLoader';
import { ItemNavigationManager } from './ItemNavigationManager';
import { ItemSEOManager } from './ItemSEOManager';
import { SlugService } from '@utils/SlugService';
import { ItemsCacheService } from '@utils/ItemsCacheService';
import { ItemPreviewPrefetchService } from '@utils/ItemPreviewPrefetchService';
import { ItemDetailData } from '../utils/item-detail-types';
import { ItemDefinition } from '@utils/ItemIconService';

export class ItemDetailManager {
    private readonly container: HTMLElement;
    private readonly data: ItemDetailData;
    private cleanupFns: (() => void)[] = [];

    private loader: ItemDataLoader | null = null;
    private navManager: ItemNavigationManager | null = null;
    private seoManager: ItemSEOManager | null = null;

    constructor(container: HTMLElement, data: any) {
        this.container = container;
        this.data = this.resolveData(data);
    }

    init(): void {
        this.setupCopyHandler();
        this.restoreProfileScroll();

        if (this.data.itemData) {
            this.renderFullPage();
            return;
        }

        const searchSlug = SlugService.toSlug(this.data.name || '');
        this.loader = new ItemDataLoader(searchSlug);

        this.loader.onLoaded((item: ItemDefinition) => {
            this.data.itemData = item;
            if (!this.data.name) this.data.name = item.name;
            this.renderFullPage();
        });

        this.loader.onError(() => {
            if (this.container) this.container.innerHTML = ItemDetailRenderer.renderError();
        });

        this.loader.onNotFound(() => {
            if (this.container) this.container.innerHTML = ItemDetailRenderer.renderNotFound();
        });

        this.loader.load();
    }

    private renderFullPage(): void {
        const isProfile = !!this.data.playerItem;
        const item = this.data.itemData;

        // Защита: если данных предмета нет — показываем «не найдено»
        if (!item) {
            this.container.innerHTML = ItemDetailRenderer.renderNotFound();
            return;
        }

        this.navManager = new ItemNavigationManager(isProfile);
        this.seoManager = new ItemSEOManager();

        const nav = this.navManager.calculate(item.name);
        const html = ItemDetailRenderer.renderFullPage(this.data, nav);

        requestAnimationFrame(() => {
            if (!this.container) return;
            this.container.innerHTML = html;
            this.seoManager?.update(item, isProfile);
            this.navManager?.attachProfileNavListeners(this.container);
            (globalThis as any).AOS?.refresh();
        });
    }

    private resolveData(data: any): ItemDetailData {
        const resolved: ItemDetailData = data || {};

        if (!resolved.name) {
            resolved.name = decodeURIComponent(globalThis.location.pathname.split('/').pop() || '');
        }

        const isProfile = globalThis.location.pathname.startsWith('/profile/item/');
        if (isProfile && !resolved.playerItem) {
            resolved.playerItem = this.restorePlayerItem(resolved.name);
        }

        if (!resolved.itemData) {
            resolved.itemData = this.restoreFromCache(resolved.name);
        }

        return resolved;
    }

    private restorePlayerItem(rawName: string): ItemDetailData['playerItem'] {
        const raw = sessionStorage.getItem('profileItemsList');
        if (!raw) return undefined;
        try {
            const list = JSON.parse(raw);
            return list.find((i: ItemDefinition) => SlugService.toSlug(i.name) === SlugService.toSlug(rawName));
        } catch { return undefined; }
    }

    private restoreFromCache(rawName: string): ItemDefinition | undefined {
        return ItemPreviewPrefetchService.get(rawName) || ItemsCacheService.getBySlugFromCache(rawName);
    }

    private setupCopyHandler(): void {
        const handler = (e: ClipboardEvent) => {
            const sel = globalThis.getSelection();
            if (!sel?.rangeCount) return;

            const clone = sel.getRangeAt(0).cloneContents();
            const div = document.createElement('div');
            div.appendChild(clone);

            div.querySelectorAll('img').forEach(img => {
                const alt = img.getAttribute('alt') || img.getAttribute('title') || '';
                if (alt) img.replaceWith(document.createTextNode(`[${alt}]`));
            });

            div.querySelectorAll('picture').forEach(pic => {
                const img = pic.querySelector('img');
                const alt = img?.getAttribute('alt') || img?.getAttribute('title') || '';
                if (alt) pic.replaceWith(document.createTextNode(`[${alt}]`));
            });

            e.clipboardData?.setData('text/plain', div.textContent || '');
            e.clipboardData?.setData('text/html', div.innerHTML || '');
            e.preventDefault();
        };

        this.container.addEventListener('copy', handler);
        this.cleanupFns.push(() => this.container.removeEventListener('copy', handler));
    }

    private restoreProfileScroll(): void {
        // Восстанавливаем скролл только при переходе назад (popstate),
        // то есть когда пользователь уже был на этой странице.
        // При первом заходе на ItemDetail скроллить к позиции профиля не нужно.
        if (globalThis.history.state?.fromBack !== true) return;

        try {
            const raw = sessionStorage.getItem('profileDynamicState')
                ?? localStorage.getItem('profileDynamicState');
            if (raw) {
                const state = JSON.parse(raw);
                if (state.scrollY > 0) setTimeout(() => globalThis.scrollTo(0, state.scrollY), 50);
            }
        } catch { /* ignore */ }
    }

    destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
        this.loader = null;
        this.navManager?.destroy();
        this.navManager = null;
        this.seoManager?.restore();
        this.seoManager?.cleanup();
        this.seoManager = null;
    }
}
