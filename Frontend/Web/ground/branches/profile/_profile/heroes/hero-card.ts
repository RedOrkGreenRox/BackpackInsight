/**
 * HeroCardRenderer - рендеринг карточки героя
 */

import { Hero } from '../utils/profile-types';

export class HeroCardRenderer {
    static render(hero: Hero): string {
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
                        <source srcset="/images/heroes/${hero.name.toLowerCase()}/avif/${hero.name.toLowerCase()}${hero.skin_num}.avif" type="image/avif">
                        <source srcset="/images/heroes/${hero.name.toLowerCase()}/webp/${hero.name.toLowerCase()}${hero.skin_num}.webp" type="image/webp">
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
                        <span class="main-hero-rating">${this.formatRating(hero.rating)}</span>
                    </div>
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
