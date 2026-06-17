import { t } from '../../../../../localization/i18n';

const TYPE_MAPPING: Record<string, string> = { 'Melee Weapon': 'MeleeWeapon', 'Ranged Weapon': 'RangedWeapon' };

export class ChipsSyncService {
    constructor(private readonly container: HTMLElement) {}

    public sync(query: string): void {
        this.container.querySelectorAll('.filter-chip').forEach(chip => this.syncChip(chip as HTMLElement, query));
    }

    private syncChip(chip: HTMLElement, query: string): void {
        const val = chip.dataset['value'];
        const type = chip.dataset['groupType'];
        if (!val || !type || chip.dataset['moreToggle']) return;
        if (type === 'sort') return this.syncSortChip(chip, val, query);
        const mappedVal = TYPE_MAPPING[val] || val.replace(/\s+/g, '');
        const escVal = mappedVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tests = this.buildTests(escVal);
        const label = this.containerIdToLabel(val, (chip.parentElement as HTMLElement).id);
        const span = chip.querySelector('span');
        this.resetChipClass(chip);
        if (tests.exact.test(query)) this.setActive(chip, span, ['active', 'exact'], `&lt;${label}&gt;`);
        else if (tests.negatedExact.test(query)) this.setActive(chip, span, ['active', 'negated', 'exact'], `!&lt;${label}&gt;`);
        else if (tests.plain.test(query)) this.setActive(chip, span, ['active', 'plain'], `${label}`);
        else if (tests.negatedPlain.test(query)) this.setActive(chip, span, ['active', 'negated', 'plain'], `!${label}`);
        else this.setInactive(chip, span, val, label);
    }

    private buildTests(escVal: string): { exact: RegExp; negatedExact: RegExp; plain: RegExp; negatedPlain: RegExp } {
        return {
            exact: new RegExp(`\\[\\s*<${escVal}>\\s*\\]`, 'i'),
            negatedExact: new RegExp(`\\[\\s*!<${escVal}>\\s*\\]`, 'i'),
            plain: new RegExp(`\\[\\s*${escVal}\\s*\\]`, 'i'),
            negatedPlain: new RegExp(`\\[\\s*!${escVal}\\s*\\]`, 'i'),
        };
    }

    private resetChipClass(chip: HTMLElement): void {
        const keep = ['filter-chip'];
        if (chip.classList.contains('no-icon-extra')) keep.push('no-icon-extra');
        chip.className = keep.join(' ');
    }

    private syncSortChip(chip: HTMLElement, val: string, query: string): void {
        const sortTag = `{${val}}`;
        const escTag = sortTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        chip.classList.toggle('active', new RegExp(escTag, 'i').test(query));
    }

    private setActive(chip: HTMLElement, span: Element | null, classes: string[], html: string): void {
        chip.classList.add(...classes);
        if (span) span.innerHTML = html;
    }

    private setInactive(chip: HTMLElement, span: Element | null, val: string, label: string): void {
        if (span) span.innerHTML = `${label}`;
        if ((chip.parentElement as HTMLElement).id === 'filterRarities') chip.classList.add(`rarity-${val.toLowerCase()}`);
    }

    private containerIdToLabel(val: string, containerId: string): string {
        return containerId === 'filterSort' ? t(`items_sort_${val.toLowerCase().replace(' ', '_')}`) : val;
    }
}
