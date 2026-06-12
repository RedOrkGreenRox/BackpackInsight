import { ApiService } from './ApiService';
import { SlugService } from './SlugService';
import type { ItemDefinition } from './ItemIconService';

/**
 * Единый кэш справочника предметов для /items и /item/:name.
 *
 * Держит данные в памяти, переиспользует один in-flight запрос и мягко
 * дублирует справочник в sessionStorage для восстановления между переходами.
 */
export class ItemsCacheService {
    private static readonly STORAGE_KEY = 'allItems';
    private static memoryItems: ItemDefinition[] | null = null;
    private static inFlight: Promise<ItemDefinition[]> | null = null;

    public static async getAllItems(): Promise<ItemDefinition[]> {
        if (this.memoryItems) return this.memoryItems;

        const stored = this.readFromSessionStorage();
        if (stored) {
            this.memoryItems = stored;
            return stored;
        }

        if (!this.inFlight) {
            this.inFlight = ApiService.getItems()
                .then((items: ItemDefinition[]) => {
                    this.setAllItems(items);
                    return items;
                })
                .finally(() => {
                    this.inFlight = null;
                });
        }

        return this.inFlight;
    }

    public static setAllItems(items: ItemDefinition[]): void {
        this.memoryItems = items;
        this.writeToSessionStorage(items);
    }

    public static getAllItemsFromCache(): ItemDefinition[] | null {
        if (this.memoryItems) return this.memoryItems;

        const stored = this.readFromSessionStorage();
        if (stored) this.memoryItems = stored;
        return stored;
    }

    public static getBySlugFromCache(rawNameOrSlug: string): ItemDefinition | undefined {
        const items = this.getAllItemsFromCache();
        if (!items) return undefined;

        const slug = SlugService.toSlug(rawNameOrSlug);
        return items.find(item => SlugService.toSlug(item.name) === slug);
    }

    public static async getBySlug(rawNameOrSlug: string): Promise<ItemDefinition | undefined> {
        const slug = SlugService.toSlug(rawNameOrSlug);
        const items = await this.getAllItems();
        return items.find(item => SlugService.toSlug(item.name) === slug);
    }

    public static clear(): void {
        this.memoryItems = null;
        this.inFlight = null;
        try {
            sessionStorage.removeItem(this.STORAGE_KEY);
        } catch {
            // Storage can be unavailable in private/restricted contexts.
        }
    }

    private static readFromSessionStorage(): ItemDefinition[] | null {
        try {
            const raw = sessionStorage.getItem(this.STORAGE_KEY);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed as ItemDefinition[] : null;
        } catch {
            return null;
        }
    }

    private static writeToSessionStorage(items: ItemDefinition[]): void {
        try {
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        } catch {
            // QuotaExceededError is non-fatal: memory cache remains available.
        }
    }
}
