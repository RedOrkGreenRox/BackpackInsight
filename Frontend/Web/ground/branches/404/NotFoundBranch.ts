import { PageMeta } from '../../roots/Branch';
import { StructuredBranch } from '../../roots/StructuredBranch';
import { t } from '../../localization/i18n';
import { NotFoundDisplay } from './_404/display/NotFoundDisplay';
import { NotFoundData } from './_404/data/NotFoundData';
import { NotFoundLogic } from './_404/logic/NotFoundLogic';
import './404.scss';

export class NotFoundBranch extends StructuredBranch<void, void> {
  protected pageClass = 'not-found-page';
  protected bodyClass = 'error-404';
  protected display = new NotFoundDisplay();
  protected data = new NotFoundData();
  protected meta: PageMeta = {
    title: t('not_found_meta_title'),
    description: t('not_found_meta_description'),
  };

  protected createLogic(_context: void, root: HTMLElement): NotFoundLogic {
    return new NotFoundLogic(root);
  }
}
