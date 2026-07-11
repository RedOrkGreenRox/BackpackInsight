import { PageMeta } from '../../roots/Branch';
import { BranchSpec } from '../../roots/BranchSpec';
import { BranchRunner } from '../../roots/BranchRunner';
import { BranchDisplay, BranchData, BranchLogic } from '../../roots/StructuredBranch';
import { ProfileDataManager } from './_profile/managers/ProfileDataManager';
import { ProfileManager } from './_profile/managers/ProfileManager';
import { SavedState } from './_profile/managers/ProfileStateManager';
import { ProfileData } from './_profile/utils/profile-types';
import './profile.scss';

interface ProfileContext {
  profileData: ProfileData;
  savedState: SavedState;
  itemSort: 'rarity' | 'level';
}

class ProfileDisplay implements BranchDisplay<any, ProfileContext> {
  private readonly dataManager = new ProfileDataManager();

  renderSkeleton(): string {
    return this.dataManager.renderSkeleton();
  }

  renderError(error: unknown): string {
    return `<div class="container"><h1 class="error">${String(error)}</h1></div>`;
  }

  renderFullPage(): string {
    return `<div class="profile-mount-wrapper"></div>`;
  }
}

class ProfileDataLoader implements BranchData<any, ProfileContext> {
  private readonly dataManager = new ProfileDataManager();

  async load(input?: any): Promise<ProfileContext> {
    const profileData = this.dataManager.resolve(input);
    if (!profileData) {
      throw new Error('Нет данных профиля');
    }

    const savedState = this.dataManager.restoreSavedState();
    const itemSort = profileData.itemsSort ?? savedState.itemSort ?? 'rarity';
    profileData.items = this.dataManager.sortItems(profileData.items, itemSort);

    return { profileData, savedState, itemSort };
  }
}

class ProfileLogic implements BranchLogic<ProfileContext> {
  private manager: ProfileManager | null = null;
  private readonly dataManager = new ProfileDataManager();

  init(context: ProfileContext, root: HTMLElement): void {
    this.manager = new ProfileManager(
      root,
      context.profileData,
      context.itemSort,
      context.savedState,
      this.dataManager,
    );
    this.manager.init();
  }

  destroy(): void {
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}

export const profileSpec: BranchSpec<any, ProfileContext> = {
  id: 'profile',
  routes: ['/profile'],
  display: new ProfileDisplay(),
  data: new ProfileDataLoader(),
  meta: (input?: any): PageMeta => {
    const dataManager = new ProfileDataManager();
    const profileData = dataManager.resolve(input);
    const meta = dataManager.getMeta(profileData);
    return {
      title: meta?.title ?? "Profile",
      description: meta?.description ?? "Player Profile Details"
    };
  },
  logic: () => [new ProfileLogic()],
};

export const ProfileBranch = new BranchRunner(profileSpec).createBranchClass();
