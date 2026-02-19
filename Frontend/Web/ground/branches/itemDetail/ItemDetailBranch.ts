import {Branch, PageMeta} from '@roots/Branch.ts';
import {t} from '../../localization/i18n';
import {ItemDefinition} from '../items/ItemsBranch';
import {parseTextWithIcons, generateIconsOrText} from '../../utils/icon-parser';
import './itemDetail.scss';

interface ItemDetailData {
    name?: string;
    playerItem?: {
        name: string; // Добавлено для типизации
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
        let orderRaw: string | null;
        let isProfileContext = false;

        // Определяем контекст: Профиль или Вики
        if (this.data.playerItem) {
            orderRaw = sessionStorage.getItem('profileItemsList');
            isProfileContext = true;
        } else {
            orderRaw = sessionStorage.getItem('filteredItemsOrder');
        }

        if (!orderRaw) return;

        let order: string[] = [];
        
        if (isProfileContext) {
            // В профиле хранится массив объектов, нам нужны имена
            try {
                const itemsList = JSON.parse(orderRaw);
                order = itemsList.map((i: any) => i.name);
            } catch (e) {
                console.error("Error parsing profile items list", e);
                return;
            }
        } else {
            // В вики хранится массив строк
            order = JSON.parse(orderRaw);
        }

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

    // Хелпер для нормализации имен (slugify)
    private toSlug(name: string): string {
        return name.toLowerCase().split(' ').join('-');
    }

    protected getHtml(data?: any): string {
        this.data = data || {};

        if (data?.scrollY !== undefined && this.listScrollY === 0) {
            this.listScrollY = data.scrollY;
        }

        // 1. Определяем "сырое" имя из URL или данных
        // Это может быть как "Bag of Stones" (из данных), так и "bag-of-stones" (из URL)
        let rawName = this.data.name;
        if (!rawName && this.data.playerItem) {
            rawName = this.data.playerItem.name;
        }
        if (!rawName) {
            rawName = decodeURIComponent(window.location.pathname.split('/').pop() || '');
        }
        
        // Нормализуем для поиска (slug)
        const searchSlug = this.toSlug(rawName || '');

        // 2. Проверяем контекст URL
        const isProfileUrl = window.location.pathname.startsWith('/profile/item/');
        
        // Если мы в контексте профиля, но нет playerItem, пытаемся найти его в кэше
        if (isProfileUrl && !this.data.playerItem) {
            const profileListRaw = sessionStorage.getItem('profileItemsList');
            if (profileListRaw) {
                try {
                    const profileList = JSON.parse(profileListRaw);
                    // Ищем по slug, так как в URL slug
                    const foundPlayerItem = profileList.find((i: any) => this.toSlug(i.name) === searchSlug);
                    if (foundPlayerItem) {
                        this.data.playerItem = foundPlayerItem;
                        // Обновляем имя на "красивое" из данных игрока
                        this.data.name = foundPlayerItem.name;
                    }
                } catch (e) {
                    console.error("Error restoring player item from cache", e);
                }
            }
        }

        // 3. Пытаемся найти статические данные предмета
        if (!this.data.itemData) {
            const allItemsRaw = sessionStorage.getItem('allItems');
            if (allItemsRaw) {
                const allItems: ItemDefinition[] = JSON.parse(allItemsRaw);
                // Ищем по slug
                const foundItem = allItems.find(i => this.toSlug(i.name) === searchSlug);
                if (foundItem) {
                    this.data.itemData = foundItem;
                    // Если имя еще не установлено (пришли из URL), берем красивое имя из статики
                    if (!this.data.name || this.data.name === rawName) {
                        this.data.name = foundItem.name;
                    }
                }
            }
        }

        const item = this.data.itemData;
        if (!item) {
            return `<div class="container"><p>${t('wiki_item_info_not_found')}</p></div>`;
        }

        // Рассчитываем навигацию
        this.calculateNavigation(item.name);

        const rarity = item.rarity || 'Common';
        const rarityClass = `rarity-${rarity.toLowerCase()}`;
        const itemTypesHtml = generateIconsOrText(item.itemTypes);
        
        // Определяем базовый URL для ссылок (профиль или вики)
        const isProfile = !!this.data.playerItem;
        const baseUrl = isProfile ? '/profile/item' : '/item';
        const backUrl = isProfile ? '/profile' : '/items';
        const backTitle = isProfile ? t('sidebar_main') : t('sidebar_items');

        // Функция для генерации ссылки навигации
        const getNavLink = (targetName: string, direction: 'prev' | 'next') => {
            const slug = this.toSlug(targetName);
            const url = `${baseUrl}/${slug}`;
            // data-target-name хранит оригинальное имя для поиска в массиве
            return `<a href="${url}" class="nav-btn-bottom nav-${direction}" data-link data-target-name="${targetName}">${direction === 'prev' ? '❮' : '❯'}</a>`;
        };
        
        // Форматирование имени файла (тот же slug)
        const imageName = this.toSlug(item.name);

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
                                    <source srcset="/images/items/webp/${imageName}.webp" type="image/webp">
                                    <source srcset="/images/items/avif/${imageName}.avif" type="image/avif">
                                    <img src="/images/items/webp/${imageName}.webp" alt="${item.name}" loading="lazy">
                                </picture>
                            </div>
                        </div>
                        <div class="item-content">
                            ${this.renderPlayerInfo()}
                            ${this.renderWikiInfo(item)}
                        </div>
                    </div>
                    
                    <div class="item-navigation-bottom"> 
                        <div class="nav-group">
                            ${this.navigation.prev
                                ? getNavLink(this.navigation.prev, 'prev')
                                : '<div class="nav-btn-bottom disabled">❮</div>'}
                            
                            <a href="${backUrl}" class="nav-btn-bottom back-btn" data-link title="${backTitle}">
                                <span class="icon">☰</span>
                            </a>
                    
                            ${this.navigation.next
                                ? getNavLink(this.navigation.next, 'next')
                                : '<div class="nav-btn-bottom disabled">❯</div>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    protected init(_data?: any): void {
        // Добавляем логику для передачи данных игрока при навигации "Вперед/Назад" в режиме профиля
        if (this.data.playerItem) {
            const navLinks = this.container?.querySelectorAll('.nav-btn-bottom.nav-prev, .nav-btn-bottom.nav-next');
            navLinks?.forEach(link => {
                link.addEventListener('click', (_e) => {
                    const targetName = (link as HTMLElement).dataset.targetName;
                    if (!targetName) return;

                    // Ищем данные предмета в сохраненном списке профиля
                    const profileListRaw = sessionStorage.getItem('profileItemsList');
                    if (profileListRaw) {
                        try {
                            const profileList = JSON.parse(profileListRaw);
                            const nextItem = profileList.find((i: any) => i.name === targetName);
                            
                            if (nextItem) {
                                // Прикрепляем данные к элементу ссылки, чтобы Gen.ts их подхватил
                                (link as any)._stateData = {
                                    playerItem: nextItem,
                                    name: targetName
                                };
                            }
                        } catch (err) {
                            console.error("Error parsing profile list for navigation", err);
                        }
                    }
                });
            });
        }
    }

    protected destroy(): void {}
}