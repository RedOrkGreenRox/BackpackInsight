/**
 * Утилиты для управления событиями с автоматической очисткой
 */

export class EventManager {
    private cleanupFns: (() => void)[] = [];

    /**
     * Добавляет обработчик события с автоматической очисткой
     */
    public addListener(
        element: Element | null,
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void {
        if (element) {
            element.addEventListener(event, handler, options);
            this.cleanupFns.push(() => element.removeEventListener(event, handler, options));
        }
    }

    /**
     * Очищает все зарегистрированные обработчики событий
     */
    public cleanup(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
    }

    /**
     * Возвращает массив функций очистки для ручного управления
     */
    public getCleanupFns(): (() => void)[] {
        return this.cleanupFns;
    }
}
