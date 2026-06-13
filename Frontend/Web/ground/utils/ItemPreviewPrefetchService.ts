import { SlugService } from './SlugService';
import type { ItemDefinition } from './ItemIconService';

interface PrefetchedItemPreview {
    item: ItemDefinition;
    imageSrc: string;
}

export class ItemPreviewPrefetchService {
    private static readonly previews = new Map<string, PrefetchedItemPreview>();
    private static readonly preloadedImages = new Set<string>();

    public static prefetch(item: ItemDefinition, imageSrc: string): void {
        const slug = SlugService.toSlug(item.name);
        this.previews.set(slug, { item, imageSrc });
        this.preloadImage(imageSrc);
    }

    public static get(rawNameOrSlug: string): ItemDefinition | undefined {
        const slug = SlugService.toSlug(rawNameOrSlug);
        return this.previews.get(slug)?.item;
    }

    public static preloadImage(imageSrc: string): void {
        if (this.preloadedImages.has(imageSrc)) return;
        this.preloadedImages.add(imageSrc);

        const img = new Image();
        img.decoding = 'async';
        img.src = imageSrc;
    }
}
