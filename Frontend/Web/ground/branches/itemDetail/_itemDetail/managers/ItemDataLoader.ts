/**
 * ItemDataLoader — асинхронная загрузка данных предмета с API.
 */
import { ApiService } from '@utils/ApiService';
import { SlugService } from '@utils/SlugService';
import { ItemDefinition } from '@utils/ItemIconService';

type LoadCallback = (item: ItemDefinition) => void;
type ErrorCallback = () => void;

export class ItemDataLoader {
    private searchSlug: string;
    private onLoadedCb: LoadCallback | null = null;
    private onErrorCb: ErrorCallback | null = null;
    private onNotFoundCb: ErrorCallback | null = null;
    private isLoading = false;

    constructor(searchSlug: string) {
        this.searchSlug = searchSlug;
    }

    onLoaded(cb: LoadCallback): void { this.onLoadedCb = cb; }
    onError(cb: ErrorCallback): void { this.onErrorCb = cb; }
    onNotFound(cb: ErrorCallback): void { this.onNotFoundCb = cb; }

    async load(): Promise<void> {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const allItems = await ApiService.getItems();
            sessionStorage.setItem('allItems', JSON.stringify(allItems));

            const found = allItems.find((item: ItemDefinition) =>
                SlugService.toSlug(item.name) === this.searchSlug
            );

            if (found) {
                this.onLoadedCb?.(found);
            } else {
                this.onNotFoundCb?.();
            }
        } catch {
            this.onErrorCb?.();
        } finally {
            this.isLoading = false;
        }
    }

    isActive(): boolean { return this.isLoading; }
}
