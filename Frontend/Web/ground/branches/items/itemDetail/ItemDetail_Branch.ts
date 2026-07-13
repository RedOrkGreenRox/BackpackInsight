import { PageMeta } from '@roots/Branch';
import { BranchSpec } from '@roots/BranchSpec';
import { BranchRunner } from '@roots/BranchRunner';
import { ItemDetailDisplay, ItemDetailInput } from './_itemDetail/display/ItemDetailDisplay';
import { ItemDetailDataLoader } from './_itemDetail/data/ItemDetailData';
import { ItemDetailLogic } from './_itemDetail/logic/ItemDetailLogic';
import { ItemDetailData } from './_itemDetail/utils/item-detail-types';
import { ItemDetailRenderer } from './_itemDetail/components/ItemDetailRenderer';
import './ItemDetail.scss';

export const itemDetailSubSpec: BranchSpec<ItemDetailInput, ItemDetailData> = {
  id: 'item-detail-sub',
  routes: [],
  styles: {
    pageClass: 'item-detail-sub-page',
    bodyClass: 'item-detail-sub-body',
  },
  display: new ItemDetailDisplay(),
  data: new ItemDetailDataLoader(),
  meta: (input?: ItemDetailInput): PageMeta => ItemDetailRenderer.getMeta(input),
  logic: (_ctx, root: HTMLElement) => [new ItemDetailLogic(root)],
};

export const ItemDetail_Branch = new BranchRunner(itemDetailSubSpec).createBranchClass();
