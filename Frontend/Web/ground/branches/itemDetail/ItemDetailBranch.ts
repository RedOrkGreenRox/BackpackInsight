import { PageMeta } from '../../roots/Branch';
import { BranchSpec } from '../../roots/BranchSpec';
import { BranchRunner } from '../../roots/BranchRunner';
import { ItemDetailDisplay, ItemDetailInput } from './_itemDetail/display/ItemDetailDisplay';
import { ItemDetailDataLoader } from './_itemDetail/data/ItemDetailData';
import { ItemDetailLogic } from './_itemDetail/logic/ItemDetailLogic';
import { ItemDetailData } from './_itemDetail/utils/item-detail-types';
import { ItemDetailRenderer } from './_itemDetail/components/ItemDetailRenderer';
import './itemDetail.scss';

export const itemDetailSpec: BranchSpec<ItemDetailInput, ItemDetailData> = {
  id: 'itemDetail',
  routes: ['/item/:name', '/profile/item/:name'],
  styles: {
    pageClass: 'item-detail-page',
    bodyClass: 'item-detail-body',
  },
  display: new ItemDetailDisplay(),
  data: new ItemDetailDataLoader(),
  meta: (input?: ItemDetailInput): PageMeta => ItemDetailRenderer.getMeta(input),
  logic: (_ctx, root: HTMLElement) => [new ItemDetailLogic(root)],
};

export const ItemDetailBranch = new BranchRunner(itemDetailSpec).createBranchClass();
