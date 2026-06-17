import { SearchTermService } from '../../../../../utils/SearchTermService';
import { FilterOptions, PreparedItem, RARITY_WEIGHTS } from './filter-types';
import { getItemKey } from './prepared-items';

const BUFFS = ['buff', 'haste', 'regeneration', 'cleanse', 'luck', 'empower', 'thorns', 'heal', 'lifesteal', 'mana'];
const DEBUFFS = ['poison', 'burn', 'bleed', 'chill', 'frost', 'curse', 'blind', 'stun', 'debuff'];
const STATS = ['damage', 'critical', 'accuracy', 'stamina', 'cooldown', 'health', 'armor', 'resist'];
const PRIORITY_TYPES = ['Melee Weapon', 'Ranged Weapon', 'Pet', 'Food', 'Accessory', 'Armor'];
const LAST_TYPES = ['Bag'];

export function calculateFilterOptions(items: any[], preparedByKey: Map<string, PreparedItem>): FilterOptions {
    const allTypes = new Set<string>();
    const allRarities = new Set<string>();
    const allHeroes = new Set<string>();
    const allUnlockSources = new Set<string>();
    const allBuffs = new Set<string>();
    const allDebuffs = new Set<string>();
    const allStats = new Set<string>();

    items.forEach(item => {
        (item.itemTypes || []).forEach((type: string) => allTypes.add(type));
        allRarities.add(item.rarity);
        allHeroes.add((item.connectedHero || 'Shared') === 'Hob Gang' ? 'Hob' : item.connectedHero || 'Shared');
        allUnlockSources.add(item.unlockSource || 'Unknown');
        collectTerms(preparedByKey.get(getItemKey(item)), allBuffs, allDebuffs, allStats);
    });

    return {
        sortedTypes: sortTypes(allTypes),
        sortedRarities: Array.from(allRarities).sort((a, b) => (RARITY_WEIGHTS[b] || 0) - (RARITY_WEIGHTS[a] || 0)),
        sortedHeroes: Array.from(allHeroes).sort(sortHeroes),
        sortedUnlockSources: Array.from(allUnlockSources).sort((a, b) => a.localeCompare(b)),
        sortedBuffs: sortWithFirst(allBuffs, 'Buff'),
        sortedDebuffs: sortWithFirst(allDebuffs, 'Debuff'),
        sortedStats: Array.from(allStats).sort((a, b) => a.localeCompare(b)),
        sortedFlags: ['Purchasable'],
    };
}

function collectTerms(prepared: PreparedItem | undefined, buffs: Set<string>, debuffs: Set<string>, stats: Set<string>): void {
    if (!prepared) return;
    const text = `${prepared.tooltipText} ${prepared.baseText} ${prepared.typeText}`;
    const extracted = SearchTermService.extractStrictTerms(text);
    addExtracted(BUFFS, extracted, buffs);
    addExtracted(DEBUFFS, extracted, debuffs);
    addExtracted(STATS, extracted, stats);
}

function addExtracted(keys: string[], extracted: Set<string>, target: Set<string>): void {
    keys.forEach(key => {
        if (extracted.has(key)) target.add(key.charAt(0).toUpperCase() + key.slice(1));
    });
}

function sortTypes(types: Set<string>): string[] {
    return Array.from(types).sort((a, b) => {
        const lastA = LAST_TYPES.indexOf(a);
        const lastB = LAST_TYPES.indexOf(b);
        if (lastA !== -1 && lastB !== -1) return lastA - lastB;
        if (lastA !== -1) return 1;
        if (lastB !== -1) return -1;

        const priorityA = PRIORITY_TYPES.indexOf(a);
        const priorityB = PRIORITY_TYPES.indexOf(b);
        if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
        if (priorityA !== -1) return -1;
        if (priorityB !== -1) return 1;
        return a.localeCompare(b);
    });
}

function sortHeroes(a: string, b: string): number {
    if (a === 'Shared') return -1;
    if (b === 'Shared') return 1;
    return a.localeCompare(b);
}

function sortWithFirst(values: Set<string>, first: string): string[] {
    return Array.from(values).sort((a, b) => {
        if (a === first) return -1;
        if (b === first) return 1;
        return a.localeCompare(b);
    });
}
