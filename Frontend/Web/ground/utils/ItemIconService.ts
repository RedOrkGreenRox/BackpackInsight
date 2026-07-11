/**
 * Service for resolving item image paths.
 * Centralised — replaces duplicated logic across ItemsBranch, ItemDetailBranch, ItemCard.
 */
import { SlugService } from '../utils/SlugService';
import type { ItemDefinition } from '../types/api-types';

export type { ItemDefinition };

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
            const match = STEP_PATTERN.exec(firstTooltip);
            if (match?.[1]) {
                const token = match[1];
                const number = SlugService.isRomanNumeral(token)
                    ? SlugService.romanToArabic(token)
                    : Number.parseInt(token, 10);
                return `heist-plan-${number}`;
            }
        }

        return SlugService.toSlug(item.name);
    }
}
