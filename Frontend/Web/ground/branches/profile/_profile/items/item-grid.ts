/**
 * ItemGridRenderer - рендеринг сетки предметов
 */

import { Item } from '../utils/profile-types';
import { ItemCardRenderer } from './item-card';

export class ItemGridRenderer {
    static render(items: Item[]): string {
        return `
            <div class="items-grid" id="profileItemsGrid">
                ${items.map((item, index) => ItemCardRenderer.render(item, index)).join('')}
            </div>
        `;
    }
}
