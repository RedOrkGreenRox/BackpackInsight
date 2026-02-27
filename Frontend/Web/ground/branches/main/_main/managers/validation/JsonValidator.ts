import { t } from '../../../../../localization/i18n';

/**
 * Утилиты для валидации JSON с подсветкой синтаксических ошибок
 */
export class JsonValidator {
    /**
     * Проверяет валидность JSON и возвращает детальную информацию об ошибках
     */
    public static validateJson(jsonText: string): { isValid: boolean; error?: string; line?: number; column?: number } {
        if (!jsonText.trim()) {
            return {
                isValid: false,
                error: t('json_empty'),
                line: 1,
                column: 1
            };
        }

        try {
            JSON.parse(jsonText);
            return { isValid: true };
        } catch (error: any) {
            return this.parseJsonError(error, jsonText);
        }
    }

    /**
     * Парсит ошибку JSON для получения детальной информации
     */
    private static parseJsonError(error: any, jsonText: string): { isValid: boolean; error: string; line: number; column: number } {
        const errorMessage = error.message || error.toString();
        
        // Стандартные ошибки JSON.parse
        if (errorMessage.includes('Unexpected end of JSON input')) {
            return {
                isValid: false,
                error: t('json_incomplete'),
                line: this.getLineCount(jsonText),
                column: this.getLastLineLength(jsonText) + 1
            };
        }

        if (errorMessage.includes('Unexpected token')) {
            const match = errorMessage.match(/position (\d+)/);
            const position = match ? parseInt(match[1]) : 0;
            const { line, column } = this.getLineAndColumn(jsonText, position);
            const token = this.extractUnexpectedChar(errorMessage);
            
            return {
                isValid: false,
                error: t('json_unexpected_token', { token }),
                line,
                column
            };
        }

        if (errorMessage.includes('Property name must be')) {
            const match = errorMessage.match(/position (\d+)/);
            const position = match ? parseInt(match[1]) : 0;
            const { line, column } = this.getLineAndColumn(jsonText, position);
            
            return {
                isValid: false,
                error: t('json_property_error'),
                line,
                column
            };
        }

        // Fallback для других ошибок
        const match = errorMessage.match(/position (\d+)/);
        const position = match ? parseInt(match[1]) : 0;
        const { line, column } = this.getLineAndColumn(jsonText, position);

        return {
            isValid: false,
            error: errorMessage,
            line,
            column
        };
    }

    /**
     * Получает строку и колонку из позиции в тексте
     */
    private static getLineAndColumn(text: string, position: number): { line: number; column: number } {
        const lines = text.substring(0, position).split('\n');
        const lastLine = lines[lines.length - 1];
        return {
            line: lines.length,
            column: (lastLine ? lastLine.length : 0) + 1
        };
    }

    /**
     * Получает количество строк в тексте
     */
    private static getLineCount(text: string): number {
        return text.split('\n').length;
    }

    /**
     * Получает длину последней строки
     */
    private static getLastLineLength(text: string): number {
        const lines = text.split('\n');
        const lastLine = lines[lines.length - 1];
        return lastLine ? lastLine.length : 0;
    }

    /**
     * Извлекает неожиданный символ из сообщения об ошибке
     */
    private static extractUnexpectedChar(errorMessage: string): string {
        const match = errorMessage.match(/Unexpected token ([^"]+)/);
        return match && match[1] ? match[1].trim() : 'неизвестный символ';
    }

    /**
     * Создает подсвеченный HTML текст с указанием ошибки
     */
    public static highlightError(jsonText: string, line: number, column: number): string {
        const lines = jsonText.split('\n');
        const errorLine = lines[line - 1] || '';
        
        // Создаем подсветку ошибки
        const beforeError = errorLine.substring(0, column - 1);
        const errorChar = errorLine.substring(column - 1, column);
        const afterError = errorLine.substring(column);
        
        return `
            <div class="json-validation-error">
                <div class="error-line-numbers">
                    ${lines.map((_, index) => 
                        `<div class="line-number ${index === line - 1 ? 'error-line' : ''}">${index + 1}</div>`
                    ).join('')}
                </div>
                <div class="json-code">
                    ${lines.map((l, index) => {
                        if (index === line - 1) {
                            return `<div class="code-line error-line">
                                <span class="code-text">${this.escapeHtml(beforeError)}</span>
                                <span class="error-char">${this.escapeHtml(errorChar)}</span>
                                <span class="code-text">${this.escapeHtml(afterError)}</span>
                            </div>`;
                        }
                        return `<div class="code-line">${this.escapeHtml(l)}</div>`;
                    }).join('')}
                </div>
                <div class="error-message">
                    ${t('json_validation_error', { line, column })}
                </div>
            </div>
        `;
    }

    /**
     * Экранирует HTML символы
     */
    private static escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
