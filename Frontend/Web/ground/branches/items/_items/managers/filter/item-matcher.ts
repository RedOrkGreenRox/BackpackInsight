import { SearchTermService } from '../../../../../utils/SearchTermService';
import { SlugService } from '../../../../../utils/SlugService';
import { ASTNode, PreparedItem } from './filter-types';
import { getItemKey } from './prepared-items';
import { parseAndEvaluateComparison } from './comparison';

export class ItemMatcher {
    constructor(private readonly preparedByKey: Map<string, PreparedItem>) {}

    public matchAST(item: any, ast: ASTNode[]): boolean {
        return ast.every(node => this.matchASTNode(item, node));
    }

    public itemMatchesStrictTag(item: any, tag: string | undefined): boolean {
        if (!tag) return false;
        const prepared = this.getPrepared(item);
        if (!prepared) return false;
        const normalizedTag = SearchTermService.normalizeText(tag);
        if (!normalizedTag) return false;

        const itemTokens = new Set(SearchTermService.tokenize(
            `${item.name} ${prepared.typeText} ${prepared.normalizedHero} ${prepared.statKeysText} ${prepared.tooltipText}`,
        ));
        const strictTokens = new Set(SearchTermService.tokenize(prepared.strictText));
        const compactTag = normalizedTag.replace(/\s+/g, '');
        const tagTokens = SearchTermService.tokenize(tag);
        if (itemTokens.has(normalizedTag) || strictTokens.has(normalizedTag) || strictTokens.has(compactTag)) return true;
        if (tagTokens.length > 1 && tagTokens.every(token => itemTokens.has(token) || strictTokens.has(token))) return true;

        if (this.tooltipContains(prepared.tooltipText, normalizedTag, itemTokens)) return true;
        const canonicalTag = SearchTermService.resolveCanonicalTerm(tag);
        if (!canonicalTag) return false;

        const extractedTerms = SearchTermService.extractStrictTerms(
            `${prepared.tooltipText} ${prepared.baseText} ${prepared.typeText}`,
        );
        if (canonicalTag === 'buff' && extractedTerms.has('debuff') && !itemTokens.has('buff') && !extractedTerms.has('buff')) {
            return false;
        }
        return extractedTerms.has(canonicalTag);
    }

    private matchASTNode(item: any, node: ASTNode): boolean {
        let isMatch = false;
        if (node.type === 'token') isMatch = this.matchesToken(item, node);
        else if (node.type === 'and') isMatch = (node.children || []).every(child => this.matchASTNode(item, child));
        else if (node.type === 'or') isMatch = (node.children || []).some(child => this.matchASTNode(item, child));
        return node.isNegated ? !isMatch : isMatch;
    }

    private matchesToken(item: any, node: ASTNode): boolean {
        const term = (node.term || '').trim();
        if (!term) return !node.isNegated;
        let isMatch = false;
        if (node.isComparison) isMatch = parseAndEvaluateComparison(item, term);
        else if (node.isExact) isMatch = this.matchesExact(item, term);
        else isMatch = this.itemMatchesStrictTag(item, term);
        return isMatch;
    }

    private matchesExact(item: any, term: string): boolean {
        const lower = term.toLowerCase();
        const heroSlug = SlugService.toSlug(item.connectedHero || 'Shared');
        const isHeroMatch = heroSlug === lower;
        const isTypeMatch = (item.itemTypes || []).some((type: string) => {
            const typeSlug = SlugService.toSlug(type);
            return typeSlug === lower || typeSlug.replaceAll('-', '') === lower;
        });
        const isRarityMatch = SlugService.toSlug(item.rarity || 'Common') === lower;
        const isPurchasableMatch = lower === 'purchasable' && item.purchasable === true;
        return isHeroMatch || isTypeMatch || isRarityMatch || isPurchasableMatch;
    }

    private tooltipContains(text: string, tag: string, tokens: Set<string>): boolean {
        if (!text.includes(tag)) return false;
        return !(tag === 'buff' && !tokens.has('buff') && text.includes('debuff'));
    }

    private getPrepared(item: any): PreparedItem | undefined {
        return this.preparedByKey.get(getItemKey(item));
    }
}
