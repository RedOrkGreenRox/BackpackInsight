import { PageMeta } from '../../roots/Branch';
import { BranchSpec } from '../../roots/BranchSpec';
import { BranchRunner } from '../../roots/BranchRunner';
import { BranchDisplay, BranchData, BranchLogic } from '../../roots/StructuredBranch';
import { t } from '../../localization/i18n';
import './main.scss';

// Импортируем все модульные компоненты
import {
    ContainerRenderer,
    TitleRenderer,
    UploadZoneRenderer,
    ErrorRenderer,
    MainManager
} from './_main/index';

class MainDisplay implements BranchDisplay<void, void> {
  renderSkeleton(): string {
    return `<div class="main-page-skeleton"></div>`;
  }
  renderError(error: unknown): string {
    return `<div class="error-view">${String(error)}</div>`;
  }
  renderFullPage(): string {
    const container = ContainerRenderer.render();
    const error = ErrorRenderer.render();
    const title = TitleRenderer.render(t);
    const uploadZone = UploadZoneRenderer.render(t);
    
    return container.replace('{{CONTENT}}', `${error}${title}${uploadZone}`);
  }
}

class MainDataLoader implements BranchData<void, void> {
  async load(): Promise<void> {
    return Promise.resolve();
  }
}

class MainLogic implements BranchLogic<void> {
  private mainManager: MainManager | null = null;

  init(_context: void, root: HTMLElement): void {
    this.mainManager = new MainManager(root, t);
    this.mainManager.init();
  }

  destroy(): void {
    if (this.mainManager) {
      this.mainManager.destroy();
      this.mainManager = null;
    }
  }
}

export const mainSpec: BranchSpec<void, void> = {
  id: 'main',
  routes: ['/'],
  styles: {
    pageClass: 'main-page',
  },
  display: new MainDisplay(),
  data: new MainDataLoader(),
  meta: (): PageMeta => ({
    title: "Backpack Insight — " + t('profile_title'),
    description: t('main_meta_description')
  }),
  logic: () => [new MainLogic()],
};

export const MainBranch = new BranchRunner(mainSpec).createBranchClass();
