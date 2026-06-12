/**
 * ItemNavigationManager — навигация prev/next между предметами.
 */
import { NavigationState } from '../utils/item-detail-types';

export class ItemNavigationManager {
    private isProfile: boolean;
    private cleanupFns: (() => void)[] = [];

    constructor(isProfile: boolean) {
        this.isProfile = isProfile;
    }

    calculate(itemName: string): NavigationState {
        const nav: NavigationState = { prev: null, next: null };
        const raw = sessionStorage.getItem(this.isProfile ? 'profileItemsList' : 'filteredItemsOrder');
        if (!raw) return nav;

        try {
            let order: string[];
            if (this.isProfile) {
                const list = JSON.parse(raw);
                order = list.map((i: { name: string }) => i.name);
            } else {
                order = JSON.parse(raw);
            }

            const idx = order.indexOf(itemName);
            if (idx !== -1) {
                nav.prev = idx > 0 ? (order[idx - 1] ?? null) : null;
                nav.next = idx < order.length - 1 ? (order[idx + 1] ?? null) : null;
            }
        } catch { /* ignore */ }

        return nav;
    }

    attachProfileNavListeners(container: HTMLElement): void {
        if (!this.isProfile) return;

        const handler = (e: Event) => {
            const link = (e.target as HTMLElement).closest('.nav-btn-top');
            if (!link) return;

            const targetName = (link as HTMLElement).dataset['targetName'];
            if (!targetName) return;

            try {
                const raw = sessionStorage.getItem('profileItemsList');
                if (!raw) return;
                const list = JSON.parse(raw);
                const item = list.find((i: { name: string }) => i.name === targetName);
                if (item) {
                    (link as any)._stateData = { playerItem: item, name: targetName };
                }
            } catch { /* ignore */ }
        };

        container.addEventListener('click', handler);
        this.cleanupFns.push(() => container.removeEventListener('click', handler));
    }

    destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
