/**
 * HeaderRenderer - основной рендерер заголовка профиля с защитой от XSS
 */

import { ProfileData } from '../utils/profile-types';
import { PlayerInfoRenderer } from './player-info';
import { StatsBarRenderer } from './stats-bar';
import { SecurityService } from '../../../../utils/SecurityService';

export class HeaderRenderer {
    static render(data: ProfileData): string {
        const playerInfo = PlayerInfoRenderer.render(data);
        const statsBar = StatsBarRenderer.render(data);

        return `
            <div class="profile-header" data-aos="zoom-in">
                <picture class="header-bg">
                    <source srcset="/images/area/avif/area${data.area}.avif" type="image/avif">
                    <source srcset="/images/area/webp/area${data.area}.webp" type="image/webp">
                    <img src="/images/area/webp/area${data.area}.webp" alt="Background" fetchpriority="high">
                </picture>

                ${playerInfo}
                ${statsBar}
                
                <!-- Версия игры -->
                <div class="actual-version-container">
                    <span class="actual-version">
                        ${SecurityService.escapeHtml(data.actual_version)}    ${SecurityService.escapeHtml(data.install_version)}
                    </span>
                </div>
                
                <!-- Герои в заголовке -->
                <div class="stats-heroes-wrapper">
                    <div class="stats-heroes-grid" id="statsHeroesGrid">
                        ${data.heroes.map(hero => this.renderHeroCard(hero)).join('')}
                    </div>
                </div>

                <!-- Статистика предметов -->
                <div class="stats-items-grid">
                    ${this.renderItemStats(data)}
                </div>
            </div>
        `;
    }

    private static renderHeroCard(hero: any): string {
        const safeName = SecurityService.escapeHtml(hero.name);
        const lowerName = safeName.toLowerCase();
        return `
            <div class="stat-hero-card" 
                 data-hero-name="${lowerName}"
                 data-level="${hero.level}"
                 data-rating="${hero.rating}"
                 data-prestige="${hero.prestige}">
                <div class="hero-header-row">
                    <picture class="stat-hero-image-wrapper">
                        <source srcset="/images/heroes/${lowerName}/avif/${lowerName}${hero.skin_num}.avif" type="image/avif">
                        <source srcset="/images/heroes/${lowerName}/webp/${lowerName}${hero.skin_num}.webp" type="image/webp">
                        <img class="stat-hero-icon" src="/images/heroes/${lowerName}/webp/${safeName}${hero.skin_num}.webp" alt="${safeName}" loading="lazy">
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
                        <span class="stat-hero-rating">${this.formatRating(hero.rating)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    private static renderItemStats(data: ProfileData): string {
        const rarityOrder = ["Boon", "Relic", "Mythic", "Legendary", "Epic", "Rare", "Common"];
        
        return rarityOrder.map(rarity => {
            if (data.item_stats[rarity]) {
                return `
                    <div class="rarity-item">
                        <picture>
                            <source srcset="/images/profile/avif/card${rarity.toLowerCase()}.avif" type="image/avif">
                            <source srcset="/images/profile/webp/card${rarity.toLowerCase()}.webp" type="image/webp">
                            <img class="rarity-icon" src="/images/profile/webp/card${rarity.toLowerCase()}.webp" alt="${rarity.toLowerCase()}" loading="lazy">
                        </picture>
                        <span class="rarity-count">${data.item_stats[rarity]}</span>
                    </div>
                `;
            }
            return '';
        }).join('');
    }

    private static formatRating(rating: number): number {
        if (rating < 5000) {
            return rating % 500;
        } else {
            return rating - 5000;
        }
    }
}
