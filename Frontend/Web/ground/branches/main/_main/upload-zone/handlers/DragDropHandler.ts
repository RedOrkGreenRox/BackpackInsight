export class DragDropHandler {
    private readonly area: HTMLElement;
    private readonly onFileRead: (file: File) => void;
    private cleanupFns: (() => void)[] = [];

    constructor(area: HTMLElement, onFileRead: (file: File) => void) {
        this.area = area;
        this.onFileRead = onFileRead;
        this.init();
    }

    private addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject) {
        if (element) {
            element.addEventListener(event, handler);
            this.cleanupFns.push(() => element.removeEventListener(event, handler));
        }
    }

    private init() {
        // Предотвращаем стандартное поведение для всех drag событий
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.addListener(this.area, eventName, (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Визуальные эффекты при наведении
        this.addListener(this.area, 'dragover', () => this.area.classList.add('drag-over'));
        this.addListener(this.area, 'dragleave', () => this.area.classList.remove('drag-over'));

        // Обработка сброса файла
        this.addListener(this.area, 'drop', (e: Event) => {
            this.area.classList.remove('drag-over');
            const dragEvent = e as DragEvent;
            const file = dragEvent.dataTransfer?.files?.[0];
                if (file) this.onFileRead(file);
        });
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
