import { describe, it, expect, vi } from 'vitest';
import { ProfileManager } from '../ground/branches/profile/_profile/managers/profile-manager';

// Mocking dependencies
vi.mock('../../../localization/i18n', () => ({
    t: (key: string) => key
}));

describe('ProfileManager', () => {
    it('should process profile data and return formatted view', () => {
        const manager = new ProfileManager();
        const mockProfile = {
            nickname: 'TestPlayer',
            level: 10,
            trophies: 1000,
            coins: 500,
            gems: 100,
            heroes: [
                { name: 'Barbarian', level: 5, rating: 1200, experience: 100, prestige: false, league: 'Bronze' }
            ],
            items: [
                { name: 'Sword', rarity: 'Common', level: 1, cards: 10, cards_need: 20 }
            ]
        };

        const view = manager.toFrontendView(mockProfile as any);
        expect(view.nickname).toBe('TestPlayer');
        expect(view.heroes).toHaveLength(1);
        expect(view.items).toHaveLength(1);
        expect(view.heroes[0].name).toBe('Barbarian');
    });
});
