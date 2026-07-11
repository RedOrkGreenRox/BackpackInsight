import { SlugService } from '../../../../utils/SlugService';

export class ItemsIconService {
    public static getItemImagePath(item: { name: string; rarity: string; tooltips?: string[] }): string {
        const maskedItems: Record<string, string> = {
            "Suspicious Sausage": "tender-sausage",
            "Fools Gold": "gold-ore",
            "Feral Cat": "black-cat",
            "Cursed Dagger": "poison-dagger",
            "Book of Dark Secrets": "dusty-book",
            "Blind Fury Potion": "wrath-potion",
            "Feather of Icarus": "phoenix-feather"
        };

        const texture = maskedItems[item.name];
        if (texture) {
            return texture;
        }

        // Проверяем условие для Special предметов с тултипом "Step {число}" (римское или арабское)
        if (item.rarity === 'Special' && item.tooltips && item.tooltips.length > 0) {
            const firstTooltip = item.tooltips[0];
            if (firstTooltip) {
                // Сначала пробуем найти арабские цифры: например, "Step 1/4" или "Step 3"
                const arabicNum = /Step\s+(\d+)/i.exec(firstTooltip)?.[1];
                if (arabicNum) return `heist-plan-${arabicNum}`;

                // Если не нашли арабские, пробуем римские: например, "Step IV"
                const romanNumeral = /Step\s+([IVXLCDM]+)/i.exec(firstTooltip)?.[1];
                if (romanNumeral) return `heist-plan-${this.romanToArabic(romanNumeral)}`;
            }
        }
        
        // Стандартная логика для остальных предметов
        return SlugService.toSlug(item.name);
    }

    private static romanToArabic(roman: string): number {
        const romanNumerals: Record<string, number> = {
            'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
            'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
            'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
            'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20
        };
        return romanNumerals[roman] || 1;
    }
}
