export class DraftEventHandler {
    private readonly container: HTMLElement;
    private input: HTMLTextAreaElement | null = null;
    private readonly onSave: (value: string) => void;
    private cleanupFns: (() => void)[] = [];

    constructor(container: HTMLElement, onSave: (value: string) => void) {
        this.container = container;
        this.onSave = onSave;
        this.init();
    }

    private init() {
        const input = this.container.querySelector('#jsonInput') as HTMLTextAreaElement;
        if (!input) return;
        
        this.input = input;
        
        // Сохранение при вводе
        const saveHandler = () => {
            if (this.input) {
                this.onSave(this.input.value);
            }
        };
        
        this.input.addEventListener('input', saveHandler);
        this.cleanupFns.push(() => this.input?.removeEventListener('input', saveHandler));
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
        this.input = null; // освобождаем ссылку на DOM-элемент
    }
}
