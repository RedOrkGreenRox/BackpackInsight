import { ErrorDisplayManager } from './validation';
import { JsonValidator } from './validation/JsonValidator';

export class ValidationManager {
    public static validateAndShowError(jsonText: string, errorElement: HTMLElement, tFunction: (key: string) => string): boolean {
        if (!jsonText.trim()) {
            ErrorDisplayManager.showError(errorElement, tFunction('error_json_empty'));
            return false;
        }

        const validation = JsonValidator.validateJson(jsonText);
        if (!validation.isValid && validation.error && validation.line && validation.column) {
            ErrorDisplayManager.showValidationError(errorElement, jsonText, validation, JsonValidator);
            return false;
        }

        ErrorDisplayManager.hideError(errorElement);
        return true;
    }

    public static showError(element: HTMLElement, msg: string): void {
        ErrorDisplayManager.showError(element, msg);
    }
}
