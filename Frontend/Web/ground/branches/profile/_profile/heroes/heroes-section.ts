import { t } from '../../../../localization/i18n';
/**
 * HeroesSectionRenderer - основной рендерер секции героев
 */

import { ProfileData } from '../utils/profile-types';
import { HeroCardRenderer } from './hero-card';

export class HeroesSectionRenderer {
    static render(data: ProfileData): string {
        // Сортируем героев перед рендером
        const sortedHeroes = [...data.heroes].sort((a, b) => {
            // Начальная сортировка при рендере совпадает с дефолтом SortController:
            // по уровню убывая (prestige = +20), вторичный — рейтинг, финальный — имя
            const lvlA = a.level + (a.prestige ? 20 : 0);
            const lvlB = b.level + (b.prestige ? 20 : 0);
            if (lvlA !== lvlB) return lvlB - lvlA;
            if (a.rating !== b.rating) return b.rating - a.rating;
            return a.name.localeCompare(b.name);
        });

        return `
            <div class="section" data-aos="fade-up">
                <h2 class="section-title">${this.getHeroesTitle(data.heroes_count)}</h2>
                <div class="sort-controls">
                    <button id="sortToggle" class="sort-btn" data-sort="level">
                        <picture>
                            <source srcset="/images/profile/avif/level.avif" type="image/avif">
                            <source srcset="/images/profile/webp/level.webp" type="image/webp">
                            <img id="sortIcon" src="/images/profile/webp/level.webp" alt="" loading="lazy" style="transition: opacity 0.2s ease;">
                        </picture>
                        <span id="sortText">${t('profile_sort_level')}</span>
                    </button>
                    <button id="invertToggle" class="invert-icon-btn">
                        <picture>
                            <source srcset="/images/profile/avif/sortlow.avif" type="image/avif">
                            <source srcset="/images/profile/webp/sortlow.webp" type="image/webp">
                            <img id="invertIcon" src="/images/profile/webp/sortlow.webp" alt="↕ По убыванию" loading="lazy" style="transition: opacity 0.2s ease;">
                        </picture>
                    </button>
                </div>
                <div class="main-heroes-grid" id="mainHeroesGrid">
                    ${sortedHeroes.map(hero => HeroCardRenderer.render(hero)).join('')}
                </div>
            </div>
        `;
    }

    private static getHeroesTitle(count: number): string {
        return t('profile_heroes_title', String(count));
    }

    private static getSortLevelText(): string {
        return t('profile_sort_level');
    }
}
