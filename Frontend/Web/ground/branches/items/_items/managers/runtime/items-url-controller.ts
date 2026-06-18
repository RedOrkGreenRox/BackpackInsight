import { FilterState } from '../ItemsStateManager';

export class ItemsUrlController {
  constructor(
    private readonly filters: FilterState,
    private readonly advancedModeEnabled: () => boolean,
    private readonly container: HTMLElement
  ) {}

  public syncUrl(): void {
    const raw = this.shareQuery();
    const normalized = this.normalizeShareQuery(raw);
    const nextPath = normalized ? `/items/${encodeURIComponent(normalized)}` : '/items';
    if (globalThis.location.pathname !== nextPath) {
      history.replaceState(history.state || {}, '', nextPath);
    }
  }

  public renderSearchFilterPreview(): void {
    const input = this.container.querySelector('#itemSearch') as HTMLElement | null;
    if (!input) return;
    const formula = this.advancedModeEnabled() ? '' : this.normalizeShareQuery(this.buildConcreteFormula());
    if (formula) input.dataset['filterQuery'] = formula;
    else delete input.dataset['filterQuery'];
  }

  public shareQuery(): string {
    const text = (this.filters.searchQuery || '').trim();
    if (this.advancedModeEnabled()) return text;
    const formula = this.buildConcreteFormula();
    return [text, formula].filter(Boolean).join(' & ');
  }

  public normalizeShareQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/\s*([&|!])\s*/g, '$1')
      .replace(/\s*([<>]=?|=)\s*/g, '$1')
      .replace(/\s*([\[\](){}])\s*/g, '$1')
      .trim()
      .toLowerCase();
  }

  public buildConcreteFormula(): string {
    const parts: string[] = [];
    const add = (set: Set<string> | undefined, negated = false) => {
      const values = [...(set ?? new Set<string>())].map(v => `[<${this.mappedTag(v)}>]`);
      if (!values.length) return;
      const chunk = values.length > 1 ? `(${values.join(' | ')})` : values[0]!;
      parts.push(negated ? `!${chunk}` : chunk);
    };
    add(this.filters.selectedTypes); add(this.filters.selectedRarities); add(this.filters.selectedHeroes);
    add(this.filters.selectedUnlockSources); add(this.filters.selectedBuffs); add(this.filters.selectedDebuffs); add(this.filters.selectedStats);
    add(this.filters.excludedTypes, true); add(this.filters.excludedRarities, true); add(this.filters.excludedHeroes, true);
    add(this.filters.excludedUnlockSources, true); add(this.filters.excludedBuffs, true); add(this.filters.excludedDebuffs, true); add(this.filters.excludedStats, true);
    if (this.filters.purchasableOnly === true) parts.push('[<Purchasable>]');
    if (this.filters.purchasableOnly === false) parts.push('![<Purchasable>]');
    return parts.join(' & ');
  }

  private mappedTag(value: string): string {
    if (value === 'Melee Weapon') return 'MeleeWeapon';
    if (value === 'Ranged Weapon') return 'RangedWeapon';
    return value.replace(/\s+/g, '');
  }
}
