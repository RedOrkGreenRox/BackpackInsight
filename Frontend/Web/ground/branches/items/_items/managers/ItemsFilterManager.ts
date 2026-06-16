// @ts-ignore
import Fuse from 'fuse.js';
import { FilterState } from './ItemsStateManager';
import { SearchTermService } from '../../../../utils/SearchTermService';
import { SlugService } from '../../../../utils/SlugService';

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

export class ItemsFilterManager {
    public fuse: Fuse<PreparedItem> | null = null;
    private preparedItems: PreparedItem[] = [];
    private preparedByKey = new Map<string, PreparedItem>();

    private readonly rarityWeights: Record<string, number> = {
        "Unique": 100, "Mythic": 90, "Legendary": 80, "Epic": 70,
        "Rare": 60, "Common": 50, "Boon": 40, "Relic": 30, "Special": 20
    };

    public initFuse(items: any[]): void {
        this.prepareItems(items);
        const options = {
            includeScore: true,
            threshold: 0.4,
            keys: [
                { name: 'item.name', weight: 2.4 },
                { name: 'typeText', weight: 1.4 },
                { name: 'normalizedHero', weight: 1 },
                { name: 'searchText', weight: 1.1 },
                { name: 'tooltipText', weight: 0.35 }
            ]
        };
        this.fuse = new Fuse(this.preparedItems, options);
    }

    private getItemKey(item: any): string {
        return item.id || item.name;
    }

    private prepareItems(items: any[]): void {
        this.preparedItems = items.map(item => {
            const normalizedHero = (item.connectedHero || 'Shared') === 'Hob Gang' ? 'Hob' : (item.connectedHero || 'Shared');
            const tooltipText = SearchTermService.normalizeText((item.tooltips || []).join(' '));
            const statKeysText = SearchTermService.normalizeText(Object.keys(item.allStats || {}).join(' '));
            const typeText = SearchTermService.normalizeText((item.itemTypes || []).join(' '));
            const baseSearchText = [
                item.id,
                item.name,
                item.rarity,
                (item.itemTypes || []).join(' '),
                normalizedHero,
                item.unlockSource || '',
                (item.tooltips || []).join(' '),
                Object.keys(item.allStats || {}).join(' ')
            ].join(' ');

            const baseText = SearchTermService.normalizeText(baseSearchText);
            return {
                key: this.getItemKey(item),
                item,
                slug: SlugService.toSlug(item.name),
                imagePath: SlugService.toSlug(item.name),
                imageSrc: '',
                tooltipText,
                normalizedHero,
                unlockSource: item.unlockSource || 'Unknown',
                statKeysText,
                typeText,
                baseText,
                searchText: SearchTermService.expandText(baseSearchText),
                strictText: this.buildStrictText(baseText)
            };
        });

        this.preparedByKey = new Map(this.preparedItems.map(prepared => [prepared.key, prepared]));
    }

    private buildStrictText(baseText: string): string {
        const strictTokens = new Set<string>(SearchTermService.tokenize(baseText));
        const aliases: Record<string, string[]> = {
            meleeweapon: ['melee weapon', 'melee'],
            rangedweapon: ['ranged weapon', 'ranged'],
            critchance: ['crit chance', 'critical chance'],
            critdamage: ['crit damage', 'critical damage'],
            maxhealth: ['max health', 'health'],
            staminacost: ['stamina cost', 'stamina usage', 'stamina'],
            staminausage: ['stamina usage', 'stamina cost', 'stamina'],
            staminarecovery: ['stamina recovery', 'stamina'],
            typeaccessory: ['accessory'],
            typearmor: ['armor'],
            typebag: ['bag'],
            typecharm: ['charm'],
            typefish: ['fish'],
            typefood: ['food'],
            typeingredient: ['ingredient'],
            typemineral: ['mineral'],
            typeplant: ['plant'],
            typepotion: ['potion'],
            typerat: ['rat'],
            typeskull: ['skull'],
            typetool: ['tool']
        };

        for (const [compact, variants] of Object.entries(aliases)) {
            if (strictTokens.has(compact) || variants.some(variant => baseText.includes(SearchTermService.normalizeText(variant)))) {
                strictTokens.add(compact);
                variants.forEach(variant => SearchTermService.tokenize(variant).forEach(token => strictTokens.add(token)));
            }
        }

        return [...strictTokens].join(' ');
    }

