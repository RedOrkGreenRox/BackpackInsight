/**
 * ItemStatsRenderer - рендеринг статистики предмета
 */

import { Item } from '../utils/profile-types';

export class ItemStatsRenderer {
    static render(item: Item): string {
        const cardsInfo = item.cards_need !== -1 ? `(${item.cards} / ${item.cards_need})` : '';
        
        return `
            <div class="item-stats">
                <span class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</span>
                <div class="item-level">lvl ${item.level} ${cardsInfo}</div>
                <div class="item-name">${item.name}</div>
            </div>
        `;
    }
}
