import { PageMeta } from '@roots/Branch';
import { ItemDetailData, NavigationState, ItemDefinition } from '../utils/item-detail-types';
import { SlugService } from '@utils/SlugService';
import { parseTextWithIcons, generateIconsOrText } from '@utils/icon-parser';
import { LoadingStates } from '@utils/LoadingStates';
import { t } from '@i18n';
import { ItemDetailParts } from './ItemDetailParts';
import { ItemGridRenderer } from './ItemGridRenderer';

export class ItemDetailRenderer {

    static getMeta(data?: any): PageMeta {
        let itemName: string;
        if (typeof data?.itemData?.name === 'string') {
            itemName = data.itemData.name;
        } else if (typeof data?.name === 'string') {
            itemName = data.name;
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
        return `<div class="id-container">${LoadingStates.createCardSkeleton(1)}</div>`;
    }

    static renderNotFound(): string {
        return `<div class="id-container"><p>${t('wiki_item_info_not_found')}</p></div>`;
    }

    static renderError(): string {
        return `<div class="id-container"><p>${t('error_server_unavailable')}</p></div>`;
    }

    static renderFullPage(data: ItemDetailData, nav: NavigationState): string {
        const item = data.itemData;
        if (!item) return this.renderNotFound();
        const rarity = item.rarity || 'Common';
        const rarityClass = `rarity-${rarity.toLowerCase()}`;
        const isProfile = !!data.playerItem;
        const baseUrl = isProfile ? '/profile/item' : '/items';
        const backUrl = isProfile ? '/profile' : '/items';
        const backTitle = isProfile ? t('sidebar_profile') : t('sidebar_items');
        const tagsHtml = generateIconsOrText(item.itemTypes);

        return `
            <div class="id-container">
                ${this.renderNav(nav, baseUrl, backUrl, backTitle)}
                <div class="id-card ${rarityClass}">
                    ${this.renderTopRow(item, rarity, rarityClass, tagsHtml)}
                    <div class="id-divider"></div>
                    <div class="id-middle-row">
                        <div class="id-left-col">${ItemGridRenderer.render(item)}</div>
                        <div class="id-right-col">${ItemDetailParts.renderStatsList(item)}</div>
                    </div>
                    <div class="id-divider"></div>
                    <div class="id-description">${this.renderDescription(item)}</div>
                    <div class="id-divider"></div>
                    ${ItemDetailParts.renderRecipesButton(item)}
                    ${ItemDetailParts.renderRecipesSection(item)}
                    ${ItemDetailParts.renderPlayerInfo(data.playerItem)}
                </div>
            </div>`;
    }

    private static renderNav(nav: NavigationState, baseUrl: string, backUrl: string, backTitle: string): string {
        return `
            <div class="id-nav">
                <div class="id-nav-group">
                    ${this.renderNavLink(nav.prev, 'prev', baseUrl)}
                    <a href="${backUrl}" class="id-nav-btn back-btn" data-link title="${backTitle}">
                        <span class="icon">☰</span>
                    </a>
                    ${this.renderNavLink(nav.next, 'next', baseUrl)}
                </div>
            </div>`;
    }

    private static renderNavLink(targetName: string | null, dir: 'prev' | 'next', baseUrl: string): string {
        const arrow = dir === 'prev' ? '❮' : '❯';
        const label = dir === 'prev' ? t('item_nav_prev') : t('item_nav_next');
        if (!targetName) {
            return `<button class="id-nav-btn disabled" disabled aria-label="${label}" aria-disabled="true">${arrow}</button>`;
        }
        const targetSlug = SlugService.toSlug(targetName);
        return `<a href="${baseUrl}?item=${targetSlug}" class="id-nav-btn nav-${dir}" data-link data-target-name="${targetName}" aria-label="${label}: ${targetName}">${arrow}</a>`;
    }

    private static renderTopRow(item: ItemDefinition, rarity: string, rarityClass: string, tagsHtml: string): string {
        const heroHtml = item.connectedHero
            ? `<div class="id-hero">${parseTextWithIcons(item.connectedHero)}</div>`
            : '<div class="id-hero id-hero-empty"></div>';
        return `
            <div class="id-top-row">
                <div class="id-top-left">${heroHtml}</div>
                <div class="id-top-right">
                    <div class="id-title-wrap">
                        <h1 class="id-title">${item.name}</h1>
                        <span class="id-rarity ${rarityClass}">${rarity}</span>
                    </div>
                    ${tagsHtml ? `<div class="id-tags">${tagsHtml}</div>` : ''}
                </div>
            </div>`;
    }

    private static renderDescription(item: ItemDefinition): string {
        const desc = item.tooltips?.length ? parseTextWithIcons(item.tooltips.join(String.raw`\n`)) : '';
        return desc || '';
    }
}
