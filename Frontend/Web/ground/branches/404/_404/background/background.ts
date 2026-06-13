import { Shell } from '../../../../roots/Shell';

/**
 * Модуль для управления фоном 404 страницы
 */
export class BackgroundManager {
    private static currentRarity: string | null = null;
    private static isLanguageChanging: boolean = false; // Флаг блокировки генерации
    private static preservedRarity: string | null = null; // Сохраненная редкость для смены языка

    /**
     * Устанавливает случайный фон в зависимости от редкости
     */
    public static set404Background(): void {
        // Восстанавливаем сохраненную редкость если есть
        if (this.preservedRarity) {
            this.currentRarity = this.preservedRarity;
            this.preservedRarity = null;
        } else if (this.isLanguageChanging && this.currentRarity) {
            // Во время смены языка используем текущую редкость
            // Ничего не делаем, просто используем currentRarity
        } else {
            // Генерируем новый рандом
            const rand = Math.random() * 100;
            let rarity = '00';

            if (rand > 99.9) rarity = '04';       // 0.1%
            else if (rand > 99) rarity = '03';    // 0.9%
            else if (rand > 95) rarity = '02';    // 4%
            else if (rand > 80) rarity = '01';    // 15%
            else rarity = '00';                   // 80%

            this.currentRarity = rarity;
        }

        // Добавляем класс для блокировки скролла только на 404 странице
        document.body.classList.add('error-404');
        Shell.getInstance().set404Background(this.currentRarity!);
    }

    /**
     * Восстанавливает обычный фон при уходе со страницы
     */
    public static restoreNormalBackground(): void {
        // Удаляем класс блокировки скролла
        document.body.classList.remove('error-404');
        Shell.getInstance().setRandomBackground();
        
        // Сохраняем редкость если это смена языка
        if (this.isLanguageChanging) {
            this.preservedRarity = this.currentRarity;
        } else {
            this.currentRarity = null;
            this.preservedRarity = null;
        }
        this.isLanguageChanging = false; // Сбрасываем флаг
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

    /**
     * Устанавливает флаг смены языка для блокировки генерации нового фона
     */
    public static setLanguageChanging(isChanging: boolean): void {
        this.isLanguageChanging = isChanging;
    }
}
