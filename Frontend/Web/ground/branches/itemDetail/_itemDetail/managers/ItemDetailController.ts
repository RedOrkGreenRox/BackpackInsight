import { ItemDefinition } from '@branches/items/_items/managers/ItemsStateManager';
import { ItemNavigationManager } from '../managers/ItemNavigationManager';
import { ItemSEOManager } from '../managers/ItemSEOManager';
import { ItemDetailUI } from '../components/ItemDetailUI';
import { ApiService } from '@utils/ApiService';
import { ItemDetailBranch } from '../../ItemDetailBranch';

export class ItemDetailController {

    private navManager = new ItemNavigationManager();
    private seoManager = new ItemSEOManager();

    public constructor(private branch: ItemDetailBranch) {}

    public async loadAndRender(searchSlug: string, playerItem: any = null) {
        this.branch.isLoading = true;
        try {
            const allItems = await ApiService.getItems();
            sessionStorage.setItem('allItems', JSON.stringify(allItems));
            const foundItem = allItems.find((item: ItemDefinition) => this.toSlug(item.name) === searchSlug);
            
            if (!foundItem) {
                const container = this.branch.getContainer();
                if (container) container.innerHTML = `<div class="container"><p>Item not found</p></div>`;
                return;
            }

            const nav = this.navManager.calculateNavigation(foundItem.name, playerItem);
            const isProfile = !!playerItem;
            
            const container = this.branch.getContainer();
            if (container) {
                container.innerHTML = ItemDetailUI.renderFullPage(foundItem, playerItem, nav, isProfile);
            }
            this.seoManager.updateSEO(foundItem, window.location.href, isProfile);
            
            this.setupEventListeners();
        } catch (e) {
            const container = this.branch.getContainer();
            if (container) container.innerHTML = `<div class="container"><p>Server unavailable</p></div>`;
        } finally {
            this.branch.isLoading = false;
        }
    }

    private setupEventListeners() {
        const container = this.branch.getContainer();
        const navLinks = container?.querySelectorAll('.nav-btn-top.nav-prev, .nav-btn-top.nav-next');
        navLinks?.forEach((link: Element) => {
            const el = link as HTMLElement;
            el.addEventListener('click', (_e: Event) => {
                const targetName = el.dataset['targetName'];
                if (!targetName) return;
                const profileListRaw = sessionStorage.getItem('profileItemsList');
                if (profileListRaw) {
                    try {
                        const profileList = JSON.parse(profileListRaw);
                        const nextItem = profileList.find((i: any) => i.name === targetName);
                        if (nextItem) {
                            (el as any)._stateData = { playerItem: nextItem, name: targetName };
                        }
                    } catch (err) {}
                }
            });
        });
    }

    public setupCopyHandler() {
        const container = this.branch.getContainer();
        if (!container) return;
        const handleCopy = (e: ClipboardEvent) => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            const clonedContents = range.cloneContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(clonedContents);
            const images = tempDiv.querySelectorAll('img, picture');
            images.forEach(el => {
                const img = el instanceof HTMLImageElement ? el : el.querySelector('img');
                const altText = img?.getAttribute('alt') || img?.getAttribute('title') || '';
                if (altText) {
                    const textNode = document.createTextNode(`[${altText}]`);
                    el.parentNode?.replaceChild(textNode, el);
                }
            });
            e.clipboardData?.setData('text/plain', tempDiv.textContent || '');
            e.preventDefault();
        };
        container.addEventListener('copy', handleCopy);
    }

    private toSlug(name: string): string {
        return name.toLowerCase().split(' ').join('-');
    }
}
