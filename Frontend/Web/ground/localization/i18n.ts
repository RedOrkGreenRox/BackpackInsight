/**
 * Простой сервис для интернационализации (i18n).
 */
class I18n {
    private static instance: I18n;
    private translations: Record<string, string> = {};
    public currentLang: string = 'en';

    private constructor() {}

    public static getInstance(): I18n {
        if (!I18n.instance) {
            I18n.instance = new I18n();
        }
        return I18n.instance;
    }

    /**
     * Инициализирует сервис: определяет язык и загружает файл перевода.
     */
    public async init(): Promise<void> {
        const savedLang = localStorage.getItem('lang');
        const browserLang = navigator.language.split('-')[0];
        
        this.currentLang = savedLang || (['ru', 'en'].includes(browserLang) ? browserLang : 'en');

        try {
            await this.loadLanguage(this.currentLang);
        } catch (error) {
            console.error(`Failed to load ${this.currentLang}.json, falling back to English.`, error);
            await this.loadLanguage('en');
        }
    }

    /**
     * Принудительно меняет язык и сохраняет выбор.
     */
    public async setLanguage(lang: 'ru' | 'en'): Promise<void> {
        if (this.currentLang === lang) return;
        
        this.currentLang = lang;
        localStorage.setItem('lang', lang);
        await this.loadLanguage(lang);
    }

    private async loadLanguage(lang: string): Promise<void> {
        // Убрали /static префикс, так как Vite копирует содержимое static в корень dist
        const response = await fetch(`/lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Could not fetch language file for ${lang}`);
        }
        this.translations = await response.json();
    }

    public t(key: string, ...args: any[]): string {
        let translation = this.translations[key] || key;
        if (args.length > 0) {
            args.forEach((arg, index) => {
                translation = translation.replace(`{${index}}`, arg);
            });
        }
        return translation;
    }
}

export const i18n = I18n.getInstance();
export const t = i18n.t.bind(i18n);
