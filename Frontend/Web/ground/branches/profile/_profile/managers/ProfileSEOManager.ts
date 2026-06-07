import { PageMeta } from '@roots/Branch.ts';
import { ProfileData } from '../utils/profile-types';

export class ProfileSEOManager {
    public static getMeta(data: ProfileData | null): PageMeta {
        let metaData = data;
        if (!metaData) {
            try {
                const cached = sessionStorage.getItem('currentProfileData');
                if (cached) metaData = JSON.parse(cached);
            } catch (e) {
                console.error('Failed to parse cached profile data for SEO', e);
            }
        }

        if (metaData && metaData.nickname) {
            return {
                title: `${metaData.nickname} — Профиль игрока | Backpack Insight`,
                description: `Статистика игрока ${metaData.nickname}: Уровень ${metaData.level}, Трофеи ${metaData.trophy + metaData.bonus_trophy}, Героев ${metaData.heroes_count}.`
            };
        }
        
        return {
            title: "Профиль игрока | Backpack Insight",
            description: "Детальная статистика профиля Backpack Brawl."
        };
    }
}
