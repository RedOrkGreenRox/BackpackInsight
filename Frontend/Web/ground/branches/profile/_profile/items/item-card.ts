/**
 * ItemCardRenderer - рендеринг карточки предмета
 */

import { Item } from '../utils/profile-types';

export class ItemCardRenderer {
    static render(item: Item, index: number): string {
        const cardsInfo = item.cards_need !== -1 ? `(${item.cards} / ${item.cards_need})` : '';

        // Форматирование имени для URL и файла: lowercase и замена пробелов на дефисы
        const slug = item.name.toLowerCase().split(' ').join('-');

        return `
            <a href="/profile/item/${slug}" class="item-card-link" data-link style="text-decoration: none; color: inherit; display: block;"
               data-aos="fade-up"
               data-aos-delay="${(index % 10) * 30}">
                <div class="item-card">
                    <div class="item-image-wrapper">
                        <picture>
                            <source srcset="/images/items/avif/${slug}.avif" type="image/avif">
                            <source srcset="/images/items/webp/${slug}.webp" type="image/webp">
                            <img src="/images/items/webp/${slug}.webp" 
                                 alt="${item.name}" 
                                 loading="lazy" 
                                 class="item-icon" 
                                 data-fallback
                                 onerror="window.handleImageError(this)">
                        </picture>
                    </div>
                    <span class="item-name">${item.name}</span>
                    <div class="item-stats">
                        <span class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</span>
                        <div class="item-level">lvl ${item.level} ${cardsInfo}</div>
                    </div>
                </div>
            </a>
        `;
    }
}
