import { SearchTermService } from '../../../../../utils/SearchTermService';
import { SlugService } from '../../../../../utils/SlugService';
import { PreparedItem } from './filter-types';

const STRICT_ALIASES: Record<string, string[]> = {
    meleeweapon: ['melee weapon', 'melee'],
    rangedweapon: ['ranged weapon', 'ranged'],
    critchance: ['crit chance', 'critical chance'],
    critdamage: ['crit damage', 'critical damage'],
    maxhealth: ['max health', 'health'],
    staminacost: ['stamina cost', 'stamina usage', 'stamina'],
    staminausage: ['stamina usage', 'stamina cost', 'stamina'],
    staminarecovery: ['stamina recovery', 'stamina'],
    typeaccessory: ['accessory'], typearmor: ['armor'], typebag: ['bag'],
    typecharm: ['charm'], typefish: ['fish'], typefood: ['food'],
    typeingredient: ['ingredient'], typemineral: ['mineral'], typeplant: ['plant'],
    typepotion: ['potion'], typerat: ['rat'], typeskull: ['skull'], typetool: ['tool'],
};

export function getItemKey(item: any): string {
    return item.id || item.name;
}

export function buildStrictText(baseText: string): string {
    const strictTokens = new Set<string>(SearchTermService.tokenize(baseText));
    for (const [compact, variants] of Object.entries(STRICT_ALIASES)) {
        if (strictTokens.has(compact) || variants.some(v => baseText.includes(SearchTermService.normalizeText(v)))) {
            strictTokens.add(compact);
            variants.forEach(v => SearchTermService.tokenize(v).forEach(token => strictTokens.add(token)));
        }
    }
    return [...strictTokens].join(' ');
}

export function prepareItems(items: any[]): PreparedItem[] {
    return items.map(item => {
        const normalizedHero = (item.connectedHero || 'Shared') === 'Hob Gang' ? 'Hob' : (item.connectedHero || 'Shared');
        const tooltipText = SearchTermService.normalizeText((item.tooltips || []).join(' '));
        const statKeysText = SearchTermService.normalizeText(Object.keys(item.allStats || {}).join(' '));
        const typeText = SearchTermService.normalizeText((item.itemTypes || []).join(' '));
        const baseSearchText = [
            item.id, item.name, item.rarity, (item.itemTypes || []).join(' '),
            normalizedHero, item.unlockSource || '', (item.tooltips || []).join(' '),
            Object.keys(item.allStats || {}).join(' '),
        ].join(' ');
        const baseText = SearchTermService.normalizeText(baseSearchText);
        return {
            key: getItemKey(item), item, slug: SlugService.toSlug(item.name),
            imagePath: SlugService.toSlug(item.name), imageSrc: '', tooltipText,
            normalizedHero, unlockSource: item.unlockSource || 'Unknown', statKeysText,
            typeText, baseText, searchText: SearchTermService.expandText(baseSearchText),
            strictText: buildStrictText(baseText),
        };
    });
}

export function mapPreparedByKey(preparedItems: PreparedItem[]): Map<string, PreparedItem> {
    return new Map(preparedItems.map(prepared => [prepared.key, prepared]));
}
