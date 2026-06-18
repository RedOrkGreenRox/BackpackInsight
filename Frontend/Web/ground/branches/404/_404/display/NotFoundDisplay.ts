import { BranchDisplay } from '../../../../roots/StructuredBranch';
import {
  ContainerRenderer,
  TitleRenderer,
  TextRenderer,
  ButtonRenderer,
} from '../';

export class NotFoundDisplay implements BranchDisplay<void, void> {
  public renderSkeleton(): string {
    return `<div class="not-found-page"><div class="nf-container loading">404</div></div>`;
  }

  public renderError(): string {
    return this.renderSkeleton();
  }

  public renderFullPage(): string {
    const title = TitleRenderer.render();
    const text = TextRenderer.render();
    const button = ButtonRenderer.render();
    return `<div class="not-found-page">${ContainerRenderer.render().replace('{{CONTENT}}', `${title}${text}${button}`)}</div>`;
  }
}
