import { Shell } from '../../../../roots/Shell';

/**
 * Модуль для управления фоном 404 страницы
 */
export class BackgroundManager {
    private static currentRarity: string | null = null;

    /**
     * Устанавливает случайный фон в зависимости от редкости
     */
    public static set404Background(): void {
        // Взвешенный рандом: [80, 15, 4, 0.9, 0.1]
        // 00, 01, 02, 03, 04
        const rand = Math.random() * 100;
        let rarity = '00';

        if (rand > 99.9) rarity = '04';       // 0.1%
        else if (rand > 99) rarity = '03';    // 0.9%
        else if (rand > 95) rarity = '02';    // 4%
        else if (rand > 80) rarity = '01';    // 15%
        else rarity = '00';                   // 80%

        // Сохраняем текущую редкость для проверки
        this.currentRarity = rarity;

        // Добавляем класс для блокировки скролла только на 404 странице
        document.body.classList.add('error-404');
        Shell.getInstance().set404Background(rarity);
    }

    /**
     * Восстанавливает обычный фон при уходе со страницы
     */
    public static restoreNormalBackground(): void {
        // Удаляем класс блокировки скролла
        document.body.classList.remove('error-404');
        Shell.getInstance().setRandomBackground();
        this.currentRarity = null;
    }

    /**
     * Проверяет, установлен ли 404 фон
     */
    public static is404Background(): boolean {
        return this.currentRarity !== null;
    }

    /**
     * Обновляет 404 фон без изменения редкости (для переключения языка)
     */
    public static refresh404Background(): void {
        if (this.currentRarity) {
            Shell.getInstance().set404Background(this.currentRarity);
        }
    }
}
