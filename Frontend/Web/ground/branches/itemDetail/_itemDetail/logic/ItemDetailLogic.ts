import { BranchLogic } from '../../../../roots/StructuredBranch';
import { ItemNavigationManager } from '../managers/ItemNavigationManager';
import { ItemSEOManager } from '../managers/ItemSEOManager';
import { ItemDetailData } from '../utils/item-detail-types';

export class ItemDetailLogic implements BranchLogic<ItemDetailData> {
  private readonly root: HTMLElement;
  private seoManager: ItemSEOManager | null = null;
  private navManager: ItemNavigationManager | null = null;
  private cleanupFns: (() => void)[] = [];

  constructor(root: HTMLElement) {
    this.root = root;
  }

  public async init(context: ItemDetailData): Promise<void> {
    if (!context.itemData) return;

    const isProfile = !!context.playerItem;
    this.seoManager = new ItemSEOManager();
    this.seoManager.update(context.itemData, isProfile);

    this.navManager = new ItemNavigationManager(isProfile);
    this.navManager.attachProfileNavListeners(this.root);

    this.setupCopyHandler(this.root);
    this.restoreProfileScroll();
  }

  public destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.navManager?.destroy();
    this.navManager = null;
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

  private restoreProfileScroll(): void {
    if (globalThis.history.state?.fromBack !== true) return;
    try {
      const raw = sessionStorage.getItem('profileDynamicState') ?? localStorage.getItem('profileDynamicState');
      if (raw) {
        const state = JSON.parse(raw);
        if (state.scrollY > 0) {
          setTimeout(() => globalThis.scrollTo(0, state.scrollY), 50);
        }
      }
    } catch { /* ignore */ }
  }
}
