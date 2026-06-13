/**
 * ItemDataLoader — асинхронная загрузка данных предмета с API.
 */
import { ItemsCacheService } from '@utils/ItemsCacheService';
import type { ItemDefinition } from '@utils/ItemIconService';

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
            const found = await ItemsCacheService.getBySlug(this.searchSlug);

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

}
