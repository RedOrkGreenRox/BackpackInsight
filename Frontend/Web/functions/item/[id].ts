// Frontend-owned Cloudflare Pages function for SPA item routes.
// The old implementation injected item SEO by fetching /api/items JSON.
// That JSON runtime endpoint is intentionally gone; until the new FlatBuffer
// middleware/frontend lands, keep /item/:id routable by serving the SPA shell.
// @ts-ignore
export const onRequestGet: PagesFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const itemId = String(params.id || "");
  const itemUrl = `${baseUrl}/item/${itemId}`;

  try {
    const indexResponse = await fetch(`${baseUrl}/index.html`);
    if (indexResponse.ok) {
      let html = await indexResponse.text();
      html = html.replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${itemUrl}">`);
      html = html.replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${itemUrl}">`);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }
  } catch (error) {
    console.error("Item SPA shell fallback failed", error);
  }

  return new Response("Item page shell unavailable", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
