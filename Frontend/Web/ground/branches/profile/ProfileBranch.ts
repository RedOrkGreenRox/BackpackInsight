import {Branch, PageMeta} from '@roots/Branch.ts';
import {Gen} from '@roots/Gen.ts';
import {t} from '../../localization/i18n';
import './profile.scss';
// @ts-ignore
import AOS from 'aos';

interface Hero {
    name: string;
    level: number;
    rating: number;
    experience: number;
    exp_req: number;
    prestige: boolean;
    league: string;
    skin_num: string;
}

interface Item {
    name: string;
    rarity: string;
    level: number;
    cards: number;
    cards_need: number;
}

interface ProfileData {
    nickname: string;
    level: number;
    trophy: number;
    bonus_trophy: number;
    gems: number;
    coins: number;
    xp_current: number;
    xp_need: number;
    area: string;
    item_stats: Record<string, number>;
    heroes: Hero[];
    heroes_count: number;
    items: Item[];
    items_count: number;
    actual_version: string;
    install_version: string;
    profile_skins: Record<string, string[]>;

    // Состояние UI
    itemsExpanded?: boolean;
    itemsSort?: 'rarity' | 'level'; // Текущая сортировка предметов
}

export class ProfileBranch extends Branch {
    private data: ProfileData | null = null;
    private currentHeroSort: 'level' | 'rating' = 'level';
    private currentItemSort: 'rarity' | 'level' = 'rarity'; // По умолчанию по редкости
    private sortAsc: boolean = false;
    private cleanupFns: (() => void)[] = [];

    // Веса редкости для сортировки
    private rarityWeights: Record<string, number> = {
        "Unique": 100,
        "Boon": 90,
        "Relic": 80,
        "Mythic": 70,
        "Legendary": 60,
        "Epic": 50,
        "Rare": 40,
        "Common": 30,
        "Special": 20
    };

    public getMeta(data?: any): PageMeta {
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
        } else {
            this.data = null;
        }

        if (!this.data) {
            return `<div class="container"><h1 class="error">Нет данных профиля</h1></div>`;
        }

        // Восстанавливаем состояние сортировки, если оно было сохранено
        if (this.data.itemsSort) {
            this.currentItemSort = this.data.itemsSort;
        }

        this.sortItems();

