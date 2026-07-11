/**
 * SecurityService - утилиты безопасности (защита от XSS и очистка HTML)
 */
export class SecurityService {
    public static escapeHtml(str: string | undefined | null): string {
        if (!str) return '';
        return str
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
}
