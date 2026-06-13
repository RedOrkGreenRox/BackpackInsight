export class UIHandler {
    private readonly input: HTMLTextAreaElement;
    private readonly hint: HTMLElement;
    private readonly onHideError: () => void;
    private readonly onContentChange: (value: string) => void;
    private cleanupFns: (() => void)[] = [];

    constructor(input: HTMLTextAreaElement, hint: HTMLElement, onHideError: () => void, onContentChange: (value: string) => void) {
        this.input = input;
        this.hint = hint;
        this.onHideError = onHideError;
        this.onContentChange = onContentChange;
        this.init();
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject) {
        if (element) {
            element.addEventListener(event, handler);
            this.cleanupFns.push(() => element.removeEventListener(event, handler));
        }
    }

    private updateUI() {
        if (this.hint) {
            this.hint.style.display = this.input.value.trim() ? 'none' : 'flex';
        }
        this.onHideError();
        this.onContentChange(this.input.value);
    }

    private init() {
        // Обновление UI при вводе текста
        this.addListener(this.input, 'input', () => this.updateUI());
    }

    public setValue(value: string) {
        this.input.value = value;
        this.updateUI();
    }

    public getValue(): string {
        return this.input.value;
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
