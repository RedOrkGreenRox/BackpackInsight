import { t } from '../../../../localization/i18n';

/**
 * Модуль для рендеринга описательного текста 404 страницы
 */
export class TextRenderer {
    /**
     * Генерирует HTML разметку текста
     */
    public static render(): string {
        return `<p class="text-404">${t('not_found_text')}</p>`;
    }
}
