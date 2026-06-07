import Fuse from 'fuse.js';
import { ItemDefinition, FilterState } from './ItemsStateManager';

export class ItemsFilterManager {
    private fuse: Fuse<ItemDefinition> | null = null;
    private rarityWeights: Record<string, number> = {
        "Unique": 100, "Mythic": 90, "Legendary": 80, "Epic": 70,
        "Rare": 60, "Common": 50, "Boon": 40, "Relic": 30, "Special": 20
    };

    public initFuse(items: ItemDefinition[]) {
        const options = {
            includeScore: true,
            threshold: 0.4,
            keys: [
                {name: 'name', weight: 2},
                {name: 'itemTypes', weight: 1.5},
                {name: 'connectedHero', weight: 1},
                {name: 'tooltips', weight: 0.5}
            ]
        };
        this.fuse = new Fuse(items, options);
    }

    public applyFilters(items: ItemDefinition[], filters: FilterState): ItemDefinition[] {
        let filtered = [...items];

        if (filters.searchQuery.trim()) {
            if (this.fuse) {
                const result = this.fuse.search(filters.searchQuery);
                filtered = result.map((res: any) => res.item);
            } else {
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                    item.tooltips.some(tip => tip.toLowerCase().includes(filters.searchQuery.toLowerCase()))
                );
            }
        }

        if (filters.selectedTypes.size > 0) {
            filtered = filtered.filter(item => item.itemTypes.some(type => filters.selectedTypes.has(type)));
        }

        if (filters.selectedRarities.size > 0) {
            filtered = filtered.filter(item => filters.selectedRarities.has(item.rarity));
        }

        if (filters.selectedHeroes.size > 0) {
            filtered = filtered.filter(item => {
                const hero = item.connectedHero || 'Shared';
                const normalizedHero = hero === 'Hob Gang' ? 'Hob' : hero;
                return filters.selectedHeroes.has(normalizedHero);
            });
        }

        if (filters.selectedUnlockSources.size > 0) {
            filtered = filtered.filter(item => filters.selectedUnlockSources.has(item.unlockSource || 'Unknown'));
        }

        if (filters.purchasableOnly !== null) {
            filtered = filtered.filter(item => item.purchasable === filters.purchasableOnly);
        }

        if (filters.selectedBuffs.size > 0) {
            filtered = filtered.filter(item => {
                const tooltipText = item.tooltips.join(' ').toLowerCase();
                return Array.from(filters.selectedBuffs).some(buff => tooltipText.includes(buff.toLowerCase()));
            });
        }

        if (filters.selectedDebuffs.size > 0) {
            filtered = filtered.filter(item => {
                const tooltipText = item.tooltips.join(' ').toLowerCase();
                return Array.from(filters.selectedDebuffs).some(debuff => tooltipText.includes(debuff.toLowerCase()));
            });
        }

        if (filters.selectedStats.size > 0) {
            filtered = filtered.filter(item => {
                const tooltipText = item.tooltips.join(' ').toLowerCase();
                return Array.from(filters.selectedStats).some(stat =>
                    tooltipText.includes(stat.toLowerCase()) ||
                    (item.allStats && Object.keys(item.allStats).some(key => key.toLowerCase().includes(stat.toLowerCase())))
                );
            });
        }

