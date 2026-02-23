export class StorageManager {
    private static readonly DRAFT_KEY = 'profile_draft_data';

    public static save(data: string): void {
        try {
            if (data.trim()) {
                localStorage.setItem(this.DRAFT_KEY, data);
                console.log('[StorageManager] Draft saved');
            } else {
                localStorage.removeItem(this.DRAFT_KEY);
                console.log('[StorageManager] Draft removed');
            }
        } catch (error) {
            console.error('[StorageManager] Save error:', error);
        }
    }
    
    public static restore(): string | null {
        try {
            return localStorage.getItem(this.DRAFT_KEY);
        } catch (error) {
            console.error('[StorageManager] Restore error:', error);
            return null;
        }
    }
    
    public static clear(): void {
        localStorage.removeItem(this.DRAFT_KEY);
    }
}
