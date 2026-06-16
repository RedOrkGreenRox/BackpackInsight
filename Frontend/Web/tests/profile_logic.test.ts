import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileDataManager } from '../ground/branches/profile/_profile/managers/ProfileDataManager';
import { Item } from '../ground/branches/profile/_profile/utils/profile-types';

// Mocking dependencies
vi.mock('../ground/localization/i18n', () => ({
    t: (key: string, val?: string) => {
        if (val) return `${key}_${val}`;
        return key;
    }
}));

describe('ProfileDataManager', () => {
    let dataManager: ProfileDataManager;

    beforeEach(() => {
        dataManager = new ProfileDataManager();
        sessionStorage.clear();
    });

    it('should resolve profile data and save to cache', () => {
        const mockProfile: any = {
            nickname: 'TestPlayer',
            level: 10,
            trophies: 1000,
            coins: 500,
            gems: 100,
            heroes: [],
            items: []
        };

        const resolved = dataManager.resolve(mockProfile);
        expect(resolved).not.toBeNull();
        expect(resolved?.nickname).toBe('TestPlayer');

        // Check if cached in sessionStorage
        const cached = sessionStorage.getItem('currentProfileData');
        expect(cached).not.toBeNull();
        expect(JSON.parse(cached!).nickname).toBe('TestPlayer');
    });

    it('should sort items by rarity weights first, then level, then cards progress, then name', () => {
        const items: Item[] = [
            { name: 'Sword', rarity: 'Common', level: 1, cards: 5, cards_need: 10 },
            { name: 'Shield', rarity: 'Legendary', level: 2, cards: 0, cards_need: 0 },
            { name: 'Axe', rarity: 'Common', level: 5, cards: 1, cards_need: 10 },
            { name: 'Bow', rarity: 'Common', level: 1, cards: 8, cards_need: 10 }
        ];

        // Sort by rarity
        const sortedRarity = dataManager.sortItems(items, 'rarity');
        // Legendary (Shield) > Common level 5 (Axe) > Common level 1 progress 80% (Bow) > Common level 1 progress 50% (Sword)
        expect(sortedRarity[0].name).toBe('Shield');
        expect(sortedRarity[1].name).toBe('Axe');
        expect(sortedRarity[2].name).toBe('Bow');
        expect(sortedRarity[3].name).toBe('Sword');
    });

    it('should generate correct SEO metadata', () => {
        const mockProfile: any = {
            nickname: 'Gladiator',
            heroes_count: 5,
            items_count: 25
        };

        const meta = dataManager.getMeta(mockProfile);
        expect(meta.title).toContain('Gladiator');
        expect(meta.description).toContain('Gladiator');
    });
});
