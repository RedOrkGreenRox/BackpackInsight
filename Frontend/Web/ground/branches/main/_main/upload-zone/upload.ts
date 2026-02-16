export class UploadHandler {
    private container: HTMLElement;
    private onHideError: () => void;
    private cleanupFns: (() => void)[] = [];

    constructor(container: HTMLElement, onHideError: () => void) {
        this.container = container;
        this.onHideError = onHideError;
        this.init();
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject) {
        if (element) {
            element.addEventListener(event, handler);
            this.cleanupFns.push(() => element.removeEventListener(event, handler));
        }
    }

    private init() {
        const area = this.container.querySelector('#uploadArea') as HTMLElement;
        const input = this.container.querySelector('#jsonInput') as HTMLTextAreaElement;
        const fInput = this.container.querySelector('#fileInput') as HTMLInputElement;
        const hint = this.container.querySelector('#uploadHint') as HTMLElement;

        const updateUI = () => {
            if (hint) hint.style.display = input.value.trim() ? 'none' : 'flex';
            this.onHideError();
        };

        const read = (file: File) => {
            if (!file) return;
            const r = new FileReader();
            r.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    input.value = e.target.result;
                    updateUI();
                }
            };
            r.readAsText(file);
        };

        if (area && input && fInput) {
            // 2. При клике пыталась вставить из буфера обмена.
            this.addListener(area, 'click', async (e: Event) => {
                if (e.target === fInput) return;
                if (e.target === input && input.value.trim()) return;

                try {
                    const text = await navigator.clipboard.readText();
                    const trimmed = text.trim();
                    // Проверяем, похоже ли это на JSON.
                    // Если скопирован файл (путь), это не будет JSON.
                    if (trimmed && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
                        input.value = trimmed;
                        updateUI();
                        return;
                    }
                } catch (err) {
                    // Clipboard access denied or empty
                }

                // Если в буфере нет JSON, открываем выбор файла
                fInput.click();
            });

            // 1. При drag&drop принимала содержимое файла
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                this.addListener(area, eventName, (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            this.addListener(area, 'dragover', () => area.classList.add('drag-over'));
            this.addListener(area, 'dragleave', () => area.classList.remove('drag-over'));

            this.addListener(area, 'drop', (e: Event) => {
                area.classList.remove('drag-over');
                const dragEvent = e as DragEvent;
                if (dragEvent.dataTransfer && dragEvent.dataTransfer.files.length > 0) {
                    read(dragEvent.dataTransfer.files[0]);
                }
            });

            // 3. Если скопирован файл целиком, принимала его содержимое а не название.
            this.addListener(input, 'paste', (e: Event) => {
                const clipboardEvent = e as ClipboardEvent;
                const data = clipboardEvent.clipboardData;
                
                if (data) {
                    // Проверяем файлы
                    if (data.files && data.files.length > 0) {
                        e.preventDefault();
                        read(data.files[0]);
                        return;
                    }
                    
                    // Проверяем items (для совместимости)
                    const items = data.items;
                    if (items) {
                        for (let i = 0; i < items.length; i++) {
                            if (items[i].kind === 'file') {
                                const file = items[i].getAsFile();
                                if (file) {
                                    e.preventDefault();
                                    read(file);
                                    return;
                                }
                            }
                        }
                    }
                }
            });

            this.addListener(input, 'input', () => updateUI());
            
            this.addListener(fInput, 'change', () => {
                if (fInput.files && fInput.files.length > 0) {
                    read(fInput.files[0]);
                    fInput.value = '';
                }
            });
        }
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}