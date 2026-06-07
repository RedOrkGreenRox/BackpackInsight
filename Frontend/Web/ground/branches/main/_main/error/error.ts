export class ErrorRenderer {
    public static render(): string {
        return `<div id="errorContainer" class="error" style="display: none;" data-aos="zoom-in" role="alert" aria-live="polite"></div>`;
    }
    
    public static renderValidationError(validation: any, jsonText: string, jsonValidator?: any): string {
        let highlightedError = '';
        
        // Используем JsonValidator если доступен
        if (jsonValidator && jsonValidator.highlightError) {
            highlightedError = jsonValidator.highlightError(jsonText, validation.line, validation.column);
        } else {
            // Fallback - простой pre блок
            highlightedError = `<pre>${jsonText}</pre>`;
        }
        
        return `
            <div class="validation-error-header">
                <strong>Ошибка JSON</strong>
                <button type="button" class="error-dismiss-btn">Закрыть</button>
            </div>
            ${highlightedError}
            <div class="validation-error-footer">
                <small>${validation.error} (строка ${validation.line}, колонка ${validation.column})</small>
            </div>
        `;
    }
}