    private getPrepared(item: any): PreparedItem | undefined {
        return this.preparedByKey.get(this.getItemKey(item));
    }

    // --- ПАРСЕР СТРОГОГО СИНТАКСИСА ЗАПРОСОВ (AST PARSER С ПОДДЕРЖКОЙ ОПЕРАТОРОВ) ---

    // Разделяет строку на части по бинарным операторам на ТЕКУЩЕМ уровне вложенности скобок
    private splitByOperator(query: string, op: string): string[] {
        const parts: string[] = [];
        let start = 0;
        let depth = 0;
        const n = query.length;
        const opLen = op.length;

        for (let i = 0; i < n; i++) {
            if (query[i] === '[') {
                depth++;
            } else if (query[i] === ']') {
                depth--;
            } else if (depth === 0) {
                const sub = query.slice(i, i + opLen);
                if (sub === op) {
                    parts.push(query.slice(start, i));
                    start = i + opLen;
                    i += opLen - 1;
                }
            }
        }
        parts.push(query.slice(start));
        return parts.map(p => p.trim()).filter(Boolean);
    }

    public parseQueryToAST(query: string): ASTNode[] {
        const trimmed = query.trim();
        if (!trimmed) return [];

        // 1. Приоритет 1: Разбор ИЛИ (|) на текущем уровне вложенности
        const orParts = this.splitByOperator(trimmed, '|');

        if (orParts.length > 1) {
            const children = orParts.map(part => {
                const subAst = this.parseQueryToAST(part);
                return subAst.length === 1 ? subAst[0]! : { type: 'and' as const, children: subAst };
            });
            return [{ type: 'or' as const, children }];
        }

        // 2. Приоритет 2: Разбор И (&) на текущем уровне вложенности
        const andParts = this.splitByOperator(trimmed, '&');

        if (andParts.length > 1) {
            const children = andParts.map(part => {
                const subAst = this.parseQueryToAST(part);
                return subAst.length === 1 ? subAst[0]! : { type: 'and' as const, children: subAst };
            });
            return [{ type: 'and' as const, children }];
        }

        // 3. Стандартный посимвольный разбор скобок и токенов
        const clauses: ASTNode[] = [];
        let i = 0;
        const n = trimmed.length;

        while (i < n) {
            while (i < n && /\s/.test(trimmed[i] || '')) {
                i++;
            }
            if (i >= n) break;

            let isNegated = false;
            if (trimmed[i] === '!') {
                isNegated = true;
                i++;
                while (i < n && /\s/.test(trimmed[i] || '')) {
                    i++;
                }
            }

            if (trimmed[i] === '[') {
                let depth = 0;
                let start = i;
                let matched = false;
                while (i < n) {
                    if (trimmed[i] === '[') {
                        depth++;
                    } else if (trimmed[i] === ']') {
                        depth--;
                        if (depth === 0) {
                            matched = true;
                            i++;
                            break;
                        }
                    }
                    i++;
                }

                if (matched) {
                    const content = trimmed.slice(start + 1, i - 1).trim();
                    let node: ASTNode;
                    
                    if (content.includes('[')) {
                        // Отношение И (AND): если скобка содержит вложенные скобки
                        const children = this.parseQueryToAST(content);
                        node = children.length === 1 && children[0]!.type === 'and'
                            ? children[0]!
                            : { type: 'and', children };
                    } else {
                        // Отношение ИЛИ (OR): если скобка содержит просто пробельные токены
                        const tokens = this.tokenizeBracketContent(content);
                        const children = tokens.map(token => this.parseToken(token));
                        node = { type: 'or', children };
                    }

                    if (isNegated) {
                        node.isNegated = true;
                    }
                    clauses.push(node);
                } else {
                    const tokenStr = trimmed.slice(start);
                    const node = this.parseToken(tokenStr);
                    if (isNegated) node.isNegated = true;
                    clauses.push(node);
                    break;
                }
            } else {
                let start = i;
                while (i < n && !/\s/.test(trimmed[i] || '') && trimmed[i] !== '[') {
                    i++;
                }
                const tokenStr = trimmed.slice(start, i);
                const node = this.parseToken(tokenStr);
                if (isNegated) node.isNegated = true;
                clauses.push(node);
            }
        }

        return clauses;
    }

