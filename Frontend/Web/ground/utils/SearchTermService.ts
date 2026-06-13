type AliasEntry = string | { term: string; weight?: number };
type AliasMap = Record<string, AliasEntry[]>;

export interface ExpandedQueryTerm {
    term: string;
    weight: number;
    isOriginal: boolean;
}

export class SearchTermService {
    private static initialized = false;
    private static aliases: AliasMap = {};
    private static tokenToExpansion = new Map<string, Map<string, number>>();
    private static readonly MIN_PREFIX_LENGTH = 4;

    public static async init(): Promise<void> {
        if (this.initialized) return;

        try {
            const response = await fetch('/search/term-aliases.ru.json');
            if (response.ok) {
                this.aliases = await response.json();
            }
        } catch {
            this.aliases = {};
        }

        this.buildIndex();
        this.initialized = true;
    }

    public static normalizeText(text: string): string {
        return String(text)
            .replace(/([\p{Ll}])([\p{Lu}])/gu, '$1 $2')
            .replace(/[_/.-]+/g, ' ')
            .toLowerCase()
            .replace(/ё/g, 'е')
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    public static tokenize(text: string): string[] {
        const normalized = this.normalizeText(text);
        return normalized ? normalized.split(' ').filter(Boolean) : [];
    }

    public static expandText(text: string): string {
        const tokens = this.tokenize(text);
        const expanded = new Set<string>(tokens);

        for (const token of tokens) {
            for (const alias of this.expandToken(token).keys()) {
                expanded.add(alias);
            }
        }

        return [...expanded].join(' ');
    }

    public static expandQuery(query: string): string {
        return this.getExpandedQueryTerms(query).join(' ');
    }

    public static getExpandedQueryTerms(query: string): string[] {
        return this.getWeightedExpandedQueryTerms(query).map(entry => entry.term);
    }

    public static getWeightedExpandedQueryTerms(query: string): ExpandedQueryTerm[] {
        const normalizedQuery = this.normalizeText(query);
        const tokens = this.tokenize(normalizedQuery);
        const expanded = new Map<string, ExpandedQueryTerm>();

        const addTerm = (term: string, weight: number, isOriginal: boolean) => {
            const normalized = this.normalizeText(term);
            if (!normalized) return;

            const existing = expanded.get(normalized);
            if (!existing || weight < existing.weight || (isOriginal && !existing.isOriginal)) {
                expanded.set(normalized, { term: normalized, weight, isOriginal: existing?.isOriginal || isOriginal });
            }
        };

        if (normalizedQuery) addTerm(normalizedQuery, 0, true);

        for (const token of tokens) {
            addTerm(token, 0, true);
            for (const [alias, weight] of this.expandToken(token)) {
                addTerm(alias, weight, false);
            }
        }

        return [...expanded.values()]
            .sort((a, b) => a.weight - b.weight || a.term.localeCompare(b.term))
            .slice(0, 32);
    }

    public static resolveCanonicalTerm(term: string): string | null {
        const normalized = this.normalizeText(term);
        if (!normalized) return null;

        for (const canonical of Object.keys(this.aliases)) {
            const canonicalTokens = this.tokenize(canonical);
            if (canonicalTokens.includes(normalized) || this.normalizeText(canonical) === normalized) {
                return this.normalizeText(canonical);
            }

            const aliases = this.aliases[canonical] || [];
            if (aliases.some(alias => this.normalizeText(this.getAliasTerm(alias)) === normalized)) {
                return this.normalizeText(canonical);
            }
        }

        return normalized;
    }

    public static extractStrictTerms(text: string): Set<string> {
        const normalizedText = this.normalizeText(text);
        const terms = new Set<string>();

        for (const canonical of Object.keys(this.aliases)) {
            const normalizedCanonical = this.normalizeText(canonical);
            if (this.textHasTokenLike(normalizedText, normalizedCanonical)) {
                terms.add(normalizedCanonical);
            }
        }

        return terms;
    }

    public static semanticRank(text: string, query: string): number {
        const normalizedText = this.normalizeText(text);
        const queryTokens = this.tokenize(query);
        if (!queryTokens.length) return 2;

        for (const token of queryTokens) {
            if (this.textHasTokenLike(normalizedText, token)) return 0;

            const expanded = this.expandToken(token);
            for (const alias of expanded.keys()) {
                if (this.textHasTokenLike(normalizedText, alias)) return 1;
            }
        }

        return 2;
    }

    private static buildIndex(): void {
        this.tokenToExpansion.clear();

        for (const [canonicalRaw, aliasesRaw] of Object.entries(this.aliases)) {
            const weightedTerms = new Map<string, number>();
            const canonicalTokens = this.tokenize(canonicalRaw);

            for (const token of canonicalTokens) weightedTerms.set(token, 0.08);

            for (const alias of aliasesRaw) {
                const aliasTerm = this.getAliasTerm(alias);
                const aliasWeight = this.getAliasWeight(alias);
                for (const token of this.tokenize(aliasTerm)) {
                    weightedTerms.set(token, Math.min(weightedTerms.get(token) ?? Infinity, aliasWeight));
                }
            }

            const group = [...weightedTerms.entries()];
            for (const [token, tokenWeight] of group) {
                if (!this.tokenToExpansion.has(token)) {
                    this.tokenToExpansion.set(token, new Map());
                }
                const target = this.tokenToExpansion.get(token)!;
                for (const [related, relatedWeight] of group) {
                    if (related === token) continue;
                    // Если пользователь ввел алиас, canonical/соседние термины чуть штрафуем.
                    const edgeWeight = Math.max(tokenWeight, relatedWeight);
                    target.set(related, Math.min(target.get(related) ?? Infinity, edgeWeight));
                }
            }
        }
    }

    private static expandToken(token: string): Map<string, number> {
        const exact = this.tokenToExpansion.get(token);
        if (exact) return new Map(exact);

        if (token.length < this.MIN_PREFIX_LENGTH) return new Map();

        const expanded = new Map<string, number>();
        for (const [knownToken, aliases] of this.tokenToExpansion.entries()) {
            if (knownToken.length < this.MIN_PREFIX_LENGTH) continue;
            if (token.startsWith(knownToken) || knownToken.startsWith(token)) {
                expanded.set(knownToken, Math.min(expanded.get(knownToken) ?? Infinity, 0.18));
                aliases.forEach((weight, alias) => {
                    expanded.set(alias, Math.min(expanded.get(alias) ?? Infinity, weight + 0.08));
                });
            }
        }

        return expanded;
    }

    private static getAliasTerm(alias: AliasEntry): string {
        return typeof alias === 'string' ? alias : alias.term;
    }

    private static getAliasWeight(alias: AliasEntry): number {
        return typeof alias === 'string' ? 0.16 : (alias.weight ?? 0.16);
    }

    private static textHasTokenLike(normalizedText: string, token: string): boolean {
        if (!normalizedText || !token) return false;
        if (normalizedText.includes(token)) return true;

        if (token.length < this.MIN_PREFIX_LENGTH) return false;
        return normalizedText.split(' ').some(part =>
            part.length >= this.MIN_PREFIX_LENGTH && (part.startsWith(token) || token.startsWith(part))
        );
    }
}
