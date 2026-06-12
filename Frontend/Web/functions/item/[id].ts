interface ItemDefinition {
    id: string;
    name: string;
    description?: string;
    rarity: string;
    coinValue?: number;
    itemTypes?: string[];
    icon?: string;
    tooltips?: string[];
}

export async function onRequestGet(context: any) {
    const { params, request } = context;
    const url = new URL(request.url);
    const BASE_URL = `${url.protocol}//${url.host}`;
    
    try {
        const itemId = params.id;

        if (!itemId) {
            return new Response('Item ID required', { status: 400 });
        }

        // 1. Получаем данные предмета из API
        let item: ItemDefinition | null = null;
        try {
            const response = await fetch(`${BASE_URL}/api/items`);
            if (response.ok) {
                const items: ItemDefinition[] = await response.json();
                // Ищем предмет по slug
                item = items.find(i => i.name.toLowerCase().replace(/['’]/g, '-').split(' ').join('-').replace(/-+/g, '-') === itemId) || null;
            }
        } catch (error) {
            console.error('Failed to fetch item:', error);
        }

        if (!item) {
            return new Response('Item not found', { status: 404 });
        }

        // 2. Скачиваем оригинальный статический index.html с хоста
        const indexResponse = await fetch(`${BASE_URL}/index.html`);
        if (!indexResponse.ok) {
            return new Response('Failed to load base page template', { status: 500 });
        }
        let html = await indexResponse.text();

        // 3. Подготавливаем мета-теги
        const itemName = item.name;
        const itemDescription = item.tooltips ? item.tooltips.join(' ').substring(0, 160) : `${itemName} - предмет из игры Backpack Brawl`;
        const itemImage = `${BASE_URL}/images/items/webp/${itemId}.webp`;
        const itemUrl = `${BASE_URL}/item/${itemId}`;
        const itemKeywords = `${itemName}, Backpack Brawl, предмет, ${item.rarity}, ${item.itemTypes?.join(', ') || ''}, игра, аналитика`;

        // 4. Подготавливаем JSON-LD структурированные данные
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Thing",
            "name": item.name,
            "description": item.tooltips ? item.tooltips.join(' ') : `${item.name} - предмет из игры Backpack Brawl`,
            "image": itemImage,
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
                "@id": itemUrl,
                "name": `${item.name} - Backpack Insight`,
                "description": itemDescription,
                "url": itemUrl
            }
        };

        // 5. Заменяем мета-теги в index.html
        // Заменяем Title
        html = html.replace(/<title>.*?<\/title>/, `<title>${itemName} - Backpack Insight | Предметы Backpack Brawl</title>`);
        
        // Заменяем Description
        html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${itemDescription}">`);
        
        // Заменяем Keywords
        html = html.replace(/<meta name="keywords" content=".*?">/, `<meta name="keywords" content="${itemKeywords}">`);

        // Заменяем каноническую ссылку
        html = html.replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${itemUrl}">`);

        // Заменяем Open Graph мета-теги
        html = html.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${itemName} - Backpack Insight">`);
        html = html.replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${itemDescription}">`);
        html = html.replace(/<meta property="og:image" content=".*?">/, `<meta property="og:image" content="${itemImage}">`);
        html = html.replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${itemUrl}">`);

        // Вставляем JSON-LD структурированные данные и hreflang перед </head>
        const injection = `
    <!-- Dynamic Item SEO -->
    <link rel="alternate" hreflang="ru" href="${itemUrl}">
    <link rel="alternate" hreflang="en" href="${BASE_URL}/en/item/${itemId}">
    <link rel="alternate" hreflang="x-default" href="${itemUrl}">
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
</head>`;
        
        html = html.replace('</head>', injection);

        // 6. Возвращаем готовый HTML
        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error: any) {
        console.error('Item page generation error:', error);
        return new Response('Error generating item page: ' + error.message, { status: 500 });
    }
}