        return filtered;
    }

    public sortItems(items: ItemDefinition[], currentSort: 'rarity' | 'name'): ItemDefinition[] {
        const sorted = [...items];
        if (sorted.length === 0) return sorted;

        sorted.sort((a, b) => {
            if (currentSort === 'rarity') {
                const weightA = this.rarityWeights[a.rarity] || 0;
                const weightB = this.rarityWeights[b.rarity] || 0;
                if (weightA !== weightB) return weightB - weightA;
            }
            return a.name.localeCompare(b.name);
        });
        return sorted;
    }

    public calculateFilterOptions(items: ItemDefinition[]) {
        const allTypes = new Set<string>();
        const allRarities = new Set<string>();
        const allHeroes = new Set<string>();
        const allUnlockSources = new Set<string>();
        const allBuffs = new Set<string>();
        const allDebuffs = new Set<string>();
        const allStats = new Set<string>();

        const buffKeywords = ['Buff', 'Haste', 'Regeneration', 'Resist', 'Thorns', 'Armor', 'Luck', 'Lifesteal', 'Empower'];
        const debuffKeywords = ['Burn', 'Bleed', 'Poison', 'Chill', 'Curse', 'Blind', 'Stun', 'Debuff', 'Fatigue', 'Insanity'];
        const statKeywords = ['Health', 'MaxHealth', 'Armor', 'Damage', 'Accuracy', 'CritChance', 'CritDamage', 'Stamina', 'StaminaRecovery', 'Resist', 'Static', 'Soul'];

        items.forEach(item => {
            item.itemTypes.forEach(type => allTypes.add(type));
            allRarities.add(item.rarity);
            const hero = item.connectedHero || 'Shared';
            const normalizedHero = hero === 'Hob Gang' ? 'Hob' : hero;
            allHeroes.add(normalizedHero);
            allUnlockSources.add(item.unlockSource || 'Unknown');

            const tooltipText = item.tooltips.join(' ').toLowerCase();
            buffKeywords.forEach(buff => { if (tooltipText.includes(buff.toLowerCase())) allBuffs.add(buff); });
            debuffKeywords.forEach(debuff => { if (tooltipText.includes(debuff.toLowerCase())) allDebuffs.add(debuff); });
            statKeywords.forEach(stat => {
                if (tooltipText.includes(stat.toLowerCase()) || 
                    (item.allStats && Object.keys(item.allStats).some(key => key.toLowerCase().includes(stat.toLowerCase())))) {
                    allStats.add(stat);
                }
            });
        });

        return {
            sortedTypes: this.sortTypes(Array.from(allTypes)),
            sortedRarities: this.sortRarities(Array.from(allRarities)),
            sortedHeroes: this.sortHeroes(Array.from(allHeroes)),
            sortedUnlockSources: Array.from(allUnlockSources).sort(),
            sortedBuffs: this.sortBuffs(Array.from(allBuffs)),
            sortedDebuffs: this.sortDebuffs(Array.from(allDebuffs)),
            sortedStats: this.sortStats(Array.from(allStats))
        };
    }

    private sortTypes(types: string[]) {
        const priorityTypes = ['Bag', 'Melee Weapon', 'Ranged Weapon', 'Pet', 'Food', 'Accessory', 'Armor'];
        return types.sort((a, b) => {
            const pA = priorityTypes.indexOf(a);
            const pB = priorityTypes.indexOf(b);
            if (pA !== -1 && pB !== -1) return pA - pB;
            if (pA !== -1) return -1;
            if (pB !== -1) return 1;
            return a.localeCompare(b);
        });
    }

    private sortRarities(rarities: string[]) {
        return rarities.sort((a, b) => (this.rarityWeights[b] || 0) - (this.rarityWeights[a] || 0));
    }

    private sortHeroes(heroes: string[]) {
        return heroes.sort((a, b) => {
            if (a === 'Shared') return -1;
            if (b === 'Shared') return 1;
            return a.localeCompare(b);
        });
    }

    private sortBuffs(buffs: string[]) {
        return buffs.sort((a, b) => (a === 'Buff' ? -1 : b === 'Buff' ? 1 : a.localeCompare(b)));
    }

    private sortDebuffs(debuffs: string[]) {
        return debuffs.sort((a, b) => (a === 'Debuff' ? -1 : b === 'Debuff' ? 1 : a.localeCompare(b)));
    }

    private sortStats(stats: string[]) {
        const statsOrder = ['Health', 'MaxHealth', 'Armor', 'Damage', 'Accuracy', 'CritChance', 'CritDamage', 'Stamina', 'Resist', 'Static', 'Soul'];
        return stats.sort((a, b) => {
            const iA = statsOrder.indexOf(a);
            const iB = statsOrder.indexOf(b);
            if (iA !== -1 && iB !== -1) return iA - iB;
            if (iA !== -1) return -1;
            if (iB !== -1) return 1;
            return a.localeCompare(b);
        });
    }
}
