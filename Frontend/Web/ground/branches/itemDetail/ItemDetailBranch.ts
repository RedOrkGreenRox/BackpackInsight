import { PageMeta } from '../../roots/Branch';
import { StructuredBranch } from '../../roots/StructuredBranch';
import { ItemDetailDisplay, ItemDetailInput } from './_itemDetail/display/ItemDetailDisplay';
import { ItemDetailDataLoader } from './_itemDetail/data/ItemDetailData';
import { ItemDetailLogic } from './_itemDetail/logic/ItemDetailLogic';
import { ItemDetailData } from './_itemDetail/utils/item-detail-types';
import { ItemDetailRenderer } from './_itemDetail/components/ItemDetailRenderer';
import './itemDetail.scss';

export class ItemDetailBranch extends StructuredBranch<ItemDetailInput, ItemDetailData> {
  protected pageClass = 'item-detail-page';
  protected bodyClass = 'item-detail-body';
  protected display = new ItemDetailDisplay();
  protected data = new ItemDetailDataLoader();
  protected meta: PageMeta | ((input?: ItemDetailInput) => PageMeta) = (input?: ItemDetailInput) =>
    ItemDetailRenderer.getMeta(input);

  protected createLogic(_context: ItemDetailData, root: HTMLElement): ItemDetailLogic {
    return new ItemDetailLogic(root);
  }

  protected override extractInput(data?: any): ItemDetailInput {
    return data as ItemDetailInput;
  }
}
