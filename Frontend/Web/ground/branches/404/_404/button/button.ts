import { t } from '../../../../localization/i18n';

/**
 * Модуль для рендеринга кнопки возврата
 */
export class ButtonRenderer {
    /**
     * Генерирует HTML разметку кнопки
     */
    public static render(): string {
        return `<button id="homeBtn" class="btn-404">${t('not_found_button')}</button>`;
    }
}
