import { FilterState } from '../ItemsStateManager';
import { SortKey, SortPriority } from './items-runtime-types';

export class ChipsSyncService {
    constructor(private readonly container: HTMLElement) {}

    public sync(filters: FilterState, sortPriorities: SortPriority[]): void {
        this.container.querySelectorAll('.filter-chip').forEach(chip => this.syncChip(chip as HTMLElement, filters, sortPriorities));
    }

    private syncChip(chip: HTMLElement, filters: FilterState, sortPriorities: SortPriority[]): void {
        const val = chip.dataset['value'];
        const type = chip.dataset['groupType'];
        if (!val || !type || chip.dataset['moreToggle']) return;
        this.resetChipClass(chip);
        if (type === 'sort') return this.syncSortChip(chip, sortKeyFromOption(val), sortPriorities);
        const state = this.getState(val, type, filters);
        if (state === 'include') chip.classList.add('active', 'include');
        if (state === 'exclude') chip.classList.add('active', 'exclude');
        if (type === 'rarity') chip.classList.add(`rarity-${val.toLowerCase()}`);
    }

    private getState(val: string, type: string, filters: FilterState): 'none' | 'include' | 'exclude' {
        if (type === 'type') return this.stateFromSets(val, filters.selectedTypes, filters.excludedTypes);
        if (type === 'rarity') return this.stateFromSets(val, filters.selectedRarities, filters.excludedRarities);
        if (type === 'hero') return this.stateFromSets(val, filters.selectedHeroes, filters.excludedHeroes);
        if (type === 'unlock') return this.stateFromSets(val, filters.selectedUnlockSources, filters.excludedUnlockSources);
        if (type === 'buff') return this.stateFromSets(val, filters.selectedBuffs, filters.excludedBuffs);
        if (type === 'debuff') return this.stateFromSets(val, filters.selectedDebuffs, filters.excludedDebuffs);
        if (type === 'stat') return this.stateFromSets(val, filters.selectedStats, filters.excludedStats);
        if (type === 'flag' && val === 'Purchasable') {
            if (filters.purchasableOnly === true) return 'include';
            if (filters.purchasableOnly === false) return 'exclude';
        }
        return 'none';
    }

    private stateFromSets(val: string, include: Set<string>, exclude: Set<string> | undefined): 'none' | 'include' | 'exclude' {
        if (include.has(val)) return 'include';
        if (exclude?.has(val)) return 'exclude';
        return 'none';
    }

    private resetChipClass(chip: HTMLElement): void {
        const keep = ['filter-chip'];
        if (chip.classList.contains('no-icon-extra')) keep.push('no-icon-extra');
        chip.className = keep.join(' ');
    }

    private syncSortChip(chip: HTMLElement, key: SortKey, sortPriorities: SortPriority[]): void {
        const idx = sortPriorities.findIndex(item => item.key === key);
        const priority = idx >= 0 ? sortPriorities[idx] : null;
        chip.classList.toggle('active', !!priority);
        chip.classList.toggle('include', priority?.direction === 'down');
        chip.classList.toggle('exclude', priority?.direction === 'up');
        chip.querySelector('.sort-dir')!.textContent = priority ? (priority.direction === 'down' ? '↓' : '↑') : '';
        chip.querySelector('.sort-priority')!.textContent = priority ? `#${idx + 1}` : '';
    }
}

function sortKeyFromOption(option: string): SortKey {
    if (option === 'Relevance') return 'relevance';
    if (option === 'Alphabet') return 'alphabet';
    return 'rarity';
}
