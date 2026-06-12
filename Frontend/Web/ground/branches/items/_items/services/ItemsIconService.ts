import { ItemDefinition } from '@branches/items/_items/managers/ItemsStateManager';

export class ItemsIconService {
    public static getItemImagePath(item: ItemDefinition): string {
        const maskedItems: Record<string, string> = {
            "Suspicious Sausage": "tender-sausage",
            "Fools Gold": "gold-ore",
            "Feral Cat": "black-cat",
            "Cursed Dagger": "poison-dagger",
            "Book of Dark Secrets": "dusty-book",
            "Blind Fury Potion": "wrath-potion",
            "Feather of Icarus": "phoenix-feather"
        };

        if (maskedItems[item.name]) {
            return maskedItems[item.name];
        }

        if (item.rarity === 'Special' && item.tooltips && item.tooltips.length > 0) {
            const firstTooltip = item.tooltips[0];
            if (firstTooltip) {
                // Сначала пробуем найти арабские цифры: например, "Step 1/4" или "Step 3"
                const arabicMatch = firstTooltip.match(/Step\s+(\d+)/i);
                if (arabicMatch && arabicMatch[1]) {
                    return `heist-plan-${arabicMatch[1]}`;
                }

                // Если не нашли арабские, пробуем римские: например, "Step IV"
                const romanMatch = firstTooltip.match(/Step\s+([IVXLCDM]+)/i);
                if (romanMatch && romanMatch[1]) {
                    const romanNumeral = romanMatch[1];
                    const arabicNumber = this.romanToArabic(romanNumeral);
                    return `heist-plan-${arabicNumber}`;
                }
            }
        }
        return this.toSlug(item.name);
    }

    private static toSlug(name: string): string {
        return name.toLowerCase().replace(/['’]/g, '-').split(' ').join('-').replace(/-+/g, '-');
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

    public static createIconHtml(iconName: string, title: string): string {
        const imageFormats = [
            {type: 'image/avif', ext: 'avif', path: '/images/fonticon/avif'},
            {type: 'image/webp', ext: 'webp', path: '/images/fonticon/webp'},
        ];
        const defaultFormat = imageFormats.find(f => f.ext === 'webp') || imageFormats[0];

        const sources = imageFormats.map(format =>
            `<source srcset="${format.path}/${iconName.toLowerCase()}.${format.ext}" type="${format.type}">`
        ).join('');

        return `<picture class="text-icon" title="${title}">` +
            `${sources}` +
            `<img src="${defaultFormat?.path}/${defaultFormat?.ext}" alt="${title}" loading="lazy">` +
            `</picture> `;
    }

    public static getIconForFilter(value: string, filterType: string): string | null {
        const normalizedValue = value.replace(/\s+/g, '');
        const typeMapping: Record<string, string> = {
            'Armor': 'TypeArmor', 'Accessory': 'TypeAccessory', 'Food': 'TypeFood', 'Plant': 'TypePlant',
            'Mineral': 'TypeMineral', 'Potion': 'TypePotion', 'MeleeWeapon': 'MeleeWeapon', 'Melee Weapon': 'MeleeWeapon',
            'RangedWeapon': 'RangedWeapon', 'Ranged Weapon': 'RangedWeapon', 'Pet': 'Pet', 'Mana': 'Mana', 'Gold': 'Gold', 'Rat': 'TypeRat'
        };
        const buffMapping: Record<string, string> = {
            'Buff': 'Buff', 'Haste': 'Haste', 'Regeneration': 'Regeneration', 'Resist': 'Resist', 'Thorns': 'Thorns',
            'Armor': 'Armor', 'Luck': 'Luck', 'Lifesteal': 'Lifesteal', 'Empower': 'Empower', 'StaminaRecovery': 'StaminaRecovery'
        };
        const debuffMapping: Record<string, string> = {
            'Burn': 'Burn', 'Bleed': 'Bleed', 'Poison': 'Poison', 'Chill': 'Chill', 'Curse': 'Curse', 'Blind': 'Blind',
            'Stun': 'Stun', 'Debuff': 'Debuff', 'Fatigue': 'Fatigue', 'Insanity': 'Insanity'
        };
        const statsMapping: Record<string, string> = {
            'Health': 'Health', 'MaxHealth': 'MaxHealth', 'Armor': 'Armor', 'Damage': 'Damage', 'Accuracy': 'Accuracy',
            'CritChance': 'CritChance', 'CritDamage': 'CritDamage', 'Stamina': 'Stamina', 'StaminaRecovery': 'StaminaRecovery',
            'Resist': 'Resist', 'Static': 'Static', 'Soul': 'Soul'
        };
        const heroMapping: Record<string, string> = {
            'Chana': 'Chana', 'Ronan': 'Ronan', 'Harkon': 'Harkon', 'Nymphedora': 'Nymphedora', 'Tink': 'Tink', 'Buzz': 'Buzz',
            'Morrow': 'Morrow', 'Enoch': 'Enoch', 'Celeste': 'Celeste', 'Shared': 'Shared', 'Dorf': 'Dorf', 'Hob': 'Hob',
            'Pepper': 'Pepper', 'Sage': 'Sage', 'Kragg': 'Kragg',
        };

        let iconName: string | null = null;
        if (filterType === 'filterTypes') iconName = typeMapping[value] || typeMapping[normalizedValue] || null;
        else if (filterType === 'filterHeroes') iconName = heroMapping[value] || null;
        else if (filterType === 'filterBuffs') iconName = buffMapping[value] || null;
        else if (filterType === 'filterDebuffs') iconName = debuffMapping[value] || null;
        else if (filterType === 'filterStats') iconName = statsMapping[value] || null;

        if (iconName) return this.createIconHtml(iconName, value);
        return null;
    }
}
