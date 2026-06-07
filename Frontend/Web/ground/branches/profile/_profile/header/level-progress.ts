/**
 * LevelProgressRenderer - рендеринг прогресса уровня
 */

import { ProfileData } from '../utils/profile-types';

export class LevelProgressRenderer {
    static render(data: ProfileData): string {
        const progress = data.xp_need > 0 ? (data.xp_current / data.xp_need) * 100 : 0;
        
        return `
            <div class="level-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${data.xp_current} / ${data.xp_need} XP</span>
            </div>
        `;
    }
}
