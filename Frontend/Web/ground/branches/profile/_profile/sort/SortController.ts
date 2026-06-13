import { t } from '../../../../localization/i18n';
// @ts-ignore
import AOS from 'aos';

export class SortController {
    private readonly container: HTMLElement;
    private cleanupFns: (() => void)[] = [];
    private currentHeroSort: 'level' | 'rating' = 'level';
    private sortAsc: boolean = false;

    constructor(container: HTMLElement) {
        this.container = container;
        this.init();
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject) {
        if (element) {
            element.addEventListener(event, handler);
            this.cleanupFns.push(() => element.removeEventListener(event, handler));
        }
    }

    // ИСПРАВЛЕНО: Теперь принимает только имя иконки, а пути формирует сама
    private updatePicture(img: HTMLImageElement, iconName: string) {
        if (!img) return;
        const picture = img.parentElement;

        img.style.opacity = '0';
        setTimeout(() => {
            img.src = `/images/profile/webp/${iconName}.webp`;
            if (picture) {
                const sources = picture.querySelectorAll('source');
                sources.forEach(s => {
                    if (s.type === 'image/avif') s.srcset = `/images/profile/avif/${iconName}.avif`;
                    if (s.type === 'image/webp') s.srcset = `/images/profile/webp/${iconName}.webp`;
                });
            }
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        }, 200);
    }

    private init() {
        const sortBtn = this.container.querySelector('#sortToggle');
        const invertBtn = this.container.querySelector('#invertToggle');
        const sortText = this.container.querySelector('#sortText');
        const sortIcon = this.container.querySelector('#sortIcon') as HTMLImageElement;
        const invertIcon = this.container.querySelector('#invertIcon') as HTMLImageElement;

        const grids = [
            this.container.querySelector('#mainHeroesGrid'),
            this.container.querySelector('#statsHeroesGrid')
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

        // Применяем сортировку по умолчанию при инициализации
        applyToAll();

        this.addListener(sortBtn, 'click', () => {
            const currentIdx = sortModes.indexOf(this.currentHeroSort);
            this.currentHeroSort = sortModes[(currentIdx + 1) % sortModes.length] as 'level' | 'rating';

            if (sortText) {
                const labels = { level: t('profile_sort_level'), rating: t('profile_sort_rating') };
                sortText.textContent = labels[this.currentHeroSort as keyof typeof labels] || labels.level;
            }

            if (sortIcon) {
                const iconName = this.currentHeroSort === 'level' ? 'level' : 'trophy';
                this.updatePicture(sortIcon, iconName);
            }

            applyToAll();
        });

        this.addListener(invertBtn, 'click', () => {
            this.sortAsc = !this.sortAsc;

            if (invertIcon) {
                const iconName = this.sortAsc ? 'sorthigh' : 'sortlow';
                this.updatePicture(invertIcon, iconName);
            }
            applyToAll();
        });
    }

    private getCardValue(card: HTMLElement): number {
        if (this.currentHeroSort === 'level') {
            const lvl = Number.parseInt(card.dataset['level'] || '0');
            return lvl + (card.dataset['prestige'] === 'true' ? 20 : 0);
        }
        return Number.parseInt(card.dataset['rating'] || '0');
    }

    private getCardTiebreaker(card: HTMLElement): number {
        if (this.currentHeroSort === 'level') {
            return Number.parseInt(card.dataset['rating'] || '0');
        }
        const lvl = Number.parseInt(card.dataset['level'] || '0');
        return lvl + (card.dataset['prestige'] === 'true' ? 20 : 0);
    }

    private compareCards(a: HTMLElement, b: HTMLElement): number {
        const valA = this.getCardValue(a);
        const valB = this.getCardValue(b);
        if (valA !== valB) return this.sortAsc ? valA - valB : valB - valA;

        const tbA = this.getCardTiebreaker(a);
        const tbB = this.getCardTiebreaker(b);
        if (tbA !== tbB) return this.sortAsc ? tbA - tbB : tbB - tbA;

        const nameA = a.dataset['heroName'] || '';
        const nameB = b.dataset['heroName'] || '';
        return this.sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }

    private applySort(grid: Element): void {
        const cards = Array.from(grid.children) as HTMLElement[];
        cards.sort((a, b) => this.compareCards(a, b));

        const fragment = document.createDocumentFragment();
        cards.forEach(card => fragment.appendChild(card));
        grid.appendChild(fragment);

        if (AOS !== undefined) AOS.refresh();
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }

    // Добавляем методы для получения состояния
    public getCurrentSort(): 'level' | 'rating' {
        return this.currentHeroSort;
    }

    public isInverted(): boolean {
        return this.sortAsc;
    }

    // Публичный метод для применения сортировки с параметрами
    public applySortWithParams(sortBy: 'level' | 'rating', inverted: boolean): void {
        this.currentHeroSort = sortBy;
        this.sortAsc = inverted;
        
        // Обновляем UI
        const sortText = this.container.querySelector('#sortText');
        const sortIcon = this.container.querySelector('#sortIcon') as HTMLImageElement;
        const invertIcon = this.container.querySelector('#invertIcon') as HTMLImageElement;

        if (sortText) {
            const labels = { level: t('profile_sort_level'), rating: t('profile_sort_rating') };
            sortText.textContent = labels[sortBy];
        }

        if (sortIcon) {
            const iconName = sortBy === 'level' ? 'level' : 'trophy';
            this.updatePicture(sortIcon, iconName);
        }

        if (invertIcon) {
            const iconName = inverted ? 'sorthigh' : 'sortlow';
            this.updatePicture(invertIcon, iconName);
        }

        // Применяем сортировку ко всем сеткам
        const grids = [
            this.container.querySelector('#mainHeroesGrid'),
            this.container.querySelector('#statsHeroesGrid')
        ];

        requestAnimationFrame(() => {
            grids.forEach(grid => {
                if (grid) this.applySort(grid);
            });
        });
    }
}