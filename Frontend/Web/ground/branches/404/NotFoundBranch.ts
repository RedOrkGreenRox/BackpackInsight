import { Branch, PageMeta } from '../../roots/Branch';
import { t } from '../../localization/i18n';
import { 
    ContainerRenderer, 
    TitleRenderer, 
    TextRenderer, 
    ButtonRenderer,
    NavigationManager 
} from './_404';
import './404.scss';

export class NotFoundBranch extends Branch {
    private isMounted = false;

    public override getMeta(): PageMeta {
        return {
            title: t('not_found_meta_title'),
            description: t('not_found_meta_description')
        };
    }

    protected getHtml(): string {
        const title = TitleRenderer.render();
        const text = TextRenderer.render();
        const button = ButtonRenderer.render();
        
        return ContainerRenderer.render()
            .replace('{{CONTENT}}', `${title}${text}${button}`);
    }

    protected init(): void {
        this.isMounted = true;

        import('./_404/background/background').then(({ BackgroundManager }) => {
            if (this.isMounted) {
                BackgroundManager.set404Background();
            }
        });

        NavigationManager.initNavigation(this.container);
    }

    protected destroy(): void {
        this.isMounted = false;

        import('./_404/background/background').then(({ BackgroundManager }) => {
            BackgroundManager.restoreNormalBackground();
        });
    }
}
