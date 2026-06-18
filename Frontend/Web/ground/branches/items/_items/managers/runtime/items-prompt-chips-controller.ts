import { FilterState } from '../ItemsStateManager';
import { FilterIconResolver } from './filter-icon-resolver';

export class ItemsPromptChipsController {
  constructor(
    private readonly container: HTMLElement,
    private readonly filters: FilterState,
    private readonly iconResolver: FilterIconResolver
  ) {}

  public renderPromptLists(): void {
    const positive = this.container.querySelector('#positiveFilterList') as HTMLElement | null;
    const negative = this.container.querySelector('#negativeFilterList') as HTMLElement | null;
    if (!positive || !negative) return;
    positive.innerHTML = this.promptChips('include');
    negative.innerHTML = this.promptChips('exclude');
    positive.classList.toggle('empty', !positive.innerHTML.trim());
    negative.classList.toggle('empty', !negative.innerHTML.trim());
  }

  private promptChips(kind: 'include' | 'exclude'): string {
    const chips: string[] = [];
    const addSet = (set: Set<string> | undefined, keyKind: string) => {
      if (!set) return;
      set.forEach(v => {
        chips.push(this.createChipHtml(kind, keyKind, v));
      });
    };

    if (kind === 'include') {
      addSet(this.filters.selectedTypes, 'type');
      addSet(this.filters.selectedRarities, 'rarity');
      addSet(this.filters.selectedHeroes, 'hero');
      addSet(this.filters.selectedUnlockSources, 'unlock');
      addSet(this.filters.selectedBuffs, 'buff');
      addSet(this.filters.selectedDebuffs, 'debuff');
      addSet(this.filters.selectedStats, 'stat');
      if (this.filters.purchasableOnly === true) {
        chips.push(this.createChipHtml(kind, 'flag', 'filterFlags', 'Purchasable'));
      }
    } else {
      addSet(this.filters.excludedTypes, 'type');
      addSet(this.filters.excludedRarities, 'rarity');
      addSet(this.filters.excludedHeroes, 'hero');
      addSet(this.filters.excludedUnlockSources, 'unlock');
      addSet(this.filters.excludedBuffs, 'buff');
      addSet(this.filters.excludedDebuffs, 'debuff');
      addSet(this.filters.excludedStats, 'stat');
      if (this.filters.purchasableOnly === false) {
        chips.push(this.createChipHtml(kind, 'flag', 'filterFlags', 'Purchasable'));
      }
    }
    return chips.join('');
  }

  private createChipHtml(kind: 'include' | 'exclude', groupType: string, value: string, overrideLabel?: string): string {
    const filterId = this.getFilterIdForGroup(groupType);
    const label = overrideLabel || this.getGroupLabel(groupType);
    const icon = this.iconResolver.getIconForFilter(value, filterId) || '';
    const safeValue = this.escapeAttr(value);
    return `<button class="prompt-token ${kind}" data-group-type="${groupType}" data-value="${safeValue}" title="Убрать: ${label}: ${safeValue}">${icon}<span>${label}: ${this.escapeHtml(value)}</span><b>×</b></button>`;
  }

  private getFilterIdForGroup(groupType: string): string {
    if (groupType === 'type') return 'filterTypes';
    if (groupType === 'rarity') return 'filterRarities';
    if (groupType === 'hero') return 'filterHeroes';
    if (groupType === 'unlock') return 'filterUnlockSources';
    if (groupType === 'buff') return 'filterBuffs';
    if (groupType === 'debuff') return 'filterDebuffs';
    if (groupType === 'stat') return 'filterStats';
    return 'filterFlags';
  }

  private getGroupLabel(groupType: string): string {
    if (groupType === 'type') return 'Тип';
    if (groupType === 'rarity') return 'Редкость';
    if (groupType === 'hero') return 'Герой';
    if (groupType === 'unlock') return 'Источник';
    if (groupType === 'buff') return 'Бафф';
    if (groupType === 'debuff') return 'Дебафф';
    if (groupType === 'stat') return 'Стата';
    return 'Флаг';
  }

  private escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  private escapeAttr(value: string): string {
    return this.escapeHtml(value);
  }
}
