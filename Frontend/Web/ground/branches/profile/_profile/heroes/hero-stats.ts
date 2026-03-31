/**
 * HeroStatsRenderer - рендеринг статистики героя
 */

import { Hero } from '../utils/profile-types';

export class HeroStatsRenderer {
    static render(hero: Hero): string {
        const fmt = (n: number) => n.toLocaleString();
        
        return `
            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-label">Уровень:</span>
                    <span class="stat-value">${hero.level}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Рейтинг:</span>
                    <span class="stat-value">${this.formatRating(hero.rating)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Опыт:</span>
                    <span class="stat-value">${fmt(hero.experience)} / ${fmt(hero.exp_req)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Лига:</span>
                    <span class="stat-value">${hero.league}</span>
                </div>
            </div>
        `;
    }

    private static formatRating(rating: number): number {
        if (rating < 5000) {
            return rating % 500;
        } else {
            return rating - 5000;
        }
    }
}
