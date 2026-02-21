// Динамическая генерация keywords в зависимости от языка
function getKeywords(lang: string = 'ru'): string {
    const keywords: Record<string, string> = {
        ru: "Backpack Brawl, аналитика, база знаний, предметы, рецепты, профили, игра, стратегия, гайд, тактика",
        en: "Backpack Brawl, analytics, knowledge base, items, recipes, profiles, game, strategy, guide, tactics"
    };
    return keywords[lang] || keywords.ru;
}

// Динамическая генерация для Cloudflare Functions
export async function onRequestGet(context: any) {
    const { request } = context;
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') || 'ru';
    
    // Генерация HTML с динамическими keywords
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Backpack Insight</title>
    <meta name="description" content="${lang === 'ru' ? 'Backpack Brawl Analytics & Wiki' : 'Backpack Brawl Analytics & Wiki'}">
    <meta name="keywords" content="${getKeywords(lang)}">
    
    <!-- Остальные мета-теги... -->
</head>
<body>
    <!-- Контент -->
</body>
</html>`;
    
    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}
