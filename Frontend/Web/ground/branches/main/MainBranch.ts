import { Branch, PageMeta } from '@roots/Branch.ts';
import { Gen } from '@roots/Gen.ts';
import { t } from '../../localization/i18n';
import { UploadHandler } from './_main/upload-zone/upload';
import { ApiService } from '../../utils/ApiService';
import { LoadingStates } from '../../utils/LoadingStates';
import { JsonValidator } from '../../utils/JsonValidator';
import './main.scss';

export class MainBranch extends Branch {
    private errorElement: HTMLElement | null = null;
    private cleanupFns: (() => void)[] = [];
    private uploadHandler: UploadHandler | null = null;
    private readonly DRAFT_KEY = 'profile_draft_data';

    public getMeta(): PageMeta {
        return {
            title: "Backpack Insight — " + t('profile_title'),
            description: "Загрузи свой JSON файл из Backpack Brawl, чтобы увидеть детальную статистику, героев и предметы."
        };
    }

    protected getHtml(): string {
        return `
            <div class="container">
                <div id="errorContainer" class="error" style="display: none;" data-aos="zoom-in" role="alert" aria-live="polite"></div>

                <h1 class="main-title" data-aos="fade-down">${t('profile_title')}</h1>

                <form class="upload-zone" id="uploadForm">
                    <div class="upload-area" id="uploadArea">
                        <input type="file" id="fileInput" accept=".json" style="display: none;">
                        <label for="jsonInput" class="visually-hidden" style="opacity: 0">Данные профиля (JSON)</label>
                        <textarea name="json_text" id="jsonInput" placeholder="" aria-label="Вставьте JSON данные здесь" aria-describedby="uploadHint errorContainer"></textarea>
                        <div class="upload-hint" id="uploadHint">
                            <span>${t('profile_upload_hint_1')}</span>
                            <span class="pc-only">${t('profile_upload_hint_2')}</span>
                            <span>${t('profile_upload_hint_3')}</span>
                        </div>
                    </div>
                    <button class="button-view-profile" type="submit" id="submitBtn">${t('profile_view_button')}</button>
                </form>
            </div>
        `;
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        if (element) {
            element.addEventListener(event, handler, options);
            this.cleanupFns.push(() => element.removeEventListener(event, handler, options));
        }
    }

    protected init(): void {
        if (!this.container) return;

        this.errorElement = this.container.querySelector('#errorContainer') as HTMLElement;
        const form = this.container.querySelector('#uploadForm') as HTMLFormElement;
        const input = this.container.querySelector('#jsonInput') as HTMLInputElement;

        // Восстанавливаем сохраненные данные при инициализации
        this.restoreDraft();

        // Сохраняем draft при изменениях
        if (input) {
            this.addListener(input, 'input', () => this.saveDraft(input.value));
            this.addListener(input, 'paste', () => {
                // Небольшая задержка чтобы вставленный текст успел появиться
                setTimeout(() => this.saveDraft(input.value), 10);
            });
            // Дополнительные события для надежности
            this.addListener(input, 'change', () => this.saveDraft(input.value));
            this.addListener(input, 'blur', () => this.saveDraft(input.value));
        }

        // Инициализируем обработчик зоны загрузки
        // Он сам навесит все события на drag&drop и буфер обмена
        this.uploadHandler = new UploadHandler(this.container, () => this.hideError(), (value) => this.saveDraft(value));

        // Оставляем здесь только логику отправки формы на сервер
        if (form && input) {
            this.addListener(form, 'submit', async (e: Event) => {
                e.preventDefault();
                await this.handleSubmit(input.value);
            });
        }
    }

    private async handleSubmit(jsonText: string) {
        // Скрываем предыдущие ошибки
        this.hideError();
        
        if (!jsonText.trim()) {
            this.showError(t('error_json_empty'));
            return;
        }

        // Валидация JSON с подсветкой ошибок
        const validation = JsonValidator.validateJson(jsonText);
        if (!validation.isValid && validation.error && validation.line && validation.column) {
            this.showValidationError(jsonText, validation);
            return;
        }

        let jsonData;
        try {
            jsonData = JSON.parse(jsonText);
        } catch (e) {
            this.showError(t('error_json_invalid'));
            return;
        }

        const submitBtn = this.container?.querySelector('#submitBtn') as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = LoadingStates.createSpinner('small') + ' ' + t('profile_loading_button');
        }

        try {
            const data = await ApiService.getProfile(jsonData);
            // Очищаем сохраненные данные после успешной отправки
            this.clearDraft();
            Gen.getInstance().navigate('/profile', data);

        } catch (e) {
            // Сюда попадут только реальные сетевые ошибки (например, обрыв соединения)
            console.error('Submit error:', e);
            this.showError(t('error_server_unavailable'));
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = t('profile_view_button');
            }
        }
    }

    private showError(msg: string) {
        if (this.errorElement) {
            this.errorElement.textContent = msg;
            this.errorElement.style.display = 'block';
        }
    }

    private hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
    }

    /**
     * Показывает детализированную ошибку валидации JSON
     */
    private showValidationError(jsonText: string, validation: { isValid: boolean; error?: string; line?: number; column?: number }) {
        if (this.errorElement && validation.error && validation.line && validation.column) {
            const highlightedError = JsonValidator.highlightError(jsonText, validation.line, validation.column);
            this.errorElement.innerHTML = `
                <div class="validation-error-header">
                    <strong>${t('error_json_invalid')}</strong>
                    <button type="button" class="error-dismiss-btn" onclick="this.parentElement.parentElement.style.display='none'">${t('error_dismiss')}</button>
                </div>
                ${highlightedError}
                <div class="validation-error-footer">
                    <small>${validation.error} (строка ${validation.line}, колонка ${validation.column})</small>
                </div>
            `;
            this.errorElement.style.display = 'block';
        }
    }

    /**
     * Сохраняет введенные данные в localStorage
     */
    private saveDraft(data: string): void {
        try {
            if (data.trim()) {
                localStorage.setItem(this.DRAFT_KEY, data);
                console.log('[MainBranch] Draft saved');
            } else {
                localStorage.removeItem(this.DRAFT_KEY);
                console.log('[MainBranch] Draft removed');
            }
        } catch (error) {
            console.error('[MainBranch] localStorage error:', error);
        }
    }

    /**
     * Восстанавливает сохраненные данные из localStorage
     */
    private restoreDraft(): void {
        try {
            const savedDraft = localStorage.getItem(this.DRAFT_KEY);
            if (savedDraft) {
                const input = this.container?.querySelector('#jsonInput') as HTMLTextAreaElement;
                if (input) {
                    input.value = savedDraft;
                    console.log('[MainBranch] Draft restored');
                    // Обновляем UI чтобы скрыть подсказку
                    const hint = this.container?.querySelector('#uploadHint') as HTMLElement;
                    if (hint) hint.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('[MainBranch] Restore error:', error);
        }
    }

    /**
     * Очищает сохраненные данные после успешной отправки
     */
    private clearDraft(): void {
        localStorage.removeItem(this.DRAFT_KEY);
    }

    protected destroy(): void {
        // Очищаем слушатели (кнопку сабмита)
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];

        // Корректно уничтожаем слушатели UploadHandler при смене страницы
        if (this.uploadHandler) {
            this.uploadHandler.destroy();
            this.uploadHandler = null;
        }
    }
}