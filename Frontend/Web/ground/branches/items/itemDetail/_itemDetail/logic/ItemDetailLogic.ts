import { BranchLogic } from '@roots/StructuredBranch';
import { ItemSEOManager } from '../managers/ItemSEOManager';
import { ItemDetailData } from '../utils/item-detail-types';

export class ItemDetailLogic implements BranchLogic<ItemDetailData> {
  private readonly root: HTMLElement;
  private seoManager: ItemSEOManager | null = null;
  private cleanupFns: (() => void)[] = [];

  constructor(root: HTMLElement) {
    this.root = root;
  }

  public async init(context: ItemDetailData): Promise<void> {
    if (!context.itemData) return;
    const isProfile = !!context.playerItem;
    this.seoManager = new ItemSEOManager();
    this.seoManager.update(context.itemData, isProfile);
    this.setupCopyHandler(this.root);
    this.setupRecipesToggle(this.root);
  }

  public destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.seoManager?.restore();
    this.seoManager?.cleanup();
    this.seoManager = null;
  }

  private setupCopyHandler(root: HTMLElement): void {
    const handler = (e: ClipboardEvent) => {
      const sel = globalThis.getSelection();
      if (!sel?.rangeCount) return;
      const clone = sel.getRangeAt(0).cloneContents();
      const div = document.createElement('div');
      div.appendChild(clone);
      div.querySelectorAll('img').forEach(img => {
        const alt = img.getAttribute('alt') || img.getAttribute('title') || '';
        if (alt) img.replaceWith(document.createTextNode(`[${alt}]`));
      });
      div.querySelectorAll('picture').forEach(pic => {
        const img = pic.querySelector('img');
        const alt = img?.getAttribute('alt') || img?.getAttribute('title') || '';
        if (alt) pic.replaceWith(document.createTextNode(`[${alt}]`));
      });
      e.clipboardData?.setData('text/plain', div.textContent || '');
      e.clipboardData?.setData('text/html', div.innerHTML || '');
      e.preventDefault();
    };
    root.addEventListener('copy', handler);
    this.cleanupFns.push(() => root.removeEventListener('copy', handler));
  }

  private setupRecipesToggle(root: HTMLElement): void {
    const btn = root.querySelector<HTMLElement>('.id-recipes-btn');
    const section = root.querySelector<HTMLElement>('.id-recipes');
    if (!btn || !section) return;
    const handler = () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (expanded) section.setAttribute('hidden', '');
      else section.removeAttribute('hidden');
    };
    btn.addEventListener('click', handler);
    this.cleanupFns.push(() => btn.removeEventListener('click', handler));
  }
}
