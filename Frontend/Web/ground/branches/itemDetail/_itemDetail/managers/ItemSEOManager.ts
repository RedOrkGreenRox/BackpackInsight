/**
 * ItemSEOManager — обновление мета-тегов, OG, JSON-LD для страницы предмета.
 */
import { ItemIconService, ItemDefinition } from '@utils/ItemIconService';
import { t } from '../../../../localization/i18n';

export class ItemSEOManager {
    private jsonLdScript: HTMLScriptElement | null = null;
    private originalTitle: string = document.title;

    update(item: ItemDefinition, isProfile: boolean): void {
        const desc = item.tooltips?.join(' ').substring(0, 160) ?? '';
        const img = `/images/items/webp/${ItemIconService.getImagePath(item)}.webp`;
        const url = window.location.href;

        document.title = `${item.name} - Backpack Insight | ${isProfile ? t('sidebar_main') : t('sidebar_items')}`;

        this.setMeta('name', 'description', desc);
        this.setMeta('name', 'keywords', `${item.name}, Backpack Brawl, ${item.rarity}, ${item.itemTypes?.join(', ') ?? ''}`);
        this.setMeta('property', 'og:title', `${item.name} - Backpack Insight`);
        this.setMeta('property', 'og:description', desc);
        this.setMeta('property', 'og:image', `https://backpackinsight.pages.dev${img}`);
        this.setMeta('property', 'og:url', url);
        this.setLink('canonical', url);
        this.setLink('alternate', url, 'ru');
        this.setLink('alternate', url.replace('/item/', '/en/item/').replace('/profile/item/', '/profile/en/item/'), 'en');

        this.updateStructuredData(item, url);
    }

    restore(): void {
        if (this.originalTitle) document.title = this.originalTitle;
    }

    cleanup(): void {
        this.jsonLdScript?.remove();
        this.jsonLdScript = null;
    }

    private setMeta(attr: string, name: string, content: string): void {
        const tag = document.querySelector(`meta[${attr}="${name}"]`);
        tag?.setAttribute('content', content);
    }

    private setLink(rel: string, href: string, hreflang?: string): void {
        const selector = hreflang
            ? `link[rel="${rel}"][hreflang="${hreflang}"]`
            : `link[rel="${rel}"]`;
        const tag = document.querySelector(selector);
        tag?.setAttribute('href', href);
    }

    private updateStructuredData(item: ItemDefinition, url: string): void {
        const data = {
            '@context': 'https://schema.org',
            '@type': 'Thing',
            'name': item.name,
            'description': item.tooltips?.join(' ') ?? '',
            'image': `https://backpackinsight.pages.dev/images/items/webp/${ItemIconService.getImagePath(item)}.webp`,
            'identifier': item.id,
            'category': item.itemTypes?.join(', ') ?? '',
            'brand': { '@type': 'Organization', 'name': 'Backpack Brawl' },
            'additionalProperty': [
                { '@type': 'PropertyValue', 'name': 'Редкость', 'value': item.rarity },
                { '@type': 'PropertyValue', 'name': 'Стоимость', 'value': item.coinValue ? `${item.coinValue} золота` : 'N/A' },
                { '@type': 'PropertyValue', 'name': 'Тип', 'value': item.itemTypes?.join(', ') ?? '' }
            ],
            'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id': url,
                'name': `${item.name} - Backpack Insight`,
                'description': item.tooltips?.join(' ') ?? '',
                'url': url
            }
        };

        if (!this.jsonLdScript) {
            this.jsonLdScript = document.createElement('script');
            this.jsonLdScript.type = 'application/ld+json';
            document.head.appendChild(this.jsonLdScript);
        }
        this.jsonLdScript.textContent = JSON.stringify(data, null, 2);
    }
}
