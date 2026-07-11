// Cloudflare Pages sitemap function.
// Kept as frontend/edge functionality, but the real sitemap is now produced by
// RBackend and proxied with the server-side API secret.
// @ts-ignore
export const onRequestGet: PagesFunction<{ BACKEND?: string; API_SECRET?: string }> = async ({ env, request }) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  if (env.BACKEND) {
    try {
      const headers = new Headers();
      if (env.API_SECRET) headers.set("X-Internal-Secret", env.API_SECRET);
      const response = await fetch(`${env.BACKEND.replace(/\/$/, "")}/api/sitemap`, { headers });
      if (response.ok) {
        return new Response(response.body, {
          status: response.status,
          headers: {
            "Content-Type": response.headers.get("Content-Type") || "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }
    } catch (error) {
      console.error("RBackend sitemap proxy failed", error);
    }
  }

  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1</priority></url>
  <url><loc>${baseUrl}/items</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/profile</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
};
