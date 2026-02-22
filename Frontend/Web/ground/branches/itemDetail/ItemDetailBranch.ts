import {Branch, PageMeta} from '@roots/Branch.ts';
import {t} from '../../localization/i18n';
import {ItemDefinition} from '../items/ItemsBranch';
import {parseTextWithIcons, generateIconsOrText} from '../../utils/icon-parser';
import {LoadingStates} from '../../utils/LoadingStates';
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
    private cleanupFns: (() => void)[] = [];

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

    private renderHeroIcon(heroName: string): string {
        return parseTextWithIcons(heroName);
    }

    private renderCostIcon(cost: number): string {
        return `
            <div class="cost-icon-wrapper">
                ${parseTextWithIcons('Gold')}
                <span class="cost-value">${cost}</span>
            </div>
        `;
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

        return `
            <div class="wiki-stats-block" data-aos="fade-up" data-aos-delay="100">
                ${descriptionHtml ? `<div class="item-description">${descriptionHtml}</div>` : ''}
                ${combatStatsHtml ? `<div class="combat-stats"><ul>${combatStatsHtml}</ul></div>` : ''}
            </div>
        `;
    }

    // Хелпер для нормализации имен (slugify)
    private toSlug(name: string): string {
        return name.toLowerCase().split(' ').join('-');
    }

    private getItemImagePath(item: ItemDefinition): string {
        // Проверяем условие для Special предметов с тултипом "Step {римское число}"
        if (item.rarity === 'Special' && item.tooltips.length > 0) {
            const firstTooltip = item.tooltips[0];
            const stepMatch = firstTooltip.match(/Step\s+([IVXLCDM]+)/);
            
            if (stepMatch) {
                const romanNumeral = stepMatch[1];
                // Конвертируем римское число в арабское
                const arabicNumber = this.romanToArabic(romanNumeral);
                return `heist-plan-${arabicNumber}`;
            }
        }
        
        // Стандартная логика для остальных предметов
        return this.toSlug(item.name);
    }

    private romanToArabic(roman: string): number {
        const romanNumerals: Record<string, number> = {
            'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
            'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
            'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
            'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20
        };
        return romanNumerals[roman] || 1;
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

        // Показываем skeleton пока загружаются данные
        if (this.container) {
            this.container.innerHTML = `
                <div class="container item-detail-container">
                    ${LoadingStates.createCardSkeleton(1)}
                    <div style="margin-top: 24px;">
                        ${LoadingStates.createCardSkeleton(3)}
                    </div>
                </div>
            `;
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
            return `<a href="${url}" class="nav-btn-top nav-${direction}" data-link data-target-name="${targetName}">${direction === 'prev' ? '❮' : '❯'}</a>`;
        };
        
        // Форматирование имени файла (тот же slug)
        const imageName = this.getItemImagePath(item);

        // Используем requestAnimationFrame для плавной замены skeleton на реальный контент
        requestAnimationFrame(() => {
            if (this.container) {
                this.container.innerHTML = `
                    <div class="container item-detail-container">
                        <div class="navigation-anchor" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 35rem;">
                            
                            <div class="item-navigation-top"> 
                                <div class="nav-group">
                                    ${this.navigation.prev
                                        ? getNavLink(this.navigation.prev, 'prev')
                                        : '<div class="nav-btn-top disabled">❮</div>'}
                                    
                                    <a href="${backUrl}" class="nav-btn-top back-btn" data-link title="${backTitle}">
                                        <span class="icon">☰</span>
                                    </a>
                            
                                    ${this.navigation.next
                                        ? getNavLink(this.navigation.next, 'next')
                                        : '<div class="nav-btn-top disabled">❯</div>'}
                                </div>
                            </div>
                            
                            <div class="item-card-wrapper">
                                <h1 class="item-title">${item.name}</h1>
                                <div class="item-header">
                                    <div class="item-header-left">
                                        ${item.connectedHero ? `<div class="item-hero-icon">${this.renderHeroIcon(item.connectedHero)}</div>` : ''}
                                        ${item.coinValue ? this.renderCostIcon(item.coinValue) : ''}
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
                                            <img src="/images/items/webp/${imageName}.webp" alt="${item.name}" loading="lazy">
                                        </picture>
                                    </div>
                                </div>
                                ${this.renderPlayerInfo()}
                                ${this.renderWikiInfo(item)}
                            </div>
                        </div>
                    </div>
                `;
                
                // Инициализируем обработчики событий после рендера
                this.init();
            }
        });

        return ''; // Возвращаем пустую строку, так как контент рендерится асинхронно
    }

    private updateSEO(item: ItemDefinition): void {
        const itemName = item.name;
        const itemDescription = item.tooltips ? item.tooltips.join(' ').substring(0, 160) : `${itemName} - предмет из игры Backpack Brawl`;
        const itemImage = `/images/items/webp/${this.getItemImagePath(item)}.webp`;
        const currentUrl = window.location.href;
        const isProfile = !!this.data.playerItem;
        
        // Обновляем базовые мета-теги
        document.title = `${itemName} - Backpack Insight | ${isProfile ? 'Профиль' : 'Предметы'} Backpack Brawl`;
        
        // Обновляем description
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) {
            descMeta.setAttribute('content', itemDescription);
        }
        
        // Обновляем keywords
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (keywordsMeta) {
            const keywords = `${itemName}, Backpack Brawl, ${isProfile ? 'профиль, предмет игрока' : 'предмет, вики'}, ${item.rarity}, ${item.itemTypes?.join(', ') || ''}, игра, аналитика`;
            keywordsMeta.setAttribute('content', keywords);
        }
        
        // Обновляем Open Graph теги
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', `${itemName} - Backpack Insight`);
        }
        
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            ogDesc.setAttribute('content', itemDescription);
        }
        
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
            ogImage.setAttribute('content', `https://backpackinsight.pages.dev${itemImage}`);
        }
        
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
            ogUrl.setAttribute('content', currentUrl);
        }
        
        // Обновляем canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', currentUrl);
        }
        
        // Обновляем hreflang
        const hreflangRu = document.querySelector('link[rel="alternate"][hreflang="ru"]');
        if (hreflangRu) {
            hreflangRu.setAttribute('href', currentUrl);
        }
        
        const hreflangEn = document.querySelector('link[rel="alternate"][hreflang="en"]');
        if (hreflangEn) {
            const englishUrl = currentUrl.replace('/item/', '/en/item/').replace('/profile/item/', '/profile/en/item/');
            hreflangEn.setAttribute('href', englishUrl);
        }
        
        // Обновляем JSON-LD структурированные данные
        this.updateStructuredData(item, currentUrl);
    }
    
    private updateStructuredData(item: ItemDefinition, currentUrl: string): void {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Thing",
            "name": item.name,
            "description": item.tooltips ? item.tooltips.join(' ') : `${item.name} - предмет из игры Backpack Brawl`,
            "image": `https://backpackinsight.pages.dev/images/items/webp/${this.getItemImagePath(item)}.webp`,
            "identifier": item.id,
            "category": item.itemTypes?.join(', ') || 'Предмет',
            "brand": {
                "@type": "Organization",
                "name": "Backpack Brawl"
            },
            "additionalProperty": [
                {
                    "@type": "PropertyValue",
                    "name": "Редкость",
                    "value": item.rarity
                },
                {
                    "@type": "PropertyValue", 
                    "name": "Стоимость в игре",
                    "value": item.coinValue ? `${item.coinValue} золота` : "Недоступно"
                },
                {
                    "@type": "PropertyValue",
                    "name": "Тип предмета",
                    "value": item.itemTypes?.join(', ') || 'Неизвестно'
                }
            ],
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": currentUrl,
                "name": `${item.name} - Backpack Insight`,
                "description": item.tooltips ? item.tooltips.join(' ') : `Подробная информация о предмете ${item.name} из игры Backpack Brawl`,
                "url": currentUrl
            }
        };
        
        // Находим или создаем JSON-LD скрипт
        let jsonLdScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
        if (!jsonLdScript) {
            jsonLdScript = document.createElement('script') as HTMLScriptElement;
            jsonLdScript.type = 'application/ld+json';
            document.head.appendChild(jsonLdScript);
        }
        
        jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
    }

    protected init(): void {
        // Логирование всех данных о предмете в консоль
        this.logItemDetails();

        // Обработчик копирования для замены изображений на их alt-текст
        this.setupCopyHandler();

        // Обновляем SEO мета-теги
        if (this.data.itemData) {
            this.updateSEO(this.data.itemData);
        }

        // Добавляем логику для передачи данных игрока при навигации "Вперед/Назад" в режиме профиля
        if (this.data.playerItem) {
                            const navLinks = this.container?.querySelectorAll('.nav-btn-top.nav-prev, .nav-btn-top.nav-next');
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

    private logItemDetails(): void {
        const item = this.data.itemData;
        const playerItem = this.data.playerItem;

        console.group('📦 Детальная информация о предмете');
        
        if (!item) {
            console.warn('❌ ItemDefinition не найдено');
            console.groupEnd();
            return;
        }

        // Основная информация
        console.group('📋 Основная информация');
        console.log('ID:', item.id);
        console.log('Название:', item.name);
        console.log('Редкость:', item.rarity);
        console.log('Стоимость:', item.coinValue ?? 'не указана');
        console.log('Покупаемый:', item.purchasable);
        console.groupEnd();

        // Классификация
        console.group('🏷️ Классификация');
        console.log('Типы предмета:', item.itemTypes);
        console.log('Связанный герой:', item.connectedHero || 'нет');
        console.log('Источник разблокировки:', item.unlockSource || 'не указан');
        console.groupEnd();

        // Геометрия
        console.group('📐 Геометрия');
        console.log('Форма предмета:', item.itemShape);
        console.log('Звезды предмета:', item.itemStars);
        console.groupEnd();

        // Крафт
        console.group('🔨 Крафт');
        console.log('Рецепты:', item.recipes);
        console.groupEnd();

        // Боевая статистика
        console.group('⚔️ Боевая статистика');
        if (item.combatStats) {
            console.log('Минимальный урон:', item.combatStats.damageMin ?? 'нет');
            console.log('Максимальный урон:', item.combatStats.damageMax ?? 'нет');
            console.log('Точность:', item.combatStats.accuracy ?? 'нет');
            console.log('Стоимость выносливости:', item.combatStats.staminaCost ?? 'нет');
            console.log('Перезарядка:', item.combatStats.cooldown ?? 'нет');
            console.log('Шанс крита:', item.combatStats.criticalChance ?? 'нет');
            console.log('Урон крита:', item.combatStats.criticalDamage ?? 'нет');
        } else {
            console.log('Боевая статистика отсутствует');
        }
        console.groupEnd();

        // Описание
        console.group('📝 Описание');
        console.log('Подсказки:', item.tooltips);
        console.groupEnd();

        // Дополнительная статистика
        console.group('📊 Дополнительная статистика');
        console.log('Все статистики:', item.allStats);
        console.groupEnd();

        // Информация об уровнях
        console.group('📈 Информация об уровнях');
        if (item.levels) {
            console.log('Максимальный уровень:', item.levels.maxLevel);
            console.log('Шанс за уровень:', item.levels.chancePerLevel ?? 'нет');
            console.log('Базовый шанс:', item.levels.baseChance ?? 'нет');
            console.log('Бонус за брейкпоинт:', item.levels.chanceBreakpointBonus ?? 'нет');
            console.log('Описание способности:', item.levels.abilityDescription ?? 'нет');
            console.log('Изменения по уровням:', item.levels.changes);
        } else {
            console.log('Информация об уровнях отсутствует');
        }
        console.groupEnd();

        // Данные игрока (если есть)
        if (playerItem) {
            console.group('🎮 Данные игрока');
            console.log('Название:', playerItem.name);
            console.log('Уровень:', playerItem.level);
            console.log('Карты:', playerItem.cards);
            console.log('Карт нужно:', playerItem.cards_need === -1 ? 'максимальный уровень' : playerItem.cards_need);
            console.groupEnd();
        } else {
            console.log('ℹ️ Данные игрока отсутствуют (просмотр из вики)');
        }

        // Полный объект для детального изучения
        console.group('🔍 Полные объекты данных');
        console.log('ItemDefinition (полный объект):', item);
        if (playerItem) {
            console.log('PlayerItem (полный объект):', playerItem);
        }
        console.groupEnd();

        console.groupEnd();
    }

    private setupCopyHandler(): void {
        if (!this.container) return;

        const handleCopy = (e: ClipboardEvent) => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const clonedContents = range.cloneContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(clonedContents);

            // Находим все изображения в выделенном фрагменте
            const images = tempDiv.querySelectorAll('img');
            images.forEach((img) => {
                const altText = img.getAttribute('alt') || img.getAttribute('title') || '';
                if (altText) {
                    // Заменяем изображение на текстовый узел с alt-текстом
                    const textNode = document.createTextNode(`[${altText}]`);
                    img.parentNode?.replaceChild(textNode, img);
                }
            });

            // Также обрабатываем picture элементы
            const pictures = tempDiv.querySelectorAll('picture');
            pictures.forEach((picture) => {
                const img = picture.querySelector('img');
                const altText = img?.getAttribute('alt') || img?.getAttribute('title') || '';
                if (altText) {
                    const textNode = document.createTextNode(`[${altText}]`);
                    picture.parentNode?.replaceChild(textNode, picture);
                }
            });

            // Устанавливаем измененный контент в буфер обмена
            const plainText = tempDiv.textContent || '';
            const htmlText = tempDiv.innerHTML || '';
            
            e.clipboardData?.setData('text/plain', plainText);
            e.clipboardData?.setData('text/html', htmlText);
            e.preventDefault();
        };

        this.container.addEventListener('copy', handleCopy);
        this.cleanupFns.push(() => {
            this.container?.removeEventListener('copy', handleCopy);
        });
    }

    protected destroy(): void {
        // При уходе со страницы предмета восстанавливаем скролл в профиле
        this.restoreProfileScroll();
        
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }

    /**
     * Восстановление скролла в профиле при возврате
     */
    private restoreProfileScroll(): void {
        try {
            // Сначала пробуем sessionStorage, затем localStorage
            let savedState = sessionStorage.getItem('profileDynamicState');
            if (!savedState) {
                savedState = localStorage.getItem('profileDynamicState');
            }
            
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.scrollY && state.scrollY > 0) {
                    // Небольшая задержка для гарантии перехода
                    setTimeout(() => {
                        window.scrollTo(0, state.scrollY);
                    }, 50);
                }
            }
        } catch (e) {
            console.error('Error restoring profile scroll:', e);
        }
    }
}