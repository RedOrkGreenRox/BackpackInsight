import { ErrorDisplayManager } from './validation';
import { JsonValidator as GlobalJsonValidator } from '@utils/JsonValidator';

export class ValidationManager {
    public static validateAndShowError(jsonText: string, errorElement: HTMLElement, tFunction: (key: string) => string, jsonValidator?: any): boolean {
        if (!jsonText.trim()) {
            ErrorDisplayManager.showError(errorElement, tFunction('error_json_empty'));
            return false;
        }
        
        // Используем JsonValidator если доступен
        const validatorToUse = jsonValidator || GlobalJsonValidator;
        if (validatorToUse && validatorToUse.validateJson) {
            const validation = validatorToUse.validateJson(jsonText);
            if (!validation.isValid && validation.error && validation.line && validation.column) {
                ErrorDisplayManager.showValidationError(errorElement, jsonText, validation, validatorToUse);
                return false;
            }
        } else {
            // Fallback на простую валидацию
            try {
                JSON.parse(jsonText);
            } catch (e) {
                ErrorDisplayManager.showError(errorElement, tFunction('error_json_invalid'));
                return false;
            }
        }
        
        ErrorDisplayManager.hideError(errorElement);
        return true;
    }
    
    public static showError(element: HTMLElement, msg: string): void {
        ErrorDisplayManager.showError(element, msg);
    }
}
