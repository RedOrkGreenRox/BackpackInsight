export class ErrorDisplayManager {
    public static showError(element: HTMLElement, msg: string): void {
        element.textContent = msg;
        element.style.display = 'block';
    }
    
    public static hideError(element: HTMLElement): void {
        element.style.display = 'none';
    }
    
    public static showValidationError(element: HTMLElement, jsonText: string, validation: any, jsonValidator?: any): void {
        let highlightedError = '';
        
        // Используем JsonValidator если доступен
        if (jsonValidator && jsonValidator.highlightError) {
            highlightedError = jsonValidator.highlightError(jsonText, validation.line, validation.column);
        } else {
            // Fallback - простой pre блок
            highlightedError = `<pre>${jsonText}</pre>`;
        }
        
        element.innerHTML = `
            <div class="validation-error-header">
                <strong>Ошибка JSON</strong>
                <button type="button" class="error-dismiss-btn">Закрыть</button>
            </div>
            ${highlightedError}
            <div class="validation-error-footer">
                <small>${validation.error} (строка ${validation.line}, колонка ${validation.column})</small>
            </div>
        `;
        element.style.display = 'block';
    }
}
