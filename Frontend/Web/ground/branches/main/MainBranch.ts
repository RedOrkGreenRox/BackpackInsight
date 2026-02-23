import { Branch, PageMeta } from '@roots/Branch.ts';
import { t } from '../../localization/i18n';
import { JsonValidator } from '@utils/JsonValidator';
import './main.scss';

// Импортируем все модульные компоненты
import {
    ContainerRenderer,
    TitleRenderer,
    UploadZoneRenderer,
    ErrorRenderer,
    MainManager
} from './_main/index';

export class MainBranch extends Branch {
    private mainManager: MainManager | null = null;
    
    public override getMeta(): PageMeta {
        return {
            title: "Backpack Insight — " + t('profile_title'),
            description: t('main_meta_description')
        };
    }

    protected getHtml(): string {
        const container = ContainerRenderer.render();
        const error = ErrorRenderer.render();
        const title = TitleRenderer.render(t);
        const uploadZone = UploadZoneRenderer.render(t);
        
        return container
            .replace('{{CONTENT}}', `${error}${title}${uploadZone}`);
    }

    protected init(): void {
        if (!this.container) return;
        
        // Инициализация главного менеджера
        this.mainManager = new MainManager(this.container, t, JsonValidator);
        this.mainManager.init();
    }

    protected destroy(): void {
        // Очистка главного менеджера
        if (this.mainManager) {
            this.mainManager.destroy();
            this.mainManager = null;
        }
    }
}
