import {Branch, PageMeta} from '@roots/Branch.ts';
import {t} from '../../localization/i18n';
import {ItemDefinition} from '../items/ItemsBranch';
import {parseTextWithIcons, generateIconsOrText} from '../../utils/icon-parser';
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
    private navigation: { prev: string | null, next: string | null } = {prev: null, next: null};
    private listScrollY: number = 0;

    public getMeta(data?: any): PageMeta {
        let itemName: string;
        if (typeof data?.name === 'string') {
            itemName = data.name;
        } else if (typeof data?.itemData?.name === 'string') {
            itemName = data.itemData.name;
        } else if (typeof data?.name === 'object' && data.name?.name) {
            itemName = data.name.name;
        } else {
            itemName = t('unknown_item');
        }

        return {
            title: t('item_detail_title', {itemName: itemName}),
            description: t('item_detail_description', {itemName: itemName})
        };
    }

    private calculateNavigation(currentName: string) {
        const orderRaw = sessionStorage.getItem('filteredItemsOrder');
        if (!orderRaw) return;

        const order: string[] = JSON.parse(orderRaw);
        const currentIndex = order.indexOf(currentName);

        if (currentIndex !== -1) {
            this.navigation.prev = currentIndex > 0 ? order[currentIndex - 1] : null;
            this.navigation.next = currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
        }
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

        const descriptionHtml = item.tooltips ? parseTextWithIcons(item.tooltips.join('\\n')) : '';

        const heroHtml = item.connectedHero
            ? `<div class="info-row">${parseTextWithIcons(`${t('wiki_item_hero')}: ${item.connectedHero}`)}</div>`
            : '';

        const costHtml = item.coinValue
            ? `<div class="info-row">${parseTextWithIcons(`${t('wiki_item_cost')}: ${item.coinValue} Gold`)}</div>`
            : '';

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

        if (data?.scrollY !== undefined && this.listScrollY === 0) {
            this.listScrollY = data.scrollY;
        }

        if (!this.data.itemData) {
            const allItemsRaw = sessionStorage.getItem('allItems');
            if (allItemsRaw) {
                const allItems: ItemDefinition[] = JSON.parse(allItemsRaw);
                const itemName = this.data.name || decodeURIComponent(window.location.pathname.split('/').pop() || '');
                const foundItem = allItems.find(i => i.name === itemName);
                if (foundItem) this.data.itemData = foundItem;
            }
        }

        const item = this.data.itemData;
        if (!item) {
            return `<div class="container"><p>${t('wiki_item_info_not_found')}</p></div>`;
        }

        // РАССЧИТЫВАЕМ НАВИГАЦИЮ ТОЛЬКО ЕСЛИ НЕТ ДАННЫХ ИГРОКА (ДЛЯ ВИКИ)
        if (!this.data.playerItem) {
            this.calculateNavigation(item.name);
        }

        const rarity = item.rarity || 'Common';
        const rarityClass = `rarity-${rarity.toLowerCase()}`;
        const itemTypesHtml = generateIconsOrText(item.itemTypes);

        return `
            <div class="container item-detail-container">
                <div class="navigation-anchor" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 35rem;">
                    
                    <div class="item-card-wrapper">
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
                    
                    ${!this.data.playerItem ? `
                    <div class="item-navigation-bottom"> 
                        <div class="nav-group">
                            ${this.navigation.prev
                                ? `<a href="/item/${encodeURIComponent(this.navigation.prev)}" class="nav-btn-bottom" data-link>❮</a>`
                                : '<div class="nav-btn-bottom disabled">❮</div>'}
                            
                            <a href="/items" class="nav-btn-bottom back-btn" data-link title="${t('sidebar_items')}">
                                <span class="icon">☰</span>
                            </a>
                    
                            ${this.navigation.next
                                ? `<a href="/item/${encodeURIComponent(this.navigation.next)}" class="nav-btn-bottom" data-link>❯</a>`
                                : '<div class="nav-btn-bottom disabled">❯</div>'}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    protected init(_data?: any): void {}
    protected destroy(): void {}
}