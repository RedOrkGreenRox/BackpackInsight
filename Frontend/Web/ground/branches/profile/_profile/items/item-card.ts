/**
 * ItemCardRenderer - рендеринг карточки предмета
 */

import { Item } from '../utils/profile-types';
import { ImageFormatService } from '../../../../utils/ImageFormatService';
import { SlugService } from '../../../../utils/SlugService';

export class ItemCardRenderer {
    static render(item: Item, index: number): string {
        const cardsInfo = item.cards_need !== -1 ? `(${item.cards} / ${item.cards_need})` : '';

        const slug = SlugService.toSlug(item.name);
        const imageSrc = ImageFormatService.itemSrc(slug);

        return `
            <a href="/profile/item/${slug}" class="item-card-link" data-link style="text-decoration: none; color: inherit; display: block;"
               data-aos="fade-up"
               data-aos-delay="${(index % 10) * 30}">
                <div class="item-card">
                    <div class="item-image-wrapper">
                        <img src="${imageSrc}" 
                             alt="${item.name}" 
                             loading="lazy"
                             decoding="async"
                             fetchpriority="low"
                             class="item-icon" 
                             data-fallback>
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
