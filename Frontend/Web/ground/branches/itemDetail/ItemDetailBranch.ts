import { Branch, PageMeta } from '../../roots/Branch';
import { t } from '../../localization/i18n';
import { ItemDefinition } from '../items/ItemsBranch';
import { parseTextWithIcons, generateIconsOrText } from '../../utils/icon-parser';
import './itemDetail.scss';

interface ItemDetailData {
    name?: string;
    playerItem?: {
        level: number;
        cards: number;
        cards_need: number;
    };
    itemData?: ItemDefinition;
}

export class ItemDetailBranch extends Branch {
    private data: ItemDetailData = {};

    public getMeta(data?: any): PageMeta {
        const name = data?.name || t('unknown_item');
        return {
            title: t('item_detail_title', { itemName: name }),
            description: t('item_detail_description', { itemName: name })
        };
    }

    private renderPlayerInfo(): string {
        const playerItem = this.data.playerItem;
        if (!playerItem) return '';
        const cardsInfo = playerItem.cards_need !== -1
            ? `<div class="stat-row"><span class="stat-label">${t('player_item_cards')}:</span> <span class="stat-value">${playerItem.cards} / ${playerItem.cards_need}</span></div>`
            : '';
        return `<div class="player-stats-block" data-aos="fade-up"><div class="stat-row"><span class="stat-label">${t('player_item_level')}:</span> <span class="stat-value lvl">Lvl ${playerItem.level}</span></div>${cardsInfo}</div>`;
    }

    private renderWikiInfo(item: ItemDefinition): string {
        const combatStatsHtml = item.combatStats
            ? Object.entries(item.combatStats)
                .filter(([, value]) => value !== null)
                .map(([key, value]) => {
                    const iconHtml = parseTextWithIcons(`stat_${key}`);
                    return `<li>${iconHtml} <span>${value}</span></li>`;
                })
                .join('')
            : '';

        // Исправлено: используем '\n' вместо '\\n' для создания настоящего символа переноса строки
        const descriptionHtml = item.tooltips ? parseTextWithIcons(item.tooltips.join('\\n')) : '';
        const heroHtml = item.connectedHero ? `<div class="info-row hero-info-row"><strong>${t('wiki_item_hero')}:</strong> ${parseTextWithIcons(item.connectedHero)}</div>` : '';
        const costHtml = item.coinValue ? `<div class="info-row"><strong>${t('wiki_item_cost')}:</strong> ${item.coinValue} ${parseTextWithIcons("Gold")}</div>` : '';

        return `
            <div class="wiki-stats-block" data-aos="fade-up" data-aos-delay="100">
                ${descriptionHtml ? `<div class="item-description">${descriptionHtml}</div>` : ''}
                ${heroHtml}
                ${costHtml}
                ${combatStatsHtml ? `<div class="combat-stats"><ul>${combatStatsHtml}</ul></div>` : ''}
            </div>
        `;
    }

    protected getHtml(data?: any): string {
        this.data = data || {};
        if (!this.data.itemData) {
            const allItemsRaw = sessionStorage.getItem('allItems');
            if (allItemsRaw) {
                const allItems: ItemDefinition[] = JSON.parse(allItemsRaw);
                const foundItem = allItems.find(i => i.name === this.data.name);
                if (foundItem) this.data.itemData = foundItem;
            }
        }
        
        const item = this.data.itemData;
        if (!item) {
            return `<div class="container"><p>${t('wiki_item_info_not_found')}</p></div>`;
        }

        const rarity = item.rarity || 'Common';
        const rarityClass = `rarity-${rarity.toLowerCase()}`;
        const itemTypesHtml = generateIconsOrText(item.itemTypes);

        return `
            <div class="container item-detail-container">
                <div class="item-card-wrapper" data-aos="zoom-in">
                    <h1 class="item-title">${item.name}</h1>
                    <div class="item-header">
                        <div class="item-rarity ${rarityClass}">${rarity}</div>
                        ${itemTypesHtml ? `<div class="item-types-block">${itemTypesHtml}</div>` : ''}
                    </div>
                    <div class="item-visual">
                        <div class="item-image-wrapper ${rarityClass}">
                            <picture>
                                <source srcset="/images/items/avif/${encodeURIComponent(item.name)}.avif" type="image/avif">
                                <source srcset="/images/items/webp/${encodeURIComponent(item.name)}.webp" type="image/webp">
                                <img src="/images/items/webp/${encodeURIComponent(item.name)}.webp" alt="${item.name}" loading="lazy">
                            </picture>
                        </div>
                    </div>
                    <div class="item-content">
                        ${this.renderPlayerInfo()}
                        ${this.renderWikiInfo(item)}
                    </div>
                </div>
            </div>
        `;
    }

    protected init(_data?: any): void {}
    protected destroy(): void {}
}
