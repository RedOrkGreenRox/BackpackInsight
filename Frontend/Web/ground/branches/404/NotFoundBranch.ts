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
    private navCleanup: (() => void) | null = null;

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

        // Сначала сохраняем деструктор навигации, затем запускаем фон.
        // Порядок важен: если destroy() придёт до resolve — навигация уже очищена,
        // а фон не будет установлен благодаря проверке isMounted.
        this.navCleanup = NavigationManager.initNavigation(this.container);

        import('./_404/background/background').then(({ BackgroundManager }) => {
            if (this.isMounted) BackgroundManager.set404Background();
        });
    }

    protected destroy(): void {
        this.isMounted = false;
        this.navCleanup?.();
        this.navCleanup = null;

        import('./_404/background/background').then(({ BackgroundManager }) => {
            BackgroundManager.restoreNormalBackground();
        });
    }
}