    private tokenizeBracketContent(content: string): string[] {
        const tokens: string[] = [];
        let i = 0;
        const n = content.length;

        while (i < n) {
            while (i < n && /\s/.test(content[i] || '')) {
                i++;
            }
            if (i >= n) break;

            if (content[i] === '(') {
                let start = i;
                let depth = 0;
                while (i < n) {
                    if (content[i] === '(') depth++;
                    else if (content[i] === ')') {
                        depth--;
                        if (depth === 0) {
                            i++;
                            break;
                        }
                    }
                    i++;
                }
                tokens.push(content.slice(start, i));
            } else {
                let start = i;
                while (i < n && !/\s/.test(content[i] || '') && content[i] !== '(') {
                    i++;
                }
                tokens.push(content.slice(start, i));
            }
        }

        return tokens;
    }

    private parseToken(tokenStr: string): ASTNode {
        let isNegated = false;
        let isExact = false;
        let isComparison = false;
        let term = tokenStr.trim();

        if (term.startsWith('!')) {
            isNegated = true;
            term = term.slice(1).trim();
        }

        if (term.startsWith('<') && term.endsWith('>')) {
            isExact = true;
            term = term.slice(1, -1).trim();
        }

        if (term.includes('<=') || term.includes('>=') || term.includes('<') || term.includes('>') || term.includes('=')) {
            isComparison = true;
        }

        return {
            type: 'token',
            term,
            isExact,
            isNegated,
            isComparison
        };
    }

    // --- МАТЧИНГ ПРЕДМЕТА С AST ДЕРЕВОМ ---

    public matchAST(item: any, ast: ASTNode[]): boolean {
        return ast.every(node => this.matchASTNode(item, node));
    }

    private matchASTNode(item: any, node: ASTNode): boolean {
        let isMatch = false;

        if (node.type === 'token') {
            isMatch = this.matchesToken(item, node);
        } else if (node.type === 'and') {
            isMatch = (node.children || []).every(child => this.matchASTNode(item, child));
        } else if (node.type === 'or') {
            isMatch = (node.children || []).some(child => this.matchASTNode(item, child));
        }

        return node.isNegated ? !isMatch : isMatch;
    }

    private matchesToken(item: any, node: ASTNode): boolean {
        const term = (node.term || '').trim();
        if (!term) return !node.isNegated;

        let isMatch = false;

        if (node.isComparison) {
            isMatch = this.parseAndEvaluateComparison(item, term);
        } else if (node.isExact) {
            const heroSlug = SlugService.toSlug(item.connectedHero || 'Shared');
            const isHeroMatch = heroSlug === term.toLowerCase();

            const isTypeMatch = (item.itemTypes || []).some((type: string) => {
                const typeSlug = SlugService.toSlug(type);
                return typeSlug === term.toLowerCase() || typeSlug.replaceAll('-', '') === term.toLowerCase();
            });

            const isRarityMatch = SlugService.toSlug(item.rarity || 'Common') === term.toLowerCase();

            isMatch = isHeroMatch || isTypeMatch || isRarityMatch;
        } else {
            isMatch = this.itemMatchesStrictTag(item, term);
        }

        return node.isNegated ? !isMatch : isMatch;
    }

    private parseAndEvaluateComparison(item: any, term: string): boolean {
        let cleaned = term.trim();
        if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
            cleaned = cleaned.slice(1, -1).trim();
        }

