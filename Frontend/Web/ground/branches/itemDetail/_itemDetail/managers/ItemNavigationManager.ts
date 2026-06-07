export class ItemNavigationManager {
    public calculateNavigation(currentName: string, playerItem: any = null): { prev: string | null, next: string | null } {
        let orderRaw: string | null;
        let isProfileContext = false;

        if (playerItem) {
            orderRaw = sessionStorage.getItem('profileItemsList');
            isProfileContext = true;
        } else {
            orderRaw = sessionStorage.getItem('filteredItemsOrder');
        }

        if (!orderRaw) return { prev: null, next: null };

        let order: string[] = [];
        if (isProfileContext) {
            try {
                const itemsList = JSON.parse(orderRaw);
                order = itemsList.map((i: any) => i.name);
            } catch (e) {
                return { prev: null, next: null };
            }
        } else {
            try {
                order = JSON.parse(orderRaw);
            } catch (e) {
                return { prev: null, next: null };
            }
        }

        const currentIndex = order.indexOf(currentName);
        if (currentIndex === -1) return { prev: null, next: null };

        return {
            prev: currentIndex > 0 ? (order[currentIndex - 1] ?? null) : null,
            next: currentIndex < order.length - 1 ? (order[currentIndex + 1] ?? null) : null
        };
    }
}
