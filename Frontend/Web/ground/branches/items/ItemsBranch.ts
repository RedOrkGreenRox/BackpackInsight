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
}

function decodeSharedQuery(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try { return decodeURIComponent(raw).trim(); }
  catch { return raw.trim(); }
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
  async load(): Promise<ItemsContext> {
    const [items] = await Promise.all([
      ItemsCacheService.getAllItems(),
      SearchTermService.init()
    ]);
    return { items: items as any as ItemDefinition[] };
  }
}

class ItemsLogic implements BranchLogic<ItemsContext> {
  private manager: ItemsManager | null = null;
  private readonly query: string | null;

  constructor(query: string | null) {
    this.query = query;
  }

  init(context: ItemsContext, root: HTMLElement): void {
    this.manager = new ItemsManager(root, context.items, this.query);
    this.manager.init();
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
  logic: (ctx) => [new ItemsLogic(decodeSharedQuery(ctx.input?.query))],
};

export const ItemsBranch = new BranchRunner(itemsSpec).createBranchClass();
