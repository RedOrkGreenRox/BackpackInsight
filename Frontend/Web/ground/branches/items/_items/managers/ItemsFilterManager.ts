// @ts-ignore
import Fuse from 'fuse.js';
import { FilterState } from './ItemsStateManager';
import { applyFilters as applyFiltersCore } from './filter/filter-applier';
import { calculateFilterOptions as calculateFilterOptionsCore } from './filter/filter-options';
import { applySearch, withoutSearch } from './filter/fuse-search';
import { ItemMatcher } from './filter/item-matcher';
import { mapPreparedByKey, prepareItems } from './filter/prepared-items';
import { parseQueryToAST as parseQueryToASTCore } from './filter/query-parser';
import { sortItems as sortItemsCore } from './filter/sort-service';
import { ASTNode, FilterOptions, PreparedItem } from './filter/filter-types';

export type { ASTNode, PreparedItem } from './filter/filter-types';

export class ItemsFilterManager {
    public fuse: Fuse<PreparedItem> | null = null;
    private preparedItems: PreparedItem[] = [];
    private preparedByKey = new Map<string, PreparedItem>();
    private matcher = new ItemMatcher(this.preparedByKey);

    public initFuse(items: any[]): void {
        this.preparedItems = prepareItems(items);
        this.preparedByKey = mapPreparedByKey(this.preparedItems);
        this.matcher = new ItemMatcher(this.preparedByKey);
        this.fuse = new Fuse(this.preparedItems, {
            includeScore: true,
            threshold: 0.4,
            ignoreLocation: true,
            keys: [
                { name: 'item.name', weight: 2.4 },
                { name: 'typeText', weight: 1.4 },
                { name: 'normalizedHero', weight: 1 },
                { name: 'searchText', weight: 1.1 },
                { name: 'tooltipText', weight: 0.35 },
            ],
        });
    }

    public parseQueryToAST(query: string): ASTNode[] {
        return parseQueryToASTCore(query);
    }

    public matchAST(item: any, ast: ASTNode[]): boolean {
        return this.matcher.matchAST(item, ast);
    }

    public itemMatchesStrictTag(item: any, tag: string | undefined): boolean {
        return this.matcher.itemMatchesStrictTag(item, tag);
    }

    public applyFilters(items: any[], filters: FilterState): any[] {
        const searched = applySearch(items, filters.searchQuery, this.fuse, this.matcher);
        return applyFiltersCore(searched, withoutSearch(filters), this.matcher);
    }

    public sortItems(items: any[], sortBy: 'rarity' | 'name' | 'relevance', query: string = ''): any[] {
        return sortItemsCore(items, sortBy, query);
    }

    public calculateFilterOptions(items: any[]): FilterOptions {
        return calculateFilterOptionsCore(items, this.preparedByKey);
    }
}
