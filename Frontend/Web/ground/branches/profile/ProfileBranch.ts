import {Branch, PageMeta} from '@roots/Branch.ts';
import {Gen} from '@roots/Gen.ts';
import {t} from '../../localization/i18n';
import {SortController} from './_profile/sort/SortController';
import {LoadingStates} from '../../utils/LoadingStates';
import { ScreenshotManager } from './_profile/managers/screenshot-manager';
import { ProfileData, SavedState, rarityWeights, HeaderRenderer, HeroesSectionRenderer, ItemsSectionRenderer, ItemCardRenderer } from './_profile';
import './profile.scss';
// @ts-ignore
import AOS from 'aos';

export class ProfileBranch extends Branch {
    private data: ProfileData | null = null;
    private currentItemSort: 'rarity' | 'level' = 'rarity'; // По умолчанию по редкости
    private cleanupFns: (() => void)[] = [];
    private sortController: SortController | null = null;
    private screenshotManager: ScreenshotManager | null = null;
    
    // Сохранение состояния для восстановления при возврате
    private savedState: SavedState = {
        scrollY: 0,
        itemSort: 'rarity',
        heroSort: {
            sortBy: 'level',
            inverted: false
        },
        currentSkins: {}
    };

    // Веса редкости для сортировки (импортированы из utils)
    // private rarityWeights уже импортирован из модуля

    public override getMeta(data?: any): PageMeta {
        const d = data as ProfileData;
        // Если данных нет в аргументах, попробуем достать из кэша для мета-тегов
        let metaData = d;
        if (!metaData) {
            try {
                const cached = sessionStorage.getItem('currentProfileData');
                if (cached) metaData = JSON.parse(cached);
            } catch (e) {
            }
        }

        if (metaData) {
            return {
                title: `${metaData.nickname} — Профиль игрока | Backpack Insight`,
                description: `Статистика игрока ${metaData.nickname}: Уровень ${metaData.level}, Трофеи ${metaData.trophy + metaData.bonus_trophy}, Героев ${metaData.heroes_count}.`
            };
        }
        return {
            title: "Профиль игрока | Backpack Insight",
            description: "Детальная статистика профиля Backpack Brawl."
        };
    }

    protected getHtml(data?: any): string {
        // 1. Пытаемся получить данные из аргументов
        let incomingData = data as ProfileData;

        // 2. Если данных нет (например, переход по кнопке "Назад"), ищем в кэше
        if (!incomingData || !incomingData.nickname) {
            const cached = sessionStorage.getItem('currentProfileData');
            if (cached) {
                try {
                    incomingData = JSON.parse(cached);
                } catch (e) {
                    console.error("Failed to parse cached profile data", e);
                }
            }
        }

        // 3. Если данные есть, обновляем кэш (чтобы продлить сессию или обновить данные)
        if (incomingData && incomingData.nickname) {
            sessionStorage.setItem('currentProfileData', JSON.stringify(incomingData));
            this.data = incomingData;
            
            // Восстанавливаем сохраненное состояние
            this.restoreSavedState();
        } else {
            this.data = null;
        }

        if (!this.data) {
            return `<div class="container"><h1 class="error">Нет данных профиля</h1></div>`;
        }

        // Показываем skeleton экран пока рендерим контент
        if (this.container) {
            this.container.innerHTML = `
                <div class="container">
                    ${LoadingStates.createProfileSkeleton()}
                    <div style="margin-top: 24px;">
                        <h3 style="color: rgba(255,255,255,0.8); margin-bottom: 16px;">${t('profile_heroes_title', '0')}</h3>
                        ${LoadingStates.createCardSkeleton(3)}
                    </div>
                    <div style="margin-top: 24px;">
                        <h3 style="color: rgba(255,255,255,0.8); margin-bottom: 16px;">${t('profile_items_title', '0')}</h3>
                        ${LoadingStates.createCardSkeleton(6)}
                    </div>
                </div>
            `;
        }

        // Восстанавливаем состояние сортировки, если оно было сохранено
        if (this.data.itemsSort) {
            this.currentItemSort = this.data.itemsSort;
        } else if (this.savedState.itemSort) {
            this.currentItemSort = this.savedState.itemSort;
        }

        this.sortItems();

        // Используем requestAnimationFrame для плавной замены skeleton на реальный контент
        requestAnimationFrame(() => {
            if (this.container) {
                this.container.innerHTML = `
                    <div class="container" id="profileContainer">
                        ${HeaderRenderer.render(this.data!)}
                        
                        <div class="button-download-profile">
                            <button id="saveProfileBtn">${t('profile_save_card')}</button>
                        </div>

                        ${HeroesSectionRenderer.render(this.data!)}
                        ${ItemsSectionRenderer.render(this.data!, this.currentItemSort)}
                    </div>
                    
                    <script id="skins-data" type="application/json">
                        ${this.data ? JSON.stringify(this.data.profile_skins) : '{}'}
                    </script>
                `;
                
                // Инициализируем обработчики событий после рендера
                this.init();
                
                // Восстанавливаем скролл и другие состояния после инициализации
                setTimeout(() => {
                    this.restoreDynamicState();
                }, 100);
            }
        });

        return ''; // Возвращаем пустую строку, так как контент рендерится асинхронно
    }

