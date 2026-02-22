import { Branch } from '@roots/Branch.ts';
import { EventManager } from '../utils/eventUtils';

/**
 * Базовый класс для всех веток с общим функционалом управления событиями
 */
export abstract class BaseBranch extends Branch {
    protected eventManager = new EventManager();

    /**
     * Добавляет обработчик события с автоматической очисткой
     */
    protected addListener(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        this.eventManager.addListener(element, event, handler, options);
    }

    /**
     * Добавляет обработчик события с автоматической очисткой и возвращает функцию для ручного удаления
     */
    protected addListenerWithCleanup(element: Element | null, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): (() => void) | null {
        return this.eventManager.addListenerWithCleanup(element, event, handler, options);
    }

    /**
     * Добавляет делегированный обработчик событий
     */
    protected addDelegateListener(parent: Element | null, selector: string, event: string, handler: (target: Element, event: Event) => void, options?: boolean | AddEventListenerOptions): void {
        this.eventManager.addDelegateListener(parent, selector, event, handler, options);
    }

    /**
     * Очищает все зарегистрированные обработчики событий
     */
    protected cleanupEvents(): void {
        this.eventManager.cleanup();
    }

    /**
     * Проверяет есть ли зарегистрированные обработчики
     */
    protected hasListeners(): boolean {
        return this.eventManager.hasListeners();
    }

    /**
     * Возвращает количество зарегистрированных обработчиков
     */
    protected getListenersCount(): number {
        return this.eventManager.getListenersCount();
    }
}
