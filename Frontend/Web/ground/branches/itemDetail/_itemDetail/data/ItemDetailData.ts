import { BranchData } from '../../../../roots/StructuredBranch';
import { ItemDefinition } from '../../../../utils/ItemIconService';
import { ItemPreviewPrefetchService } from '../../../../utils/ItemPreviewPrefetchService';
import { ItemsCacheService } from '../../../../utils/ItemsCacheService';
import { SlugService } from '../../../../utils/SlugService';
import { ItemDataLoader } from '../managers/ItemDataLoader';
import { ItemDetailData, NavigationState, PlayerItemData } from '../utils/item-detail-types';
import { ItemDetailInput } from '../display/ItemDetailDisplay';

export class ItemDetailDataLoader implements BranchData<ItemDetailInput, ItemDetailData> {
  public async load(input?: ItemDetailInput): Promise<ItemDetailData> {
    const data: ItemDetailData = {
      name: input?.name,
      playerItem: input?.playerItem,
      itemData: input?.itemData,
    };

    if (!data.name) {
      data.name = decodeURIComponent(globalThis.location.pathname.split('/').pop() || '');
    }

    const isProfile = globalThis.location.pathname.startsWith('/profile/item/');
    if (isProfile && !data.playerItem) {
      data.playerItem = this.restorePlayerItem(data.name);
    }

    data.itemData ??= ItemPreviewPrefetchService.get(data.name) || ItemsCacheService.getBySlugFromCache(data.name);

    if (!data.itemData) {
      data.itemData = await this.loadFromApi(data.name);
    }

    data.navigation = this.calculateNavigation(data.name, isProfile);
    return data;
  }

  private restorePlayerItem(rawName: string): PlayerItemData | undefined {
    const raw = sessionStorage.getItem('profileItemsList');
    if (!raw) return undefined;
    try {
      const list = JSON.parse(raw) as PlayerItemData[];
      return list.find(i => SlugService.toSlug(i.name) === SlugService.toSlug(rawName));
    } catch { return undefined; }
  }

  private async loadFromApi(rawName: string): Promise<ItemDefinition | undefined> {
    return new Promise((resolve) => {
      const loader = new ItemDataLoader(SlugService.toSlug(rawName));
      loader.onLoaded(resolve);
      loader.onError(() => resolve(undefined));
      loader.onNotFound(() => resolve(undefined));
      loader.load();
    });
  }

  private calculateNavigation(itemName: string, isProfile: boolean): NavigationState {
    const nav: NavigationState = { prev: null, next: null };
    const raw = sessionStorage.getItem(isProfile ? 'profileItemsList' : 'filteredItemsOrder');
    if (!raw) return nav;

    try {
      let order: string[];
      if (isProfile) {
        const list = JSON.parse(raw) as { name: string }[];
        order = list.map(i => i.name);
      } else {
        order = JSON.parse(raw) as string[];
      }

      const targetSlug = SlugService.toSlug(itemName);
      const idx = order.findIndex(name => SlugService.toSlug(name) === targetSlug);
      if (idx !== -1) {
        nav.prev = idx > 0 ? (order[idx - 1] ?? null) : null;
        nav.next = idx < order.length - 1 ? (order[idx + 1] ?? null) : null;
      }
    } catch { /* ignore */ }

    return nav;
  }
}