        return `
            <div class="container" id="profileContainer">
                ${this._renderHeader()}
                
                <div class="button-download-profile">
                    <button id="saveProfileBtn">${t('profile_save_card')}</button>
                </div>

                ${this._renderHeroes()}
                ${this._renderItems()}
            </div>
            
            <script id="skins-data" type="application/json">
                ${JSON.stringify(this.data.profile_skins)}
            </script>
        `;
    }

    private sortItems() {
        if (!this.data || !this.data.items) return;

        this.data.items.sort((a, b) => {
            if (this.currentItemSort === 'rarity') {
                const weightA = this.rarityWeights[a.rarity] || 0;
                const weightB = this.rarityWeights[b.rarity] || 0;
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
                const weightA = this.rarityWeights[a.rarity] || 0;
                const weightB = this.rarityWeights[b.rarity] || 0;
                if (weightA !== weightB) return weightB - weightA;
            }

            return a.name.localeCompare(b.name); // В конце всегда по алфавиту
        });

        // --- ВАЖНО: Сохраняем отсортированный список для навигации в ItemDetail ---
        sessionStorage.setItem('profileItemsList', JSON.stringify(this.data.items));
    }

    private _renderHeader(): string {
        if (!this.data) return '';
        const d = this.data;
        const fmt = (n: number) => n.toLocaleString();
        // Правильная градация редкости
        const rarityOrder = ["Boon", "Relic", "Mythic", "Legendary", "Epic", "Rare", "Common"];

        return `
            <div class="profile-header" data-aos="zoom-in">
                <picture class="header-bg">
                    <source srcset="/images/area/avif/area${d.area}.avif" type="image/avif">
                    <source srcset="/images/area/webp/area${d.area}.webp" type="image/webp">
                    <img src="/images/area/webp/area${d.area}.webp" alt="Background" fetchpriority="high">
                </picture>

                <h4>${d.nickname}</h4>
                
                <div class="stats-grid">
                    <div class="stat-player-card">
                        <picture>
                            <source srcset="/images/profile/avif/level.avif" type="image/avif">
                            <source srcset="/images/profile/webp/level.webp" type="image/webp">
                            <img src="/images/profile/webp/level.webp" alt="Lvl" loading="lazy">
                        </picture>
                        <span class="stat-value">${d.level}</span>
                    </div>
                    <div class="stat-player-card">
                        <picture>
                            <source srcset="/images/profile/avif/xp.avif" type="image/avif">
                            <source srcset="/images/profile/webp/xp.webp" type="image/webp">
                            <img src="/images/profile/webp/xp.webp" alt="XP" loading="lazy">
                        </picture>
                        <span class="stat-value">${fmt(d.xp_current)} / ${fmt(d.xp_need)}</span>
                    </div>
                    <div class="stat-player-card">
                        <picture>
                            <source srcset="/images/profile/avif/trophy.avif" type="image/avif">
                            <source srcset="/images/profile/webp/trophy.webp" type="image/webp">
                            <img src="/images/profile/webp/trophy.webp" alt="Trophy" loading="lazy">
                        </picture>
                        <span class="stat-value">${d.trophy + d.bonus_trophy}</span>
                    </div>
                    <div class="stat-player-card">
                        <picture>
                            <source srcset="/images/profile/avif/gems.avif" type="image/avif">
                            <source srcset="/images/profile/webp/gems.webp" type="image/webp">
                            <img src="/images/profile/webp/gems.webp" alt="Gems" loading="lazy">
                        </picture>
                        <span class="stat-value">${d.gems}</span>
                    </div>
                    <div class="stat-player-card">
                        <picture>
                            <source srcset="/images/profile/avif/coins.avif" type="image/avif">
                            <source srcset="/images/profile/webp/coins.webp" type="image/webp">
                            <img src="/images/profile/webp/coins.webp" alt="Coins" loading="lazy">
                        </picture>
                        <span class="stat-value">${d.coins}</span>
                    </div>
                </div>

                <div class="stats-heroes-wrapper">
                    <div class="stats-heroes-grid" id="statsHeroesGrid">
                        ${d.heroes.map(hero => `
                            <div class="stat-hero-card" 
                                 data-hero-name="${hero.name.toLowerCase()}"
                                 data-level="${hero.level}"
                                 data-rating="${hero.rating}"
                                 data-prestige="${hero.prestige}">
                                <div class="hero-header-row">
                                    <picture class="stat-hero-image-wrapper">
                                        <source srcset="/images/heroes/${hero.name.toLowerCase()}/webp/${hero.name.toLowerCase()}${hero.skin_num}.webp" type="image/webp">
                                        <source srcset="/images/heroes/${hero.name.toLowerCase()}/avif/${hero.name.toLowerCase()}${hero.skin_num}.avif" type="image/avif">
                                        <img class="stat-hero-icon" src="/images/heroes/${hero.name.toLowerCase()}/webp/${hero.name}${hero.skin_num}.webp" alt="${hero.name}" loading="lazy">
                                    </picture>
                                    <div class="stat-hero-level-container">
                                        <picture class="stat-hero-level-frame">
                                            <source srcset="/images/profile/avif/frame_${hero.prestige ? 'prestige' : 'common'}.avif" type="image/avif">
                                            <source srcset="/images/profile/webp/frame_${hero.prestige ? 'prestige' : 'common'}.webp" type="image/webp">
                                            <img src="/images/profile/webp/frame_${hero.prestige ? 'prestige' : 'common'}.webp" alt="level frame" loading="lazy">
                                        </picture>
                                        <span class="stat-hero-level-text">${hero.level}</span>
                                    </div>
                                    <div class="stat-hero-rating-container">
                                        <picture class="stat-hero-league">
                                            <source srcset="/images/profile/avif/rank${hero.league.toLowerCase()}.avif" type="image/avif">
                                            <source srcset="/images/profile/webp/rank${hero.league.toLowerCase()}.webp" type="image/webp">
                                            <img src="/images/profile/webp/Rank${hero.league.toLowerCase()}.webp" alt="rank" loading="lazy">
                                        </picture>
                                        <span class="stat-hero-rating">${hero.rating}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="stats-items-grid">
                    ${rarityOrder.map(rarity => {
            if (d.item_stats[rarity]) {
                return `
                                <div class="rarity-item">
                                    <picture>
                                        <source srcset="/images/profile/avif/card${rarity.toLowerCase()}.avif" type="image/avif">
                                        <source srcset="/images/profile/webp/card${rarity.toLowerCase()}.webp" type="image/webp">
                                        <img class="rarity-icon" src="/images/profile/webp/card${rarity.toLowerCase()}.webp" alt="${rarity.toLowerCase()}" loading="lazy">
                                    </picture>
                                    <span class="rarity-count">${d.item_stats[rarity]}</span>
                                </div>
                            `;
            }
            return '';
        }).join('')}
                </div>

                <div class="actual-version-container">
                    <span class="actual-version">
                        ${d.actual_version}    ${d.install_version}
                    </span>
                </div>
            </div>
        `;
    }

    private _renderHeroCard(hero: Hero): string {
        const fmt = (n: number) => n.toLocaleString();
        return `
            <div class="main-hero-card" data-aos="fade-up"
                 data-level="${hero.level}"
                 data-rating="${hero.rating}"
                 data-prestige="${hero.prestige}"
                 data-hero-name="${hero.name.toLowerCase()}"
                 data-current-skin="01">

                <button class="skin-btn prev-skin"></button>
                <button class="skin-btn next-skin"></button>

                <div class="main-hero-image">
                    <picture>
                        <source srcset="/images/heroes/${hero.name.toLowerCase()}/webp/${hero.name.toLowerCase()}${hero.skin_num}.webp" type="image/webp">
                        <source srcset="/images/heroes/${hero.name.toLowerCase()}/avif/${hero.name.toLowerCase()}${hero.skin_num}.avif" type="image/avif">
                        <img src="/images/heroes/${hero.name.toLowerCase()}/webp/${hero.name.toLowerCase()}${hero.skin_num}.webp" alt="${hero.name.toLowerCase()}" loading="lazy" class="hero-img" style="transition: opacity 0.2s ease;">
                    </picture>
                </div>
                <div class="main-hero-header-row">
                    <div class="main-hero-level-container">
                        <picture class="main-hero-level-frame">
                            <source srcset="/images/profile/avif/frame_${hero.prestige ? 'prestige' : 'common'}.avif" type="image/avif">
                            <source srcset="/images/profile/webp/frame_${hero.prestige ? 'prestige' : 'common'}.webp" type="image/webp">
                            <img src="/images/profile/webp/frame_${hero.prestige ? 'prestige' : 'common'}.webp" alt="level frame" loading="lazy">
                        </picture>
                        <span class="main-hero-level-text">${hero.level}</span>
                    </div>

                    <div class="main-hero-info">
                        <div class="main-hero-name">${hero.name}</div>
                        <div class="main-hero-exp">${fmt(hero.experience)} / ${fmt(hero.exp_req)}</div>
                    </div>

                    <div class="main-hero-rating-container">
                        <picture class="main-hero-rating">
                            <source srcset="/images/profile/avif/rank${hero.league.toLowerCase()}.avif" type="image/avif">
                            <source srcset="/images/profile/webp/rank${hero.league.toLowerCase()}.webp" type="image/webp">
                            <img src="/images/profile/webp/rank${hero.league.toLowerCase()}.webp" alt="rank" loading="lazy">
                        </picture>
                        <span class="main-hero-rating">${hero.rating}</span>
                    </div>
                </div>
            </div>
        `;
    }

    private _renderItemCard(item: Item, index: number): string {
        const isHidden = this.data?.itemsExpanded ? false : index > 5;
        const cardsInfo = item.cards_need !== -1 ? `(${item.cards} / ${item.cards_need})` : '';

        // Форматирование имени для URL и файла: lowercase и замена пробелов на дефисы
        const slug = item.name.toLowerCase().split(' ').join('-');

        return `
            <a href="/profile/item/${slug}" class="item-card-link ${isHidden ? 'hidden' : ''}" data-link style="text-decoration: none; color: inherit; display: block;"
               data-aos="fade-up"
               data-aos-delay="${(index % 5) * 50}">
                <div class="item-card">
                    <div class="item-image-wrapper">
                        <picture>
                            <source srcset="/images/items/avif/${slug}.avif" type="image/avif">
                            <source srcset="/images/items/webp/${slug}.webp" type="image/webp">
                            <img src="/images/items/webp/${slug}.webp" 
                                 alt="${item.name}" 
                                 loading="lazy" 
                                 class="item-icon" 
                                 data-fallback>
                        </picture>
                    </div>
                    <span class="item-name">${item.name}</span>
                    <div class="item-stats">
                        <span class="rarity-${item.rarity.toLowerCase()}">${item.rarity}</span>
                        <div class="item-level">lvl ${item.level} ${cardsInfo}</div>
                    </div>
                </div>
            </a>
        `;
    }

    private _renderHeroes(): string {
        if (!this.data) return '';
        const d = this.data;

        return `
            <div class="section" data-aos="fade-up">
                <h2 class="section-title">${t('profile_heroes_title', d.heroes_count)}</h2>
                <div class="sort-controls">
                    <button id="sortToggle" class="sort-btn" data-sort="level">
                        <picture>
                            <source srcset="/images/profile/webp/level.webp" type="image/webp">
                            <source srcset="/images/profile/avif/level.avif" type="image/avif">
                            <img id="sortIcon" src="/images/profile/webp/level.webp" alt="Сортировка по уровню" loading="lazy" style="transition: opacity 0.2s ease;">
                        </picture>
                        <span id="sortText">${t('profile_sort_level')}</span>
                    </button>
                    <button id="invertToggle" class="invert-icon-btn">
                        <picture>
                            <source srcset="/images/profile/webp/sortlow.webp" type="image/webp">
                            <source srcset="/images/profile/avif/sortlow.avif" type="image/avif">
                            <img id="invertIcon" src="/images/profile/webp/sortlow.webp" alt="↕ По убыванию" loading="lazy" style="transition: opacity 0.2s ease;">
                        </picture>
                    </button>
                </div>
                <div class="main-heroes-grid" id="mainHeroesGrid">
                    ${d.heroes.map(hero => this._renderHeroCard(hero)).join('')}
                </div>
            </div>
        `;
    }

    private _renderItems(): string {
        if (!this.data) return '';
        const d = this.data;

        const sortLabel = this.currentItemSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_level');

        return `
            <div class="section" data-aos="fade-up">
                <h2 class="section-title">${t('profile_items_title', d.items_count)}</h2>
                
                <div class="sort-controls" style="margin-bottom: 20px;">
                    <button id="itemSortToggle" class="sort-btn">
                        <span id="itemSortText">${sortLabel}</span>
                    </button>
                </div>

                <div class="items-grid" id="profileItemsGrid">
                    ${d.items.map((item, index) => this._renderItemCard(item, index)).join('')}
                </div>
                
                ${!d.itemsExpanded && d.items_count > 5 ? `
                    <div class="load-more-container">
                        <button id="loadMoreItemsBtn" class="load-more-btn">${t('profile_show_more')}</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

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
            if (target.tagName === 'IMG' && target.hasAttribute('data-fallback')) {
                const img = target as HTMLImageElement;
                if (img.getAttribute('data-failed') === 'true') return;
                img.setAttribute('data-failed', 'true');
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

        // 1. Показать еще
        const loadMoreBtn = this.container.querySelector('#loadMoreItemsBtn');
        if (loadMoreBtn) {
            this.addListener(loadMoreBtn, 'click', () => {
                const hiddenLinks = this.container?.querySelectorAll('.item-card-link.hidden');
                hiddenLinks?.forEach(link => {
                    link.classList.remove('hidden');
                    link.classList.remove('aos-animate');
                    void (link as HTMLElement).offsetWidth;
                });

                loadMoreBtn.remove();

                // Сохраняем состояние
                Gen.getInstance().updateCurrentState({itemsExpanded: true});

                if (typeof AOS !== 'undefined') {
                    setTimeout(() => {
                        AOS.refresh();
                        hiddenLinks?.forEach(link => {
                            if (!link.classList.contains('aos-animate')) {
                                link.classList.add('aos-animate');
                            }
                        });
                    }, 100);
                }
            });
        }

        // 2. Сортировка Героев
        this.initSorting();

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
                    grid.innerHTML = this.data.items.map((item, index) => this._renderItemCard(item, index)).join('');
                    // Обновляем текст кнопки
                    const text = this.container?.querySelector('#itemSortText');
                    if (text) text.textContent = this.currentItemSort === 'rarity' ? t('items_sort_rarity') : t('items_sort_level');

                    setTimeout(() => AOS.refresh(), 100);
                }
            });
        }

        const grids = [
            this.container?.querySelector('#mainHeroesGrid'),
            this.container?.querySelector('#statsHeroesGrid')
        ];
        grids.forEach(grid => {
            if (grid) this.applySort(grid);
        });

        // 3. Скины
        this.initSkins();

        // 4. Скриншот
        const saveBtn = this.container.querySelector('#saveProfileBtn');
        if (saveBtn) {
            this.addListener(saveBtn, 'click', () => this.takeScreenshot());
        }

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
        });
    }

    private updatePicture(img: HTMLImageElement, newSrcBase: string) {
        if (!img) return;
        const picture = img.parentElement;

        img.style.opacity = '0';
        setTimeout(() => {
            img.src = `${newSrcBase}.webp`;
            if (picture) {
                const sources = picture.querySelectorAll('source');
                sources.forEach(s => {
                    if (s.type === 'image/avif') s.srcset = `${newSrcBase}.avif`;
                    if (s.type === 'image/webp') s.srcset = `${newSrcBase}.webp`;
                });
            }
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        }, 200);
    }

    private initSorting(): void {
        const sortBtn = this.container?.querySelector('#sortToggle');
        const invertBtn = this.container?.querySelector('#invertToggle');
        const sortText = this.container?.querySelector('#sortText');
        const sortIcon = this.container?.querySelector('#sortIcon') as HTMLImageElement;
        const invertIcon = this.container?.querySelector('#invertIcon') as HTMLImageElement;

        const grids = [
            this.container?.querySelector('#mainHeroesGrid'),
            this.container?.querySelector('#statsHeroesGrid')
        ];

        if (!sortBtn || !invertBtn) return;

        const sortModes = ['level', 'rating'];

        const applyToAll = () => {
            requestAnimationFrame(() => {
                grids.forEach(grid => {
                    if (grid) this.applySort(grid);
                });
            });
        };

        this.addListener(sortBtn, 'click', () => {
            const currentIdx = sortModes.indexOf(this.currentHeroSort);
            this.currentHeroSort = sortModes[(currentIdx + 1) % sortModes.length] as any;

            if (sortText) {
                const labels = {level: t('profile_sort_level'), rating: t('profile_sort_rating')};
                sortText.textContent = labels[this.currentHeroSort];
            }

            if (sortIcon) {
                const iconName = this.currentHeroSort === 'level' ? 'Level' : 'Trophy';
                this.updatePicture(sortIcon, `/images/profile/webp/${iconName}`);
            }

            applyToAll();
        });

        this.addListener(invertBtn, 'click', () => {
            this.sortAsc = !this.sortAsc;

            if (invertIcon) {
                const iconName = this.sortAsc ? 'sorthigh' : 'sortlow';
                this.updatePicture(invertIcon, `/images/profile/webp/${iconName}`);
            }
            applyToAll();
        });
    }

    private applySort(grid: Element): void {
        const cards = Array.from(grid.children) as HTMLElement[];

        cards.sort((a, b) => {
            let valA: any, valB: any;

            if (this.currentHeroSort === 'level') {
                valA = parseInt(a.dataset.level || '0');
                valB = parseInt(b.dataset.level || '0');

                // FIX: Учитываем престиж (+20 уровней)
                if (a.dataset.prestige === 'true') valA += 20;
                if (b.dataset.prestige === 'true') valB += 20;

            } else if (this.currentHeroSort === 'rating') {
                valA = parseInt(a.dataset.rating || '0');
                valB = parseInt(b.dataset.rating || '0');
            }

            if (valA < valB) return this.sortAsc ? -1 : 1;
            if (valA > valB) return this.sortAsc ? 1 : -1;
            return 0;
        });

        const fragment = document.createDocumentFragment();
        cards.forEach(card => fragment.appendChild(card));
        grid.appendChild(fragment);

        if (typeof AOS !== 'undefined') AOS.refresh();
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
            skinsMap[key.toLowerCase()] = rawSkinsMap[key];
        }

        const cards = this.container?.querySelectorAll('.main-hero-card');
        cards?.forEach(card => {
            const heroName = (card as HTMLElement).dataset.heroName?.toLowerCase();
            if (!heroName) return;
            const availableSkins = ['01', ...(skinsMap[heroName] || [])];
            const uniqueSkins = Array.from(new Set(availableSkins)).sort();

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

                (card as HTMLElement).dataset.currentSkin = skin;
                this.updateHeaderSkin(heroName, skin);
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

    private async takeScreenshot() {
        const element = this.container?.querySelector('.profile-header') as HTMLElement;
        if (!element) return;

        const btn = this.container?.querySelector('#saveProfileBtn') as HTMLButtonElement;
        if (btn) {
            btn.textContent = t('profile_creating_card');
            btn.disabled = true;
        }

        try {
            // Динамический импорт
            // @ts-ignore
            const {default: html2canvas} = await import('html2canvas');

            const canvas = await html2canvas(element, {
                backgroundColor: null,
                useCORS: true,
                scale: 2,
                logging: false,
                // ФИКСЫ ДЛЯ СКРОЛЛА И ШИРИНЫ
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                windowWidth: 1920, // Эмулируем десктоп
                windowHeight: 1080
            });

            const link = document.createElement('a');
            link.download = `Profile_${this.data?.nickname || 'Player'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error("Screenshot failed", e);
            alert("Не удалось создать скриншот.");
        } finally {
            if (btn) {
                btn.textContent = t('profile_save_card');
                btn.disabled = false;
            }
        }
    }

    protected destroy():
        void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}