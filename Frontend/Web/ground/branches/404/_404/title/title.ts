import { t } from '../../../../localization/i18n';

/**
 * Модуль для рендеринга заголовка 404 страницы
 */
export class TitleRenderer {
    /**
     * Генерирует HTML разметку заголовка
     */
    public static render(): string {
        return `<h1 class="title-404">${t('not_found_title')}</h1>`;
    }
}
