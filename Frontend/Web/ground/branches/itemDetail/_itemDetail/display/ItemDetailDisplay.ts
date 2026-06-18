import { BranchDisplay } from '../../../../roots/StructuredBranch';
import { ItemDetailRenderer } from '../components/ItemDetailRenderer';
import { ItemDetailData, NavigationState } from '../utils/item-detail-types';

export interface ItemDetailInput {
  name?: string;
  playerItem?: ItemDetailData['playerItem'];
  itemData?: ItemDetailData['itemData'];
}

export class ItemDetailDisplay implements BranchDisplay<ItemDetailInput, ItemDetailData> {
  public renderSkeleton(): string {
    return ItemDetailRenderer.renderSkeleton();
  }

  public renderError(error: unknown): string {
    console.error('ItemDetail display error:', error);
    return ItemDetailRenderer.renderError();
  }

  public renderFullPage(context: ItemDetailData): string {
    const nav: NavigationState = context.navigation ?? { prev: null, next: null };
    return ItemDetailRenderer.renderFullPage(context, nav);
  }
}
