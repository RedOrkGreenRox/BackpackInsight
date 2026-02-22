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
     * Добавляет обработчик события с автоматической очисткой и возвращает функцию для ручного удаления
     */
    public addListenerWithCleanup(
        element: Element | null,
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): (() => void) | null {
        if (!element) return null;
        
        element.addEventListener(event, handler, options);
        const cleanup = () => element.removeEventListener(event, handler, options);
        this.cleanupFns.push(cleanup);
        return cleanup;
    }

    /**
     * Добавляет делегированный обработчик событий
     */
    public addDelegateListener(
        parent: Element | null,
        selector: string,
        event: string,
        handler: (target: Element, event: Event) => void,
        options?: boolean | AddEventListenerOptions
    ): void {
        if (!parent) return;
        
        const delegateHandler = (e: Event) => {
            const target = (e.target as Element).closest(selector);
            if (target && parent.contains(target)) {
                handler(target, e);
            }
        };
        
        parent.addEventListener(event, delegateHandler, options);
        this.cleanupFns.push(() => parent.removeEventListener(event, delegateHandler, options));
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

    /**
     * Проверяет есть ли зарегистрированные обработчики
     */
    public hasListeners(): boolean {
        return this.cleanupFns.length > 0;
    }

    /**
     * Возвращает количество зарегистрированных обработчиков
     */
    public getListenersCount(): number {
        return this.cleanupFns.length;
    }
}
