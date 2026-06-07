import { ItemDefinition } from '@branches/items/_items/managers/ItemsStateManager';
import { t } from '../../../../localization/i18n';
import { parseTextWithIcons, generateIconsOrText } from '@utils/icon-parser';
import { ItemsIconService } from '@branches/items/_items/services/ItemsIconService';

export class ItemDetailUI {
    public static renderPlayerInfo(playerItem: any): string {
        if (!playerItem) return '';
        const cardsInfo = playerItem.cards_need !== -1
            ? `<div class="stat-row"><span class="stat-label">${t('player_item_cards')}:</span> <span class="stat-value">${playerItem.cards} / ${playerItem.cards_need}</span></div>`
            : '';
        return `<div class="player-stats-block" data-aos="fade-up"><div class="stat-row"><span class="stat-label">${t('player_item_level')}:</span> <span class="stat-value lvl">Lvl ${playerItem.level}</span></div>${cardsInfo}</div>`;
    }

    public static renderWikiInfo(item: ItemDefinition): string {
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

        return `
            <div class="wiki-stats-block" data-aos="fade-up" data-aos-delay="100">
                ${descriptionHtml ? `<div class="item-description">${descriptionHtml}</div>` : ''}
                ${combatStatsHtml ? `<div class="combat-stats"><ul>${combatStatsHtml}</ul></div>` : ''}
            </div>
        `;
    }

    public static renderFullPage(item: ItemDefinition, playerItem: any, navigation: {prev: string|null, next: string|null}, isProfile: boolean): string {
        const rarity = item.rarity || 'Common';
        const rarityClass = `rarity-${rarity.toLowerCase()}`;
        const itemTypesHtml = generateIconsOrText(item.itemTypes);
        const baseUrl = isProfile ? '/profile/item' : '/item';
        const backUrl = isProfile ? '/profile' : '/items';
        const backTitle = isProfile ? t('sidebar_main') : t('sidebar_items');
        const imageName = ItemsIconService.getItemImagePath(item);

        const getNavLink = (targetName: string, direction: 'prev' | 'next') => {
            const slug = targetName.toLowerCase().split(' ').join('-');
            const url = `${baseUrl}/${slug}`;
            return `<a href="${url}" class="nav-btn-top nav-${direction}" data-link data-target-name="${targetName}">${direction === 'prev' ? '❮' : '❯'}</a>`;
        };

        return `
            <div class="container item-detail-container">
                <div class="navigation-anchor" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 35rem;">
                    <div class="item-navigation-top"> 
                        <div class="nav-group">
                            ${navigation.prev ? getNavLink(navigation.prev, 'prev') : '<div class="nav-btn-top disabled">❮</div>'}
                            <a href="${backUrl}" class="nav-btn-top back-btn" data-link title="${backTitle}"><span class="icon">☰</span></a>
                            ${navigation.next ? getNavLink(navigation.next, 'next') : '<div class="nav-btn-top disabled">❯</div>'}
                        </div>
                    </div>
                    <div class="item-card-wrapper">
                        <h1 class="item-title">${item.name}</h1>
                        <div class="item-header">
                            <div class="item-header-left">
                                ${item.connectedHero ? `<div class="item-hero-icon">${parseTextWithIcons(item.connectedHero)}</div>` : ''}
                                ${item.coinValue ? `<div class="cost-icon-wrapper">${parseTextWithIcons('Gold')}<span class="cost-value">${item.coinValue}</span></div>` : ''}
                            </div>
                            <div class="item-rarity ${rarityClass}">${rarity}</div>
                            <div class="item-header-right">
                                ${itemTypesHtml ? `<div class="item-types-block">${itemTypesHtml}</div>` : ''}
                            </div>
                        </div>
                        <div class="item-visual">
                            <div class="item-image-wrapper ${rarityClass}">
                                <picture>
                                    <source srcset="/images/items/webp/${imageName}.webp" type="image/webp">
                                    <source srcset="/images/items/avif/${imageName}.avif" type="image/avif">
                                    <img src="/images/items/webp/${imageName}.webp" alt="${item.name}" loading="lazy" onerror="window.handleImageError(this)">
                                </picture>
                            </div>
                        </div>
                        ${this.renderPlayerInfo(playerItem)}
                        ${this.renderWikiInfo(item)}
                    </div>
                </div>
            </div>
        `;
    }
}
