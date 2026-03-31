/**
 * StatsBarRenderer - рендеринг основной статистики игрока
 */

import { ProfileData } from '../utils/profile-types';

export class StatsBarRenderer {
    static render(data: ProfileData): string {
        const fmt = (n: number) => n.toLocaleString();
        
        return `
            <div class="stats-grid">
                <div class="stat-player-card">
                    <picture>
                        <source srcset="/images/profile/avif/level.avif" type="image/avif">
                        <source srcset="/images/profile/webp/level.webp" type="image/webp">
                        <img src="/images/profile/webp/level.webp" alt="Lvl" loading="lazy">
                    </picture>
                    <span class="stat-value">${data.level}</span>
                </div>
                <div class="stat-player-card">
                    <picture>
                        <source srcset="/images/profile/avif/xp.avif" type="image/avif">
                        <source srcset="/images/profile/webp/xp.webp" type="image/webp">
                        <img src="/images/profile/webp/xp.webp" alt="XP" loading="lazy">
                    </picture>
                    <span class="stat-value">${fmt(data.xp_current)} / ${fmt(data.xp_need)}</span>
                </div>
                <div class="stat-player-card">
                    <picture>
                        <source srcset="/images/profile/avif/trophy.avif" type="image/avif">
                        <source srcset="/images/profile/webp/trophy.webp" type="image/webp">
                        <img src="/images/profile/webp/trophy.webp" alt="Trophy" loading="lazy">
                    </picture>
                    <span class="stat-value">${data.trophy + data.bonus_trophy}</span>
                </div>
                <div class="stat-player-card">
                    <picture>
                        <source srcset="/images/profile/avif/gems.avif" type="image/avif">
                        <source srcset="/images/profile/webp/gems.webp" type="image/webp">
                        <img src="/images/profile/webp/gems.webp" alt="Gems" loading="lazy">
                    </picture>
                    <span class="stat-value">${data.gems}</span>
                </div>
                <div class="stat-player-card">
                    <picture>
                        <source srcset="/images/profile/avif/coins.avif" type="image/avif">
                        <source srcset="/images/profile/webp/coins.webp" type="image/webp">
                        <img src="/images/profile/webp/coins.webp" alt="Coins" loading="lazy">
                    </picture>
                    <span class="stat-value">${data.coins}</span>
                </div>
            </div>
        `;
    }
}