    private sortItems() {
        if (!this.data || !this.data.items) return;

        this.data.items.sort((a, b) => {
            if (this.currentItemSort === 'rarity') {
                const weightA = rarityWeights[a.rarity] || 0;
                const weightB = rarityWeights[b.rarity] || 0;
                if (weightA !== weightB) return weightB - weightA; // Сначала редкие
            }

            // Сортировка по уровню (используется как основной или вторичный критерий)
            if (a.level !== b.level) return b.level - a.level;

            // Сортировка по опыту (картам) при равном уровне
            const progressA = a.cards_need > 0 ? a.cards / a.cards_need : 0;
            const progressB = b.cards_need > 0 ? b.cards / b.cards_need : 0;
            if (progressA !== progressB) return progressB - progressA;

            // Если и уровень, и опыт равны, сортируем по редкости (если еще не отсортировали)
            if (this.currentItemSort !== 'rarity') {
                const weightA = rarityWeights[a.rarity] || 0;
                const weightB = rarityWeights[b.rarity] || 0;
                if (weightA !== weightB) return weightB - weightA;
            }

            return a.name.localeCompare(b.name); // В конце всегда по алфавиту
        });

        // --- ВАЖНО: Сохраняем отсортированный список для навигации в ItemDetail ---
        sessionStorage.setItem('profileItemsList', JSON.stringify(this.data.items));
    }

    // Метод formatRating перенесен в hero-card.ts и hero-stats.ts
    // Логика теперь доступна в модулях героев

    // Метод _renderHeader заменен на HeaderRenderer.render()
    // Логика перенесена в модуль header/header.ts

    // Метод _renderHeroCard заменен на HeroCardRenderer.render()
    // Логика перенесена в модуль heroes/hero-card.ts

    // Метод _renderItemCard заменен на ItemCardRenderer.render()
    // Логика перенесена в модуль items/item-card.ts

    // Метод _renderHeroes заменен на HeroesSectionRenderer.render()
    // Логика перенесена в модуль heroes/heroes-section.ts

