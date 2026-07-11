export interface SavedState {
    scrollY: number;
    itemSort: 'rarity' | 'level';
    heroSort: {
        sortBy: 'level' | 'rating';
        inverted: boolean;
    };
    currentSkins: Record<string, string>;
}

export class ProfileStateManager {
    private readonly STATE_KEY = 'profileDynamicState';

    public saveState(state: SavedState): void {
        const stateJson = JSON.stringify(state);
        sessionStorage.setItem(this.STATE_KEY, stateJson);
        localStorage.setItem(this.STATE_KEY, stateJson);
    }

    public restoreState(): SavedState {
        try {
            const saved = sessionStorage.getItem(this.STATE_KEY) || localStorage.getItem(this.STATE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error restoring profile state:', e);
        }

        return {
            scrollY: 0,
            itemSort: 'rarity',
            heroSort: { sortBy: 'level', inverted: false },
            currentSkins: {}
        };
    }

    public clearState(): void {
        sessionStorage.removeItem(this.STATE_KEY);
        localStorage.removeItem(this.STATE_KEY);
    }
}
