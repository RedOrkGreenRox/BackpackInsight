import { Branch, PageMeta } from '../../roots/Branch';
import { Gen } from '../../roots/Gen';
import { t } from '../../localization/i18n'; // Импортируем функцию перевода
import './main.scss';

export class MainBranch extends Branch {
    private errorElement: HTMLElement | null = null;
    private cleanupFns: (() => void)[] = [];

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

        const area = this.container.querySelector('#uploadArea') as HTMLElement;
        const input = this.container.querySelector('#jsonInput') as HTMLInputElement;
        const fInput = this.container.querySelector('#fileInput') as HTMLInputElement;
        const hint = this.container.querySelector('#uploadHint') as HTMLElement;
        const form = this.container.querySelector('#uploadForm') as HTMLFormElement;
        this.errorElement = this.container.querySelector('#errorContainer') as HTMLElement;

        const read = (file: File) => {
            if (!file) return;
            const r = new FileReader();
            r.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    input.value = e.target.result;
                    if (hint) hint.style.display = 'none';
                    this.hideError();
                }
            };
            r.readAsText(file);
        };

        if (area) {
            this.addListener(area, 'click', (_e: Event) => {
                if (!input.value.trim()) {
                    fInput.click();
                    input.blur(); 
                }
            });
        }

        if (input) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(n => {
                this.addListener(input, n, (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            this.addListener(input, 'dragover', () => area?.classList.add('drag-over'));
            this.addListener(input, 'dragleave', () => area?.classList.remove('drag-over'));
            this.addListener(input, 'drop', (e: any) => {
                area?.classList.remove('drag-over');
                if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                    read(e.dataTransfer.files[0]);
                }
            });

            this.addListener(input, 'paste', (e: any) => {
                const clipboardEvent = e as ClipboardEvent;
                if (clipboardEvent.clipboardData && clipboardEvent.clipboardData.files && clipboardEvent.clipboardData.files.length > 0) {
                    e.preventDefault();
                    read(clipboardEvent.clipboardData.files[0]);
                }
            });

            this.addListener(input, 'input', () => {
                if (hint) hint.style.display = input.value ? 'none' : 'flex';
                this.hideError();
            });
        }

        if (fInput) {
            this.addListener(fInput, 'change', (e: Event) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                    read(target.files[0]);
                }
            });
        }

        if (form) {
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
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            Gen.getInstance().navigate('/profile', data);

        } catch (e) {
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
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
