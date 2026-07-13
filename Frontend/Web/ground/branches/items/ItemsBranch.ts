import { PageMeta } from '../../roots/Branch';
import { BranchSpec } from '../../roots/BranchSpec';
import { BranchRunner } from '../../roots/BranchRunner';
import { BranchDisplay, BranchData, BranchLogic } from '../../roots/StructuredBranch';
import { ItemsLayoutRenderer } from './_items/components/ItemsLayoutRenderer';
import { ItemsManager } from './_items/managers/ItemsManager';
import { ItemsCacheService } from '../../utils/ItemsCacheService';
import { SearchTermService } from '../../utils/SearchTermService';
import { ItemDefinition } from '../../types/api-types';
import './items.scss';

export type { ItemDefinition };

interface ItemsContext {
  items: ItemDefinition[];
  detailName?: string;
  searchQuery?: string | null;
}

class ItemsDisplay implements BranchDisplay<any, ItemsContext> {
  renderSkeleton(): string {
    return ItemsLayoutRenderer.render();
  }

  renderError(error: unknown): string {
    return `<div class="container"><h1 class="error">${String(error)}</h1></div>`;
  }

  renderFullPage(): string {
    return ItemsLayoutRenderer.render();
  }
}

class ItemsDataLoader implements BranchData<any, ItemsContext> {
  async load(_input?: any): Promise<ItemsContext> {
    const [items] = await Promise.all([
      ItemsCacheService.getAllItems(),
      SearchTermService.init()
    ]);
    const searchParams = new URLSearchParams(globalThis.location.search);
    const detailName = searchParams.get('item') ?? undefined;
    const searchQuery = searchParams.get('search') ?? null;
    return {
      items: items as any as ItemDefinition[],
      detailName,
      searchQuery,
    };
  }
}

class ItemsLogic implements BranchLogic<ItemsContext> {
  private manager: ItemsManager | null = null;
  private readonly query: string | null;
  private readonly detailName: string | undefined;

  constructor(query: string | null, detailName?: string) {
    this.query = query;
    this.detailName = detailName;
  }

  init(context: ItemsContext, root: HTMLElement): void {
    this.manager = new ItemsManager(root, context.items, this.query);
    this.manager.init();
    if (this.detailName) {
      this.manager.openDetail(this.detailName);
    }
  }

  destroy(): void {
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}

export const itemsSpec: BranchSpec<any, ItemsContext> = {
  id: 'items',
  routes: ['/items'],
  display: new ItemsDisplay(),
  data: new ItemsDataLoader(),
  meta: (): PageMeta => ({
    title: 'Список предметов | Backpack Insight',
    description: 'Интерактивная база данных предметов, рецепты крафтов и характеристики Backpack Brawl.',
  }),
  logic: (ctx) => [new ItemsLogic(ctx.context.searchQuery ?? null, ctx.context.detailName)],
};

export const ItemsBranch = new BranchRunner(itemsSpec).createBranchClass();
