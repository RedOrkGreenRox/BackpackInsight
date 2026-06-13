import { Branch, PageMeta } from '@roots/Branch.ts';
import { ProfileDataManager } from './_profile/managers/ProfileDataManager';
import { ProfileManager } from './_profile/managers/ProfileManager';
import './profile.scss';

export class ProfileBranch extends Branch {
    private readonly dataManager = new ProfileDataManager();
    private manager: ProfileManager | null = null;

    public override getMeta(data?: any): PageMeta {
        return this.dataManager.getMeta(data ?? null);
    }

    protected getHtml(data?: any): string {
        const profileData = this.dataManager.resolve(data);
        if (!profileData) {
            return `<div class="container"><h1 class="error">Нет данных профиля</h1></div>`;
        }

        const savedState = this.dataManager.restoreSavedState();
        const itemSort = profileData.itemsSort ?? savedState.itemSort ?? 'rarity';
        profileData.items = this.dataManager.sortItems(profileData.items, itemSort);

        // Запоминаем данные на this чтобы init() мог их использовать
        (this as any)._pending = { profileData, savedState, itemSort };

        return this.dataManager.renderSkeleton();
    }

    protected init(_data?: any): void {
        if (!this.container) return;
        const pending = (this as any)._pending;
        if (!pending) return;
        delete (this as any)._pending;

        const { profileData, savedState, itemSort } = pending;

        this.manager = new ProfileManager(
            this.container,
            profileData,
            itemSort,
            savedState,
            this.dataManager,
        );
        this.manager.init();
    }

    protected destroy(): void {
        this.manager?.destroy();
        this.manager = null;
    }
}
