import { MultiselectFilterController } from './multiselect-filter-controller';

export interface RuntimeFilterOptions {
    sortedTypes: string[];
    sortedRarities: string[];
    sortedHeroes: string[];
    sortedUnlockSources: string[];
    sortedBuffs: string[];
    sortedDebuffs: string[];
    sortedStats: string[];
    sortedFlags: string[];
}

export class FilterOptionsController {
    constructor(private readonly multiselect: MultiselectFilterController) {}

    public setup(options: RuntimeFilterOptions): void {
        this.multiselect.create('filterTypes', options.sortedTypes, 'type');
        this.multiselect.create('filterRarities', options.sortedRarities, 'rarity');
        this.multiselect.create('filterHeroes', options.sortedHeroes, 'hero');
        this.multiselect.create('filterUnlockSources', options.sortedUnlockSources, 'unlock');
        this.multiselect.create('filterBuffs', options.sortedBuffs, 'buff');
        this.multiselect.create('filterDebuffs', options.sortedDebuffs, 'debuff');
        this.multiselect.create('filterStats', options.sortedStats, 'stat');
        this.multiselect.create('filterFlags', options.sortedFlags, 'flag');
    }
}
