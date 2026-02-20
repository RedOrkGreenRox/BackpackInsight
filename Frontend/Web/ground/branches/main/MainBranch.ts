import { Branch, PageMeta } from '@roots/Branch.ts';
import { Gen } from '@roots/Gen.ts';
import { t } from '../../localization/i18n';
import { UploadHandler } from './_main/upload-zone/upload'; // Импортируем наш вынесенный модуль
import { ApiService } from '../../utils/ApiService';
import './main.scss';

export class MainBranch extends Branch {
    private errorElement: HTMLElement | null = null;
    private cleanupFns: (() => void)[] = [];
    private uploadHandler: UploadHandler | null = null; // Переменная для хранения экземпляра обработчика

    public getMeta(): PageMeta {
        return {
            title: "Backpack Insight — " + t('profile_title'),
            description: "Загрузи свой JSON файл из Backpack Brawl, чтобы увидеть детальную статистику, героев и предметы."
        };
    }

    protected getHtml(): string {
        return `
            <div class="container">
                <div id="errorContainer" class="error" style="display: none;" data-aos="zoom-in"></div>

                <h1 class="main-title" data-aos="fade-down">${t('profile_title')}</h1>

                <form class="upload-zone" id="uploadForm">
                    <div class="upload-area" id="uploadArea">
                        <input type="file" id="fileInput" accept=".json" style="display: none;">
                        <label for="jsonInput" class="visually-hidden" style="opacity: 0">Данные профиля (JSON)</label>
                        <textarea name="json_text" id="jsonInput" placeholder="" aria-label="Вставьте JSON данные здесь"></textarea>
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

        // Инициализируем обработчик зоны загрузки
        // Он сам навесит все события на drag&drop и буфер обмена
        this.uploadHandler = new UploadHandler(this.container, () => this.hideError());

        // Оставляем здесь только логику отправки формы на сервер
        if (form && input) {
            this.addListener(form, 'submit', async (e: Event) => {
                e.preventDefault();
                await this.handleSubmit(input.value);
            });
        }
    }

    private async handleSubmit(jsonText: string) {
        if (!jsonText.trim()) {
            this.showError(t('error_json_empty'));
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
            submitBtn.textContent = t('profile_loading_button');
        }

        try {
            const data = await ApiService.getProfile(jsonData);
            Gen.getInstance().navigate('/profile', data);

        } catch (e) {
            // Сюда попадут только реальные сетевые ошибки (например, обрыв соединения)
            console.error(e);
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