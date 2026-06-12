/**
 * Shared slugification utilities for item names and item asset names.
 */
export class SlugService {
    private static readonly ROMAN_NUMERALS: Record<string, number> = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
        'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
        'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
        'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20
    };

    static toSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/['’‘`´]/g, '-')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    static romanToArabic(roman: string): number {
        return this.ROMAN_NUMERALS[roman.toUpperCase()] || 1;
    }

    static isRomanNumeral(str: string): boolean {
        return str.toUpperCase() in this.ROMAN_NUMERALS;
    }
}
