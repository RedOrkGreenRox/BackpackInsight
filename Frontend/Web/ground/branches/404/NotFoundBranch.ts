import { PageMeta } from '../../roots/Branch';
import { BranchSpec } from '../../roots/BranchSpec';
import { BranchRunner } from '../../roots/BranchRunner';
import { t } from '../../localization/i18n';
import { NotFoundDisplay } from './_404/display/NotFoundDisplay';
import { NotFoundData } from './_404/data/NotFoundData';
import { NotFoundLogic } from './_404/logic/NotFoundLogic';
import './404.scss';

export const notFoundSpec: BranchSpec<void, void> = {
  id: 'not-found',
  routes: ['/404'],
  styles: {
    pageClass: 'not-found-page',
    bodyClass: 'error-404',
  },
  display: new NotFoundDisplay(),
  data: new NotFoundData(),
  meta: (): PageMeta => ({
    title: t('not_found_meta_title'),
    description: t('not_found_meta_description'),
  }),
  logic: (_ctx, root: HTMLElement) => [new NotFoundLogic(root)],
};

export const NotFoundBranch = new BranchRunner(notFoundSpec).createBranchClass();
