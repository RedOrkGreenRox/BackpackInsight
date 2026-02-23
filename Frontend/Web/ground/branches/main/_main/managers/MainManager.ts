import { DraftManager } from './DraftManager';
import { FormManager } from './FormManager';
import { SubmitManager } from './submit/SubmitManager';
import { UploadHandler } from '../upload-zone/upload';
import { JsonValidator } from '@utils/JsonValidator';

/**
 * Главный менеджер для координации всех компонентов MainBranch
 * Выносит всю логику инициализации из основного класса
 */
export class MainManager {
    private container: HTMLElement;
    private t: (key: string) => string;
    private jsonValidator: any;
    private uploadHandler: UploadHandler | null = null;
    private submitManager: SubmitManager | null = null;

    constructor(container: HTMLElement, t: (key: string) => string, jsonValidator: any) {
        this.container = container;
        this.t = t;
        this.jsonValidator = jsonValidator;
    }

    /**
     * Инициализация всех компонентов
     */
    public init(): void {
        this.initDraftManagement();
        this.initSubmitManager();
        this.initUploadHandler();
        this.initFormSubmission();
    }

    /**
     * Очистка всех компонентов
     */
    public destroy(): void {
        // Очистка менеджеров
        FormManager.destroy();
        DraftManager.destroy();
        
        // Очистка UploadHandler
        if (this.uploadHandler) {
            this.uploadHandler.destroy();
            this.uploadHandler = null;
        }
        
        // Очистка SubmitManager
        this.submitManager = null;
    }

    /**
     * Инициализация управления draft
     */
    private initDraftManagement(): void {
        DraftManager.initDraftManagement(this.container);
    }

    /**
     * Инициализация менеджера отправки формы
     */
    private initSubmitManager(): void {
        this.submitManager = new SubmitManager(this.container, this.t, this.jsonValidator);
    }

    /**
     * Инициализация обработчика загрузки файлов
     */
    private initUploadHandler(): void {
        this.uploadHandler = new UploadHandler(
            this.container, 
            () => this.hideError(), 
            (value) => DraftManager.saveDraft(value)
        );
    }

    /**
     * Инициализация отправки формы
     */
    private initFormSubmission(): void {
        FormManager.initForm(this.container, async (jsonText: string) => {
            await this.submitManager?.handleSubmit(jsonText);
        });
    }

    /**
     * Скрытие ошибки
     */
    private hideError(): void {
        const errorElement = this.container?.querySelector('#errorContainer') as HTMLElement;
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}
