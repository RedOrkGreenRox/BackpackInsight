import { t } from '../../../../../localization/i18n';
import { generateIconsOrText } from '../../../../../utils/icon-parser';

const TYPE_ICONS: Record<string, string> = {
    Armor: 'TypeArmor', Accessory: 'TypeAccessory', Food: 'TypeFood', Plant: 'TypePlant',
    Mineral: 'TypeMineral', Potion: 'TypePotion', MeleeWeapon: 'MeleeWeapon',
    'Melee Weapon': 'MeleeWeapon', RangedWeapon: 'RangedWeapon', 'Ranged Weapon': 'RangedWeapon',
    Pet: 'Pet', Mana: 'Mana', Gold: 'Gold', Rat: 'TypeRat',
};
const HERO_ICONS: Record<string, string> = {
    Chana: 'Chana', Ronan: 'Ronan', Harkon: 'Harkon', Nymphedora: 'Nymphedora', Tink: 'Tink',
    Buzz: 'Buzz', Morrow: 'Morrow', Enoch: 'Enoch', Celeste: 'Celeste', Shared: 'Shared', Dorf: 'Dorf',
    Hob: 'Hob', Pepper: 'Pepper', Sage: 'Sage', Kragg: 'Kragg', Fern: 'Fern', Zahir: 'Zahir',
    'Crash Test Ducky': 'crashtestducky',
};
const BUFF_ICONS: Record<string, string> = {
    Buff: 'Buff', Haste: 'Haste', Regeneration: 'Regeneration', Resist: 'Resist', Thorns: 'Thorns',
    Armor: 'Armor', Luck: 'Luck', Lifesteal: 'Lifesteal', Empower: 'Empower', Cleanse: 'Resist', Heal: 'Life', Mana: 'Mana',
};
const DEBUFF_ICONS: Record<string, string> = {
    Burn: 'Burn', Bleed: 'Bleed', Poison: 'Poison', Chill: 'Chill', Frost: 'Chill', Curse: 'Curse',
    Blind: 'Blind', Stun: 'Stun', Debuff: 'Debuff',
};
const STAT_ICONS: Record<string, string> = {
    Health: 'Health', MaxHealth: 'MaxHealth', Armor: 'Armor', Damage: 'Damage', Accuracy: 'Accuracy',
    Critical: 'CritChance', Cooldown: 'Cooldown', CritChance: 'CritChance', CritDamage: 'CritDamage', Stamina: 'Stamina', StaminaRecovery: 'StaminaRecovery',
    Resist: 'Resist', Static: 'Static', Soul: 'Soul',
};
const SORT_ICONS: Record<string, string> = {
    'Rarity Down': 'sortlow', 'Rarity Up': 'sorthigh', 'Alphabet Up': 'sorthigh',
    'Alphabet Down': 'sortlow', Relevance: 'luck',
};

export class FilterIconResolver {
    public getIconForFilter(value: string, filterType: string): string | null {
        const normalizedValue = value.replace(/\s+/g, '');
        let iconName: string | null = null;
        let titleDesc = '';
        if (filterType === 'filterTypes') {
            iconName = TYPE_ICONS[value] || TYPE_ICONS[normalizedValue] || null;
            titleDesc = `Тип: ${value}`;
            if (!iconName) {
                const result = generateIconsOrText([value]);
                if (result.includes('<picture')) return result;
            }
        } else if (filterType === 'filterHeroes') { iconName = HERO_ICONS[value] || null; titleDesc = `Герой: ${value}`; }
        else if (filterType === 'filterBuffs') { iconName = BUFF_ICONS[value] || null; titleDesc = `Эффект: ${value}`; }
        else if (filterType === 'filterDebuffs') { iconName = DEBUFF_ICONS[value] || null; titleDesc = `Эффект: ${value}`; }
        else if (filterType === 'filterStats') { iconName = STAT_ICONS[value] || null; titleDesc = `Характеристика: ${value}`; }
        else if (filterType === 'filterFlags') { iconName = value === 'Purchasable' ? 'Gold' : null; titleDesc = `Тег: ${value}`; }
        else if (filterType === 'filterSort') {
            iconName = SORT_ICONS[value] || null;
            titleDesc = `Сортировка: ${t('items_sort_' + value.toLowerCase().replace(' ', '_'))}`;
        }
        return iconName ? this.createIconHtml(iconName, titleDesc, filterType === 'filterSort') : null;
    }

    private createIconHtml(iconName: string, title: string, profile = false): string {
        const base = profile && iconName !== 'luck' ? '/images/profile' : '/images/fonticon';
        const formats = [{ type: 'image/avif', ext: 'avif', path: `${base}/avif` }, { type: 'image/webp', ext: 'webp', path: `${base}/webp` }];
        const sources = formats.map(f => `<source srcset="${f.path}/${iconName.toLowerCase()}.${f.ext}" type="${f.type}">`).join('');
        return `<picture class="filter-icon" title="${title}">${sources}<img src="${base}/webp/${iconName.toLowerCase()}.webp" alt="${title}" loading="lazy"></picture>`;
    }
}
