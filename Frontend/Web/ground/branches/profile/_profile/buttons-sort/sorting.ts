/// <reference path="../../../../types/global.d.ts" />

document.addEventListener('DOMContentLoaded', function () {
    const sortBtn = document.getElementById('sortToggle');
    const sortIcon = document.getElementById('sortIcon') as HTMLImageElement;
    const sortText = document.getElementById('sortText');
    const invertBtn = document.getElementById('invertToggle');
    const invertIcon = document.getElementById('invertIcon') as HTMLImageElement;
    const heroGrid = document.querySelector('.main-heroes-grid');

    if (sortIcon) sortIcon.classList.add('loaded');
    if (sortText) sortText.classList.add('loaded');
    if (invertIcon) invertIcon.classList.add('loaded');

    if (!sortBtn || !invertBtn || !heroGrid) {
        return;
    }

    let sortByLevel = localStorage.getItem('sortByLevel') !== 'false';
    let sortAscending = localStorage.getItem('sortAscending') === 'true';

    function updateIcons() {
        if (sortIcon && sortText) {
            const newSortName = sortByLevel ? 'Level' : 'Trophy';
            const picture = sortIcon.parentElement;
            if (picture) {
                const sources = picture.querySelectorAll('source');
                if (sources.length >= 2) {
                    sources[0].srcset = `/static/images/profile/avif/${newSortName}.avif`;
                    sources[1].srcset = `/static/images/profile/webp/${newSortName}.webp`;
                }
            }
            sortIcon.src = `/static/images/profile/webp/${newSortName}.webp`;

            sortIcon.classList.add('loaded');
            sortText.textContent = sortByLevel ? 'Сортировка по уровню' : 'Сортировка по рейтингу';
        }

        if (invertIcon) {
            const newInvertName = sortAscending ? 'SortHigh' : 'SortLow';
            const picture = invertIcon.parentElement;
            if (picture) {
                const sources = picture.querySelectorAll('source');
                if (sources.length >= 2) {
                    sources[0].srcset = `/static/images/profile/avif/${newInvertName}.avif`;
                    sources[1].srcset = `/static/images/profile/webp/${newInvertName}.webp`;
                }
            }
            invertIcon.src = `/static/images/profile/webp/${newInvertName}.webp`;

            invertIcon.classList.add('loaded');
        }
    }

    sortBtn.addEventListener('click', function (_e) {
        sortByLevel = !sortByLevel;
        localStorage.setItem('sortByLevel', String(sortByLevel));
        updateIcons();
        sortHeroes();
    });

    invertBtn.addEventListener('click', function (_e) {
        sortAscending = !sortAscending;
        localStorage.setItem('sortAscending', String(sortAscending));
        updateIcons();
        sortHeroes();
    });

    function sortHeroes() {
        const heroCards = Array.from(document.querySelectorAll('.main-hero-card')) as HTMLElement[];
        const headerHeroGrid = document.querySelector('.stats-heroes-grid'); // Контейнер в шапке

        // 1. Сортируем массив основных карточек
        heroCards.sort((a, b) => {
            let valA, valB;

            if (sortByLevel) {
                // Учитываем престиж для корректной сортировки уровней
                const prestigeA = a.dataset.prestige === 'true' ? 100 : 0;
                const prestigeB = b.dataset.prestige === 'true' ? 100 : 0;
                valA = (parseInt(a.dataset.level || '0') || 0) + prestigeA;
                valB = (parseInt(b.dataset.level || '0') || 0) + prestigeB;
            } else {
                valA = parseInt(a.dataset.rating || '0') || 0;
                valB = parseInt(b.dataset.rating || '0') || 0;
            }

            return sortAscending ? valA - valB : valB - valA;
        });

        // 2. Перемещаем карточки в основной сетке (внизу)
        const mainFragment = document.createDocumentFragment();
        heroCards.forEach(card => mainFragment.appendChild(card));
        heroGrid?.appendChild(mainFragment);

        // 3. Синхронизируем порядок в шапке (в карточке профиля)
        if (headerHeroGrid) {
            const headerFragment = document.createDocumentFragment();
            heroCards.forEach(card => {
                const heroName = card.dataset.heroName;
                // Находим соответствующую маленькую карточку по имени героя
                const headerCard = headerHeroGrid.querySelector(`.stat-hero-card[data-hero-name="${heroName}"]`);
                if (headerCard) {
                    headerFragment.appendChild(headerCard);
                }
            });
            headerHeroGrid.appendChild(headerFragment);
        }

        if (typeof window.AOS !== 'undefined') {
            setTimeout(window.AOS.refresh, 150);
        }
    }

    updateIcons();
    sortHeroes();
});