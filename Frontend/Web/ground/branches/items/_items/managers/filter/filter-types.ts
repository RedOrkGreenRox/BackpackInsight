export interface PreparedItem {
    key: string;
    item: any;
    slug: string;
    imagePath: string;
    imageSrc: string;
    tooltipText: string;
    normalizedHero: string;
    unlockSource: string;
    statKeysText: string;
    typeText: string;
    baseText: string;
    searchText: string;
    strictText: string;
}

export interface ASTNode {
    type: 'token' | 'and' | 'or';
    term?: string;
    isExact?: boolean;
    isNegated?: boolean;
    isComparison?: boolean;
    children?: ASTNode[];
}

export interface FilterOptions {
    sortedTypes: string[];
    sortedRarities: string[];
    sortedHeroes: string[];
    sortedUnlockSources: string[];
    sortedBuffs: string[];
    sortedDebuffs: string[];
    sortedStats: string[];
    sortedFlags: string[];
}

export const RARITY_WEIGHTS: Record<string, number> = {
    Unique: 100,
    Mythic: 90,
    Legendary: 80,
    Epic: 70,
    Rare: 60,
    Common: 50,
    Boon: 40,
    Relic: 30,
    Special: 20,
};