        const doubleRegex = /^(\d+(?:\.\d+)?)\s*([<>]=?|=)\s*([a-zA-Z_]+)\s*([<>]=?|=)\s*(\d+(?:\.\d+)?)$/i;
        let match = doubleRegex.exec(cleaned);
        if (match) {
            const val1 = Number.parseFloat(match[1]!);
            const op1 = match[2]!;
            const statName = match[3]!;
            const op2 = match[4]!;
            const val2 = Number.parseFloat(match[5]!);

            const statVal = this.getStatValue(item, statName);
            if (statVal === null) return false;

            return this.evaluateOp(val1, op1, statVal) && this.evaluateOp(statVal, op2, val2);
        }

        const singleLeftRegex = /^([a-zA-Z_]+)\s*([<>]=?|=)\s*(\d+(?:\.\d+)?)$/i;
        match = singleLeftRegex.exec(cleaned);
        if (match) {
            const statName = match[1]!;
            const op = match[2]!;
            const val = Number.parseFloat(match[3]!);

            const statVal = this.getStatValue(item, statName);
            if (statVal === null) return false;

            return this.evaluateOp(statVal, op, val);
        }

        const singleRightRegex = /^(\d+(?:\.\d+)?)\s*([<>]=?|=)\s*([a-zA-Z_]+)$/i;
        match = singleRightRegex.exec(cleaned);
        if (match) {
            const val = Number.parseFloat(match[1]!);
            const op = match[2]!;
            const statName = match[3]!;

            const statVal = this.getStatValue(item, statName);
            if (statVal === null) return false;

            return this.evaluateOp(val, op, statVal);
        }

