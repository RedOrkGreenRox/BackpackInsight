import { Branch, PageMeta } from '@roots/Branch.ts';
import { ItemDetailRenderer, ItemDetailManager } from './_itemDetail';
import './itemDetail.scss';

export class ItemDetailBranch extends Branch {
    private manager: ItemDetailManager | null = null;

    public override getMeta(data?: any): PageMeta {
        return ItemDetailRenderer.getMeta(data);
    }

    protected getHtml(): string {
        return ItemDetailRenderer.renderSkeleton();
    }

    protected init(data?: any): void {
        if (!this.container) return;
        this.manager = new ItemDetailManager(this.container, data);
        this.manager.init();
    }

    protected destroy(): void {
        this.manager?.destroy();
        this.manager = null;
    }
}
