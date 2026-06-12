/**
 * Service for resolving item image paths.
 * Centralised — replaces duplicated logic across ItemsBranch, ItemDetailBranch, ItemCard.
 */
import { SlugService } from '../utils/SlugService';

export interface ItemDefinition {
    id: string;
    name: string;
    rarity: string;
    coinValue: number | null;
    itemTypes: string[];
    connectedHero: string;
    unlockSource: string;
    itemShape: { x: number; y: number }[];
    itemStars: { x: number; y: number }[];
    purchasable: boolean;
    recipes: unknown[];
    combatStats: Record<string, number | null>;
    tooltips: string[];
    allStats: Record<string, unknown>;
    levels: unknown;
}

const MASKED_ITEMS: Record<string, string> = {
    'Suspicious Sausage': 'tender-sausage',
    'Fools Gold': 'gold-ore',
    'Feral Cat': 'black-cat',
    'Cursed Dagger': 'poison-dagger',
    'Book of Dark Secrets': 'dusty-book',
    'Blind Fury Potion': 'wrath-potion',
    'Feather of Icarus': 'phoenix-feather',
};

const STEP_PATTERN = /^Step\s+(\d+|[IVXLCDM]+)/i;

export class ItemIconService {
    static getImagePath(item: ItemDefinition): string {
        const masked = MASKED_ITEMS[item.name];
        if (masked) return masked;

        const firstTooltip = item.tooltips?.[0];
        if (item.rarity === 'Special' && firstTooltip) {
            const match = firstTooltip.match(STEP_PATTERN);
            if (match?.[1]) {
                const token = match[1];
                const number = SlugService.isRomanNumeral(token)
                    ? SlugService.romanToArabic(token)
                    : parseInt(token, 10);
                return `heist-plan-${number}`;
            }
        }

        return SlugService.toSlug(item.name);
    }
}