        const statVal = this.getStatValue(item, cleaned);
        return statVal !== null;
    }

    private getStatValue(item: any, statName: string): number | null {
        const norm = statName.toLowerCase();
        const stats = item.combatStats || {};

        if (norm === 'criticalchance' || norm === 'critchance' || norm === 'critical_chance') {
            return stats.criticalChance ?? null;
        }
        if (norm === 'criticaldamage' || norm === 'critdamage' || norm === 'critical_damage') {
            return stats.criticalDamage ?? null;
        }
        if (norm === 'accuracy' || norm === 'acc') {
            return stats.accuracy ?? null;
        }
        if (norm === 'staminacost' || norm === 'stamina') {
            return stats.staminaCost ?? null;
        }
        if (norm === 'cooldown' || norm === 'cd') {
            return stats.cooldown ?? null;
        }
        if (norm === 'damagemin' || norm === 'mindamage' || norm === 'damage_min') {
            return stats.damageMin ?? null;
        }
        if (norm === 'damagemax' || norm === 'maxdamage' || norm === 'damage_max') {
            return stats.damageMax ?? null;
        }
        if (norm === 'coinvalue' || norm === 'value' || norm === 'price' || norm === 'gold' || norm === 'cost') {
            return item.coinValue ?? null;
        }
        if (norm === 'level' || norm === 'lvl') {
            return item.level ?? null;
        }
        return null;
    }

    private evaluateOp(left: number, op: string, right: number): boolean {
        if (op === '<=') return left <= right;
        if (op === '>=') return left >= right;
        if (op === '<') return left < right;
        if (op === '>') return left > right;
        if (op === '=' || op === '==') return left === right;
        return false;
    }

    public itemMatchesStrictTag(item: any, tag: string | undefined): boolean {
        if (!tag) return false;
        
        const tagStr: string = tag;
        const prepared = this.getPrepared(item);
        if (!prepared) return false;

        const normalizedTag = SearchTermService.normalizeText(tagStr);
        if (!normalizedTag) return false;

        const itemTokens = new Set(SearchTermService.tokenize(
            item.name + ' ' + prepared.typeText + ' ' + prepared.normalizedHero + ' ' + prepared.statKeysText + ' ' + prepared.tooltipText
        ));

        if (itemTokens.has(normalizedTag)) return true;

        if (prepared.tooltipText.includes(normalizedTag)) {
            if (normalizedTag === 'buff' && !itemTokens.has('buff') && prepared.tooltipText.includes('debuff')) {
                // skip debuff
            } else {
                return true;
            }
        }

        const canonicalTag = SearchTermService.resolveCanonicalTerm(tagStr);
        if (canonicalTag) {
            const extractedTerms = SearchTermService.extractStrictTerms(
                prepared.tooltipText + ' ' + prepared.baseText + ' ' + prepared.typeText
            );
            
            if (canonicalTag === 'buff' && extractedTerms.has('debuff') && !itemTokens.has('buff') && !extractedTerms.has('buff')) {
                return false;
            }

            if (extractedTerms.has(canonicalTag)) return true;
        }

        return false;
    }

    private compareByCurrentSort(a: any, b: any, sortBy: 'rarity' | 'name' | 'relevance', inverted: boolean = false): number {
        if (sortBy === 'rarity') {
            const weightA = this.rarityWeights[a.rarity] || 0;
            const weightB = this.rarityWeights[b.rarity] || 0;
            if (weightA !== weightB) {
                return inverted ? weightA - weightB : weightB - weightA;
            }
        }

        const comp = a.name.localeCompare(b.name);
        return inverted ? -comp : comp;
    }

    public applyFilters(items: any[], filters: FilterState): any[] {
        let filtered = [...items];
        
        const queryStr = filters.searchQuery || '';
        let cleanQuery = queryStr.replace(/\{[^}]+\}/g, '').trim();
        if (cleanQuery) {
            const ast = this.parseQueryToAST(cleanQuery);
            filtered = filtered.filter(item => this.matchAST(item, ast));
        }

        // Поддержка независимых фильтров для обратной совместимости с unit-тестами
        if (filters.selectedTypes && filters.selectedTypes.size > 0) {
            filtered = filtered.filter(item =>
                (item.itemTypes || []).some((type: string) => filters.selectedTypes.has(type))
            );
        }

        if (filters.selectedRarities && filters.selectedRarities.size > 0) {
            filtered = filtered.filter(item =>
                filters.selectedRarities.has(item.rarity)
            );
        }

        if (filters.selectedHeroes && filters.selectedHeroes.size > 0) {
            filtered = filtered.filter(item => {
                const prepared = this.getPrepared(item);
                return filters.selectedHeroes.has(prepared?.normalizedHero || 'Shared');
            });
        }

        if (filters.selectedUnlockSources && filters.selectedUnlockSources.size > 0) {
            filtered = filtered.filter(item => {
                const prepared = this.getPrepared(item);
                return filters.selectedUnlockSources.has(prepared?.unlockSource || 'Unknown');
            });
        }

        if (filters.purchasableOnly !== null) {
            filtered = filtered.filter(item =>
                item.purchasable === filters.purchasableOnly
            );
        }

        if (filters.selectedBuffs && filters.selectedBuffs.size > 0) {
            filtered = filtered.filter(item =>
                Array.from(filters.selectedBuffs).some(buff =>
                    this.itemMatchesStrictTag(item, buff)
                )
            );
        }

        if (filters.selectedDebuffs && filters.selectedDebuffs.size > 0) {
            filtered = filtered.filter(item =>
                Array.from(filters.selectedDebuffs).some(debuff =>
                    this.itemMatchesStrictTag(item, debuff)
                )
            );
        }

        if (filters.selectedStats && filters.selectedStats.size > 0) {
            filtered = filtered.filter(item =>
                Array.from(filters.selectedStats).some(stat =>
                    this.itemMatchesStrictTag(item, stat)
                )
            );
        }

        return filtered;
    }

    public sortItems(items: any[], sortBy: 'rarity' | 'name' | 'relevance', query: string = ''): any[] {
        let activeSort = sortBy;
        let inverted = false;

        const sortMatch = /\{([a-zA-Z\s]+)\}/i.exec(query);
        if (sortMatch) {
            const modeStr = sortMatch[1]!.toLowerCase().trim();
            
            if (modeStr === 'rarity down') {
                activeSort = 'rarity';
                inverted = false;
            } else if (modeStr === 'rarity up') {
                activeSort = 'rarity';
                inverted = true;
            } else if (modeStr === 'alphabet up') {
                activeSort = 'name';
                inverted = false;
            } else if (modeStr === 'alphabet down') {
                activeSort = 'name';
                inverted = true;
            } else if (modeStr === 'relevance') {
                activeSort = 'relevance';
            }
        }

        const sorted = [...items];
        sorted.sort((a, b) => {
            return this.compareByCurrentSort(a, b, activeSort, inverted);
        });
        return sorted;
    }

    public calculateFilterOptions(items: any[]) {
        const allTypes = new Set<string>();
        const allRarities = new Set<string>();
        const allHeroes = new Set<string>();
        const allUnlockSources = new Set<string>();
        const allBuffs = new Set<string>();
        const allDebuffs = new Set<string>();
        const allStats = new Set<string>();

        const buffKeywords = ['buff', 'haste', 'regeneration', 'cleanse', 'luck', 'empower', 'thorns', 'heal', 'lifesteal', 'mana'];
        const debuffKeywords = ['poison', 'burn', 'bleed', 'chill', 'frost', 'curse', 'blind', 'stun', 'debuff'];
        const statKeywords = ['damage', 'critical', 'accuracy', 'stamina', 'cooldown', 'health', 'armor', 'resist', 'shield', 'block'];

        items.forEach(item => {
            (item.itemTypes || []).forEach((type: string) => allTypes.add(type));
            allRarities.add(item.rarity);
            
            const hero = item.connectedHero || 'Shared';
            const normalizedHero = hero === 'Hob Gang' ? 'Hob' : hero;
            allHeroes.add(normalizedHero);
            
            allUnlockSources.add(item.unlockSource || 'Unknown');

            const prepared = this.getPrepared(item);
            if (prepared) {
                const combinedText = prepared.tooltipText + ' ' + prepared.baseText + ' ' + prepared.typeText;
                const extractedTerms = SearchTermService.extractStrictTerms(combinedText);

                buffKeywords.forEach(buff => {
                    if (extractedTerms.has(buff)) {
                        allBuffs.add(buff.charAt(0).toUpperCase() + buff.slice(1));
                    }
                });

                debuffKeywords.forEach(debuff => {
                    if (extractedTerms.has(debuff)) {
                        allDebuffs.add(debuff.charAt(0).toUpperCase() + debuff.slice(1));
                    }
                });

                statKeywords.forEach(stat => {
                    if (extractedTerms.has(stat)) {
                        allStats.add(stat.charAt(0).toUpperCase() + stat.slice(1));
                    }
                });
            }
        });

        const priorityTypes = ['Bag', 'Melee Weapon', 'Ranged Weapon', 'Pet', 'Food', 'Accessory', 'Armor'];
        const sortedTypes = Array.from(allTypes).sort((a, b) => {
            const priorityA = priorityTypes.indexOf(a);
            const priorityB = priorityTypes.indexOf(b);
            if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB;
            if (priorityA !== -1) return -1;
            if (priorityB !== -1) return 1;
            return a.localeCompare(b);
        });
        
        const sortedRarities = Array.from(allRarities).sort((a, b) => {
            const weightA = this.rarityWeights[a] || 0;
            const weightB = this.rarityWeights[b] || 0;
            return weightB - weightA;
        });
        
        const sortedHeroes = Array.from(allHeroes).sort((a, b) => {
            if (a === 'Shared') return -1;
            if (b === 'Shared') return 1;
            return a.localeCompare(b);
        });
        
        const sortedUnlockSources = Array.from(allUnlockSources).sort((a, b) => a.localeCompare(b));
        
        const sortedBuffs = Array.from(allBuffs).sort((a, b) => {
            if (a === 'Buff') return -1;
            if (b === 'Buff') return 1;
            return a.localeCompare(b);
        });
        
        const sortedDebuffs = Array.from(allDebuffs).sort((a, b) => {
            if (a === 'Debuff') return -1;
            if (b === 'Debuff') return 1;
            return a.localeCompare(b);
        });
        
        const sortedStats = Array.from(allStats).sort((a, b) => a.localeCompare(b));

        return {
            sortedTypes,
            sortedRarities,
            sortedHeroes,
            sortedUnlockSources,
            sortedBuffs,
            sortedDebuffs,
            sortedStats
        };
    }
}
