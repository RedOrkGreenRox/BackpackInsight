import { ItemDefinition } from './ItemsBranch';

class ItemCache {
    private items: Map<string, ItemDefinition> = new Map();

    public setAll(items: ItemDefinition[]) {
        items.forEach(item => {
            this.items.set(item.name, item);
        });
    }

    public getByName(name: string): ItemDefinition | undefined {
        return this.items.get(name);
    }

    public isLoaded(): boolean {
        return this.items.size > 0;
    }
}

export const itemCache = new ItemCache();
