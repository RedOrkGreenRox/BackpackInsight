/**
 * HeroesSectionRenderer - основной рендерер секции героев
 */

import { ProfileData } from '../utils/profile-types';
import { HeroCardRenderer } from './hero-card';
import { t } from '../../../../localization/i18n';

export class HeroesSectionRenderer {
    static render(data: ProfileData): string {
        // Сортируем героев перед рендером
        const sortedHeroes = [...data.heroes].sort((a, b) => {
            // Сначала по prestige (true优先)
            if (a.prestige !== b.prestige) return b.prestige ? 1 : -1;
            
            // Затем по уровню (по убыванию)
            if (a.level !== b.level) return b.level - a.level;
            
            // Затем по рейтингу (по убыванию)
            if (a.rating !== b.rating) return b.rating - a.rating;
            
            // В конце по алфавиту
            return a.name.localeCompare(b.name);
        });

        return `
            <div class="section" data-aos="fade-up">
                <h2 class="section-title">${this.getHeroesTitle(data.heroes_count)}</h2>
                <div class="sort-controls" role="toolbar" aria-label="Сортировка героев">
                    <button id="sortToggle" class="sort-btn" data-sort="level" aria-label="${t('profile_sort_level')}">
                        <picture>
                            <source srcset="/images/profile/avif/level.avif" type="image/avif">
                            <source srcset="/images/profile/webp/level.webp" type="image/webp">
                            <img id="sortIcon" src="/images/profile/webp/level.webp" alt="" loading="lazy" style="transition: opacity 0.2s ease;">
                        </picture>
                        <span id="sortText">${t('profile_sort_level')}</span>
                    </button>
                    <button id="invertToggle" class="invert-icon-btn" aria-label="Инвертировать порядок" aria-pressed="false">
                        <picture>
                            <source srcset="/images/profile/avif/sortlow.avif" type="image/avif">
                            <source srcset="/images/profile/webp/sortlow.webp" type="image/webp">
                            <img id="invertIcon" src="/images/profile/webp/sortlow.webp" alt="" loading="lazy" style="transition: opacity 0.2s ease;">
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
}
