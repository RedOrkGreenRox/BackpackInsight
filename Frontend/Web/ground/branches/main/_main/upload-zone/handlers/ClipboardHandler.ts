import { FileHandler } from './FileHandler';

export class ClipboardHandler {
    private area: HTMLElement;
    private input: HTMLTextAreaElement;
    private fileInput: HTMLInputElement;
    private onContent: (content: string) => void;
    private cleanupFns: (() => void)[] = [];

    constructor(
        area: HTMLElement,
        input: HTMLTextAreaElement,
        fileInput: HTMLInputElement,
        onContent: (content: string) => void
    ) {
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

    private init() {
        // Клик по области.
        // Проблема: navigator.clipboard.readText() — async, а после await браузер
        // уже не считает вызов fileInput.click() частью пользовательского жеста
        // и блокирует открытие диалога (особенно Safari, Firefox).
        //
        // Решение: сразу синхронно открываем диалог выбора файла. Если в буфере
        // есть JSON — clipboard API обработает его через событие paste на textarea
        // (пользователь сам вставит Ctrl+V). Кнопка «открыть файл» — запасной путь.
        this.addListener(this.area, 'click', (e: Event) => {
            if (e.target === this.fileInput) return;
            // Если textarea уже содержит текст и кликнули именно по ней — не мешаем
            if (e.target === this.input && this.input.value.trim()) return;

            this.fileInput.click();
        });

        // Вставка в textarea — обрабатываем и файлы и текст.
        // data.items охватывает оба случая: файл (kind='file') и текст (kind='string'),
        // поэтому проверяем только items — это надёжнее чем дублирующая проверка files.
        this.addListener(this.input, 'paste', (e: Event) => {
            const clipboardEvent = e as ClipboardEvent;
            const items = clipboardEvent.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item) continue;

                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) {
                        e.preventDefault();
                        FileHandler.readAndProcessFile(file, this.onContent);
                        return; // файл найден — дальше не смотрим
                    }
                }
            }
            // Текстовая вставка — браузер сам вставит в textarea, не перехватываем
        });
    }

    public destroy() {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }
}
