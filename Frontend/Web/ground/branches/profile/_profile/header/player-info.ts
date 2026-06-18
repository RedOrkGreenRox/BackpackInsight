/**
 * PlayerInfoRenderer - рендеринг основной информации о игроке с защитой от XSS
 */

import { ProfileData } from '../utils/profile-types';
import { SecurityService } from '../../../../utils/SecurityService';

export class PlayerInfoRenderer {
    static render(data: ProfileData): string {
        const safeNickname = SecurityService.escapeHtml(data.nickname);
        return `
            <h4>${safeNickname}</h4>
        `;
    }
}