    // Метод _renderItems заменен на ItemsSectionRenderer.render()
    // Логика перенесена в модуль items/items-section.ts

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        if (element) {
            element.addEventListener(event, handler, options);
            this.cleanupFns.push(() => element.removeEventListener(event, handler, options));
        }
    }

    protected init(_data?: any): void {
        if (!this.container) return;

        // 0. Обработка ошибок картинок
        this.addListener(this.container, 'error', (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'SOURCE') return;
            if (target.tagName === 'IMG' && target.dataset['fallback']) {
                const img = target as HTMLImageElement;
                if (img.dataset['failed'] === 'true') return;
                img.dataset['failed'] = 'true';
                const placeholder = '/images/placeholder/placeholder.webp';
                const picture = img.parentElement;
                if (picture && picture.tagName === 'PICTURE') {
                    const sources = picture.querySelectorAll('source');
                    sources.forEach(s => {
                        s.srcset = placeholder;
                        s.type = 'image/webp';
                    });
                }
                img.src = placeholder;
                img.parentElement?.classList.add('no-image');
            }
        }, true);


        // 1. Простая логика отображения предметов с lazy loading
        // Ничего дополнительно не нужно - loading="lazy" в HTML обеспечит подгрузку

        // 2. Сортировка Героев
        if (this.container) {
            this.sortController = new SortController(this.container);
            this.cleanupFns.push(() => {
                if (this.sortController) {
                    this.sortController.destroy();
                    this.sortController = null;
                }
            });
        }

        // 3. Сортировка Предметов
        const itemSortBtn = this.container.querySelector('#itemSortToggle');
        if (itemSortBtn) {
            this.addListener(itemSortBtn, 'click', () => {
                this.currentItemSort = this.currentItemSort === 'rarity' ? 'level' : 'rarity';

                // Сохраняем состояние
                Gen.getInstance().updateCurrentState({itemsSort: this.currentItemSort});

                // Перерисовываем (простой способ - перезагрузить ветвь с новыми данными)
                // Но лучше просто обновить HTML грида
                this.sortItems();
                const grid = this.container?.querySelector('#profileItemsGrid');
                if (grid && this.data) {
                    grid.innerHTML = this.data.items.map((item, index) => ItemCardRenderer.render(item, index)).join('');
                    // Обновляем текст кнопки
                    const text = this.container?.querySelector('#itemSortText');
                    if (text) text.textContent = this.currentItemSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_level');

                    setTimeout(() => AOS.refresh(), 100);
                }
            });
        }

        // 6. Сохранение состояния при перезагрузке страницы
        window.addEventListener('beforeunload', () => {
            this.saveCurrentState();
        });
        this.cleanupFns.push(() => {
            window.removeEventListener('beforeunload', () => {
                this.saveCurrentState();
            });
        });

        // 7. Восстановление из localStorage если sessionStorage пуст (для перезагрузки)
        if (!sessionStorage.getItem('profileDynamicState')) {
            this.restoreFromLocalStorage();
        }

        // 3. Скины
        this.initSkins();

        // 4. Скриншот
        this.screenshotManager = new ScreenshotManager(this.container, t);
        this.screenshotManager.init();

        // 5. Передача данных предмета при клике
        const itemLinks = this.container.querySelectorAll('.item-card-link');
        itemLinks.forEach(link => {
            const card = link.querySelector('.item-card');
            if (card) {
                const name = card.querySelector('.item-name')?.textContent;
                const itemData = this.data?.items.find(i => i.name === name);
                if (itemData) {
                    (link as any)._stateData = {
                        playerItem: itemData
                    };
                }
            }
            
            // Добавляем сохранение состояния при клике на предмет
            this.addListener(link, 'click', () => {
                this.saveCurrentState();
            });
        });
    }


    private initSkins(): void {
        const skinsDataEl = document.getElementById('skins-data');
        if (!skinsDataEl || !skinsDataEl.textContent) return;

        let rawSkinsMap: Record<string, string[]> = {};
        try {
            rawSkinsMap = JSON.parse(skinsDataEl.textContent);
        } catch (e) {
            console.error("Error parsing skins", e);
            return;
        }

        // Приводим все ключи карты скинов к нижнему регистру для надежного сопоставления
        const skinsMap: Record<string, string[]> = {};
        for (const key in rawSkinsMap) {
            const value = rawSkinsMap[key];
            if (value) {
                skinsMap[key.toLowerCase()] = value;
            }
        }

        const cards = this.container?.querySelectorAll('.main-hero-card');
        cards?.forEach(card => {
            const heroName = (card as HTMLElement).dataset['heroName']?.toLowerCase();
            if (!heroName) return;
            const availableSkins = ['01', ...(skinsMap[heroName] || [])];
            const uniqueSkins = Array.from(new Set(availableSkins)).sort((a, b) => a.localeCompare(b));

            if (uniqueSkins.length <= 1) {
                card.querySelectorAll('.skin-btn').forEach(b => (b as HTMLElement).style.display = 'none');
                return;
            }

            let currentSkinIdx = 0;
            const imgContainer = card.querySelector('.main-hero-image');
            const img = imgContainer?.querySelector('img') as HTMLImageElement;

            const updateSkin = () => {
                const skin = uniqueSkins[currentSkinIdx];
                const baseSrc = `/images/heroes/${heroName}`;

                if (img) {
                    const picture = img.parentElement;
                    img.style.opacity = '0';
                    setTimeout(() => {
                        const webp = `${baseSrc}/webp/${heroName}${skin}.webp`;
                        const avif = `${baseSrc}/avif/${heroName}${skin}.avif`;

                        img.src = webp;
                        if (picture) {
                            const sources = picture.querySelectorAll('source');
                            sources.forEach(s => {
                                if (s.type === 'image/webp') s.srcset = webp;
                                if (s.type === 'image/avif') s.srcset = avif;
                            });
                        }
                        requestAnimationFrame(() => {
                            img.style.opacity = '1';
                        });
                    }, 200);
                }

                (card as HTMLElement).dataset['currentSkin'] = skin;
                this.updateHeaderSkin(heroName || '', skin || '');
            };

            const prevBtn = card.querySelector('.prev-skin');
            const nextBtn = card.querySelector('.next-skin');

            this.addListener(prevBtn, 'click', (e: Event) => {
                e.stopPropagation();
                currentSkinIdx = (currentSkinIdx - 1 + uniqueSkins.length) % uniqueSkins.length;
                updateSkin();
            });

            this.addListener(nextBtn, 'click', (e: Event) => {
                e.stopPropagation();
                currentSkinIdx = (currentSkinIdx + 1) % uniqueSkins.length;
                updateSkin();
            });
        });
    }

    private updateHeaderSkin(heroName: string, skin: string): void {
        // Приводим к нижнему регистру для использования в путях и селекторах
        const lowerHero = heroName.toLowerCase();
        const lowerSkin = skin.toLowerCase();

        // Используем lowerHero в селекторе, так как в HTML data-атрибуты обычно в нижнем регистре
        const headerCard = this.container?.querySelector(`.stat-hero-card[data-hero-name="${lowerHero}"]`);
        if (!headerCard) return;

        const imgWrapper = headerCard.querySelector('.stat-hero-image-wrapper');
        const img = imgWrapper?.querySelector('img');
        const sources = imgWrapper?.querySelectorAll('source');

        // Формируем пути с использованием приведенных к нижнему регистру строк
        const webp = `/images/heroes/${lowerHero}/webp/${lowerHero}${lowerSkin}.webp`;
        const avif = `/images/heroes/${lowerHero}/avif/${lowerHero}${lowerSkin}.avif`;

        if (img) {
            img.src = webp;
            sources?.forEach(s => {
                if (s.type === 'image/avif') s.srcset = avif;
                if (s.type === 'image/webp') s.srcset = webp;
            });
        }
    }

    // Старый метод takeScreenshot заменен на ScreenshotManager
    // private async takeScreenshot() { ... }

    /**
     * Сохранение текущего динамического состояния
     */
    private saveCurrentState(): void {
        if (!this.container) return;

        // Сохраняем позицию скролла
        this.savedState.scrollY = window.scrollY;

        // Сохраняем состояние предметов
        this.savedState.itemSort = this.currentItemSort;

        // Сохраняем состояние сортировки героев
        if (this.sortController) {
            this.savedState.heroSort = {
                sortBy: this.sortController.getCurrentSort(),
                inverted: this.sortController.isInverted()
            };
        }

        // Сохраняем текущие скины героев
        this.savedState.currentSkins = {};
        const heroCards = this.container.querySelectorAll('.main-hero-card');
        heroCards.forEach(card => {
            const heroName = (card as HTMLElement).dataset['heroName'];
            const currentSkin = (card as HTMLElement).dataset['currentSkin'];
            if (heroName && currentSkin) {
                this.savedState.currentSkins[heroName] = currentSkin;
            }
        });

        // Сохраняем в оба хранилища
        const stateJson = JSON.stringify(this.savedState);
        sessionStorage.setItem('profileDynamicState', stateJson);
        localStorage.setItem('profileDynamicState', stateJson);
    }

    /**
     * Восстановление сохраненного состояния из sessionStorage
     */
    private restoreSavedState(): void {
        try {
            const saved = sessionStorage.getItem('profileDynamicState');
            if (saved) {
                this.savedState = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error restoring saved state:', e);
            // Используем значения по умолчанию
            this.savedState = {
                scrollY: 0,
                itemSort: 'rarity',
                heroSort: {
                    sortBy: 'level',
                    inverted: false
                },
                currentSkins: {}
            };
        }
    }

    /**
     * Восстановление состояния из localStorage (для перезагрузки страницы)
     */
    private restoreFromLocalStorage(): void {
        try {
            const saved = localStorage.getItem('profileDynamicState');
            if (saved) {
                this.savedState = JSON.parse(saved);
                // Копируем в sessionStorage для дальнейшего использования
                sessionStorage.setItem('profileDynamicState', saved);
                console.log('State restored from localStorage after page reload');
            }
        } catch (e) {
            console.error('Error restoring state from localStorage:', e);
            // Используем значения по умолчанию
            this.savedState = {
                scrollY: 0,
                itemSort: 'rarity',
                heroSort: {
                    sortBy: 'level',
                    inverted: false
                },
                currentSkins: {}
            };
        }
    }

    /**
     * Восстановление динамического состояния после рендера
     */
    private restoreDynamicState(): void {
        if (!this.container) return;

        // Восстанавливаем скролл
        if (this.savedState.scrollY > 0) {
            window.scrollTo(0, this.savedState.scrollY);
        }

        // Восстанавливаем сортировку предметов
        if (this.savedState.itemSort !== this.currentItemSort) {
            this.currentItemSort = this.savedState.itemSort;
            this.sortItems();
            const grid = this.container.querySelector('#profileItemsGrid');
            if (grid && this.data) {
                grid.innerHTML = this.data.items.map((item, index) => ItemCardRenderer.render(item, index)).join('');
                const text = this.container.querySelector('#itemSortText');
                if (text) {
                    text.textContent = this.currentItemSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_level');
                }
            }
        }

        // Восстанавливаем сортировку героев
        if (this.sortController && this.savedState.heroSort.sortBy) {
            // Применяем сохраненную сортировку
            const sortBtn = this.container.querySelector('#sortToggle') as HTMLButtonElement;
            const invertBtn = this.container.querySelector('#invertToggle') as HTMLButtonElement;
            
            if (sortBtn) {
                sortBtn.dataset['sort'] = this.savedState.heroSort.sortBy;
                const icon = sortBtn.querySelector('#sortIcon') as HTMLImageElement;
                const text = sortBtn.querySelector('#sortText') as HTMLSpanElement;
                
                if (icon && text) {
                    if (this.savedState.heroSort.sortBy === 'rating') {
                        icon.src = '/images/profile/webp/rating.webp';
                        text.textContent = t('profile_sort_rating');
                    } else {
                        icon.src = '/images/profile/webp/level.webp';
                        text.textContent = t('profile_sort_level');
                    }
                }
            }

            if (invertBtn && this.savedState.heroSort.inverted) {
                invertBtn.classList.add('inverted');
                const icon = invertBtn.querySelector('#invertIcon') as HTMLImageElement;
                if (icon) {
                    icon.src = '/images/profile/webp/sortup.webp';
                }
            }

            // Пересортировываем героев
            this.sortController.applySortWithParams(this.savedState.heroSort.sortBy, this.savedState.heroSort.inverted);
        }

        // Восстанавливаем скины героев
        setTimeout(() => {
            this.restoreSkins();
        }, 200);
    }

    /**
     * Восстановление скинов героев
     */
    private restoreSkins(): void {
        if (!this.container) return;

        Object.entries(this.savedState.currentSkins).forEach(([heroName, skin]) => {
            // Находим карточку героя
            const heroCard = this.container?.querySelector(`.main-hero-card[data-hero-name="${heroName}"]`);
            if (!heroCard) return;

            // Находим все доступные скины для этого героя
            const skinsDataEl = document.getElementById('skins-data');
            if (!skinsDataEl?.textContent) return;

            try {
                const rawSkinsMap = JSON.parse(skinsDataEl.textContent);
                const skinsMap: Record<string, string[]> = {};
                for (const key in rawSkinsMap) {
                    skinsMap[key.toLowerCase()] = rawSkinsMap[key];
                }

                const availableSkins = ['01', ...(skinsMap[heroName.toLowerCase()] || [])];
                const uniqueSkins = Array.from(new Set(availableSkins)).sort((a, b) => a.localeCompare(b));
                
                const skinIndex = uniqueSkins.indexOf(skin);
                if (skinIndex !== -1) {
                    // Устанавливаем нужный скин
                    const imgContainer = heroCard.querySelector('.main-hero-image');
                    const img = imgContainer?.querySelector('img') as HTMLImageElement;
                    
                    if (img) {
                        const lowerHero = heroName.toLowerCase();
                        const webp = `/images/heroes/${lowerHero}/webp/${lowerHero}${skin}.webp`;
                        const avif = `/images/heroes/${lowerHero}/avif/${lowerHero}${skin}.avif`;
                        const picture = img.parentElement;

                        img.src = webp;
                        if (picture) {
                            const sources = picture.querySelectorAll('source');
                            sources.forEach(s => {
                                if (s.type === 'image/webp') s.srcset = webp;
                                if (s.type === 'image/avif') s.srcset = avif;
                            });
                        }
                        
                        (heroCard as HTMLElement).dataset['currentSkin'] = skin;
                        this.updateHeaderSkin(heroName, skin);
                    }
                }
            } catch (e) {
                console.error('Error restoring skin for hero:', heroName, e);
            }
        });
    }

    /**
     * Переопределение метода destroy для сохранения состояния
     */
    public destroy(): void {
        // Сохраняем состояние перед уничтожением
        this.saveCurrentState();
        
        // Очищаем ресурсы
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
        
        // Очищаем ScreenshotManager
        this.screenshotManager?.destroy();
        this.screenshotManager = null;
    }

    /**
     * Очистка состояния при явном выходе из профиля
     */
    public clearState(): void {
        localStorage.removeItem('profileDynamicState');
        sessionStorage.removeItem('profileDynamicState');
    }
}