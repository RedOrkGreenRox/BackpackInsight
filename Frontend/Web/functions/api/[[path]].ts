export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  const url = new URL(context.request.url);

  // Берем путь после /api и добавляем его к адресу туннеля
  // Например: /api/items -> https://[UUID].cfargotunnel.com/items
  const backendPath = url.pathname.replace('/api', '');
  const destination = `${context.env.BACKEND}${backendPath}${url.search}`;

  return fetch(destination, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
  });
};