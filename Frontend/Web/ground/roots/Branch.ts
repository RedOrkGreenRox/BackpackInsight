/**
 * Интерфейс для мета-данных страницы
 */
export interface PageMeta {
    title: string;
    description: string;
    image?: string; // Для соцсетей (OG:Image)
}

/**
 * Abstract Branch
 * Базовый класс для всех страниц (ветвей) приложения.
 */
export abstract class Branch {
    protected container: HTMLElement | null = null;

    /**
     * Возвращает HTML-разметку ветви.
     */
    protected abstract getHtml(data?: any): string;

    /**
     * Возвращает мета-данные для SEO.
     * Если не переопределить, вернутся дефолтные.
     */
    public getMeta(_data?: any): PageMeta {
        return {
            title: "Backpack Insight",
            description: "Аналитика, статистика и вики по игре Backpack Brawl."
        };
    }

    /**
     * Инициализация логики после рендера.
     */
    protected abstract init(data?: any): void;

    /**
     * Очистка перед удалением.
     */
    protected abstract destroy(): void;

    public mount(container: HTMLElement, data?: any): void {
        this.container = container;
        this.container.innerHTML = this.getHtml(data);
        this.init(data);
    }

    public unmount(): void {
        this.destroy();
        if (this.container) {
            this.container.innerHTML = '';
            this.container = null;
        }
    }
}
