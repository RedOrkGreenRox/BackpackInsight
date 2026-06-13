import { Gen } from '../../../../roots/Gen';

/**
 * Модуль для управления навигацией 404 страницы.
 * Возвращает функцию-деструктор для удаления слушателя.
 */
export class NavigationManager {
    public static initNavigation(container: HTMLElement | null): () => void {
        const homeBtn = container?.querySelector('#homeBtn');
        if (!homeBtn) return () => {};

        const handler = () => Gen.getInstance().navigate('/');
        homeBtn.addEventListener('click', handler);
        return () => homeBtn.removeEventListener('click', handler);
    }
}
