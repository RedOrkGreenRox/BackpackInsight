import { DragDropHandler, FileHandler, ClipboardHandler, UIHandler } from './handlers';

export class UploadHandler {
    private container: HTMLElement;
    private onHideError: () => void;
    private onContentChange: (value: string) => void;
    private dragDropHandler: DragDropHandler | null = null;
    private clipboardHandler: ClipboardHandler | null = null;
    private uiHandler: UIHandler | null = null;
    private _fileInputCleanup: (() => void) | null = null;

    constructor(container: HTMLElement, onHideError: () => void, onContentChange?: (value: string) => void) {
        this.container = container;
        this.onHideError = onHideError;
        this.onContentChange = onContentChange || (() => {});
        this.init();
    }

    private init() {
        const area = this.container.querySelector('#uploadArea') as HTMLElement;
        const input = this.container.querySelector('#jsonInput') as HTMLTextAreaElement;
        const fInput = this.container.querySelector('#fileInput') as HTMLInputElement;
        const hint = this.container.querySelector('#uploadHint') as HTMLElement;

        if (!area || !input || !fInput) return;

        // Инициализация UI Handler
        this.uiHandler = new UIHandler(input, hint, this.onHideError, this.onContentChange);

        // Инициализация DragDrop Handler
        this.dragDropHandler = new DragDropHandler(area, (file: File) => {
            FileHandler.readAndProcessFile(file, (content: string) => {
                this.uiHandler?.setValue(content);
            });
        });

        // Инициализация Clipboard Handler
        this.clipboardHandler = new ClipboardHandler(area, input, fInput, (content: string) => {
            this.uiHandler?.setValue(content);
        });

        // Обработка выбора файла через input
        const onFileChange = () => {
            if (fInput.files && fInput.files.length > 0) {
                const file = fInput.files[0];
                if (file) {
                    FileHandler.readAndProcessFile(file, (content: string) => {
                        this.uiHandler?.setValue(content);
                    });
                }
                fInput.value = '';
            }
        };
        fInput.addEventListener('change', onFileChange);
        // Сохраняем деструктор вручную — fInput не входит в handlers,
        // которые уже имеют свой cleanupFns
        this._fileInputCleanup = () => fInput.removeEventListener('change', onFileChange);
    }

    public destroy() {
        this._fileInputCleanup?.();
        this._fileInputCleanup = null;
        this.dragDropHandler?.destroy();
        this.clipboardHandler?.destroy();
        this.uiHandler?.destroy();
        this.dragDropHandler = null;
        this.clipboardHandler = null;
        this.uiHandler = null;
    }
}