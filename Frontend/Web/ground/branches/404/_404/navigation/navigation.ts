import { Gen } from '../../../../roots/Gen';

/**
 * Модуль для управления навигацией 404 страницы
 */
export class NavigationManager {
    /**
     * Инициализирует обработчики событий для навигации
     */
    public static initNavigation(container: HTMLElement | null): void {
        const homeBtn = container?.querySelector('#homeBtn');
        homeBtn?.addEventListener('click', () => {
            Gen.getInstance().navigate('/');
        });
    }
}
