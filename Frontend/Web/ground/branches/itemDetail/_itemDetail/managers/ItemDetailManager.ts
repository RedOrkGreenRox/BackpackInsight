/**
 * ItemDetailManager — оркестратор всей логики ItemDetailBranch.
 * Аналог MainManager для ветки main.
 */
import { ItemDetailRenderer } from '../components/ItemDetailRenderer';
import { ItemDataLoader } from './ItemDataLoader';
import { ItemNavigationManager } from './ItemNavigationManager';
import { ItemSEOManager } from './ItemSEOManager';
import { SlugService } from '@utils/SlugService';
import { ItemDetailData } from '../utils/item-detail-types';
import { ItemDefinition } from '@utils/ItemIconService';

export class ItemDetailManager {
    private container: HTMLElement;
    private data: ItemDetailData;
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
        this.navManager = new ItemNavigationManager(isProfile);
        this.seoManager = new ItemSEOManager();

        const nav = this.navManager.calculate(this.data.itemData?.name ?? this.data.name ?? '');
        const html = ItemDetailRenderer.renderFullPage(this.data, nav);

        requestAnimationFrame(() => {
            if (!this.container) return;
            this.container.innerHTML = html;
            this.seoManager?.update(this.data.itemData!, isProfile);
            this.navManager?.attachProfileNavListeners(this.container);
            (window as any).AOS?.refresh();
        });
    }

    private resolveData(data: any): ItemDetailData {
        const resolved: ItemDetailData = data || {};

        if (!resolved.name) {
            resolved.name = decodeURIComponent(window.location.pathname.split('/').pop() || '');
        }

        const isProfile = window.location.pathname.startsWith('/profile/item/');
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
        const raw = sessionStorage.getItem('allItems');
        if (!raw) return undefined;
        try {
            const items: ItemDefinition[] = JSON.parse(raw);
            return items.find(i => SlugService.toSlug(i.name) === SlugService.toSlug(rawName));
        } catch { return undefined; }
    }

    private setupCopyHandler(): void {
        const handler = (e: ClipboardEvent) => {
            const sel = window.getSelection();
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
        try {
            const raw = sessionStorage.getItem('profileDynamicState')
                ?? localStorage.getItem('profileDynamicState');
            if (raw) {
                const state = JSON.parse(raw);
                if (state.scrollY > 0) setTimeout(() => window.scrollTo(0, state.scrollY), 50);
            }
        } catch { /* ignore */ }
    }

    destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
        this.loader = null;
        this.navManager?.destroy();
        this.navManager = null;
        this.seoManager?.cleanup();
        this.seoManager = null;
    }
}
