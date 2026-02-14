import { Branch, PageMeta } from '../../roots/Branch';
import { t } from '../../localization/i18n';
import { ItemDefinition } from './ItemsBranch'; // Импортируем общий интерфейс

// Данные, которые приходят на страницу
interface ItemDetailData {
    name?: string; // Из URL
    playerItem?: { // Данные конкретного предмета игрока (если переход из профиля)
        level: number;
        cards: number;
        cards_need: number;
        rarity: string;
    };
    itemData?: ItemDefinition; // Полные данные из вики
}

export class ItemDetailBranch extends Branch {
    private data: ItemDetailData = {};

    public getMeta(data?: any): PageMeta {
        const name = data?.name || "Предмет";
        return {
            title: t('item_detail_title', name),
            description: t('item_detail_description', name)
        };
    }

    protected getHtml(data?: any): string {
        this.data = data || {};
        const itemName = this.data.name || "Unknown";
        
        // Если полные данные не были переданы (например, при переходе из профиля),
        // пытаемся найти их в sessionStorage.
        if (!this.data.itemData) {
            const allItemsRaw = sessionStorage.getItem('allItems');
            if (allItemsRaw) {
                const allItems: ItemDefinition[] = JSON.parse(allItemsRaw);
                this.data.itemData = allItems.find(i => i.name === itemName);
            }
        }

        const item = this.data.itemData;
        const playerItem = this.data.playerItem;

        let playerInfoHtml = '';
        if (playerItem) {
            const cardsInfo = playerItem.cards_need !== -1 
                ? `<p>${t('player_item_cards')}: <span style="color: #fff; font-weight: bold;">${playerItem.cards} / ${playerItem.cards_need}</span></p>`
                : '';
            playerInfoHtml = `
                <div class="item-details-section player-stats">
                    <h3>${t('player_item_stats_title')}</h3>
                    <p>${t('player_item_level')}: <span style="color: #fff; font-weight: bold;">${playerItem.level}</span></p>
                    <p>${t('player_item_rarity')}: <span class="rarity-${playerItem.rarity.toLowerCase()}" style="font-weight: bold;">${playerItem.rarity}</span></p>
                    ${cardsInfo}
                </div>
            `;
        }

        let wikiInfoHtml = `<p>${t('wiki_item_info_not_found')}</p>`;
        if (item) {
            const combatStatsHtml = item.combatStats ? Object.entries(item.combatStats).map(([key, value]) => value !== null ? `<li><strong>${key}:</strong> ${value}</li>` : '').join('') : '';
            const itemTypesHtml = item.itemTypes ? item.itemTypes.join(', ') : 'Нет';
            
            wikiInfoHtml = `
                <div class="item-details-section wiki-stats">
                    <h3>${t('wiki_item_info_title')}</h3>
                    <p><strong>${t('wiki_item_id')}:</strong> ${item.id}</p>
                    <p><strong>${t('wiki_item_types')}:</strong> ${itemTypesHtml}</p>
                    ${item.connectedHero ? `<p><strong>${t('wiki_item_hero')}:</strong> ${item.connectedHero}</p>` : ''}
                    ${item.coinValue ? `<p><strong>${t('wiki_item_cost')}:</strong> ${item.coinValue} ${t('wiki_item_cost_unit')}</p>` : ''}
                    ${item.tooltips ? `<p><strong>${t('wiki_item_description')}:</strong> <em>${item.tooltips.join(' ')}</em></p>` : ''}
                    
                    ${combatStatsHtml ? `<h4>${t('wiki_item_combat_stats')}</h4><ul>${combatStatsHtml}</ul>` : ''}
                </div>
            `;
        }

        return `
            <div class="container" style="padding-top: 100px; text-align: left;">
                
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 class="main-title">${itemName}</h1>
                    ${item ? `<h2 class="rarity-${item.rarity.toLowerCase()}" style="font-size: 1.5rem;">${item.rarity}</h2>` : ''}
                </div>
                
                <div class="item-details-layout">
                    <div class="item-details-visual">
                        <div class="item-image-wrapper" style="width: 128px; height: 128px; margin: 0 auto;">
                            <picture>
                                <source srcset="/static/images/items/avif/${encodeURIComponent(itemName)}.avif" type="image/avif">
                                <source srcset="/static/images/items/webp/${encodeURIComponent(itemName)}.webp" type="image/webp">
                                <img src="/static/images/items/webp/${encodeURIComponent(itemName)}.webp" 
                                     alt="${itemName}" 
                                     style="width: 100%; height: 100%; object-fit: contain;">
                            </picture>
                        </div>
                    </div>
                    <div class="item-details-info">
                        ${playerInfoHtml}
                        ${wikiInfoHtml}
                    </div>
                </div>
            </div>
        `;
    }

    protected init(_data?: any): void {}
    protected destroy(): void {}
}
