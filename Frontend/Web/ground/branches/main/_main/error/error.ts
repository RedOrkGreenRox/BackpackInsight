// Рендерит только контейнер для ошибок — содержимое заполняет ErrorDisplayManager.
export class ErrorRenderer {
    public static render(): string {
        return `<div id="errorContainer" class="error" style="display: none;" data-aos="zoom-in" role="alert" aria-live="polite"></div>`;
    }
}
