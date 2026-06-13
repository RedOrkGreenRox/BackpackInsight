/**
 * TypeScript интерфейсы для профиля игрока
 */

export interface Hero {
    name: string;
    level: number;
    rating: number;
    experience: number;
    exp_req: number;
    prestige: boolean;
    league: string;
    skin_num: string;
}

export interface Item {
    name: string;
    rarity: string;
    level: number;
    cards: number;
    cards_need: number;
}

export interface ProfileData {
    nickname: string;
    level: number;
    trophy: number;
    bonus_trophy: number;
    gems: number;
    coins: number;
    xp_current: number;
    xp_need: number;
    area: string;
    item_stats: Record<string, number>;
    heroes: Hero[];
    heroes_count: number;
    items: Item[];
    items_count: number;
    actual_version: string;
    install_version: string;
    profile_skins: Record<string, string[]>;

    // Состояние UI
    itemsSort?: 'rarity' | 'level'; // Текущая сортировка предметов
}

// SavedState живёт в ProfileStateManager — единственный источник истины.
// Реэкспортируем отсюда для обратной совместимости импортов.
export type { SavedState } from '../managers/ProfileStateManager';

export interface RarityWeights {
    [key: string]: number;
}
