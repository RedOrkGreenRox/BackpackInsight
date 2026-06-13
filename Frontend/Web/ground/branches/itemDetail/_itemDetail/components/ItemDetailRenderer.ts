/**
 * ItemDetailRenderer — генерация HTML для страницы детального просмотра предмета.
 * Чистые статические методы, без состояния.
 */
import { PageMeta } from '@roots/Branch.ts';
import { ItemDetailData, NavigationState, ItemDefinition } from '../utils/item-detail-types';
import { ImageFormatService } from '@utils/ImageFormatService';
import { ItemIconService } from '@utils/ItemIconService';
import { parseTextWithIcons, generateIconsOrText } from '@utils/icon-parser';
import { LoadingStates } from '@utils/LoadingStates';
import { t } from '../../../../localization/i18n';

export class ItemDetailRenderer {

    static getMeta(data?: any): PageMeta {
        let itemName: string;
        if (typeof data?.name === 'string') {
            itemName = data.name;
        } else if (typeof data?.itemData?.name === 'string') {
            itemName = data.itemData.name;
        } else if (typeof data?.name === 'object' && data.name?.name) {
            itemName = data.name.name;
        } else if (data?.playerItem?.name) {
            itemName = data.playerItem.name;
        } else {
            itemName = t('unknown_item');
        }

        return {
            title: t('item_detail_title', { itemName }),
            description: t('item_detail_description', { itemName })
        };
    }

    static renderSkeleton(): string {
        return `<div class="container item-detail-container">
            ${LoadingStates.createCardSkeleton(1)}
            <div style="margin-top: 24px;">${LoadingStates.createCardSkeleton(3)}</div>
        </div>`;
    }

    static renderNotFound(): string {
        return `<div class="container"><p>${t('wiki_item_info_not_found')}</p></div>`;
    }

    static renderError(): string {
        return `<div class="container"><p>${t('error_server_unavailable')}</p></div>`;
    }

    static renderFullPage(data: ItemDetailData, nav: NavigationState): string {
        const item = data.itemData;
        if (!item) return this.renderNotFound();

        const rarity = item.rarity || 'Common';
        const rarityClass = `rarity-${rarity.toLowerCase()}`;
        const isProfile = !!data.playerItem;
        const baseUrl = isProfile ? '/profile/item' : '/item';
        const backUrl = isProfile ? '/profile' : '/items';
        const backTitle = isProfile ? t('sidebar_main') : t('sidebar_items');
        const imageName = ItemIconService.getImagePath(item);
        const imageSrc = ImageFormatService.itemSrc(imageName);
        const itemTypesHtml = generateIconsOrText(item.itemTypes);

        return `
            <div class="container item-detail-container">
                <div class="navigation-anchor">
                    <div class="item-navigation-top">
                        <div class="nav-group">
                            ${this.renderNavLink(nav.prev, 'prev', baseUrl)}
                            <a href="${backUrl}" class="nav-btn-top back-btn" data-link title="${backTitle}">
                                <span class="icon">☰</span>
                            </a>
                            ${this.renderNavLink(nav.next, 'next', baseUrl)}
                        </div>
                    </div>
                    <div class="item-card-wrapper">
                        <h1 class="item-title">${item.name}</h1>
                        <div class="item-header">
                            <div class="item-header-left">
                                ${item.connectedHero ? `<div class="item-hero-icon">${parseTextWithIcons(item.connectedHero)}</div>` : ''}
                                ${item.coinValue ? this.renderCostIcon(item.coinValue) : ''}
                            </div>
                            <div class="item-rarity ${rarityClass}">${rarity}</div>
                            <div class="item-header-right">
                                ${itemTypesHtml ? `<div class="item-types-block">${itemTypesHtml}</div>` : ''}
                            </div>
                        </div>
                        <div class="item-visual">
                            <div class="item-image-wrapper ${rarityClass}">
                                <img src="${imageSrc}" alt="${item.name}" loading="lazy" decoding="async" onerror="window.handleImageError(this)">
                            </div>
                        </div>
                        ${this.renderPlayerInfo(data.playerItem)}
                        ${this.renderWikiInfo(item)}
                    </div>
                </div>
            </div>`;
    }

    private static renderNavLink(targetName: string | null, dir: 'prev' | 'next', baseUrl: string): string {
        const arrow = dir === 'prev' ? '❮' : '❯';
        if (!targetName) return `<div class="nav-btn-top disabled">${arrow}</div>`;
        return `<a href="${baseUrl}/${targetName}" class="nav-btn-top nav-${dir}" data-link data-target-name="${targetName}">${arrow}</a>`;
    }

    private static renderPlayerInfo(playerItem?: { name: string; level: number; cards: number; cards_need: number }): string {
        if (!playerItem) return '';
        const cardsInfo = playerItem.cards_need !== -1
            ? `<div class="stat-row"><span class="stat-label">${t('player_item_cards')}:</span> <span class="stat-value">${playerItem.cards} / ${playerItem.cards_need}</span></div>`
            : '';
        return `<div class="player-stats-block" data-aos="fade-up">
            <div class="stat-row"><span class="stat-label">${t('player_item_level')}:</span> <span class="stat-value lvl">Lvl ${playerItem.level}</span></div>
            ${cardsInfo}
        </div>`;
    }

    private static renderCostIcon(cost: number): string {
        return `<div class="cost-icon-wrapper">${parseTextWithIcons('Gold')}<span class="cost-value">${cost}</span></div>`;
    }

    private static renderWikiInfo(item: ItemDefinition): string {
        const combatStatsHtml = item.combatStats
            ? Object.entries(item.combatStats)
                .filter(([, v]) => v !== null)
                .map(([k, v]) => `<li>${parseTextWithIcons(`stat_${k}`)} <span>${v}</span></li>`)
                .join('')
            : '';

        const desc = item.tooltips?.length ? parseTextWithIcons(item.tooltips.join('\\n')) : '';

        return `<div class="wiki-stats-block" data-aos="fade-up" data-aos-delay="100">
            ${desc ? `<div class="item-description">${desc}</div>` : ''}
            ${combatStatsHtml ? `<div class="combat-stats"><ul>${combatStatsHtml}</ul></div>` : ''}
        </div>`;
    }
}
