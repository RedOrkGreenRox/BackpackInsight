import { Branch, PageMeta } from '@roots/Branch.ts';
import { t } from '../../localization/i18n';
import { JsonValidator } from '@utils/JsonValidator';
import './main.scss';

// Импортируем модульные компоненты
import {
    ContainerRenderer,
    TitleRenderer,
    UploadZoneRenderer,
    ErrorRenderer,
    FormManager,
    DraftManager,
    UploadHandler
} from './_main/index';
import { SubmitManager } from './_main/managers/submit';

export class MainBranch extends Branch {
    private uploadHandler: UploadHandler | null = null;
    private submitManager: SubmitManager | null = null;
    
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
        
        // Инициализация менеджеров
        DraftManager.initDraftManagement(this.container);
        this.submitManager = new SubmitManager(this.container, t, JsonValidator);
        this.initUploadHandler();
        this.initFormSubmission();
    }

    protected destroy(): void {
        // Очистка менеджеров
        FormManager.destroy();
        DraftManager.destroy();
        
        // Очистка UploadHandler
        if (this.uploadHandler) {
            this.uploadHandler.destroy();
            this.uploadHandler = null;
        }
    }
    
    private initUploadHandler(): void {
        if (!this.container) return;
        
        this.uploadHandler = new UploadHandler(
            this.container, 
            () => this.hideError(), 
            (value) => DraftManager.saveDraft(value)
        );
    }
    
    private initFormSubmission(): void {
        FormManager.initForm(this.container, async (jsonText: string) => {
            await this.submitManager?.handleSubmit(jsonText);
        });
    }
    
    private hideError(): void {
        const errorElement = this.container?.querySelector('#errorContainer') as HTMLElement;
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}
