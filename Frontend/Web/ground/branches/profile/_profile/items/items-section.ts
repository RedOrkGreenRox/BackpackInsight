import { t } from '../../../../localization/i18n';
/**
 * ItemsSectionRenderer - основной рендерер секции предметов с поисковой строкой
 */

import { ProfileData } from '../utils/profile-types';
import { ItemCardRenderer } from './item-card';

export class ItemsSectionRenderer {
    static render(data: ProfileData, currentItemSort: 'rarity' | 'level'): string {
        const sortLabel = currentItemSort === 'rarity' ? this.getItemsSortRarity() : this.getItemsSortLevel();

        return `
            <div class="section" data-aos="fade-up">
                <h2 class="section-title">${this.getItemsTitle(data.items_count)}</h2>
                
                <div class="search-controls" style="margin-bottom: 16px;">
                    <input type="text" id="profileItemSearch" class="search-input" placeholder="${t('items_search_placeholder', 'Поиск по предметам профиля...')}" style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; outline: none;" />
                </div>

                <div class="sort-controls" style="margin-bottom: 20px;">
                    <button id="itemSortToggle" class="sort-btn">
                        <span id="itemSortText">${sortLabel}</span>
                    </button>
                </div>

                <div class="items-grid" id="profileItemsGrid">
                    ${data.items.map((item, index) => ItemCardRenderer.render(item, index)).join('')}
                </div>
            </div>
        `;
    }

    private static getItemsTitle(count: number): string {
        return t('profile_items_title', String(count));
    }

    private static getItemsSortRarity(): string {
        return t('items_sort_rarity');
    }

    private static getItemsSortLevel(): string {
        return t('items_sort_level');
    }
}
