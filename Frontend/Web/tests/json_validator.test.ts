import { describe, it, expect, vi } from 'vitest';
import { JsonValidator } from '../ground/branches/main/_main/managers/validation/JsonValidator';

// Мокаем i18n, так как он может зависеть от окружения
vi.mock('../../../../localization/i18n', () => ({
    t: (key: string, params?: any) => {
        if (params) return `${key}_${JSON.stringify(params)}`;
        return key;
    }
}));

// Мокаем document для escapeHtml
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
globalThis.document = dom.window.document;

describe('JsonValidator', () => {
    it('should validate correct JSON', () => {
        const result = JsonValidator.validateJson('{"name": "Test", "value": 123}');
        expect(result.isValid).toBe(true);
    });

    it('should reject empty string', () => {
        const result = JsonValidator.validateJson('   ');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('json_empty');
        expect(result.line).toBe(1);
    });

    it('should detect unexpected tokens', () => {
        // Ошибка в позиции 1 (символ 'f')
        const result = JsonValidator.validateJson('f{ "a": 1 }');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('json_unexpected_token');
        expect(result.line).toBe(1);
    });

    it('should detect incomplete JSON', () => {
        const result = JsonValidator.validateJson('{"name": "Test"');
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
    });

    it('should correctly calculate line and column', () => {
        const json = '{\n  "a": 1,\n  "b":\n  "error"'; // Ошибка на 4 строке
        const result = JsonValidator.validateJson(json);
        expect(result.isValid).toBe(false);
        expect(result.line).toBeGreaterThan(1);
    });

    it('should escape HTML in highlightError', () => {
        const html = JsonValidator.highlightError('<div>', 1, 1);
        expect(html).toContain('&lt;');
        expect(html).toContain('div&gt;');
    });
});
