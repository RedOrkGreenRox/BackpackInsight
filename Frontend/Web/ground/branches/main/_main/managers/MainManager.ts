import { DraftManager } from './DraftManager';
import { FormManager } from './FormManager';
import { SubmitManager } from './submit/SubmitManager';
import { UploadHandler } from '../upload-zone/upload';

/**
 * Главный менеджер для координации всех компонентов MainBranch
 * Выносит всю логику инициализации из основного класса
 */
export class MainManager {
    private container: HTMLElement;
    private t: (key: string) => string;
    private uploadHandler: UploadHandler | null = null;
    private submitManager: SubmitManager | null = null;
    private formManager: FormManager = new FormManager();
    private draftManager: DraftManager = new DraftManager();

    constructor(container: HTMLElement, t: (key: string) => string) {
        this.container = container;
        this.t = t;
    }

    public init(): void {
        this.draftManager.initDraftManagement(this.container);
        this.submitManager = new SubmitManager(this.container, this.t);
        this.uploadHandler = new UploadHandler(
            this.container,
            () => this.hideError(),
            (value) => this.draftManager.saveDraft(value)
        );
        this.formManager.initForm(this.container, async (jsonText: string) => {
            await this.submitManager?.handleSubmit(jsonText);
        });
    }

    public destroy(): void {
        this.formManager.destroy();
        this.draftManager.destroy();
        this.uploadHandler?.destroy();
        this.uploadHandler = null;
        this.submitManager = null;
    }

    private hideError(): void {
        const errorElement = this.container?.querySelector('#errorContainer') as HTMLElement;
        if (errorElement) errorElement.style.display = 'none';
    }
}
