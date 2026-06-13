/**
 * ItemSEOManager — обновление мета-тегов, OG, JSON-LD для страницы предмета.
 */
import { ImageFormatService } from '@utils/ImageFormatService';
import { ItemIconService, ItemDefinition } from '@utils/ItemIconService';
import { MetaService } from '@utils/MetaService';
import { t } from '../../../../localization/i18n';

export class ItemSEOManager {
    private readonly jsonLdId = 'item-detail-json-ld';
    private originalTitle: string = document.title;

    update(item: ItemDefinition, isProfile: boolean): void {
        const desc = item.tooltips?.join(' ').substring(0, 160) ?? '';
        const imagePath = ItemIconService.getImagePath(item);
        const imageSrc = ImageFormatService.itemSrc(imagePath);
        const absoluteImage = `${window.location.origin}${imageSrc}`;
        const url = window.location.href;

        document.title = `${item.name} - Backpack Insight | ${isProfile ? t('sidebar_profile') : t('sidebar_items')}`;

        MetaService.setMeta('name', 'description', desc);
        MetaService.setMeta('name', 'keywords', `${item.name}, Backpack Brawl, ${item.rarity}, ${item.itemTypes?.join(', ') ?? ''}`);
        MetaService.setMeta('property', 'og:title', `${item.name} - Backpack Insight`);
        MetaService.setMeta('property', 'og:description', desc);
        MetaService.setMeta('property', 'og:image', absoluteImage);
        MetaService.setMeta('property', 'og:url', url);
        MetaService.setLink('canonical', url);
        MetaService.setLink('alternate', url, 'ru');
        MetaService.setLink('alternate', url.replace('/item/', '/en/item/').replace('/profile/item/', '/profile/en/item/'), 'en');

        this.updateStructuredData(item, url, absoluteImage);
    }

    restore(): void {
        if (this.originalTitle) document.title = this.originalTitle;
    }

    cleanup(): void {
        document.getElementById(this.jsonLdId)?.remove();
    }

    private updateStructuredData(item: ItemDefinition, url: string, absoluteImage: string): void {
        const data = {
            '@context': 'https://schema.org',
            '@type': 'Thing',
            'name': item.name,
            'description': item.tooltips?.join(' ') ?? '',
            'image': absoluteImage,
            'identifier': item.id,
            'category': item.itemTypes?.join(', ') ?? '',
            'brand': { '@type': 'Organization', 'name': 'Backpack Brawl' },
            'additionalProperty': [
                { '@type': 'PropertyValue', 'name': t('jsonld_rarity'), 'value': item.rarity },
                { '@type': 'PropertyValue', 'name': t('jsonld_cost'), 'value': item.coinValue ? `${item.coinValue} ${t('jsonld_cost_gold')}` : t('jsonld_cost_na') },
                { '@type': 'PropertyValue', 'name': t('jsonld_type'), 'value': item.itemTypes?.join(', ') ?? '' }
            ],
            'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id': url,
                'name': `${item.name} - Backpack Insight`,
                'description': item.tooltips?.join(' ') ?? '',
                'url': url
            }
        };

        MetaService.setJsonLd(this.jsonLdId, data);
    }
}
