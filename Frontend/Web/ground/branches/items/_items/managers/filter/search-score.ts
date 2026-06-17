const SCORE_KEY = '__itemsFuseScore';

export function setSearchScore(item: any, score: number): void {
    Object.defineProperty(item, SCORE_KEY, {
        value: score,
        configurable: true,
        enumerable: false,
        writable: true,
    });
}

export function getSearchScore(item: any): number | null {
    const score = item?.[SCORE_KEY];
    return typeof score === 'number' ? score : null;
}

export function clearSearchScores(items: any[]): void {
    items.forEach(item => {
        if (item && Object.prototype.hasOwnProperty.call(item, SCORE_KEY)) {
            delete item[SCORE_KEY];
        }
    });
}
