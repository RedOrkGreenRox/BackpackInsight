// @ts-ignore
import AOS from 'aos';
import { ImageFormatService } from '../../../../../utils/ImageFormatService';
import { ItemPreviewPrefetchService } from '../../../../../utils/ItemPreviewPrefetchService';
import { SlugService } from '../../../../../utils/SlugService';
import { ItemsIconService } from '../../services/ItemsIconService';

export class ItemsGridRenderer {
    private intersectionObserver: IntersectionObserver | null = null;
    private renderedCount = 0;
    private readonly renderBatchSize = 80;
    private readonly eagerImagesCount = 12;

    constructor(private readonly container: HTMLElement) {}

    public render(items: any[]): void {
        const grid = this.grid();
        if (!grid) return;
        this.disconnectInfiniteScroll();
        grid.innerHTML = '';
        this.renderedCount = 0;
        this.appendNextItemsBatch(items);
        this.setupInfiniteScroll(items);
    }

    public destroy(): void {
        this.disconnectInfiniteScroll();
    }

    private setupInfiniteScroll(items: any[]): void {
        const sentinel = this.container.querySelector('#itemsScrollSentinel');
        if (!sentinel) return;
        this.intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) this.appendNextItemsBatch(items);
        }, { root: null, rootMargin: '900px 0px', threshold: 0 });
        this.intersectionObserver.observe(sentinel);
    }

    private disconnectInfiniteScroll(): void {
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;
    }

    private appendNextItemsBatch(items: any[]): void {
        const grid = this.grid();
        if (!grid) return;
        if (this.renderedCount >= items.length) { this.disconnectInfiniteScroll(); return; }
        const start = this.renderedCount;
        const end = Math.min(start + this.renderBatchSize, items.length);
        const fragment = document.createDocumentFragment();
        for (let index = start; index < end; index++) {
            const item = items[index];
            if (item) fragment.appendChild(this.createCardLink(item, index));
        }
        this.renderedCount = end;
        grid.appendChild(fragment);
        this.animateVisible(grid, start, end);
        if (this.renderedCount >= items.length) this.disconnectInfiniteScroll();
    }

    private createCardLink(item: any, index: number): HTMLAnchorElement {
        const imagePath = ItemsIconService.getItemImagePath(item);
        const imageSrc = ImageFormatService.itemSrc(imagePath);
        const link = document.createElement('a');
        link.href = `/item/${SlugService.toSlug(item.name)}`;
        link.dataset['link'] = '';
        link.className = 'item-card-link';
        link.style.cssText = 'text-decoration: none; color: inherit; display: block;';
        (link as any)._stateData = { itemData: item };
        link.dataset['aos'] = 'fade-up';
        link.dataset['aosOffset'] = '-400px';
        link.dataset['aosDelay'] = `${Math.min((index % 10) * 30, 300)}`;
        link.appendChild(this.createCard(item, imageSrc, index));
        link.addEventListener('pointerenter', () => ItemPreviewPrefetchService.prefetch(item, imageSrc), { passive: true });
        link.addEventListener('click', () => { (link as any)._stateData = { itemData: item, scrollY: window.scrollY }; });
        return link;
    }

    private createCard(item: any, imageSrc: string, index: number): HTMLDivElement {
        const card = document.createElement('div');
        card.className = 'item-card';
        const eager = index < this.eagerImagesCount;
        card.innerHTML = `
            <div class="item-image-wrapper">
                <img src="${imageSrc}" alt="${item.name}" loading="${eager ? 'eager' : 'lazy'}"
                     decoding="async" fetchpriority="${eager ? 'high' : 'low'}" class="item-icon" data-fallback>
            </div>
            <span class="item-name">${item.name}</span>
            <div class="item-stats"><span class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</span></div>
        `;
        return card;
    }

    private animateVisible(grid: HTMLElement, start: number, end: number): void {
        requestAnimationFrame(() => {
            AOS.refresh();
            setTimeout(() => {
                Array.from(grid.querySelectorAll('.item-card-link')).slice(start, end).forEach((el, i) => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        el.classList.add('aos-animate');
                        (el as HTMLElement).style.animationDelay = `${Math.min((i % 10) * 30, 300)}ms`;
                        (el as HTMLElement).style.animation = 'fadeUp 0.6s ease-out forwards';
                    }
                });
            }, 50);
        });
    }

    private grid(): HTMLElement | null {
        return this.container.querySelector('#wikiItemsGrid');
    }
}
