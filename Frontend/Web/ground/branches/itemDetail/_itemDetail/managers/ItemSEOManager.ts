import { ItemDefinition } from '@branches/items/_items/managers/ItemsStateManager';

export class ItemSEOManager {
    public updateSEO(item: ItemDefinition, currentUrl: string, isProfile: boolean): void {
        const itemName = item.name;
        const itemDescription = item.tooltips ? item.tooltips.join(' ').substring(0, 160) : `${itemName} - предмет из игры Backpack Brawl`;
        const itemImage = `/images/items/webp/${this.toSlug(itemName)}.webp`;

        document.title = `${itemName} - Backpack Insight | ${isProfile ? 'Профиль' : 'Предметы'} Backpack Brawl`;
        
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute('content', itemDescription);

        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (keywordsMeta) {
            const keywords = `${itemName}, Backpack Brawl, ${isProfile ? 'профиль, предмет игрока' : 'предмет, вики'}, ${item.rarity}, ${item.itemTypes?.join(', ') || ''}, игра, аналитика`;
            keywordsMeta.setAttribute('content', keywords);
        }

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', `${itemName} - Backpack Insight`);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', itemDescription);

        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', `https://backpackinsight.pages.dev${itemImage}`);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', currentUrl);

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', currentUrl);

        this.updateStructuredData(item, currentUrl);
    }

    private updateStructuredData(item: ItemDefinition, currentUrl: string): void {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Thing",
            "name": item.name,
            "description": item.tooltips ? item.tooltips.join(' ') : `${item.name} - предмет из игры Backpack Brawl`,
            "image": `https://backpackinsight.pages.dev/images/items/webp/${this.toSlug(item.name)}.webp`,
            "identifier": item.id,
            "category": item.itemTypes?.join(', ') || 'Предмет',
            "brand": { "@type": "Organization", "name": "Backpack Brawl" },
            "additionalProperty": [
                { "@type": "PropertyValue", "name": "Редкость", "value": item.rarity },
                { "@type": "PropertyValue", "name": "Стоимость в игре", "value": item.coinValue ? `${item.coinValue} золота` : "Недоступно" },
                { "@type": "PropertyValue", "name": "Тип предмета", "value": item.itemTypes?.join(', ') || 'Неизвестно' }
            ],
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": currentUrl,
                "name": `${item.name} - Backpack Insight`,
                "url": currentUrl
            }
        };

        let jsonLdScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
        if (!jsonLdScript) {
            jsonLdScript = document.createElement('script');
            jsonLdScript.type = 'application/ld+json';
            document.head.appendChild(jsonLdScript);
        }
        jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
    }

    private toSlug(name: string): string {
        return name.toLowerCase().split(' ').join('-');
    }
}
