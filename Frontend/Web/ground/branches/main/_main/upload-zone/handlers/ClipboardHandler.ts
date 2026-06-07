import { FileHandler } from './FileHandler';

export class ClipboardHandler {
    private area: HTMLElement;
    private input: HTMLTextAreaElement;
    private fileInput: HTMLInputElement;
    private onContent: (content: string) => void;
    private cleanupFns: (() => void)[] = [];

    constructor(area: HTMLElement, input: HTMLTextAreaElement, fileInput: HTMLInputElement, onContent: (content: string) => void) {
        this.area = area;
        this.input = input;
        this.fileInput = fileInput;
        this.onContent = onContent;
        this.init();
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject) {
        if (element) {
            element.addEventListener(event, handler);
            this.cleanupFns.push(() => element.removeEventListener(event, handler));
        }
    }

    private async tryReadClipboard(): Promise<boolean> {
        try {
            const text = await navigator.clipboard.readText();
            const trimmed = text.trim();
            
            // Проверяем, похоже ли это на JSON
            if (trimmed && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
                this.onContent(trimmed);
                return true;
            }
        } catch (err) {
            // Clipboard access denied or empty
        }
        return false;
    }

    private init() {
        // Клик по области - пробуем буфер обмена или открываем файл
        this.addListener(this.area, 'click', async (e: Event) => {
            if (e.target === this.fileInput) return;
            if (e.target === this.input && this.input.value.trim()) return;

            const hasClipboard = await this.tryReadClipboard();
            if (!hasClipboard) {
                this.fileInput.click();
            }
        });

        // Вставка в textarea
        this.addListener(this.input, 'paste', (e: Event) => {
            const clipboardEvent = e as ClipboardEvent;
            const data = clipboardEvent.clipboardData;
            
            if (data) {
                // Проверяем файлы
                if (data.files && data.files.length > 0) {
                    e.preventDefault();
                    const firstFile = data.files[0];
                    if (firstFile) {
                        FileHandler.readAndProcessFile(firstFile, this.onContent);
                    }
                    return;
                }
                
                // Проверяем items (для совместимости)
                const items = data.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item && item.kind === 'file') {
                            const file = item.getAsFile();
                            if (file) {
                                e.preventDefault();
                                FileHandler.readAndProcessFile(file, this.onContent);
                            }
                        }
                    }
                }
            }
        });
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
