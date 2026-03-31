/**
 * HeroesSectionRenderer - основной рендерер секции героев
 */

import { ProfileData, Hero } from '../utils/profile-types';
import { HeroCardRenderer } from './hero-card';

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
                <div class="sort-controls">
                    <button id="sortToggle" class="sort-btn" data-sort="level">
                        <picture>
                            <source srcset="/images/profile/avif/level.avif" type="image/avif">
                            <source srcset="/images/profile/webp/level.webp" type="image/webp">
                            <img id="sortIcon" src="/images/profile/webp/level.webp" alt="Сортировка по уровню" loading="lazy" style="transition: opacity 0.2s ease;">
                        </picture>
                        <span id="sortText">${this.getSortLevelText()}</span>
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
        // Импорт t будет добавлен позже
        return `Герои (${count})`;
    }

    private static getSortLevelText(): string {
        // Импорт t будет добавлен позже
        return 'Сортировка по уровню';
    }
}
