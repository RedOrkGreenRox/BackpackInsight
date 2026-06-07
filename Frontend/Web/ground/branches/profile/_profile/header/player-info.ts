/**
 * PlayerInfoRenderer - рендеринг основной информации о игроке
 */

import { ProfileData } from '../utils/profile-types';

export class PlayerInfoRenderer {
    static render(data: ProfileData): string {
        return `
            <h4>${data.nickname}</h4>
        `;
    }
}
