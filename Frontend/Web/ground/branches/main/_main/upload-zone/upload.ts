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
        const input = this.container.querySelector('#jsonInput') as HTMLInputElement;
        const fInput = this.container.querySelector('#fileInput') as HTMLInputElement;
        const hint = this.container.querySelector('#uploadHint') as HTMLElement;

        const read = (file: File) => {
            if (!file) return;
            const r = new FileReader();
            r.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    input.value = e.target.result;
                    if (hint) hint.style.display = 'none';
                    this.onHideError();
                }
            };
            r.readAsText(file);
        };

        if (area) {
            this.addListener(area, 'click', async () => {
                if (input.value.trim()) return;

                try {
                    const clipboardText = await navigator.clipboard.readText();

                    if (clipboardText && clipboardText.trim()) {
                        input.value = clipboardText;
                        if (hint) hint.style.display = 'none';
                        this.onHideError();
                    } else {
                        fInput.click();
                    }
                } catch (error) {
                    fInput.click();
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

            this.addListener(input, 'drop', (e: Event) => {
                area?.classList.remove('drag-over');
                const dragEvent = e as DragEvent;
                if (dragEvent.dataTransfer && dragEvent.dataTransfer.files.length > 0) {
                    read(dragEvent.dataTransfer.files[0]);
                }
            });

            this.addListener(input, 'paste', (e: Event) => {
                const clipboardEvent = e as ClipboardEvent;
                if (clipboardEvent.clipboardData && clipboardEvent.clipboardData.files && clipboardEvent.clipboardData.files.length > 0) {
                    e.preventDefault();
                    read(clipboardEvent.clipboardData.files[0]);
                }
            });

            this.addListener(input, 'input', () => {
                if (hint) hint.style.display = input.value ? 'none' : 'flex';
                this.onHideError();
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
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}