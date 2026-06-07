/**
 * Модуль для рендеринга контейнера 404 страницы
 */

export class ContainerRenderer {
    /**
     * Генерирует HTML разметку контейнера
     */
    public static render(): string {
        return `
            <div class="container-404">
                {{CONTENT}}
            </div>
        `;
    }
}
