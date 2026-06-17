export function getCurrentSortFromQuery(query: string): { mode: 'rarity' | 'name' | 'relevance'; inverted: boolean } {
    const sortMatch = /\{([a-zA-Z\s]+)\}/i.exec(query);
    if (!sortMatch) return { mode: 'rarity', inverted: false };
    const modeStr = sortMatch[1]!.toLowerCase().trim();
    if (modeStr === 'rarity down') return { mode: 'rarity', inverted: false };
    if (modeStr === 'rarity up') return { mode: 'rarity', inverted: true };
    if (modeStr === 'alphabet up') return { mode: 'name', inverted: false };
    if (modeStr === 'alphabet down') return { mode: 'name', inverted: true };
    if (modeStr === 'relevance') return { mode: 'relevance', inverted: false };
    return { mode: 'rarity', inverted: false };
}
