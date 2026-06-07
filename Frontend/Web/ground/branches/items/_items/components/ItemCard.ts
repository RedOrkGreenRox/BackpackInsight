import { ItemDefinition } from '@branches/items/_items/managers/ItemsStateManager';
import { ItemsIconService } from '@branches/items/_items/services/ItemsIconService';

export class ItemCard {
    public static render(item: ItemDefinition, index: number): string {
        const imagePath = ItemsIconService.getItemImagePath(item);
        const rarityClass = `rarity-${item.rarity.toLowerCase()}`;
        const delay = Math.min((index % 10) * 30, 300);
        const slug = item.name.toLowerCase().split(' ').join('-');

        return `
            <a href="/item/${slug}" class="item-card-link" data-link 
               data-aos="fade-up" data-aos-offset="-400px" data-aos-delay="${delay}">
                <div class="item-card">
                    <div class="item-image-wrapper">
                        <picture>
                            <source srcset="/images/items/avif/${imagePath}.avif" type="image/avif">
                            <source srcset="/images/items/webp/${imagePath}.webp" type="image/webp">
                            <img src="/images/items/webp/${imagePath}.webp" 
                                 alt="${item.name}" 
                                 loading="lazy" 
                                 class="item-icon"
                                 data-fallback
                                 onerror="window.handleImageError(this)">
                        </picture>
                    </div>
                    <span class="item-name">${item.name}</span>
                    <div class="item-stats">
                        <span class="${rarityClass}">${item.rarity}</span>
                    </div>
                </div>
            </a>
        `;
    }
}
