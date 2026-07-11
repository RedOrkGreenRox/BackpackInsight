import { BranchLogic } from '../../../../roots/StructuredBranch';
import { NavigationManager } from '../navigation/navigation';

export class NotFoundLogic implements BranchLogic<void> {
  private readonly root: HTMLElement;
  private navCleanup: (() => void) | null = null;
  private isMounted = true;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  public async init(): Promise<void> {
    this.navCleanup = NavigationManager.initNavigation(this.root);
    const { BackgroundManager } = await import('../background/background');
    if (this.isMounted) BackgroundManager.set404Background();
  }

  public destroy(): void {
    this.isMounted = false;
    this.navCleanup?.();
    this.navCleanup = null;
    import('../background/background').then(({ BackgroundManager }) => {
      BackgroundManager.restoreNormalBackground();
    });
  }
}
