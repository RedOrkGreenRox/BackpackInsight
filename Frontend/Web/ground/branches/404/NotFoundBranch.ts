import { Branch } from '../../roots/Branch';
import { 
    ContainerRenderer, 
    TitleRenderer, 
    TextRenderer, 
    ButtonRenderer, 
    BackgroundManager, 
    NavigationManager 
} from './_404';
import './404.scss';

export class NotFoundBranch extends Branch {
    protected getHtml(): string {
        const title = TitleRenderer.render();
        const text = TextRenderer.render();
        const button = ButtonRenderer.render();
        
        return ContainerRenderer.render()
            .replace('{{CONTENT}}', `${title}${text}${button}`);
    }

    protected init(): void {
        BackgroundManager.set404Background();
        NavigationManager.initNavigation(this.container);
    }

    protected destroy(): void {
        BackgroundManager.restoreNormalBackground();
    }
}
