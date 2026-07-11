import { describe, it, expect, vi } from 'vitest';
import { parseTextWithIcons, generateIconsOrText } from '../ground/utils/icon-parser';
import { ApiService } from '../ground/utils/ApiService';

describe('Icon Parser', () => {
    it('should correctly replace known keywords with icons', () => {
        const text = 'The Golden Bow of Chana';
        const result = parseTextWithIcons(text);
        expect(result).toContain('class="value-text"');
        expect(result).toContain('title="Chana"');
    });

    it('should handle aliases (Melee Weapon -> MeleeWeapon)', () => {
        const text = 'This is a Melee Weapon';
        const result = parseTextWithIcons(text);
        expect(result).toContain('title="Melee Weapon"');
    });

    it('should not replace forbidden names', () => {
        const text = 'Gain 5 attack';
        const result = parseTextWithIcons(text);
        // Gain is in FORBIDDEN_NAMES, so it should be wrapped in text-default, not be an icon
        expect(result).not.toContain('<picture');
        expect(result).toContain('class="text-default">Gain');
    });

    it('should wrap numbers and percentages in value-text', () => {
        const text = 'Increases damage by 10%';
        const result = parseTextWithIcons(text);
        expect(result).toContain('class="value-text"');
        expect(result).toContain('10%');
    });

    it('should handle Roman numerals for Special items (Dragonleaf logic)', () => {
        // Testing the logic that’s also in ItemDetail/ItemsBranch
        // Note: icon-parser itself doesn't handle the "Step IV" -> "heist-plan-4" 
        // as that's a file path logic, but it should still wrap the text
        const text = 'Step IV: The Plan';
        const result = parseTextWithIcons(text);
        expect(result).toContain('class="value-text"');
    });

    it('should handle nested span cleanup (value-text priority)', () => {
        // Testing the final post-cleanup logic
        const text = 'Slightly complex phrase';
        const result = parseTextWithIcons(text);
        expect(result).not.toContain('class="text-default">');
        // Detailed check would require matching the specific regex result
    });

    it('should generate icons for valid types via generateIconsOrText', () => {
        const result = generateIconsOrText(['Armor', 'UnknownType']);
        expect(result).toContain('<picture class="text-icon" title="Armor">');
        expect(result).toContain('class="text-fallback">UnknownType</span>');
    });
});

describe('ApiService', () => {
    // Mocking the global fetch
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch;

    it('should handle successful GET requests', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: 'test' }),
            headers: new Headers({ 'Content-Type': 'application/json' })
        });

        // We assume ApiService has a getItems method as used in Branches
        // Since ApiService is usually a static wrapper
        const result = await ApiService.getItems();
        expect(mockFetch).toHaveBeenCalled();
        expect(result).toBeDefined();
    });
});
