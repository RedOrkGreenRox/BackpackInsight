import { PreparedItem } from './filter-types';

export function shortTermMatches(value: string, item: PreparedItem): boolean {
    const term = value.toLowerCase().trim();
    if (term.length > 3) return true;
    return (` ${item.baseText} ${item.searchText} `).includes(` ${term} `);
}
