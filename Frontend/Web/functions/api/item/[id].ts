// Compatibility route for old /api/item/:id Cloudflare function shape.
// It no longer builds JSON-derived SEO data because /api/items JSON runtime was
// removed. Redirect to the SPA item route instead of returning a hard 404.
// @ts-ignore
export const onRequestGet: PagesFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const itemId = String(params.id || "");
  return Response.redirect(`${url.origin}/item/${itemId}`, 302);
};
