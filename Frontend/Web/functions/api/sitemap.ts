import { ItemDefinition } from '../../ground/branches/items/ItemsBranch';

const BASE_URL = 'https://backpackinsight.pages.dev';

interface SitemapEntry {
    url: string;
    lastmod: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}

export async function GET() {
    try {
        // Базовые страницы
        const staticPages: SitemapEntry[] = [
            {
                url: `${BASE_URL}/`,
                lastmod: new Date().toISOString(),
                changefreq: 'daily',
                priority: 1.0
            },
            {
                url: `${BASE_URL}/items`,
                lastmod: new Date().toISOString(),
                changefreq: 'weekly',
                priority: 0.9
            },
            {
                url: `${BASE_URL}/profile`,
                lastmod: new Date().toISOString(),
                changefreq: 'monthly',
                priority: 0.8
            }
        ];

        // Получаем предметы для динамических страниц
        let items: ItemDefinition[] = [];
        try {
            const response = await fetch(`${BASE_URL}/api/items`);
            if (response.ok) {
                items = await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch items for sitemap:', error);
        }

        // Создаем страницы для каждого предмета
        const itemPages: SitemapEntry[] = items.map((item) => ({
            url: `${BASE_URL}/item/${item.id}`,
            lastmod: new Date().toISOString(),
            changefreq: 'monthly' as const,
            priority: 0.7
        }));

        // Объединяем все страницы
        const allPages = [...staticPages, ...itemPages];

        // Генерируем XML
        const xml = generateSitemapXML(allPages);

        return new Response(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600'
            }
        });

    } catch (error) {
        console.error('Sitemap generation error:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
}

function generateSitemapXML(entries: SitemapEntry[]): string {
    const xmlEntries = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}
