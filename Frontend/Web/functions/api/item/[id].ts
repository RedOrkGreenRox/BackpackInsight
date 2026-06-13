const BASE_URL = 'https://backpackinsight.pages.dev';

interface ItemDefinition {
    id: string;
    name: string;
    description?: string;
    rarity: string;
    coinValue?: number;
    itemTypes?: string[];
    icon?: string;
}

export async function onRequestGet(context: any) {
    const { params } = context;
    
    try {
        const itemId = params.id;

        if (!itemId) {
            return new Response('Item ID required', { status: 400 });
        }

        // Получаем данные предмета
        let item: ItemDefinition | null = null;
        try {
            const response = await fetch(`${BASE_URL}/api/items`);
            if (response.ok) {
                const items: ItemDefinition[] = await response.json();
                item = items.find(i => i.id === itemId) || null;
            }
        } catch (error) {
            console.error('Failed to fetch item:', error);
        }

        if (!item) {
            return new Response('Item not found', { status: 404 });
        }

        // Генерируем JSON-LD для предмета с улучшенной структурой
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Thing",
            "name": item.name,
            "description": item.description || `${item.name} - предмет из игры Backpack Brawl`,
            "image": item.icon ? `${BASE_URL}${item.icon}` : `${BASE_URL}/images/placeholder/placeholder.webp`,
            "identifier": item.id,
            "category": item.itemTypes?.join(', ') || 'Предмет',
            "brand": {
                "@type": "Organization",
                "name": "Backpack Brawl"
            },
            "additionalProperty": [
                {
                    "@type": "PropertyValue",
                    "name": "Редкость",
                    "value": item.rarity
                },
                {
                    "@type": "PropertyValue", 
                    "name": "Стоимость в игре",
                    "value": item.coinValue ? `${item.coinValue} золота` : "Недоступно"
                },
                {
                    "@type": "PropertyValue",
                    "name": "Тип предмета",
                    "value": item.itemTypes?.join(', ') || 'Неизвестно'
                }
            ],
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${BASE_URL}/item/${itemId}`,
                "name": `${item.name} - Backpack Insight`,
                "description": item.description || `Подробная информация о предмете ${item.name} из игры Backpack Brawl`,
                "url": `${BASE_URL}/item/${itemId}`
            }
        };

        // Генерируем HTML с динамическими мета-тегами
        const html = generateItemHTML(item, structuredData);

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        console.error('Item page generation error:', error);
        return new Response('Error generating item page', { status: 500 });
    }
}

function generateItemHTML(item: ItemDefinition, structuredData: any): string {
    const itemDescription = item.description || `${item.name} - предмет из игры Backpack Brawl. Узнайте характеристики, рецепты и способы получения.`;
    const itemImage = item.icon ? `${BASE_URL}${item.icon}` : `${BASE_URL}/images/placeholder/placeholder.webp`;
    
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.name} - Backpack Insight | Предметы Backpack Brawl</title>
    <meta name="description" content="${itemDescription}">
    <meta name="keywords" content="${item.name}, Backpack Brawl, предмет, ${item.rarity}, ${item.itemTypes?.join(', ') || ''}, игра, аналитика">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${BASE_URL}/item/${item.id}">
    
    <!-- Hreflang for alternative languages -->
    <link rel="alternate" hreflang="ru" href="${BASE_URL}/item/${item.id}">
    <link rel="alternate" hreflang="en" href="${BASE_URL}/en/item/${item.id}">
    <link rel="alternate" hreflang="x-default" href="${BASE_URL}/item/${item.id}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${item.name} - Backpack Insight">
    <meta property="og:description" content="${itemDescription}">
    <meta property="og:image" content="${itemImage}">
    <meta property="og:image:width" content="400">
    <meta property="og:image:height" content="400">
    <meta property="og:image:alt" content="${item.name} - иконка предмета">
    <meta property="og:url" content="${BASE_URL}/item/${item.id}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:site_name" content="Backpack Insight">
    <meta property="article:section" content="Предметы">
    <meta property="article:tag" content="${item.rarity}">
    ${item.itemTypes?.map((type: string) => `<meta property="article:tag" content="${type}">`).join('\n    ') || ''}
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#4CAF50">
    <link rel="manifest" href="/manifest.json">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="%23191008" d="m1 1 1 1H1zm14 0v1zm11 0q2-1 1 3h-1z"/></svg>'>
    
    <!-- Global Styles -->
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background-color: #121212; 
            font-family: sans-serif; 
            color: white; 
        }
        .loading { 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #333;
            border-top: 4px solid #4CAF50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="app" class="loading">
        <div class="loading-spinner"></div>
        <p>Загрузка информации о предмете "${item.name}"...</p>
        <p style="opacity: 0.7; font-size: 14px;">Редкость: ${item.rarity} | Тип: ${item.itemTypes?.join(', ') || 'Неизвестно'}</p>
    </div>
    

    <!-- Entry Point -->
    <script type="module" src="/ground/core.ts"></script>
</body>
</html>`;
}
