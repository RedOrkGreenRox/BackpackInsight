import { Item } from '../utils/profile-types';

export class ProfileSortManager {
    public sortItems(items: Item[], currentSort: 'rarity' | 'level', weights: Record<string, number>): Item[] {
        const sorted = [...items];
        sorted.sort((a, b) => {
            if (currentSort === 'rarity') {
                const weightA = weights[a.rarity] || 0;
                const weightB = weights[b.rarity] || 0;
                if (weightA !== weightB) return weightB - weightA;
            }

            if (a.level !== b.level) return b.level - a.level;

            const progressA = a.cards_need > 0 ? a.cards / a.cards_need : 0;
            const progressB = b.cards_need > 0 ? b.cards / b.cards_need : 0;
            if (progressA !== progressB) return progressB - progressA;

            if (currentSort !== 'rarity') {
                const weightA = weights[a.rarity] || 0;
                const weightB = weights[b.rarity] || 0;
                if (weightA !== weightB) return weightB - weightA;
            }

            return a.name.localeCompare(b.name);
        });
        return sorted;
    }
}
